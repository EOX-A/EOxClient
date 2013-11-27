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
requirejs.config({
    paths: {
        gw: '../bower_components/virtualglobeviewer/src'
    }
});

require([
    './glTFLoader',
    '../bower_components/virtualglobeviewer/src/SceneGraph/SceneGraph',
    '../bower_components/virtualglobeviewer/src/RenderContext',
    '../bower_components/virtualglobeviewer/src/SceneGraph/Navigation',
    '../bower_components/virtualglobeviewer/src/SceneGraph/Renderer'
], function(GlobWebGLTFLoader, SceneGraph, RenderContext, Navigation, SceneGraphRenderer) {

    var fpsElement = null;
    var renderContext;

    var stats = function() {
        if (fpsElement != null) {
            fpsElement.innerHTML = "<span style=\"font-weight:bold\">FPS : " + renderContext.numFrames + "</span>";
        }

        renderContext.numFrames = 0;
    }

    fpsElement = document.getElementById("fps");
    window.setInterval(stats, 1000);

    renderContext = new RenderContext({
        canvas: "viewport",
        backgroundColor: [1.0, 1.0, 1.0, 1.0],
        continuousRendering: true
    });
    var nav = new Navigation(renderContext);

    var sgRenderer;

    var loader = Object.create(GlobWebGLTFLoader);
    loader.initWithPath("./model/duck/duck.json");
//     loader.initWithPath("./model/box/box.json");
//     loader.initWithPath("./model/vcurtains/gltf/test.json");

    var onLoadedCallback = function(success, rootObj) {
        // if (success) {
        //     console.log('Loading model successfully finished');
        // } else {
        //     console.log('Loading model FAILED');
        // }
        // console.log('rootObj:');
        // console.dir(rootObj);

        nav.node = rootObj;
        sgRenderer = new SceneGraphRenderer(renderContext, rootObj);
        console.log('Starting to render');
    };

    loader.load({
        rootObj: new SceneGraph.Node()
    }, onLoadedCallback);
});



// require(['../src/RenderContext','../src/SceneGraph/Navigation','../src/SceneGraph/ColladaParser','../src/SceneGraph/Renderer'],
//     function (RenderContext,Navigation,ColladaParser,SceneGraphRenderer)  {

// var fpsElement = null;
// var renderContext;

// var stats = function()
// {
//     if ( fpsElement != null )
//     {
//         fpsElement.innerHTML = "<span style=\"font-weight:bold\">FPS : " + renderContext.numFrames + "</span>";
//     }

//     renderContext.numFrames = 0;
// }

// $(function()
// {
//     fpsElement = document.getElementById("fps");
//     window.setInterval(stats,1000);

//     renderContext = new RenderContext( { canvas: "ColladaCanvas", backgroundColor: [1.0,1.0,1.0,1.0], continuousRendering: true  });
//     var nav = new Navigation(renderContext);

//     var sgRenderer;

//     var xhr = new XMLHttpRequest();
//     xhr.onreadystatechange = function(e)
//     {
//         if ( xhr.readyState == 4 )// && xhr.status == 200)
//         {
//             var node = ColladaParser.parse( xhr.responseXML );
//             nav.node = node;
//             sgRenderer = new SceneGraphRenderer(renderContext,node);
//         }
//     };
//     //xhr.open("GET", "models/warehouse_model.dae");
//     //xhr.open("GET", "models/worms-cathedral.dae");
//     //xhr.open("GET", "duck_triangulate.dae");
//     // xhr.open("GET", "models/soldier.dae");
//             xhr.open("GET", "models/collada/clouds.dae");
//     xhr.send();


// });