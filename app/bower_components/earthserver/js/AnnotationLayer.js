//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

EarthServerGenericClient.AnnotationLayer = function(Name,root,fontSize,fontColor,fontHover,markerSize,markerColor)
{
    this.name = Name;
    var annotationTransforms = [];
    var annotations = [];

    this.addAnnotation = function(xPos,yPos,zPos,Text)
    {
        annotations.push(Text);
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
                annotationTransforms.push(sphere_trans);

                sphere_trans = null;
                sphere_shape = null;
                sphere = null;
                sphere_app = null;
                sphere_material = null;
            }

            var rootTransform = document.createElement('transform');

            textTransform.setAttribute('translation', xPos + " " + (yPos+fontHover) + " " + zPos);
            textTransform.setAttribute('scale', (-fontSize) + " " + (-fontSize) + " " + fontSize);

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


            annotationTransforms.push(rootTransform);
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

    this.renderLayer = function( value )
    {
        for(var i=0; i<annotationTransforms.length;i++)
        {
            annotationTransforms[i].setAttribute("render",value);
        }
    };

    this.getAnnotationTexts = function()
    {
        var arrayReturn = [];

        for(var i=0; i<annotations.length;i++)
        {   arrayReturn.push(annotations[i]);    }

        return arrayReturn;
    };
};