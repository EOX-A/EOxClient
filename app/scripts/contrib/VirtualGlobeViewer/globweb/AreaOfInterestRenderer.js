/*
 * AreaOfInterestRenderer:
 *
 * Renderer to draw objects of type "AreaOfInterest" on GlobWeb's VectorLayer.
 *
 * Author: Martin Hecher <martin.hecher@fraunhofer.at>
 *
 * License: TBD
 */

define([
	'virtualglobeviewer/CoordinateSystem',
	'virtualglobeviewer/VectorRendererManager',
	'virtualglobeviewer/FeatureStyle',
	'virtualglobeviewer/Program'
], function(CoordinateSystem, VectorRendererManager, FeatureStyle, Program) {

	'use strict';

	/**************************************************************************************************************/

	/** @constructor
	AreaOfInterest Renderer constructor
 */
	var AreoOfInterestRenderer = function(tileManager) {
		// Store object for rendering
		this.renderContext = tileManager.renderContext;
		this.tileConfig = tileManager.tileConfig;

		// Bucket management for rendering : a bucket is a texture with its points
		this.buckets = [];

		// For stats
		this.numberOfRenderPoints = 0;

		this.program = {};
		this._createAreaProgram();
		this._createOutlineProgram();
	};

	AreoOfInterestRenderer.prototype._createAreaProgram = function() {
		var vertexShader = "\
	attribute vec3 vertex; \n\
	uniform mat4 viewProjectionMatrix; \n\
	\n\
	void main(void)  \n\
	{ \n\
		// Compute poi position in clip coordinate \n\
		gl_Position = viewProjectionMatrix * vec4(vertex, 1.0); \n\
	} \n\
	";

		var fragmentShader = "\
	precision lowp float; \n\
	uniform float alpha; \n\
	uniform vec3 fillColor; \n\
	uniform vec3 outlineColor; \n\
	\n\
	void main(void) \n\
	{ \n\
		// vec4 textureColor = texture2D(texture, texCoord); \n\
		gl_FragColor = vec4(fillColor.rgb, alpha); \n\
		if (gl_FragColor.a <= 0.0) discard; \n\
	} \n\
	";

		this.program.area = new Program(this.renderContext);
		this.program.area.createFromSource(vertexShader, fragmentShader);
	};

	AreoOfInterestRenderer.prototype._createOutlineProgram = function() {
		var vertexShader = "\
	attribute vec3 vertex; \n\
	uniform mat4 viewProjectionMatrix; \n\
	\n\
	void main(void)  \n\
	{ \n\
		// Compute poi position in clip coordinate \n\
		gl_Position = viewProjectionMatrix * vec4(vertex, 1.0); \n\
	} \n\
	";

		var fragmentShader = "\
	precision lowp float; \n\
	uniform float alpha; \n\
	uniform vec3 fillColor; \n\
	uniform vec3 outlineColor; \n\
	\n\
	void main(void) \n\
	{ \n\
		// vec4 textureColor = texture2D(texture, texCoord); \n\
		//gl_FragColor = vec4(outlineColor.rgb, alpha); \n\
		gl_FragColor = vec4(outlineColor.rgb, 1); \n\
		if (gl_FragColor.a <= 0.0) discard; \n\
	} \n\
	";

		this.program.outline = new Program(this.renderContext);
		this.program.outline.createFromSource(vertexShader, fragmentShader);
	};

	/*
	Add a polygon to the renderer
 */
	AreoOfInterestRenderer.prototype.addGeometry = function(geometry, layer, style) {
		if (style) {
			var bucket = this.getOrCreateBucket(layer, style);

			if (geometry.type !== "Polygon") {
				console.log("[AreaOfInterestRenderer::addGeometry] type '" + geometry.type + "' is not (yet) supported");
				return;
			}

			var polygon3d = [],
				vertical = vec3.create();

			for (var idx in geometry.coordinates) {
				var geo_pos = geometry.coordinates[idx];
				//console.debug("[AreaOfInterestRenderer::addGeometry] geo_pos: " + geo_pos[0] + "/" + geo_pos[1] + "/" + geo_pos[2]);

				var pos3d = CoordinateSystem.fromGeoTo3D(geo_pos);

				vec3.normalize(pos3d, vertical);

				var pointRenderData = {
					pos3d: pos3d,
					vertical: vertical,
					geometry: geometry,
					fillColor: style.fillColor,
					outlineColor: style.outlineColor,
				};

				bucket.points.push(pointRenderData);
				bucket.type = geometry.area;

				//console.debug("[AreaOfInterestRenderer::addGeometry] added point (in worldspace): " + pointRenderData.pos3d[0] + "/" + pointRenderData.pos3d[1] + "/" + pointRenderData.pos3d[2]);
			}

			//console.debug("[AreaOfInterestRenderer::addGeometry] added polygon with #" + bucket.points.length + " points");
		}
	}

	/**************************************************************************************************************/

	/*
	Remove a point from renderer
 */
	AreoOfInterestRenderer.prototype.removeGeometry = function(geometry, layer) {
		// FIXXME: quick hack for single selection
		//this.buckets.points = [];
		//this.buckets = [];

		for (var i = 0; i < this.buckets.length; i++) {
			var bucket = this.buckets[i];
			if (bucket.layer == layer) {
				for (var j = 0; j < bucket.points.length; j++) {
					if (bucket.points[j].geometry == geometry) {
						bucket.points.splice(j, 1);

						if (bucket.points.length == 0) {
							this.buckets.splice(i, 1);
						}
					}
				}
			}
		}
	}

	/**************************************************************************************************************/

	/*
	Get or create bucket to render a point
 */
	AreoOfInterestRenderer.prototype.getOrCreateBucket = function(layer, style) {
		// Find an existing bucket for the given style, except if label is set, always create a new one
		// for (var i = 0; i < this.buckets.length; i++) {
		// 	var bucket = this.buckets[i];
		// 	if (bucket.layer == layer && bucket.style.isEqualForPoint(style)) {
		// 		return bucket;
		// 	}
		// }

		// Create a bucket
		var bucket = {
			points: [],
			style: style,
			layer: layer
		};

		this.buckets.push(bucket);

		return bucket;
	}

	/**************************************************************************************************************/

	/*
	Render all the POIs
 */
	AreoOfInterestRenderer.prototype.render = function() {
		if (this.buckets.length == 0) {
			return;
		}

		this.numberOfRenderPoints = 0;

		var renderContext = this.renderContext;
		var gl = this.renderContext.gl;

		// Setup states
		// gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		this.drawArea();
		this.drawOutline();

		gl.disable(gl.BLEND);
	};

	AreoOfInterestRenderer.prototype.drawArea = function() {

		var renderContext = this.renderContext;
		var gl = this.renderContext.gl;

		// Setup program
		this.program.area.apply();

		// The shader only needs the viewProjection matrix, use modelViewMatrix as a temporary storage
		mat4.multiply(renderContext.projectionMatrix, renderContext.viewMatrix, renderContext.modelViewMatrix)
		gl.uniformMatrix4fv(this.program.area.uniforms["viewProjectionMatrix"], false, renderContext.modelViewMatrix);

		// Compute eye direction from inverse view matrix
		mat4.inverse(renderContext.viewMatrix, renderContext.modelViewMatrix);
		var camZ = [renderContext.modelViewMatrix[8], renderContext.modelViewMatrix[9], renderContext.modelViewMatrix[10]];
		vec3.normalize(camZ);
		vec3.scale(camZ, this.tileConfig.cullSign, camZ);

		// Compute pixel size vector to offset the points from the earth
		var pixelSizeVector = renderContext.computePixelSizeVector();

		for (var idx = 0; idx < this.buckets.length; idx++) {

			var bucket = this.buckets[idx]

			if (bucket.type === "2D") {
				this._drawPlane(bucket);
			} else {
				this._drawBox(bucket);
			}
		}
	};

	AreoOfInterestRenderer.prototype._drawBox = function(bucket) {
		var renderContext = this.renderContext;
		var gl = this.renderContext.gl;

		var verts = [];
		for (var idx = 0; idx < bucket.points.length; ++idx) {
			var point = bucket.points[idx];
			verts.push(point.pos3d[0]);
			verts.push(point.pos3d[1]);
			verts.push(point.pos3d[2]);
		}

		// console.log("asdf: " + verts.length);
		if (verts.length !== 72) { // FIXXME: that should not happen, find error!
			return;
		}
		// vertex coords array
		var vertices = new Float32Array(verts);

		// // normal array
		// var normals = new Float32Array(
		// [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // v0-v1-v2-v3 front
		// 	1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
		// 	0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // v0-v5-v6-v1 top
		// 	-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // v1-v6-v7-v2 left
		// 	0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // v7-v4-v3-v2 bottom
		// 	0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
		// ] // v4-v7-v6-v5 back
		// );


		// // texCoord array
		// var texCoords = new Float32Array(
		// [1, 1, 0, 1, 0, 0, 1, 0, // v0-v1-v2-v3 front
		// 	0, 1, 0, 0, 1, 0, 1, 1, // v0-v3-v4-v5 right
		// 	1, 0, 1, 1, 0, 1, 0, 0, // v0-v5-v6-v1 top
		// 	1, 1, 0, 1, 0, 0, 1, 0, // v1-v6-v7-v2 left
		// 	0, 0, 1, 0, 1, 1, 0, 1, // v7-v4-v3-v2 bottom
		// 	0, 0, 1, 0, 1, 1, 0, 1
		// ] // v4-v7-v6-v5 back
		// );

		// index array
		var indices = new Uint8Array(
			[0, 1, 2, 0, 2, 3, // front
				4, 5, 6, 4, 6, 7, // right
				8, 9, 10, 8, 10, 11, // top
				12, 13, 14, 12, 14, 15, // left
				16, 17, 18, 16, 18, 19, // bottom
				20, 21, 22, 20, 22, 23
			] // back
		);

		var box = {};

		// box.normalObject = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, box.normalObject);
		// gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

		// box.texCoordObject = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, box.texCoordObject);
		// gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

		box.vertexObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, box.vertexObject);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		box.indexObject = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indexObject);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.DYNAMIC_DRAW);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		box.numIndices = indices.length;

		// Warning : use quoted strings to access properties of the attributes, to work correctly in advanced mode with closure compiler
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		// gl.vertexAttribPointer(this.program.area.attributes['vertex'], 3, gl.FLOAT, false, 0, 0);

		gl.uniform1f(this.program.area.uniforms["alpha"], bucket.layer._opacity);
		gl.uniform3f(this.program.area.uniforms["fillColor"], bucket.points[0].fillColor[0], bucket.points[0].fillColor[1], bucket.points[0].fillColor[2]);
		gl.uniform3f(this.program.area.uniforms["outlineColor"], bucket.points[0].outlineColor[0], bucket.points[0].outlineColor[1], bucket.points[0].outlineColor[2]);

		// Enable all of the vertex attribute arrays.
		// gl.enableVertexAttribArray(0);
		// gl.enableVertexAttribArray(1);
		// gl.enableVertexAttribArray(2);

		// Set up all the vertex attributes for vertices, normals and texCoords
		gl.bindBuffer(gl.ARRAY_BUFFER, box.vertexObject);
		gl.vertexAttribPointer(this.program.area.attributes['vertex'], 3, gl.FLOAT, false, 0, 0);

		// gl.bindBuffer(gl.ARRAY_BUFFER, box.normalObject);
		// gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

		// gl.bindBuffer(gl.ARRAY_BUFFER, box.texCoordObject);
		// gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

		// Bind the index array
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indexObject);

		gl.drawElements(gl.TRIANGLES, box.numIndices, gl.UNSIGNED_BYTE, 0);
		// gl.drawArrays(gl.TRIANGLE_FAN, 0, bucket.points.length);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indexObject, null);

		this.numberOfRenderPoints++;
	};

	AreoOfInterestRenderer.prototype._drawPlane = function(bucket) {
		var renderContext = this.renderContext;
		var gl = this.renderContext.gl;

		var verts = [];
		for (var idx = 0; idx < bucket.points.length; ++idx) {
			var point = bucket.points[idx1];
			verts.push(point.pos3d[0]);
			verts.push(point.pos3d[1]);
			verts.push(point.pos3d[2]);
		}

		var vertices = new Float32Array(verts);

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		// Warning : use quoted strings to access properties of the attributes, to work correctly in advanced mode with closure compiler
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(this.program.area.attributes['vertex'], 3, gl.FLOAT, false, 0, 0);

		gl.uniform1f(this.program.area.uniforms["alpha"], bucket.layer._opacity);
		gl.uniform3f(this.program.area.uniforms["fillColor"], bucket.points[0].fillColor[0], bucket.points[0].fillColor[1], bucket.points[0].fillColor[2]);
		gl.uniform3f(this.program.area.uniforms["outlineColor"], bucket.points[0].outlineColor[0], bucket.points[0].outlineColor[1], bucket.points[0].outlineColor[2]);

		gl.drawArrays(gl.TRIANGLE_FAN, 0, bucket.points.length);

		this.numberOfRenderPoints++;
	};

	AreoOfInterestRenderer.prototype.drawOutline = function() {

		var renderContext = this.renderContext;
		var gl = this.renderContext.gl;

		// Setup program
		this.program.outline.apply();
		gl.lineWidth(2);

		// The shader only needs the viewProjection matrix, use modelViewMatrix as a temporary storage
		mat4.multiply(renderContext.projectionMatrix, renderContext.viewMatrix, renderContext.modelViewMatrix)
		gl.uniformMatrix4fv(this.program.outline.uniforms["viewProjectionMatrix"], false, renderContext.modelViewMatrix);

		// Compute eye direction from inverse view matrix
		mat4.inverse(renderContext.viewMatrix, renderContext.modelViewMatrix);
		var camZ = [renderContext.modelViewMatrix[8], renderContext.modelViewMatrix[9], renderContext.modelViewMatrix[10]];
		vec3.normalize(camZ);
		vec3.scale(camZ, this.tileConfig.cullSign, camZ);

		// Compute pixel size vector to offset the points from the earth
		var pixelSizeVector = renderContext.computePixelSizeVector();

		for (var idx = 0; idx < this.buckets.length; idx++) {

			var bucket = this.buckets[idx]

			if (bucket.type === "2D") {
				this._drawPlaneOutline(bucket);
			} else {
				this._drawBoxOutline(bucket);
			}
		}
	};

	AreoOfInterestRenderer.prototype._drawPlaneOutline = function(bucket) {
		var renderContext = this.renderContext;
		var gl = this.renderContext.gl;

		var verts = [];
		for (var idx = 0; idx < bucket.points.length; ++idx) {
			var point = bucket.points[idx1];
			verts.push(point.pos3d[0]);
			verts.push(point.pos3d[1]);
			verts.push(point.pos3d[2]);
		}

		var vertices = new Float32Array(verts);

		this.vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

		// Warning : use quoted strings to access properties of the attributes, to work correctly in advanced mode with closure compiler
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		gl.vertexAttribPointer(this.program.outline.attributes['vertex'], 3, gl.FLOAT, false, 0, 0);

		gl.uniform1f(this.program.outline.uniforms["alpha"], 0.8);
		gl.uniform3f(this.program.outline.uniforms["fillColor"], bucket.points[0].fillColor[0], bucket.points[0].fillColor[1], bucket.points[0].fillColor[2]);
		gl.uniform3f(this.program.outline.uniforms["outlineColor"], bucket.points[0].outlineColor[0], bucket.points[0].outlineColor[1], bucket.points[0].outlineColor[2]);

		gl.drawArrays(gl.LINE_LOOP, 0, bucket.points.length);

		this.numberOfRenderPoints++;
	};

	AreoOfInterestRenderer.prototype._drawBoxOutline = function(bucket) {
		var renderContext = this.renderContext;
		var gl = this.renderContext.gl;

		var verts = [];
		for (var idx = 0; idx < bucket.points.length; ++idx) {
			var point = bucket.points[idx];
			verts.push(point.pos3d[0]);
			verts.push(point.pos3d[1]);
			verts.push(point.pos3d[2]);
		}

		// console.log("asdf: " + verts.length);
		if (verts.length !== 72) { // FIXXME: that should not happen, find error!
			return;
		}
		// vertex coords array
		var vertices = new Float32Array(verts);

		// // normal array
		// var normals = new Float32Array(
		// [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, // v0-v1-v2-v3 front
		// 	1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, // v0-v3-v4-v5 right
		// 	0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, // v0-v5-v6-v1 top
		// 	-1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, // v1-v6-v7-v2 left
		// 	0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, // v7-v4-v3-v2 bottom
		// 	0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
		// ] // v4-v7-v6-v5 back
		// );


		// // texCoord array
		// var texCoords = new Float32Array(
		// [1, 1, 0, 1, 0, 0, 1, 0, // v0-v1-v2-v3 front
		// 	0, 1, 0, 0, 1, 0, 1, 1, // v0-v3-v4-v5 right
		// 	1, 0, 1, 1, 0, 1, 0, 0, // v0-v5-v6-v1 top
		// 	1, 1, 0, 1, 0, 0, 1, 0, // v1-v6-v7-v2 left
		// 	0, 0, 1, 0, 1, 1, 0, 1, // v7-v4-v3-v2 bottom
		// 	0, 0, 1, 0, 1, 1, 0, 1
		// ] // v4-v7-v6-v5 back
		// );

		// index array
		// var indices = new Uint8Array(
		// [0, 1, 2, 0, 2, 3, // front
		// 	4, 5, 6, 4, 6, 7, // right
		// 	8, 9, 10, 8, 10, 11, // top
		// 	12, 13, 14, 12, 14, 15, // left
		// 	16, 17, 18, 16, 18, 19, // bottom
		// 	20, 21, 22, 20, 22, 23
		// ] // back
		// );

		// FIXXME: the box construction is nonsense, fix it!
		// index array
		var indices = [];
		indices.push(new Uint8Array([0, 1, 2, 3])); // front
		indices.push(new Uint8Array([5, 6, 7, 4])); // front
		indices.push(new Uint8Array([1, 0, 7, 10])); // front
		indices.push(new Uint8Array([13, 14, 15, 16])); // front
		indices.push(new Uint8Array([17, 18, 19, 20])); // front

		var box = {};

		// box.normalObject = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, box.normalObject);
		// gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);

		// box.texCoordObject = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, box.texCoordObject);
		// gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

		box.vertexObject = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, box.vertexObject);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		box.indexObject = [];
		box.numIndices = [];

		for (idx1 = 0; idx1 < indices.length; idx1++) {
			box.indexObject[idx1] = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indexObject[idx1]);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices[idx1], gl.DYNAMIC_DRAW);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

			box.numIndices[idx1] = indices[idx1].length;
		}

		// Warning : use quoted strings to access properties of the attributes, to work correctly in advanced mode with closure compiler
		// gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
		// gl.vertexAttribPointer(this.program.area.attributes['vertex'], 3, gl.FLOAT, false, 0, 0);

		gl.uniform1f(this.program.outline.uniforms["alpha"], bucket.layer._opacity);
		gl.uniform3f(this.program.outline.uniforms["fillColor"], bucket.points[0].fillColor[0], bucket.points[0].fillColor[1], bucket.points[0].fillColor[2]);
		gl.uniform3f(this.program.outline.uniforms["outlineColor"], bucket.points[0].outlineColor[0], bucket.points[0].outlineColor[1], bucket.points[0].outlineColor[2]);

		// Enable all of the vertex attribute arrays.
		// gl.enableVertexAttribArray(0);
		// gl.enableVertexAttribArray(1);
		// gl.enableVertexAttribArray(2);

		// Set up all the vertex attributes for vertices, normals and texCoords
		gl.bindBuffer(gl.ARRAY_BUFFER, box.vertexObject);
		gl.vertexAttribPointer(this.program.outline.attributes['vertex'], 3, gl.FLOAT, false, 0, 0);

		// gl.bindBuffer(gl.ARRAY_BUFFER, box.normalObject);
		// gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

		// gl.bindBuffer(gl.ARRAY_BUFFER, box.texCoordObject);
		// gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0);

		// Bind the index array
		for (idx2 = 0; idx2 < indices.length; idx2++) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box.indexObject[idx2]);
			gl.drawElements(gl.LINE_LOOP, box.numIndices[idx2], gl.UNSIGNED_BYTE, 0);
			// gl.drawArrays(gl.TRIANGLE_FAN, 0, bucket.points.length);
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

		this.numberOfRenderPoints++;
	};

	/**************************************************************************************************************/

	// Register the renderer
	VectorRendererManager.registerRenderer({
		creator: function(globe) {
			return new AreoOfInterestRenderer(globe.tileManager);
		},
		canApply: function(type, style) {
			if (type === "Polygon" && style.renderer === "AreaOfInterest") {
				console.debug("[VectorRendererManager::AreaOfInterestRenderer] selected with style:");
				console.log(style);
			}
			return type === "Polygon" && style.renderer === "AreaOfInterest";
		},
		id: function() {
			return "AreaOfInterest";
		}
	});

	return AreoOfInterestRenderer;

});