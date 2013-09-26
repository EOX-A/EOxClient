//Namespace
var EarthServerGenericClient = EarthServerGenericClient || {};

EarthServerGenericClient.createBasicUI = function(domElementID)
{
    //Call accordion widget at the dom element
    var UI_DIV = document.getElementById(domElementID);
    if( !UI_DIV )
    {
        alert("Can't find DomElement for UI with ID " +domElementID);
        return;
    }

    //Create Divs for all scene models
    for(var i=0; i<EarthServerGenericClient_MainScene.getModelCount();i++)
    {
        var name = document.createElement("h3");
        name.innerHTML = EarthServerGenericClient_MainScene.getModelName(i);
        var div = document.createElement("div");

        UI_DIV.appendChild(name);
        UI_DIV.appendChild(div);

        EarthServerGenericClient.appendXYZASlider(div,i);
        EarthServerGenericClient_MainScene.setSpecificElement(i,div);

        div=null;
        p=null;
    }

    //Create Div for the Cameras
    var Cam = document.createElement("h3");
    Cam.innerHTML = "Cameras";
    var cdiv = document.createElement("div");
    var cp   = document.createElement("p");

    for(i=0; i< EarthServerGenericClient_MainScene.getCameraDefCount();i++)
    {
        var button = document.createElement('button');
        var cameraDef = EarthServerGenericClient_MainScene.getCameraDef(i);
        cameraDef = cameraDef.split(":");
        button.setAttribute("onclick", "EarthServerGenericClient_MainScene.setView('"+cameraDef[1]+"');return false;");
        button.innerHTML = cameraDef[0];

        cp.appendChild(button);
        button = null;
    }
    cdiv.appendChild(cp);
    UI_DIV.appendChild(Cam);
    UI_DIV.appendChild(cdiv);

    cdiv=null;
    cp=null;

    //Create Div for the Annotations
    var Anno = document.createElement("h3");
    Anno.innerHTML = "Annotations";
    var adiv = document.createElement("div");

    for(i=0; i< EarthServerGenericClient_MainScene.getAnnotationLayerCount();i++)
    {
        var ap   = document.createElement("p");

        var ALname = EarthServerGenericClient_MainScene.getAnnotationLayerName(i);
        ap.innerHTML= ALname + ": ";
        var checkbox = document.createElement("input");
        checkbox.setAttribute("type","checkbox");
        checkbox.setAttribute("checked","checked");
        checkbox.setAttribute("onchange","EarthServerGenericClient_MainScene.drawAnnotationLayer('"+ALname+"',this.checked)");
        ap.appendChild(checkbox);
        //Build list with annotations in this layer ulli
        var list = document.createElement("ul");
        var annotationTexts = EarthServerGenericClient_MainScene.getAnnotationLayerTexts(ALname);
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

    $( "#"+domElementID ).accordion({
        heightStyle: "content",
        collapsible: true
    });

    UI_DIV = null;
};

EarthServerGenericClient.appendXYZASlider = function(domElement, moduleNumber){
    //X-Axis
    var xp = document.createElement("p");
    xp.setAttribute("id","EarthServerGenericClient_SliderCell_X_" + moduleNumber );
    xp.innerHTML = "X Translation: ";
    domElement.appendChild(xp);

    //jQueryUI Slider
    var Xslider = document.createElement("div");
    Xslider.setAttribute("id","xSlider_"+moduleNumber);
    domElement.appendChild(Xslider);

    $( "#xSlider_"+moduleNumber ).slider({
        range: "max",
        min: -EarthServerGenericClient_MainScene.cubeSizeX,
        max: EarthServerGenericClient_MainScene.cubeSizeX,
        value: EarthServerGenericClient_MainScene.getModelOffsetX(moduleNumber) * EarthServerGenericClient_MainScene.cubeSizeX,
        slide: function( event, ui ) {
            EarthServerGenericClient_MainScene.updateOffset(moduleNumber,0,ui.value);
        }
    });

    //Y-Axis
    var yp = document.createElement("p");
    yp.setAttribute("id","EarthServerGenericClient_SliderCell_y_" + moduleNumber );
    yp.innerHTML = "Y Translation: ";
    domElement.appendChild(yp);

    //jQueryUI Slider
    var Yslider = document.createElement("div");
    Yslider.setAttribute("id","ySlider_"+moduleNumber);
    domElement.appendChild(Yslider);

    $( "#ySlider_"+moduleNumber ).slider({
        range: "max",
        min: -EarthServerGenericClient_MainScene.cubeSizeY,
        max: EarthServerGenericClient_MainScene.cubeSizeY,
        value: EarthServerGenericClient_MainScene.getModelOffsetY(moduleNumber) * EarthServerGenericClient_MainScene.cubeSizeY,
        slide: function( event, ui ) {
            EarthServerGenericClient_MainScene.updateOffset(moduleNumber,1,ui.value);
        }
    });

    //Z-Axis
    var zp = document.createElement("p");
    zp.setAttribute("id","EarthServerGenericClient_SliderCell_z_" + moduleNumber );
    zp.innerHTML = "Z Translation: ";
    domElement.appendChild(zp);

    //jQueryUI Slider
    var Zslider = document.createElement("div");
    Zslider.setAttribute("id","zSlider_"+moduleNumber);
    domElement.appendChild(Zslider);

    $( "#zSlider_"+moduleNumber ).slider({
        range: "max",
        min: -EarthServerGenericClient_MainScene.cubeSizeZ,
        max: EarthServerGenericClient_MainScene.cubeSizeZ,
        value: EarthServerGenericClient_MainScene.getModelOffsetZ(moduleNumber) * EarthServerGenericClient_MainScene.cubeSizeZ,
        slide: function( event, ui ) {
            EarthServerGenericClient_MainScene.updateOffset(moduleNumber,2,ui.value);
        }
    });

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
        value: EarthServerGenericClient_MainScene.getModelTransparency(moduleNumber)*100,
        slide: function( event, ui ) {
            EarthServerGenericClient_MainScene.updateTransparency(moduleNumber,parseFloat(ui.value/100));
        }
    });

};

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
            EarthServerGenericClient_MainScene.updateElevation(moduleNumber,ui.value);
        }
    });

};

EarthServerGenericClient.createProgressBar =  function(DivID)
{
    $( "#"+DivID ).progressbar({ value: 0, max: 100 });
    $( "#"+DivID ).on( "progressbarcomplete", function( event, ui ) {
        $( "#"+DivID ).toggle( "blind" );
    } );

    this.updateValue = function(value)
    {
        $( "#"+DivID ).progressbar( "option", "value", value );
    };
};

