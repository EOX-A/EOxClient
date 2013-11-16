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

define(['../bower_components/virtualglobeviewer/src/SceneGraph/SceneGraph'], function(SceneGraph) {

    var glTFLoader = Object.create(glTFParser, {

        handleBuffer: {
            value: function(entryID, description, userInfo) {
                console.log('handleBuffer:');
                console.dir(description);
                return true;
            }
        },

        handleImage: {
            value: function(entryID, description, userInfo) {
                console.log('handleImage:');
                console.dir(description);
                return true;
            }
        },

        handleShader: {
            value: function(entryID, description, userInfo) {
                console.log('handleShader:');
                console.dir(description);
                return true;
            }
        },

        handleTechnique: {
            value: function(entryID, description, userInfo) {
                console.log('handleTechnique:');
                console.dir(description);
                return true;
            }
        },

        handleMaterial: {
            value: function(entryID, description, userInfo) {
                console.log('handleMaterial:');
                console.dir(description);
                return true;
            }
        },

        handleLight: {
            value: function(entryID, description, userInfo) {
                console.log('handleLight:');
                console.dir(description);
                return true;
            }
        },

        handleMesh: {
            value: function(entryID, description, userInfo) {
                console.log('handleMesh:');
                console.dir(description);
                return true;
            }
        },

        handleCamera: {
            value: function(entryID, description, userInfo) {
                console.log('handleCamera:');
                console.dir(description);
                return true;
            }
        },

        handleScene: {
            value: function(entryID, description, userInfo) {
                console.log('handleScene:');
                console.dir(description);
                return true;
            }
        },

        handleNode: {
            value: function(entryID, description, userInfo) {
                console.log('handleNode:');
                console.dir(description);
                return true;
            }
        }

    });

    return glTFLoader;
});