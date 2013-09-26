/**
 * @namespace Namespace for the Earth Server Generic Client
 */
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @ignore Just Inheritance Helper
 */
Function.prototype.inheritsFrom = function( parentClassOrObject )
{
    if ( parentClassOrObject.constructor == Function )
    {
        //Normal Inheritance
        this.prototype = new parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject.prototype;
    }
    else
    {
        //Pure Virtual Inheritance
        this.prototype = parentClassOrObject;
        this.prototype.constructor = this;
        this.prototype.parent = parentClassOrObject;
    }
    return this;
};

/**
 * This function checks if this code is running on a mobile platform.
 * The function returns true if it's a mobile platform, false if not.
 * @return {boolean}
 *
 */
EarthServerGenericClient.isMobilePlatform = function ()
{
    var mobilePlatform = (function(a)
    {
        if(/android.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge|maemo|midp|mmp|opera m(ob|in)i|palm(os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|treo|up\.(browser|link)|vodafone|wap|windows(ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|awa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r|s)|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp(i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac(|\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt(|\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg(g|\/(k|l|u)|50|54|e\-|e\/|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(di|rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-||o|v)|zz)|mt(50|p1|v)|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v)|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-|)|webc|whit|wi(g|nc|nw)|wmlb|wonu|x700|xda(\-|2|g)|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
        {return true} else {return false}
    })(navigator.userAgent||window.opera);

    return mobilePlatform;
};

/**
 * @ignore Helper for Events
 */
EarthServerGenericClient.getEventTarget = function(e)
{
    e = e || window.event;
    return e.target || e.srcElement;
};

/**
 * @class SceneManager is the main class of the unified client.
 * All scene models are registered in this class with the add() function.
 * The createScene() function creates a x3dom scene with all scene models.
 * The createUI() function creates the UI.
 */
EarthServerGenericClient.SceneManager = function()
{
    var models = [];               //Array of scene models
    var modelLoadingProgress = []; //Array to store the models loading progress
    var totalLoadingProgress = 0;  //Value for the loading progress bar (all model loading combined)
    var baseElevation = [];        //Every Model has it's base elevation on the Y-Axis. Needed to change and restore the elevation.
    var currentUIElement = 0;      //The current chosen UI element, which is a Model. Change everything for the model with that ID.
    var progressCallback = undefined;//Callback function for the progress update.
    var annotationLayers = [];      //Array of AnnotationsLayer to display annotations in the cube
    var cameraDefs = [];            //Name and ID of the specified cameras. Format: "NAME:ID"
    var maxResolution = 1000;
    var axisLabels = null;

    /**
     * Enables/Disables the logging of Server requests, building of terrain etc.
     * @default false
     * @type {boolean}
     */
    var timeLog= false;

    /**
     * This variable contains the AxisLabel object.
     * This object manages the labels and its appearances on each axis.
     * @default null
     * @type {Object}
     */
    var axisLabels = null;

    /**
     * Name of the X-Axis to be displayed.
     * @default "x"
     * @type {String}
     */
    var xLabel = "X";

    /**
     * Name of the Y-Axis to be displayed.
     * @default "y"
     * @type {String}
     */
    var yLabel = "Y";

    /**
     * Name of the Z-Axis to be displayed.
     * @default "z"
     * @type {String}
     */
    var zLabel = "Z";

    /**
     * Returns the number of registered scene models.
     * @returns {Number}
     */
    this.getModelCount = function()
    {
        return models.length;
    };

    /**
     * Returns the name of the scene model with the given index.
     * @param modelIndex - Index of the model.
     * @returns {String}
     */
    this.getModelName = function(modelIndex)
    {
        if(modelIndex < models.length)
        {   return models[modelIndex].name; }
        else
        {   return "No model with ID " + modelIndex;    }
    };

    /**
     * Returns the X offset of the model with the given index.
     * @param modelIndex - Index of the model.
     * @returns {Number}
     */
    this.getModelOffsetX= function(modelIndex)
    {
        if(modelIndex < models.length)
        {   return models[modelIndex].xOffset; }
        else
        {
            console.log("MainScene::getModelOffsetX: No model with ID " + modelIndex);
            return 0;
        }
    };

    /**
     * Returns the Y offset of the model with the given index.
     * @param modelIndex - Index of the model.
     * @returns {Number}
     */
    this.getModelOffsetY= function(modelIndex)
    {
        if(modelIndex < models.length)
        {   return models[modelIndex].yOffset; }
        else
        {
            console.log("MainScene::getModelOffsetY: No model with ID " + modelIndex);
            return 0;
        }
    };

    /**
     * Returns the Z offset of the model with the given index.
     * @param modelIndex - Index of the model.
     * @returns {Number}
     */
    this.getModelOffsetZ= function(modelIndex)
    {
        if(modelIndex < models.length)
        {   return models[modelIndex].zOffset; }
        else
        {
            console.log("MainScene::getModelOffsetZ: No model with ID " + modelIndex);
            return 0;
        }
    };

    /**
     * Returns the transparency of the model with the given index.
     * @param modelIndex - Index of the model.
     * @returns {Number}
     */
    this.getModelTransparency = function(modelIndex)
    {
        if(modelIndex < models.length)
        {   return models[modelIndex].transparency; }
        else
        {
            console.log("MainScene::getModelTransparency: No model with ID " + modelIndex);
            return 0;
        }
    };

    /**
     * Let the scene model set it's specific UI element in the given domElement.
     * @param modelIndex - Index of the model.
     * @param domElement - domElement to put the UI element into.
     */
    this.setSpecificElement = function(modelIndex,domElement)
    {
        if(modelIndex < models.length)
        {   models[modelIndex].setSpecificElement(domElement); }
        else
        {
            console.log("MainScene::SetSpecificElement: No model with ID " + modelIndex);
        }
    };

    /**
     * @default 1000 / 200 on a mobile platform
     * @type {Number}
     */
    if( EarthServerGenericClient.isMobilePlatform())  //and for mobile Clients
        maxResolution = 200;

    /**
     * Enables or disables the logging.
     * @param value - Boolean
     */
    this.setTimeLog = function(value)
    {   timeLog = value; };
    /**
     * Starts the timer for a logging event with the given name.
     * @param eventName
     */
    this.timeLogStart = function(eventName)
    {
        if( timeLog)
        {   console.time(eventName); }
    };
    /**
     * Ends the timer for a logging event with the given name and prints the result.
     * @param eventName
     */
    this.timeLogEnd = function(eventName)
    {
        if( timeLog)
        {   console.timeEnd(eventName); }
    };

    /**
     * Determines if an annotation layer will be drawn.
     * @param layerName - Name of the annotation layer.
     * @param drawValue - boolean value.
     */
    this.drawAnnotationLayer = function(layerName,drawValue)
    {
        var index = this.getAnnotationLayerIndex(layerName);
        if( index < annotationLayers.length )
        {   annotationLayers[index].renderLayer(drawValue); }
        else
        {   console.log("MainScene::drawAnnotationLayer: No Layer with name " + layerName);  }
    };

    /**
     * Returns the annotation texts of a given annotation layer as an array of strings.
     * @param layerName - Name of the Annotation Layer.
     * @returns {*} - Array of Annotations as strings.
     */
    this.getAnnotationLayerTexts = function(layerName)
    {
        var index = this.getAnnotationLayerIndex(layerName);
        if( index < annotationLayers.length )
        {   return annotationLayers[index].getAnnotationTexts(); }
        else
        {
            var val = [];
            val.push("MainScene::getAnnotationLayerTexts: No Layer with name " + layerName);
            console.log(val);
            return val;
        }
    };

    /**
     * Returns the number of registered AnnotationLayers.
     * @returns {Number}
     */
    this.getAnnotationLayerCount = function()
    {
        return annotationLayers.length;
    };

    /**
     * Returns the name of the AnnotationLayer with the given index.
     * @param layerIndex - Index of the AnnotationLayer.
     * @returns {*} - Either the Name of the AnnotationLayer or "No Name"
     */
    this.getAnnotationLayerName = function(layerIndex)
    {
        if( layerIndex < annotationLayers.length)
        {   return annotationLayers[layerIndex].name; }
        else
        {
            console.log("MainScene::getAnnotationLayerName: No Layer with ID " + layerIndex);
            return "No Name";
        }
    };

    /**
     * Returns the index of an existing AnnotationLayer in the array or -1 if no layer with the given name was found.
     * @param AnnotationLayerName - Name of the Layer
     * @returns {number} - Either index in the array or -1 if not found
     */
    this.getAnnotationLayerIndex = function(AnnotationLayerName)
    {
        for(var i=0;i<annotationLayers.length;i++)
        {
            if( annotationLayers[i].name === AnnotationLayerName)
            {
                return i;
            }
        }

        return -1;
    };

    /**
     * Adds an AnnotationsLayer to the scene.
     * @param name - Name of the Layer. You need the name of a layer to add annotations to it.
     * @param fontSize - Font size of all annotations added to this layer.
     * @param fontColor - Color of all annotations added to this layer.
     * @param fontHover - The annotation text hovers above the annotation marker by this value.
     * @param markerSize - The size if the annotation marker
     * @param markerColor - Color of the annotation marker
     */
    this.addAnnotationsLayer = function(name,fontSize,fontColor,fontHover,markerSize,markerColor)
    {
        var root = document.getElementById("AnnotationsGroup");
        if( root)
        {
            if( this.getAnnotationLayerIndex(name) < 0)
            {
                var layer = new EarthServerGenericClient.AnnotationLayer(name,root,fontSize,fontColor,fontHover,markerSize,markerColor);
                annotationLayers.push(layer);
            }
            else
            {   alert("AnnotationLayer with this name already created.");   }
        }
        else
        {   alert("Please add Layers after creating the scene.");   }
    };

    /**
     * Adds an annotation to an existing annotation layer.
     * @param AnnotationLayerName - Name of the annotation layer to add the annotation to.
     * @param xPos - Position on the x-axis of the annotation.
     * @param yPos - Position on the y-axis of the annotation.
     * @param zPos - Position on the z-axis of the annotation.
     * @param Text - Text of the annotation.
     */
    this.addAnnotation = function(AnnotationLayerName,xPos,yPos,zPos,Text)
    {
        var index = this.getAnnotationLayerIndex(AnnotationLayerName);
        if( index >= 0)
        {
            annotationLayers[index].addAnnotation(xPos,yPos,zPos,Text);
        }
        else
        {
            alert("Could not found a AnnotationLayer with name: " + AnnotationLayerName);
        }
    };

    /**
     * Sets the callback function for the progress update. The progress function gives a parameter between 0-100.
     * You can set callback = null for no progress update at all. If no callback is given at all the progress is
     * printed to the console.
     * @param callback
     */
    this.setProgressCallback=function(callback)
    {
        progressCallback = callback;
    };
    /**
     * All Modules and Terrain shall report their loading progress.
     * Modules when they receive data and terrains if they are done building the terrain.
     * Every time this function is called 1 is added to the total progress. It is assumed that for every
     * request a terrain is build thus 100% = model.requests*2
     * If a callback is registered the function is called, otherwise the progress is printed to the console or ignored.
     * @param modelIndex - Index of the model.
     */
    this.reportProgress = function(modelIndex)
    {
        //If null no progress update is wished
        if( progressCallback !== null)
        {
            modelLoadingProgress[modelIndex] += 1;

            //Reset total loading progress to 0 and calc it with the new value
            totalLoadingProgress = 0;
            for(var i=0; i<modelLoadingProgress.length; i++)
            {
                var tmp = modelLoadingProgress[i] / ( models[i].requests *2 );
                if( tmp > 1.0) tmp = 1;
                totalLoadingProgress += tmp;
            }
            totalLoadingProgress = (totalLoadingProgress / modelLoadingProgress.length)*100;

            //Callback function or console?
            if( progressCallback !== undefined)
            {   progressCallback(totalLoadingProgress);    }
            else
            {   console.log(totalLoadingProgress); }
        }
    };

    /**
     * Returns the maximum resolution per dimension of a scene model.
     * This number depends on power templates (e.g. mobile device).
     * @return {Number}
     */
    this.getMaxResolution = function()
    {   return maxResolution;   };

    /**
     * Adds any scene model to the scene.
     * @param model
     *      Any type of scene model.
     */
    this.addModel = function( model )
    {
        //Model ID is the current length of the models array. That means to IDs start at 0 and increase by 1.
        model.index = models.length;
        //Store model in the array
        models.push(model);
        //Initialize it's loading progress to 0
        modelLoadingProgress[model.index] = 0;
    };

    /**
     * Sets the view of the X3Dom window to the predefined camera.
     * @param camID - ID of the Camera dom object.
     */
    this.setView =function(camID)
    {
        var cam = document.getElementById(camID);
        if(cam)
        {
            //If the user changes the camera, then moves around the camera has to be set to false to be able to bin again
            cam.setAttribute('set_bind','false');
            cam.setAttribute('set_bind','true');
        }
    };

    /**
     * Returns the number of defined cameras
     * @returns {Number}
     */
    this.getCameraDefCount = function()
    {
        return cameraDefs.length;
    };

    /**
     * Returns the definition of the camera with the given index.
     * Format: "CameraName:CameraID"
     * @param cameraIndex
     * @returns {String}
     */
    this.getCameraDef = function(cameraIndex)
    {
        if(cameraIndex < cameraDefs.length)
        {   return cameraDefs[cameraIndex]; }
        else
        {   return "Camera:NotDefined"}
    };

    /**
     * Creates the whole X3DOM Scene in the fishtank/cube with all added scene models.
     * The Sizes of the cube are assumed as aspect ratios with values between 0 and 1.
     * Example createScene("x3dom_div",1.0, 0.3, 0.5 ) Cube has 30% height and 50 depth compared to the width.
     * @param x3dID - ID of the x3d dom element.
     * @param sceneID - ID of the scene element.
     * @param cubeSizeX - width of the cube.
     * @param cubeSizeY - height of the cube.
     * @param cubeSizeZ - depth of the cube.
     */
    this.createScene = function(x3dID,sceneID, cubeSizeX, cubeSizeY, cubeSizeZ )
    {
        if( cubeSizeX <= 0 || cubeSizeX > 1.0) cubeSizeX = 1.0;
        if( cubeSizeY <= 0 || cubeSizeY > 1.0) cubeSizeY = 1.0;
        if( cubeSizeZ <= 0 || cubeSizeZ > 1.0) cubeSizeZ = 1.0;

        cubeSizeX = (parseFloat(cubeSizeX) * 1000);
        cubeSizeY = (parseFloat(cubeSizeY) * 1000);
        cubeSizeZ = (parseFloat(cubeSizeZ) * 1000);

        this.cubeSizeX = cubeSizeX;
        this.cubeSizeY = cubeSizeY;
        this.cubeSizeZ = cubeSizeZ;

        var scene = document.getElementById(sceneID);
        if( !scene)
        {
            alert("No X3D Scene found with id " + sceneID);
            return;
        }

        //Background
        var background = document.createElement("Background");
        background.setAttribute("groundAngle",'0.9 1.5 1.57');
        background.setAttribute("groundColor",'0.3 0.3 0.4 0.35 0.35 0.55 0.4 0.4 0.5 0.5 0.5 0.6');
        background.setAttribute("skyAngle",'0.9 1.5 1.57');
        background.setAttribute("skyColor",'0.2 0.2 0.3 0.3 0.4 0.3 0.4 0.5 0.4 0.5 0.5 0.6');
        scene.appendChild(background);

        //Cameras
        var cam1 = document.createElement('Viewpoint');
        cam1.setAttribute("id","EarthServerGenericClient_Cam_Front");
        cam1.setAttribute("position", "0 0 " + this.cubeSizeZ*2);
        cameraDefs.push("Front:EarthServerGenericClient_Cam_Front");

        var cam2 = document.createElement('Viewpoint');
        cam2.setAttribute("id","EarthServerGenericClient_Cam_Top");
        cam2.setAttribute("position", "0 " + this.cubeSizeY*2.5 + " 0");
        cam2.setAttribute("orientation", "1.0 0.0 0.0 -1.55");
        cameraDefs.push("Top:EarthServerGenericClient_Cam_Top");

        var cam3 = document.createElement('Viewpoint');
        cam3.setAttribute("id","EarthServerGenericClient_Cam_Side");
        cam3.setAttribute("position", "" + -this.cubeSizeX*2+ " 0 0");
        cam3.setAttribute("orientation", "0 1 0 -1.55");
        cameraDefs.push("Side:EarthServerGenericClient_Cam_Side");

        scene.appendChild(cam1);
        scene.appendChild(cam2);
        scene.appendChild(cam3);

        var shape = document.createElement('Shape');
        var appearance = document.createElement('Appearance');
        var material = document.createElement('Material');
        material.setAttribute("emissiveColor","1 1 0");

        var lineset = document.createElement('IndexedLineSet');
        lineset.setAttribute("colorPerVertex", "false");
        lineset.setAttribute("coordIndex","0 1 2 3 0 -1 4 5 6 7 4 -1 0 4 -1 1 5 -1 2 6 -1 3 7 -1");

        var coords = document.createElement('Coordinate');
        coords.setAttribute("id", "cube");

        var cubeX = cubeSizeX/2.0;
        var cubeY = cubeSizeY/2.0;
        var cubeZ = cubeSizeZ/2.0;
        var cubeXNeg = -cubeSizeX/2.0;
        var cubeYNeg = -cubeSizeY/2.0;
        var cubeZNeg = -cubeSizeZ/2.0;

        var p = {};
        p[0] = ""+ cubeXNeg + " " + cubeYNeg + " " + cubeZNeg + " ";
        p[1] = ""+ cubeX + " " + cubeYNeg + " " + cubeZNeg + " ";
        p[2] = ""+ cubeX + " " + cubeY + " " + cubeZNeg + " ";
        p[3] = ""+ cubeXNeg + " " + cubeY + " " + cubeZNeg + " ";
        p[4] = ""+ cubeXNeg + " " + cubeYNeg + " " + cubeZ + " ";
        p[5] = ""+ cubeX + " " + cubeYNeg + " " + cubeZ + " ";
        p[6] = ""+ cubeX + " " + cubeY + " " + cubeZ + " ";
        p[7] = ""+ cubeXNeg + " " + cubeY + " " + cubeZ + " ";
        var points="";
        for(var i=0; i<8;i++)
        {   points = points+p[i];   }
        coords.setAttribute("point", points);

        lineset.appendChild(coords);
        appearance.appendChild(material);
        shape.appendChild(appearance);
        shape.appendChild(lineset);
        scene.appendChild(shape);

        var trans = document.createElement('Transform');
        trans.setAttribute("id", "trans");
        scene.appendChild(trans);

        this.setView('EarthServerGenericClient_Cam_Front');
        this.trans = trans;

        var annotationTrans = document.createElement("transform");
        annotationTrans.setAttribute("id","AnnotationsGroup");
        scene.appendChild(annotationTrans);
    };

    /**
     *
     */
    this.createAxisLabels = function()
    {
        axisLabels = new EarthServerGenericClient.AxisLabels(this.cubeSizeX/2, this.cubeSizeY/2, this.cubeSizeZ/2);
        axisLabels.createAxisLabels(xLabel,yLabel,zLabel);
    };

    /**
     * This function starts to load all models. You call this when the html is loaded or later on a click.
     */
    this.createModels = function()
    {
        for(var i=0; i< models.length; i++)
        {
            models[i].createModel(this.trans,this.cubeSizeX,this.cubeSizeY,this.cubeSizeZ);
        }
    };

    /**
     * Update Offset changes the position of the current selected SceneModel on the x-,y- or z-Axis.
     * @param modelIndex - Index of the model that should be altered
     * @param which - Which Axis will be changed (0:X 1:Y 2:Z)
     * @param value - The new position
     */
    this.updateOffset = function(modelIndex,which,value)
    {
        var trans = document.getElementById("EarthServerGenericClient_modelTransform"+modelIndex);

        if( trans )
        {
            var offset;
            switch(which)
            {
                case 0: offset = this.cubeSizeX/2.0; break;
                case 1: offset = this.cubeSizeY/2.0; break;
                case 2: offset = this.cubeSizeZ/2.0; break;
            }
            var oldTrans = trans.getAttribute("translation");
            oldTrans = oldTrans.split(" ");
            oldTrans[which] = value - offset;
            trans.setAttribute("translation",oldTrans[0] + " " + oldTrans[1] + " " + oldTrans[2]);
        }
    };

    /**
     * This changes the scaling on the Y-Axis(Elevation).
     * @param modelIndex - Index of the model that should be altered
     * @param value - The base elevation is multiplied by this value
     */
    this.updateElevation =function(modelIndex,value)
    {
        var trans = document.getElementById("EarthServerGenericClient_modelTransform"+modelIndex);

        if( trans )
        {
            var oldTrans = trans.getAttribute("scale");
            oldTrans = oldTrans.split(" ");

            if( baseElevation[modelIndex] === undefined)
            {
                baseElevation[modelIndex] = oldTrans[1];
            }

            oldTrans[1] = value*baseElevation[modelIndex]/10;

            trans.setAttribute("scale",oldTrans[0] + " " + oldTrans[1] + " " + oldTrans[2]);
        }
    };

    /**
     * Changes the transparency of the Scene Model.
     * @param modelIndex - Index of the model that should be altered
     * @param value - New Transparency between 0-1 (Fully Opaque - Fully Transparent)
     */
    this.updateTransparency = function(modelIndex,value)
    {
        if(modelIndex < models.length)
        {   models[modelIndex].updateTransparency(value);   }
    };

    /**
     * This creates the UI for the Scene.
     * @param domElementID - The dom element where to append the UI.
     */
    this.createUI = function(domElementID)
    {
        EarthServerGenericClient.createBasicUI(domElementID);
    };

    /**
     * Sets the names of the axes to be displayed.
     * @param LabelX - width
     * @param LabelY - height
     * @param LabelZ - depth
     */
    this.setAxisLabels = function( LabelX, LabelY, LabelZ){
        xLabel = String(LabelX);
        yLabel = String(LabelY);
        zLabel = String(LabelZ);
    };


};

/**
 * @class Abstract base class for scene models.
 */
EarthServerGenericClient.AbstractSceneModel = function(){
    /**
     * Sets the name of the scene model.
     * The name is useful for the demo because it appears in the category "Modules".
     * @param modelName
     *      Sets the name of model.
     */
    this.setName = function(modelName){
        this.name = String(modelName);
    };
    /**
     * Sets the area of interest for the model (Lower Corner, Upper Corner).
     * @param minx
     *      Minimum of lower latitude
     * @param miny
     *      Minimum of lower longitude
     * @param maxx
     *      Maximum of upper latitude
     * @param maxy
     *      Maximum of upper longitude
     */
    this.setAreaOfInterest = function(minx,miny,maxx,maxy){
        this.minx = minx;
        this.miny = miny;
        this.maxx = maxx;
        this.maxy = maxy;
    };
    /**
     * Sets the resolution of the scene model (if possible).
     * @param xRes
     *      Resolution on the x-axis/Latitude
     * @param zRes
     *      Resolution on the z-axis/Longitude
     */
    this.setResolution = function(xRes,zRes){
        this.XResolution = parseInt(xRes);
        this.ZResolution = parseInt(zRes);

        var maxResolution = EarthServerGenericClient_MainScene.getMaxResolution();
        if( this.XResolution > maxResolution )
        {   this.XResolution = maxResolution;   }
        if( this.ZResolution > maxResolution )
        {   this.ZResolution = maxResolution;   }

    };

    /**
     * Sets the position of the scene model within the fishtank/cube.
     * The function accepts values in the range of 0 and 1 for each parameter.
     * @param xOffset
     *      Offset on the x-axis (width).
     * @param yOffset
     *      Offset on the y-axis (height).
     * @param zOffset
     *      Offset on the z-axis (depth).
     */
    this.setOffset = function( xOffset, yOffset, zOffset){
        this.xOffset = parseFloat(xOffset);
        this.yOffset = parseFloat(yOffset);
        this.zOffset = parseFloat(zOffset);
    };
    /**
     * Sets the size of the scene model compared to the fishtank/cube.
     * The function accepts values in the range of 0 and 1 for each parameter.
     * @param xScale
     *      Size of the model on the x-axis (width).
     * @param yScale
     *      Size of the model on the y-axis (height).
     * @param zScale
     *      Size of the model on the x-axis (width).
     */
    this.setScale = function( xScale, yScale, zScale){
        this.xScale = parseFloat(xScale);
        this.yScale = parseFloat(yScale);
        this.zScale = parseFloat(zScale);
    };

    /**
     * Sets the image format for the server request.
     * @param imageFormat
     *      Default format is "png".
     */
    this.setImageFormat = function( imageFormat){
        this.imageFormat = String(imageFormat);
    };

    /**
     * Sets the initial transparency of the scene model.
     * The function accepts a parameter value in the range of 0 (fully opaque) and 1(fully transparent).
     * @param transparency
     *      Value of visibility.
     */
    this.setTransparency = function( transparency ){
        this.transparency = parseFloat(transparency);
    };

    /**
     * Updates the transparency during runtime of the scene model.
     * The function accepts a value in the range of 0 (fully opaque) and 1(fully transparent).
     * @param transparency
     */
    this.updateTransparency = function( transparency ){
        this.terrain.setTransparency(transparency);
    };

    /**
     * Modules report their loading progress to this function which leads the information to the main scene.
     */
    this.reportProgress = function()
    {
        //The total progress of this module depens on the number of requests it does.
        //The progress parameter is the progress of ONE request.
        //ReceivedDataCount is the number of already received responses.
        //it is doubled because for each request one terrain will be build.
        var totalProgress = ((this.receivedDataCount) / (this.requests * 2))*100;
        EarthServerGenericClient_MainScene.reportProgress(this.index,totalProgress);
    };

    /**
     * Validates the received data from the server request.
     * Checks if a texture and a heightmap are available at the moment.
     * @param data - Received data from the server request.
     * @returns {boolean} - TRUE if OK, FALSE if some data is missing
     */
    this.checkReceivedData = function( data)
    {
        this.receivedDataCount++;
        this.reportProgress();

        if( data === null || !data.validate() )
        {
            alert(this.name +": Request not successful.");
            this.reportProgress();//NO Terrain will be built so report the progress here
            this.removePlaceHolder();//Remove the placeHolder.
            return false;
        }

        return true;
    };

    /**
     * This creates a placeholder Element for the model. It consists of an simple quad.
     * Models that use this placeholder should remove it of course.
     */
    this.createPlaceHolder = function()
    {
        var appearance = document.createElement('Appearance');
        var material = document.createElement('Material');
        material.setAttribute("emissiveColor","0.4 0.4 0.4");

        var trans = document.createElement('Transform');
        var yoff = (this.cubeSizeY * this.yOffset);
        trans.setAttribute("translation", "0 "+ yoff  + " 0");

        var shape = document.createElement('shape');
        var triangleset = document.createElement('IndexedFaceSet');
        triangleset.setAttribute("colorPerVertex", "false");
        triangleset.setAttribute("coordindex","0 1 2 3 -1");

        var coords = document.createElement('Coordinate');

        var cubeX = this.cubeSizeX/2.0;
        var cubeZ = this.cubeSizeZ/2.0;
        var cubeXNeg = -this.cubeSizeX/2.0;
        var cubeYNeg = -this.cubeSizeY/2.0;
        var cubeZNeg = -this.cubeSizeZ/2.0;

        var p = {};
        p[0] = ""+ cubeXNeg + " " + cubeYNeg + " " + cubeZNeg + " ";
        p[1] = ""+ cubeXNeg + " " + cubeYNeg + " " + cubeZ + " ";
        p[2] = ""+ cubeX    + " " + cubeYNeg + " " + cubeZ    + " ";
        p[3] = ""+ cubeX    + " " + cubeYNeg + " " + cubeZNeg;

        var points="";
        for(var i=0; i<4;i++)
        {   points = points+p[i];   }
        coords.setAttribute("point", points);

        triangleset.appendChild(coords);
        appearance.appendChild(material);
        shape.appendChild(appearance);
        shape.appendChild(triangleset);
        trans.appendChild(shape);

        this.placeHolder = trans;
        this.root.appendChild( this.placeHolder );

        appearance = null;
        material = null;
        shape = null;
        triangleset = null;
        coords = null;
        points = null;
        trans = null;
    };

    /**
     * Removes the PlaceHolder created in createPlaceHolder(). If already deleted nothing happens.
     */
    this.removePlaceHolder = function()
    {
        if( this.placeHolder !== null && this.placeHolder !== undefined )
        {
            this.root.removeChild( this.placeHolder);
            this.placeHolder = null;
        }
    };

    /**
     * Creates the transform for the scene model to fit into the fishtank/cube. This is done automatically by
     * the scene model.
     * @param xRes
     *      Size of the received data on the x-axis (e.g. the requested DEM )
     * @param yRes
     *      Size of the received data on the y-axis
     * @param zRes
     *      Size of the received data on the z-axis
     * @param minvalue
     *      Minimum Value along the y-axis (e.g. minimum value in a DEM, so the model starts at it's wished location)
     * @return {Element}
     */
    this.createTransform = function(xRes,yRes,zRes,minvalue){
        var trans = document.createElement('Transform');
        trans.setAttribute("id", "EarthServerGenericClient_modelTransform"+this.index);

        this.YResolution = yRes;

        var scaleX = (this.cubeSizeX*this.xScale)/(parseInt(xRes)-1);
        var scaleY = (this.cubeSizeY*this.yScale)/this.YResolution;
        var scaleZ = (this.cubeSizeZ*this.zScale)/(parseInt(zRes)-1);
        trans.setAttribute("scale", "" + scaleX + " " + scaleY + " " + scaleZ);

        var xoff = (this.cubeSizeX * this.xOffset) - (this.cubeSizeX/2.0);
        var yoff = (this.cubeSizeY * this.yOffset) - (minvalue*scaleY) - (this.cubeSizeY/2.0);
        var zoff = (this.cubeSizeZ * this.zOffset) - (this.cubeSizeZ/2.0);
        trans.setAttribute("translation", "" + xoff+ " " + yoff  + " " + zoff);

        return trans;
    };
    /**
     * Sets the default values. This is done automatically by the scene model.
     */
    this.setDefaults = function(){
        /**
         * Name of the model. This will be display in the UI.
         * @default Name is given by the module
         * @type {String}
         */
        this.name = "No name given";

        /**
         * Resolution for the latitude.
         * @default 500
         * @type {Number}
         */
        this.XResolution = 500;

        /**
         * Resolution for the longitude
         * @default 500
         * @type {Number}
         */
        this.ZResolution = 500;

        /**
         * Offset on the X-Axis for the model.
         * @default 0
         * @type {Number}
         */
        this.xOffset = 0;

        /**
         * Offset on the Y-Axis for the model.
         * @default 0
         * @type {Number}
         */
        this.yOffset = 0;

        /**
         * Offset on the Z-Axis for the model.
         * @default 0
         * @type {Number}
         */
        this.zOffset = 0;

        /**
         * The models dimension compared to the whole cube on the X-Axis.
         * @default 1
         * @type {Number}
         */
        this.xScale = 1;

        /**
         * The models dimension compared to the whole cube on the Y-Axis.
         * @default 0.3
         * @type {Number}
         */
        this.yScale = 0.3;

        /**
         * The models dimension compared to the whole cube on the Z-Axis.
         * @default 1
         * @type {Number}
         */
        this.zScale = 1;

        /**
         * The used Image format (if one is used)
         * @default "png"
         * @type {String}
         */
        this.imageFormat = "png";

        /**
         * The amount of requests the model do. It is needed to keep track of the loading progress.
         * @default 1
         * @type {number}
         */
        this.requests = 1;

        /**
         * The amount of already received responses. Along with requests this is used to keep track of the loading progress.
         * @default 0
         * @type {number}
         */
        this.receivedDataCount = 0;

        /**
         * The Transparency of the model.
         * @default 0
         * @type {Number}
         */
        this.transparency = 0;
    };
};


/**
 * @class AxisLabels
 * @description This class generates labels for each axis and side (except bottom) of the bounding box.
 *
 * @param xSize
 *      The width of the bounding box.
 * @param ySize
 *      The height of the bounding box.
 * @param zSize
 *      The depth of the bounding box.
 */
EarthServerGenericClient.AxisLabels = function(xSize, ySize, zSize)
{
    /**
     * @description Defines the color of the text. Default at start: emissiveColor attribute is set, the diffuseColor one isn't.
     * @type {string}
     * @default "0.7 0.7 0.5"
     */
    var fontColor = "0.7 0.7 0.5";

    /**
     * @description Defines the size of the font. Value is always positive!
     * @default 50.0
     * @type {number}
     */
    var fontSize = 50.0;

    /**
     * @description Array stores all X3DOM transform nodes. Each transform contains the shape, material, text and fontStyle node.
     * @type {Array}
     * @default Empty
     */
    var transforms = new Array();
    /**
     * @description Array stores all text nodes of the x-axis.
     * @type {Array}
     * @default Empty
     */
    var textNodesX = new Array();
    /**
     * @description Array stores all text nodes of the y-axis.
     * @type {Array}
     * @default Empty
     */
    var textNodesY = new Array();
    /**
     * @description Array stores all text nodes of the z-axis.
     * @type {Array}
     * @default Empty
     */
    var textNodesZ = new Array();

    /**
     * @description This function changes the text size of each label independent of its axis.
     *
     * @param size
     * The parameter (positive value expected) represents the desired size of the font.
     * Remember, the parameter represents the size in x3dom units not in pt like css.
     * Hence the size value could be large.
     */
    this.changeFontSize = function(size)
    {
        size = Math.abs(size);
        for(var i=0; i<transforms.length; i++)
        {
            var scale =x3dom.fields.SFVec3f.parse(transforms[i].getAttribute('scale'));

            if(scale.x>=0) scale.x = size; else scale.x = -1 * size;
            if(scale.y>=0) scale.y = size; else scale.y = -1 * size;
            if(scale.z>=0) scale.z = size; else scale.z = -1 * size;

            transforms[i].setAttribute('scale', scale.x + " " + scale.y + " " + scale.z);
        }
    };

    /**
     * This function changes the color of each label independent of its axis.
     * @param color
     * This parameter changes the current color value of each label.
     * It expects a string in x3d color format.
     * E.g. "1.0 1.0 1.0" for white and "0.0 0.0 0.0" for black.
     */
    this.changeColor = function(color)
    {
        for(var i=0; i<transforms.length; i++)
        {
            var material = transforms[i].getElementsByTagName('material');

            for(var j=0; j<material.length; j++)
            {
                material[j].setAttribute('emissiveColor', color);
                material[j].setAttribute('diffuseColor', color);
            }
        }
    };

    /**
     * @description This function changes the text of each label on the x-axis.
     *
     * @param string
     * Defines the new text.
     */
    this.changeLabelNameX = function(string)
    {
        //Prevent multi line!
        while(string.search("'")!=-1 || string.search("\"")!=-1)
        {
            string = string.replace("'", " ");
            string = string.replace("\"", " ");
        }

        for(var i=0; i<textNodesX.length; i++)
        {
            textNodesX[i].setAttribute('string', string);
        }
    };

    /**
     * @description This function changes the text of each label on the y-axis.
     *
     * @param string
     * Defines the new text.
     */
    this.changeLabelNameY = function(string)
    {
        //Prevent multi line!
        while(string.search("'")!=-1 || string.search("\"")!=-1)
        {
            string = string.replace("'", " ");
            string = string.replace("\"", " ");
        }

        for(var i=0; i<textNodesY.length; i++)
        {
            textNodesY[i].setAttribute('string', string);
        }
    };

    /**
     * @param string
     * Defines the new text.
     */
    this.changeLabelNameZ = function(string)
    {
        //Prevent multi line!
        while(string.search("'")!=-1 || string.search("\"")!=-1)
        {
            string = string.replace("'", " ");
            string = string.replace("\"", " ");
        }

        for(var i=0; i<textNodesZ.length; i++)
        {
            textNodesZ[i].setAttribute('string', string);
        }
    };

    /**
     * @description This function generates labels on all three axis (x,y,z). The labels will be
     * added on each side (except bottom).
     */
    this.createAxisLabels = function(xLabel,yLabel,zLabel)
    {
        createLabel("x", "front", xLabel);
        createLabel("x", "back",  xLabel);
        createLabel("x", "top",   xLabel);

        createLabel("y", "front", yLabel);
        createLabel("y", "back",  yLabel);
        createLabel("y", "left",  yLabel);
        createLabel("y", "right", yLabel);

        createLabel("z", "front", zLabel);
        createLabel("z", "back",  zLabel);
        createLabel("z", "top",   zLabel);
    };

    /**
     * @description This (private) function creates the needed x3dom nodes.
     *
     * @param axis
     * Which axis do you want? Available: x, y, z
     *
     * @param side
     * Choose the side of the axis. <br>
     * Available for x: front (default), back and top. <br>
     * Available for y: front (default), back, left and right. <br>
     * Available for z: front (default), back and top.
     *
     * @param label
     * This text will appear at the given axis.
     */
    function createLabel(axis, side, label)
    {
        //Setup text
        var textTransform = document.createElement('transform');
        textTransform.setAttribute('scale', fontSize + " " + fontSize + " " + fontSize);
        var shape = document.createElement('shape');
        var appearance = document.createElement('appearance');
        var material = document.createElement('material');
        material.setAttribute('emissiveColor', fontColor);
        var text = document.createElement('text');
        text.setAttribute('string', label);
        var fontStyle = document.createElement('fontStyle');
        fontStyle.setAttribute('family', 'calibri');
        fontStyle.setAttribute('style', 'bold');
        text.appendChild(fontStyle);
        appearance.appendChild(material);
        shape.appendChild(appearance);
        shape.appendChild(text);
        textTransform.appendChild(shape);

        //var home = document.getElementById('x3dScene');
        var home = document.getElementById('AnnotationsGroup');
        var rotationTransform = document.createElement('transform');

        if(axis=="x")
        {
            textTransform.setAttribute('translation', "0 " + (ySize+fontSize/2) + " " + zSize);

            if(side=="back")
            {
                rotationTransform.setAttribute('rotation', '0 1 0 3.14');
            }
            else if(side=="top")
            {
                textTransform.setAttribute('rotation', '1 0 0 -1.57');
                textTransform.setAttribute('translation', "0 " + -ySize + " " + (-zSize-fontSize/2));
            }
            textNodesX[textNodesX.length] = text;
        }
        else if(axis=="y")
        {
            textTransform.setAttribute('translation', -(xSize+fontSize/2) + " 0 " + zSize);
            textTransform.setAttribute('rotation', '0 0 1 1.57');

            if(side=="back")
            {
                textTransform.setAttribute('translation', (xSize+fontSize/2) + " 0 " + zSize);
                textTransform.setAttribute('rotation', '0 0 1 4.74');
                rotationTransform.setAttribute('rotation', '1 0 0 3.14');
            }
            else if(side=="left")
            {
                rotationTransform.setAttribute('rotation', '0 1 0 -1.57');
            }
            else if(side=="right")
            {
                rotationTransform.setAttribute('rotation', '0 1 0 1.57');
            }
            textNodesY[textNodesY.length] = text;
        }
        else if(axis=="z")
        {
            textTransform.setAttribute('translation', xSize + " " + (ySize+fontSize/2) + " 0");
            textTransform.setAttribute('rotation', '0 1 0 1.57');
            if(side=="back")
            {
                rotationTransform.setAttribute('rotation', '0 1 0 3.14');
            }
            else if(side=="top")
            {
                textTransform.setAttribute('rotation', '0 1 0 1.57');
                textTransform.setAttribute('translation', "0 0 0");

                rotationTransform.setAttribute('rotation', '0 0 1 -4.71');
                rotationTransform.setAttribute('translation', -(xSize+fontSize/2) + " " + -ySize + " 0");
            }
            textNodesZ[textNodesZ.length] = text;
        }

        transforms[transforms.length]=textTransform;
        rotationTransform.appendChild(textTransform);
        home.appendChild(rotationTransform);
    }
};