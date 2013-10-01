//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

/**
 * Creates the basic UI
 * @param domElementID - Dom element to append the UI to.
 */
EarthServerGenericClient.createBasicUI = function(domElementID)
{
    var UI_DIV = document.getElementById(domElementID);
    if( !UI_DIV )
    {
        alert("Can't find DomElement for UI with ID " +domElementID);
        return;
    }

    //Create Divs for all scene models
    for(var i=0; i<EarthServerGenericClient.MainScene.getModelCount();i++)
    {
        var name = document.createElement("h3");
        name.innerHTML = EarthServerGenericClient.MainScene.getModelName(i);
        var div = document.createElement("div");
        //Set IDs
        name.setAttribute("id","EarthServerGenericClient_ModelHeader_"+i);
        div.setAttribute("id","EarthServerGenericClient_ModelDiv_"+i);

        UI_DIV.appendChild(name);
        UI_DIV.appendChild(div);

        EarthServerGenericClient.appendXYZSlider(div,"Model"+i+"X","X Translation",i,0,
            -EarthServerGenericClient.MainScene.getCubeSizeX(),EarthServerGenericClient.MainScene.getCubeSizeX(),
            EarthServerGenericClient.MainScene.getModelOffsetX(i) * EarthServerGenericClient.MainScene.getCubeSizeX(),
            EarthServerGenericClient.MainScene.updateOffset);

        /*
        Note about the sliders: The cube is using X and Z axis is base and Y as height.
        While this is standard in computer graphics it can confuse users.
        Because of this the labels on Y and Z are switched.
         */

        EarthServerGenericClient.appendXYZSlider(div,"Model"+i+"Z","Y Translation",i,2,
            -EarthServerGenericClient.MainScene.getCubeSizeZ(),EarthServerGenericClient.MainScene.getCubeSizeZ(),
            EarthServerGenericClient.MainScene.getModelOffsetZ(i) * EarthServerGenericClient.MainScene.getCubeSizeZ(),
            EarthServerGenericClient.MainScene.updateOffset);

        EarthServerGenericClient.appendXYZSlider(div,"Model"+i+"Y","Z Translation",i,1,
            -EarthServerGenericClient.MainScene.getCubeSizeY(),EarthServerGenericClient.MainScene.getCubeSizeY(),
            EarthServerGenericClient.MainScene.getModelOffsetY(i) * EarthServerGenericClient.MainScene.getCubeSizeY(),
            EarthServerGenericClient.MainScene.updateOffset);

        EarthServerGenericClient.appendAlphaSlider(div,i);
        EarthServerGenericClient.MainScene.setSpecificElement(i,div);

        div=null;
        p=null;
    }

    //Create Div for the Cameras
    var Cam = document.createElement("h3");
    Cam.innerHTML = "Cameras";
    var cdiv = document.createElement("div");
    var cp   = document.createElement("p");

    for(i=0; i< EarthServerGenericClient.MainScene.getCameraDefCount();i++)
    {
        var button = document.createElement('button');
        var cameraDef = EarthServerGenericClient.MainScene.getCameraDef(i);
        cameraDef = cameraDef.split(":");
        button.setAttribute("onclick", "EarthServerGenericClient.MainScene.setView('"+cameraDef[1]+"');return false;");
        button.innerHTML = cameraDef[0];

        cp.appendChild(button);
        button = null;
    }
    cdiv.appendChild(cp);
    UI_DIV.appendChild(Cam);
    UI_DIV.appendChild(cdiv);

    cdiv=null;
    cp=null;

    //Create Divs for a Light sources
    for(i=0; i<EarthServerGenericClient.MainScene.getLightCount();i++)
    {
        var lightHeader = document.createElement("h3");
        lightHeader.innerHTML = "Light " + i;
        var lightDiv = document.createElement("div");

        UI_DIV.appendChild(lightHeader);
        UI_DIV.appendChild(lightDiv);

        /*
         Note about the sliders: The cube is using X and Z axis is base and Y as height.
         While this is standard in computer graphics it can confuse users.
         Because of this the labels on Y and Z are switched.
         */

        EarthServerGenericClient.appendXYZSlider(lightDiv,"Light"+i+"X","X Translation",i,0,
            -EarthServerGenericClient.MainScene.getCubeSizeX(),EarthServerGenericClient.MainScene.getCubeSizeX(),0,
            EarthServerGenericClient.MainScene.updateLightPosition);

        EarthServerGenericClient.appendXYZSlider(lightDiv,"Light"+i+"Z","Y Translation",i,2,
            -EarthServerGenericClient.MainScene.getCubeSizeZ(),EarthServerGenericClient.MainScene.getCubeSizeZ(),0,
            EarthServerGenericClient.MainScene.updateLightPosition);

        EarthServerGenericClient.appendXYZSlider(lightDiv,"Light"+i+"Y","Z Translation",i,1,
            -EarthServerGenericClient.MainScene.getCubeSizeY(),EarthServerGenericClient.MainScene.getCubeSizeY(),0,
            EarthServerGenericClient.MainScene.updateLightPosition);

        EarthServerGenericClient.appendGenericSlider(lightDiv,"Light"+i+"R","Radius",i,0,5000,500,
            EarthServerGenericClient.MainScene.updateLightRadius);

        EarthServerGenericClient.appendGenericSlider(lightDiv,"Light"+i+"I","Intensity",i,0,5,1,
            EarthServerGenericClient.MainScene.updateLightIntensity);

        lightDiv=null;
        lightHeader=null;
    }

    // Create Div for the Annotations
    if( EarthServerGenericClient.MainScene.getAnnotationLayerCount() )
    {
        var Anno = document.createElement("h3");
        Anno.innerHTML = "Annotations";
        var adiv = document.createElement("div");

        for(i=0; i< EarthServerGenericClient.MainScene.getAnnotationLayerCount();i++)
        {
            var ap   = document.createElement("p");

            var ALname = EarthServerGenericClient.MainScene.getAnnotationLayerName(i);
            ap.innerHTML= ALname + ": ";
            var checkbox = document.createElement("input");
            checkbox.setAttribute("type","checkbox");
            checkbox.setAttribute("checked","checked");
            checkbox.setAttribute("onchange","EarthServerGenericClient.MainScene.drawAnnotationLayer('"+ALname+"',this.checked)");
            ap.appendChild(checkbox);
            //Build list with annotations in this layer
            var list = document.createElement("ul");
            var annotationTexts = EarthServerGenericClient.MainScene.getAnnotationLayerTexts(ALname);
            for(var k=0; k<annotationTexts.length;k++)
            {
                var entry = document.createElement("li");
                entry.innerHTML = annotationTexts[k];
                list.appendChild(entry);
                entry = null;
            }

            ap.appendChild(list);
            adiv.appendChild(ap);
            ap = null;
            checkbox = null;
            list = null;
        }

        UI_DIV.appendChild(Anno);
        UI_DIV.appendChild(adiv);

        adiv=null;
        ap=null;
    }
    $( "#"+domElementID ).accordion({
        heightStyle: "content",
        collapsible: true
    });

    UI_DIV = null;
};

/**
 * Appends a axis slider to a UI element. Axis sliders call the callback function with an ID,axis and their value.
 * @param domElement - Append the slider to this dom element.
 * @param sliderID - Dom ID for this slider.
 * @param label - Label (displayed in the UI) for this slider
 * @param elementID - First parameter for the callback function. Change the element with this ID.
 * @param axis - Axis this slider should effect. 0:x 1:y 2:z
 * @param min - Minimum value of this slider.
 * @param max - Maximum value of this slider.
 * @param startValue - Start value of this slider.
 * @param callback - Callback function, every time the slider is moved this function will be called.
 */
EarthServerGenericClient.appendXYZSlider = function(domElement,sliderID,label,elementID,axis,min,max,startValue,callback)
{
    var p = document.createElement("p");
    p.innerHTML = label;
    domElement.appendChild(p);

    var slider = document.createElement("div");
    slider.setAttribute("id",sliderID);
    domElement.appendChild(slider);

    $( "#"+sliderID ).slider({
        range: "max",
        min: min,
        max: max,
        value: startValue,
        slide: function( event, ui ) {
            callback(elementID,axis,ui.value);
        }
    });
};

/**
 * Generic sliders are calling their callback function with an element ID and their value.
 * @param domElement - Append the slider to this dom element.
 * @param sliderID - Dom ID for this slider.
 * @param label - Label (displayed in the UI) for this slider
 * @param elementID - First parameter for the callback function. Change the module with this ID.
 * @param min - Minimum value of this slider.
 * @param max - Maximum value of this slider.
 * @param startValue - Start value of this slider.
 * @param callback - Callback function, every time the slider is moved this function will be called.
 */
EarthServerGenericClient.appendGenericSlider = function(domElement,sliderID,label,elementID,min,max,startValue,callback)
{
    var p = document.createElement("p");
    p.innerHTML = label;
    domElement.appendChild(p);

    var slider = document.createElement("div");
    slider.setAttribute("id",sliderID);
    domElement.appendChild(slider);

    $( "#"+sliderID ).slider({
        range: "max",
        min: min,
        max: max,
        value: startValue,
        slide: function( event, ui ) {
            callback(elementID,ui.value);
        }
    });

};

/**
 * Special slider for setting the transparency of scene models.
 * @param domElement - Append the slider to this dom element.
 * @param moduleNumber - Index of the scene model.
 */
EarthServerGenericClient.appendAlphaSlider = function(domElement, moduleNumber){
    //AlphaChannel
    var ap = document.createElement("p");
    ap.setAttribute("id","EarthServerGenericClient_SliderCell_a_" + moduleNumber );
    ap.innerHTML = "Transparency: ";
    domElement.appendChild(ap);

    //jQueryUI Slider
    var Aslider = document.createElement("div");
    Aslider.setAttribute("id","aSlider_"+moduleNumber);
    domElement.appendChild(Aslider);

    $( "#aSlider_"+moduleNumber ).slider({
        range: "max",
        min: 0,
        max: 100,
        value: EarthServerGenericClient.MainScene.getModelTransparency(moduleNumber)*100,
        slide: function( event, ui ) {
            EarthServerGenericClient.MainScene.updateTransparency(moduleNumber,parseFloat(ui.value/100));
        }
    });

};

/**
 * Special slider for setting the elevation of scene models.
 * @param domElement - Append the slider to this dom element.
 * @param moduleNumber - Index of the scene model.
 */
EarthServerGenericClient.appendElevationSlider = function(domElement,moduleNumber){

    var ep = document.createElement("p");
    ep.setAttribute("id","EarthServerGenericClient_SliderCell_e_" + moduleNumber );
    ep.innerHTML = "Elevation: ";
    domElement.appendChild(ep);

    //jQueryUI Slider
    var Eslider = document.createElement("div");
    Eslider.setAttribute("id","eSlider_"+moduleNumber);
    domElement.appendChild(Eslider);

    $( "#eSlider_"+moduleNumber ).slider({
        range: "max",
        min: 0,
        max: 100,
        value: 10,
        slide: function( event, ui ) {
            EarthServerGenericClient.MainScene.updateElevation(moduleNumber,ui.value);
        }
    });

};

EarthServerGenericClient.appendMaxShownElementsSlider = function(domElement,moduleNumber,maxElements)
{
    var ep = document.createElement("p");
    ep.setAttribute("id","EarthServerGenericClient_SliderCell_me_" + moduleNumber );
    ep.innerHTML = "DrawnElements: ";
    domElement.appendChild(ep);

    //jQueryUI Slider
    var Eslider = document.createElement("div");
    Eslider.setAttribute("id","meSlider_"+moduleNumber);
    domElement.appendChild(Eslider);

    $( "#meSlider_"+moduleNumber ).slider({
        range: "max",
        min: 1,
        max: maxElements,
        value: parseInt(maxElements/2),
        slide: function( event, ui ) {
            EarthServerGenericClient.MainScene.updateMaxShownElements(moduleNumber,ui.value);
        }
    });
};

/**
 * @class The default progress bar to display the progress in loading and creating the scene models.
 * @param DivID
 */
EarthServerGenericClient.createProgressBar =  function(DivID)
{
    $( "#"+DivID ).progressbar({ value: 0, max: 100 });
    $( "#"+DivID ).on( "progressbarcomplete", function( event, ui ) {
        $( "#"+DivID ).toggle( "blind" );
    } );

    /**
     * Updates the value in the progress bar.
     * @param value - New value
     */
    this.updateValue = function(value)
    {
        $( "#"+DivID ).progressbar( "option", "value", value );
    };
};

