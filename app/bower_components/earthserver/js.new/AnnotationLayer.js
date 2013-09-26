//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * @class Annotation Layer to create multiple Annotations with the same style who belong together.
 * @param Name - Name of the Layer. To be displayed and to add annotations to it.
 * @param root - X3dom element to append the annotations.
 * @param fontSize - Font size of the annotations.
 * @param fontColor - Font color of the annotations
 * @param fontHover - The annotations hovers above the marker by this value.
 * @param markerSize - Size of the annotations marker.
 * @param markerColor - Color of the annotations marker.
 * @constructor
 */
EarthServerGenericClient.AnnotationLayer = function(Name,root,fontSize,fontColor,fontHover,markerSize,markerColor)
{

    this.name = Name;   // Name of this layer
    var annotationTransforms = []; // Array with all annotation text transforms
    var annotations = [];   // The text of the annotations (displayed in the UI)
    var markerTransforms = []; // Array with all marker transforms
    var modelIndex = -1;    // Index of the model this layer is bound to (-1 for unbound)

    /**
     * Sets the index of the scene model this annotation layer is bound to.
     * @param index - Index of the scene model.
     */
    this.setBoundModuleIndex = function(index)
    {
        modelIndex = index;
    };

    /**
     * Returns the index of the model this layer is bound to.
     * @returns {number} - Index of the model or -1 if unbound.
     */
    this.getBoundModuleIndex = function()
    {
        return modelIndex;
    };

    /**
     * Resets the modelIndex this annotation layer is bound to back to -1 and marks it as unbound.
     */
    this.releaseBinding = function()
    {
        modelIndex = -1;
    };

    /**
     * If the annotation layer is bound to a module the annotations shall move when the module is moved.
     * This function shall receive the delta of the positions every time the module is moved.
     * @param axis - Axis of the movement.
     * @param delta - Delta to the last position.
     */
    this.movementUpdateBoundModule = function(axis,delta)
    {
        if( axis >= 0 && axis < 3)
        {
            for(var i=0; i<annotationTransforms.length;i++)
            {
                var trans = annotationTransforms[i].getAttribute("translation");
                var transValue = trans.split(" ");

                if( transValue.length < 3)
                { transValue = trans.split(",");}

                if(i%2 === 0 || axis === 1)
                {   transValue[axis] = parseInt(transValue[axis]) - parseInt(delta); }
                else
                {   transValue[axis] = parseInt(transValue[axis]) + parseInt(delta); }

                annotationTransforms[i].setAttribute("translation",transValue[0] + " " + transValue[1] + " " + transValue[2]);
            }
            for( i=0; i<markerTransforms.length;i++)
            {
                trans = markerTransforms[i].getAttribute("translation");
                transValue = trans.split(" ");

                if( transValue.length < 3)
                { transValue = trans.split(",");}

                transValue[axis] = parseInt(transValue[axis]) - parseInt(delta);
                markerTransforms[i].setAttribute("translation",transValue[0] + " " + transValue[1] + " " + transValue[2]);
            }
        }


    };

    /**
     * This function notifies the annotation layer that the scene model's elevation was changed.
     * All annotation will be checked and altered in their position.
     */
    this.elevationUpdateBoundModule = function()
    {
        for(var i=0; i<annotationTransforms.length;i++)
        {
            var trans = annotationTransforms[i].getAttribute("translation");
            var transValue = trans.split(" ");
            var mirror = 1;//We have to multiply the backside text positions with -1

            if( transValue.length < 3)
            { transValue = trans.split(",");}


            if(i%2 === 1)
            {   mirror = -1;    }

            transValue[1] = EarthServerGenericClient.MainScene.getHeightAt3DPosition(modelIndex,parseInt(transValue[0])*mirror,parseInt(transValue[2])*mirror) + fontHover;
            annotationTransforms[i].setAttribute("translation",transValue[0] + " " + transValue[1] + " " + transValue[2]);
        }

        for( i=0; i<markerTransforms.length;i++)
        {
            trans = markerTransforms[i].getAttribute("translation");
            transValue = trans.split(" ");

            if( transValue.length < 3)
            { transValue = trans.split(",");}

            transValue[1] = EarthServerGenericClient.MainScene.getHeightAt3DPosition(modelIndex,parseInt(transValue[0]),parseInt(transValue[2]));
            markerTransforms[i].setAttribute("translation",transValue[0] + " " + transValue[1] + " " + transValue[2]);
        }

    };

    /**
     * Adds an annotation marker and -text to the annotation layer.
     * @param xPos - Position on the X-Axis of the marker and center of the annotation.
     * @param yPos - Position on the Y-Axis of the marker and center of the annotation.
     * @param zPos - Position on the Z-Axis of the marker and center of the annotation.
     * @param Text - Text for the annotation.
     */
    this.addAnnotation = function(xPos,yPos,zPos,Text)
    {

        annotations.push(Text);//save the text for later queries

        //We draw 2 texts without their back faces.
        //So the user can see the text from most angles and not mirror inverted.
        for(var i=0;i<2;i++)
        {
            var textTransform = document.createElement('transform');
            textTransform.setAttribute('scale', fontSize + " " + fontSize + " " + fontSize);
            var shape = document.createElement('shape');
            var appearance = document.createElement('appearance');
            appearance.setAttribute("id","Layer_Appearance_"+Name);
            var material = document.createElement('material');
            material.setAttribute('emissiveColor', fontColor);
            material.setAttribute('diffuseColor', fontColor);
            var text = document.createElement('text');
            text.setAttribute('string', Text);
            var fontStyle = document.createElement('fontStyle');
            fontStyle.setAttribute('family', 'calibri');
            fontStyle.setAttribute('style', 'bold');
            text.appendChild(fontStyle);
            appearance.appendChild(material);
            shape.appendChild(appearance);
            shape.appendChild(text);
            textTransform.appendChild(shape);

            //one marker is enough
            if(i===0)
            {
                var sphere_trans = document.createElement("Transform");
                sphere_trans.setAttribute("scale",markerSize + " " + markerSize + " "+markerSize);
                sphere_trans.setAttribute('translation', xPos + " " + yPos + " " + zPos);
                var sphere_shape = document.createElement("Shape");
                var sphere = document.createElement("Sphere");
                var sphere_app = document.createElement("Appearance");
                var sphere_material = document.createElement('material');
                sphere_material.setAttribute('diffusecolor', markerColor);
                sphere_app.appendChild(sphere_material);
                sphere_shape.appendChild(sphere_app);
                sphere_shape.appendChild(sphere);
                sphere_trans.appendChild(sphere_shape);

                root.appendChild(sphere_trans);
                //annotationTransforms.push(sphere_trans);
                markerTransforms.push(sphere_trans);

                sphere_trans = null;
                sphere_shape = null;
                sphere = null;
                sphere_app = null;
                sphere_material = null;
            }

            var rootTransform = document.createElement('transform');

            textTransform.setAttribute('translation', xPos + " " + (yPos+fontHover) + " " + zPos);
            textTransform.setAttribute('scale', (-fontSize) + " " + (-fontSize) + " " + fontSize);

            //One text "normal" and one "mirror inverted"
            if(i===0)
            {
                textTransform.setAttribute('rotation', '0 0 1 3.14');
            }
            else
            {
                textTransform.setAttribute('rotation', '0 0 1 3.14');
                textTransform.setAttribute('translation', -xPos + " " + (yPos+fontHover) + " " + -zPos);
                rootTransform.setAttribute('rotation', '0 1 0 3.14');
            }

            //annotationTransforms.push(rootTransform);//save the transform to toggle rendering
            annotationTransforms.push(textTransform);
            rootTransform.appendChild(textTransform);
            root.appendChild( rootTransform );
        }

        textTransform = null;
        shape = null;
        appearance = null;
        material = null;
        text = null;
        fontStyle = null;
    };

    /**
     * Determine the rendering of this layer.
     * @param value - boolean
     */
    this.renderLayer = function( value )
    {
        for(var i=0; i<annotationTransforms.length;i++)
        {
            annotationTransforms[i].setAttribute("render",value);
        }
        for(i=0; i<markerTransforms.length;i++)
        {
            markerTransforms[i].setAttribute("render",value);
        }
    };


    /**
     * Returns an array with the annotation text.
     * @returns {Array}
     */
    this.getAnnotationTexts = function()
    {
        var arrayReturn = [];

        for(var i=0; i<annotations.length;i++)
        {   arrayReturn.push(annotations[i]);    }

        return arrayReturn;
    };
};

/**
 * @class AxisLabels
 * @description This class generates labels for each axis and side (except bottom) of the bounding box.
 *
 * @param xSize - The width of the bounding box.
 * @param ySize - The height of the bounding box.
 * @param zSize - The depth of the bounding box.
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
    var transforms = [];
    /**
     * @description Array stores all text nodes of the x-axis.
     * @type {Array}
     * @default Empty
     */
    var textNodesX = [];
    /**
     * @description Array stores all text nodes of the y-axis.
     * @type {Array}
     * @default Empty
     */
    var textNodesY = [];
    /**
     * @description Array stores all text nodes of the z-axis.
     * @type {Array}
     * @default Empty
     */
    var textNodesZ = [];

    /**
     * @description This function changes the text size of each label independent of its axis.
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