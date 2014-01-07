/***************************************
 * Copyright 2011, 2012 GlobWeb contributors.
 *
 * This file is part of GlobWeb.
 *
 * GlobWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * (at your option) any later version.
 *
 * GlobWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GlobWeb. If not, see <http://www.gnu.org/licenses/>.
 ***************************************/

define([
    'virtualglobeviewer/SceneGraph/SceneGraph',
    './helpers/resource-manager',
    './glTF-parser',
    './helpers/glMatrix'
], function(SceneGraph, ResourceManager, glTFParser) {

    // var categoriesDepsOrder = ["buffers", "bufferViews", "images",  "videos", "samplers", "textures", "shaders",
    // "programs", "techniques", "materials", "indices", "attributes", "meshes", "cameras", "lights", "skins", "nodes",
    // "scenes", "animations"];

    // Utilities

    function RgbArraytoHex(colorArray) {
        if (!colorArray) return 0xFFFFFFFF;
        var r = Math.floor(colorArray[0] * 255),
            g = Math.floor(colorArray[1] * 255),
            b = Math.floor(colorArray[2] * 255),
            a = 255;

        var color = (a << 24) + (r << 16) + (g << 8) + b;

        return color;
    }

    // FIXXME
    function typeNumberToString(typeNumber) {
        switch (typeNumber) {
            case 5123:
                return 'UNSIGNED_SHORT';
            case 5126:
                return 'FLOAT';
            case 35664:
                return 'FLOAT_VEC2';
            case 35665:
                return 'FLOAT_VEC3';
            case 35666:
                return 'FLOAT_VEC4';
            case 35675:
                return 'FLOAT_MAT3';
            case 35676:
                return 'FLOAT_MAT4';
            case 35678:
                return 'SAMPLER_2D';
        }
    }

    function componentsPerElementForGLType(glType) {
        switch (glType) {
            case "FLOAT":
            case "UNSIGNED_BYTE":
            case "UNSIGNED_SHORT":
                return 1;
            case "FLOAT_VEC2":
                return 2;
            case "FLOAT_VEC3":
                return 3;
            case "FLOAT_VEC4":
                return 4;
            default:
                return null;
        }
    }

    // Resource management

    var GlobWebEntry = function(entryID, object, description) {
        this.entryID = entryID;
        this.object = object;
        this.description = description;
    };

    var GlobWebResourceManager = function() {
        this._entries = {};
        this.binaryManager = Object.create(ResourceManager);
        this.binaryManager.init(this);
        this.binaryManager.maxConcurrentRequests = 4;
        this.binaryManager.bytesLimit = 1024 * 1024;
    };

    GlobWebResourceManager.prototype.setEntry = function(entryID, object, description) {
        if (!entryID) {
            console.error("No EntryID provided, cannot store", description);
            return;
        }

        if (this._entries[entryID]) {
            console.warn("entry[" + entryID + "] is being overwritten");
        }

        this._entries[entryID] = new GlobWebEntry(entryID, object, description);
    };

    GlobWebResourceManager.prototype.getEntry = function(entryID) {
        return this._entries[entryID];
    };

    GlobWebResourceManager.prototype.clearEntries = function() {
        this._entries = {};
    };

    // Helper object to encapsulate the loading of a SceneGraph.Geometry/Mesh over the network:
    function GeometryLoaderProxy(geometry) {
        this.totalAttributes = 0;
        this.loadedAttributes = 0;

        // GlobWeb's SceneGraph.Geometry object:
        this.geometry = geometry;
    };

    GeometryLoaderProxy.prototype.setMesh = function(mesh) {
        this.geometry.mesh = mesh;
    };

    GeometryLoaderProxy.prototype.setMaterial = function(material) {
        this.geometry.material = material;
    };

    GeometryLoaderProxy.prototype.checkFinished = function() {
        var mesh = this.geometry.mesh;
        if (mesh.indexArray &&
            mesh.vertexArray &&
            (this.totalAttributes === this.loadedAttributes)) {

            mesh.isLoaded = true;
            return true;
        }

        return false;
    };

    GeometryLoaderProxy.prototype.setIndexArray = function(indexArray) {
        var mesh = this.geometry.mesh;        
        mesh.indexArray = indexArray;
        
        // NOTE: necessary for for rendering in SceneGraph.Mesh.render:
        mesh.indices = [];
        for (i = 0, l = indexArray.length; i < l; i += 1) {
            mesh.indices.push(indexArray[i]);
            //console.log("indices: " + indexArray[i]);
        }

        // FIXXME: make this variable!
        mesh.numElements = 3;
    };

    GeometryLoaderProxy.prototype.setVertexArray = function(vertexArray) {
        var mesh = this.geometry.mesh;
        mesh.vertexArray = vertexArray;
        
        // NOTE: necessary for bounding box calculation of SceneGraph.Node:
        mesh.vertices = [];
        for (i = 0, l = vertexArray.length; i < l; ++i) {
            mesh.vertices.push(vertexArray[i]);
            //console.log("vertices: " + vertexArray[i]);
        }
    };

    GeometryLoaderProxy.prototype.setNormalArray = function(normalArray) {
        var mesh = this.geometry.mesh;
        mesh.normalArray = normalArray;
        
//         mesh.normals = [];
//         for (i = 0, l = normalArray.length; i < l; ++i) {
//             mesh.normals.push(normalArray[i]);
//             //console.log("normals: " + normalArray[i]);
//         }
    };
         

    GeometryLoaderProxy.prototype.setTexCoordArray = function(texCoordArray) {
        var mesh = this.geometry.mesh;
        mesh.texCoordArray = texCoordArray;
        
//         mesh.texCoords = [];
//         for (i = 0, l = texCoordArray.length; i < l; ++i) {
//             mesh.texCoords.push(texCoordArray[i]);
//             //console.log("texCoords: " + texCoordArray[i]);
//         }
    };         
     
    // Delegate for processing index buffers
    var IndicesDelegate = function() {};

    IndicesDelegate.prototype.handleError = function(errorCode, info) {
        // FIXME: report error
        console.log("ERROR(IndicesDelegate):" + errorCode + ":" + info);
    };

    IndicesDelegate.prototype.convert = function(resource, ctx) {
        return new Uint16Array(resource, 0, ctx.indices.count);
    };

    IndicesDelegate.prototype.resourceAvailable = function(glResource, ctx) {
        var geo_proxy = ctx.geoLoaderProxy;
        geo_proxy.setIndexArray(glResource, true);
        geo_proxy.checkFinished();

        return true;
    };

    var indicesDelegate = new IndicesDelegate();

    var IndicesContext = function(indices, geoLoaderProxy) {
        this.indices = indices;
        this.geoLoaderProxy = geoLoaderProxy;
    };

    // Delegate for processing vertex attribute buffers
    var VertexAttributeDelegate = function() {};

    VertexAttributeDelegate.prototype.handleError = function(errorCode, info) {
        // FIXME: report error
        console.log("ERROR(VertexAttributeDelegate):" + errorCode + ":" + info);
    };

    VertexAttributeDelegate.prototype.convert = function(resource, ctx) {
        return resource;
    };

    VertexAttributeDelegate.prototype.resourceAvailable = function(glResource, ctx) {
        var geo_proxy = ctx.geoLoaderProxy;
        var attribute = ctx.attribute;
        var semantic = ctx.semantic;
        var floatArray;
        var i, l;
        //FIXME: Float32 is assumed here, but should be checked.

        // FIXXME: convert from type to string and back is nonesense...
        var type = typeNumberToString(attribute.type);
        if (!type) {
            throw Error();
        }
        // FIXXME: The loader is not yet capable of loading the main buffer ("bufferView.buffer", e.g. "duck.bin")
        // and offset into it here. Currently the buffers are loaded in different requests but with the "range" header
        // attribute set accordingly. Therefore the byteOffset is always set to 0 here:
        var byteOffset = 0;//attribute.byteOffset;
        
        if (semantic == "POSITION") {
            // TODO: Should be easy to take strides into account here  
            floatArray = new Float32Array(glResource, byteOffset, attribute.count * componentsPerElementForGLType(type));            
            geo_proxy.setVertexArray(floatArray);
        }
        else if (semantic == "NORMAL") {
            floatArray = new Float32Array(glResource, byteOffset, attribute.count * componentsPerElementForGLType(type));
            geo_proxy.setNormalArray(floatArray);
        }
        else if ((semantic == "TEXCOORD_0") || (semantic == "TEXCOORD" )) {
            floatArray = new Float32Array(glResource, byteOffset, attribute.count * componentsPerElementForGLType(type));
            geo_proxy.setTexCoordArray(floatArray);
        }

        geo_proxy.loadedAttributes++;
        geo_proxy.checkFinished();

        return true;
    };

    var vertexAttributeDelegate = new VertexAttributeDelegate();

    var VertexAttributeContext = function(attribute, semantic, geoLoaderProxy) {
        this.attribute = attribute;
        this.semantic = semantic;
        this.geoLoaderProxy = geoLoaderProxy;
    };

    var GlobWebGLTFLoader = Object.create(glTFParser, {

        load: {
            enumerable: true,
            value: function(userInfo, options) {
                this.globWebResources = new GlobWebResourceManager();
                glTFParser.load.call(this, userInfo, options);
                glTFParser.handleLoadCompleted = options;
                return userInfo.rootObj;
            }
        },

        globWebResources: {
            value: null,
            writable: true

        },

        handleBuffer: {
            value: function(entryID, description, userInfo) {
                // console.log('handleBuffer: adding ' + entryID);
                this.globWebResources.setEntry(entryID, null, description);
                description.type = "ArrayBuffer";
                return true;
            }
        },

        handleBufferView: {
            value: function(entryID, description, userInfo) {
                // console.log('handleBufferView: adding ' + entryID);
                this.globWebResources.setEntry(entryID, null, description);

                var buffer = this.globWebResources.getEntry(description.buffer);
                description.type = "ArrayBufferView";

                var bufferViewEntry = this.globWebResources.getEntry(entryID);
                bufferViewEntry.buffer = buffer;
                return true;
            }
        },

        handleShader: {
            value: function(entryID, description, userInfo) {
                // No shader handling at this time
                return true;
            }
        },

        handleTechnique: {
            value: function(entryID, description, userInfo) {
                // No technique handling at this time
                return true;
            }
        },

        handleImage: {
            value: function(entryID, description, userInfo) {
//                 console.log('handleImage: adding ' + entryID);
                this.globWebResources.setEntry(entryID, null, description);
                return true;
            }
        },

        handleTexture: {
            value: function(entryID, description, userInfo) {
//                 console.log('handleTextures: adding ' + entryID);
                this.globWebResources.setEntry(entryID, null, description);
                return true;
            }
        },

        handleMaterial: {
            value: function(entryID, description, userInfo) {
                //this should be rewritten using the meta datas that actually create the shader.
                //here we will infer what needs to be pass to Three.js by looking inside the technique parameters.
                var texturePath = null;

                if (!description.instanceTechnique) {
                    console.log('No instanceTechnique for material: ' + entryID);
                    return;
                }

                var technique = description.instanceTechnique;
                var texture = technique.values.diffuse;
                if (typeof texture === 'string') {
                    var imageEntry = this.globWebResources.getEntry(texture);
                    if (imageEntry) {
                        var imageID = imageEntry.description.source;
                        var image = this.globWebResources.getEntry(imageID);
                        texturePath = image.description.path;
                    }
                }

                var diffuseColor = !texturePath ? technique.values.diffuse : null;
                var transparency = technique.values.transparency ? technique.values.transparency.value : 1.0;

                var material = new SceneGraph.Material();
                if (diffuseColor) {
                    material.diffuse = diffuseColor;
                }

                if (texturePath) {
                    // The 'false' parameter prevents the internal horizontal flipping of the image:
                    material.texture = new SceneGraph.Texture(texturePath, false);
                }

                this.globWebResources.setEntry(entryID, material, description);
                
                return true;
            }
        },

        handleIndices: {
            value: function(entryID, description, userInfo) {
                this.globWebResources.setEntry(entryID, null, description);
                // console.log('handled index: ' + entryID);
                return true;
            }
        },

        handleAttribute: {
            value: function(entryID, description, userInfo) {
                this.globWebResources.setEntry(entryID, null, description);
                // console.log('handled attribute: ' + entryID);
                return true;
            }
        },

        handleLight: {
            value: function(entryID, description, userInfo) {
                // No light handling at this time
                return true;
            }
        },

        handleMesh: {
            value: function(entryID, description, userInfo) {

                // Create the Geometry holding Mesh and Material after it is fully loaded:
                var geometry = new SceneGraph.Geometry();
                this.globWebResources.setEntry(entryID, geometry, description);

                // Create the GeometryLoaderProxy to keep track if the SceneGraph.Geometry  is fully loaded:
                var geo_proxy = new GeometryLoaderProxy(geometry);

                var primitivesDescription = description.primitives;
                if (!primitivesDescription) {
                    //FIXME: not implemented in delegate
                    console.log("MISSING_PRIMITIVES for mesh:" + entryID);
                    return false;
                }

                // Iterate through primitives making up the mesh and build up the mesh structure for the GlobWeb renderer:
                for (var i = 0; i < primitivesDescription.length; i++) {
                    var primitiveDescription = primitivesDescription[i];

                    // FIXXME: where to get the primitive values from?
                    if (primitiveDescription.primitive === 4 /*"TRIANGLES"*/ ) {

                        var mesh = new SceneGraph.Mesh();
                        var materialEntry = this.globWebResources.getEntry(primitiveDescription.material);

                        geometry.mesh = mesh;
                        geometry.material = materialEntry.object;

                        var indicesID = primitiveDescription.indices;
                        //var indicesID = entryID + "_indices" + "_" + i;
                        var indicesEntry = this.globWebResources.getEntry(indicesID);
                        indicesEntry = indicesEntry.description;
                        indicesEntry.id = indicesID;
                        var indicesContext = new IndicesContext(indicesEntry, geo_proxy);
                        // var alreadyProcessedIndices = this.globWebResources.binaryManager.getResource(primitiveDescription.indices, indicesDelegate, indicesContext);
                        var alreadyProcessedIndices = this.globWebResources.binaryManager.getResource(indicesEntry, indicesDelegate, indicesContext);
                        /*if(alreadyProcessedIndices) {
                            indicesDelegate.resourceAvailable(alreadyProcessedIndices, indicesContext);
                        }*/ 

                        // Load Vertex Attributes
                        var allSemantics = Object.keys(primitiveDescription.attributes);
                        allSemantics.forEach(function(semantic) {
                            geo_proxy.totalAttributes++;

                            var attribute;
                            var attributeID = primitiveDescription.attributes[semantic];
                            //var attributeEntry = this.globWebResources.getEntry(attributeID);
                            //if (!attributeEntry) {
                            //let's just use an anonymous object for the attribute
                            attributeEntry = this.globWebResources.getEntry(attributeID).description;
                            attributeEntry.id = attributeID;
                            //? this.globWebResources.setEntry(attributeID, attributeEntry, attribute);

                            // var bufferEntry = this.globWebResources.getEntry(attributeEntry.bufferView);
                            // attribute.bufferView = bufferEntry.entryID;
                            // if (typeof attribute.byteOffset === 'undefined') {
                            //     attribute.byteOffset = 0;
                            // };
                            //attributeEntry = this.globWebResources.getEntry(attributeID);

                            // } else {
                            //     attribute = attributeEntry.object;
                            // }

                            var attribContext = new VertexAttributeContext(attributeEntry, semantic, geo_proxy);

                            var alreadyProcessedAttribute = this.globWebResources.binaryManager.getResource(attributeEntry, vertexAttributeDelegate, attribContext);
                            /*if(alreadyProcessedAttribute) {
                                vertexAttributeDelegate.resourceAvailable(alreadyProcessedAttribute, attribContext);
                            }*/
                        }, this);
                    }
                }
                return true;
            }
        },

        handleCamera: {
            value: function(entryID, description, userInfo) {
                // No camera handling at this time
                return true;
            }
        },

        handleNode: {
            value: function(entryID, description, userInfo) {

                var globWebNode = new SceneGraph.Node();
                globWebNode.name = description.name;

                this.globWebResources.setEntry(entryID, globWebNode, description);

                var m = description.matrix;
                if (m) {
                    globWebNode.matrix = mat4.create([
                        m[0], m[4], m[8], m[12],
                        m[1], m[5], m[9], m[13],
                        m[2], m[6], m[10], m[14],
                        m[3], m[7], m[11], m[15]
                    ]);
                }

                // Iterate through all node meshes and attach the appropriate objects
                //FIXME: decision needs to be made between these 2 ways, probably meshes will be discarded.
                var meshEntry;
                if (description.mesh) {
                    meshEntry = this.globWebResources.getEntry(description.mesh);
                    globWebNode.geometries.push(meshEntry.object);
                    // meshEntry.object.onComplete(function(mesh) {
                    //     mesh.attachToNode(globWebNode);
                    // });
                }

                if (description.meshes) {
                    description.meshes.forEach(function(meshID) {
                        meshEntry = this.globWebResources.getEntry(meshID);
                        globWebNode.geometries.push(meshEntry.object);
                        // meshEntry.object.onComplete(function(mesh) {
                        //     mesh.attachToNode(globWebNode);
                        // });
                    }, this);
                }

                /*if (description.camera) {
                    var cameraEntry = this.threeResources.getEntry(description.camera);
                    node.cameras.push(cameraEntry.entry);
                }*/

                return true;
            }
        },

        buildNodeHierachy: {
            value: function(nodeEntryId, parentNode) {
                var nodeEntry = this.globWebResources.getEntry(nodeEntryId);
                var globWebNode = nodeEntry.object;
                parentNode.children.push(globWebNode);

                var children = nodeEntry.description.children;
                if (children) {
                    children.forEach(function(childID) {
                        this.buildNodeHierachy(childID, globWebNode);
                    }, this);
                }

                return globWebNode;
            }
        },

        handleScene: {
            value: function(entryID, description, userInfo) {

                if (!description.nodes) {
                    console.log("ERROR: invalid file required nodes property is missing from scene");
                    return false;
                }

                description.nodes.forEach(function(nodeUID) {
                    this.buildNodeHierachy(nodeUID, userInfo.rootObj);
                }, this);

                /*if (this.delegate) {
                    this.delegate.loadCompleted(scene);
                }*/

                return true;
            }
        }

    });

    return GlobWebGLTFLoader;
});