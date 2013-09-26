var EarthServerGenericClient = EarthServerGenericClient || {};


EarthServerGenericClient.createBasicUI = function(domElementID,cntModels)
{
    var mytable = document.createElement("table");
    var mytablebody = document.createElement("tbody");
    mytable.appendChild(mytablebody);

    var Element = document.getElementById(domElementID);
    if(Element)
    {   Element.appendChild(mytable);}
    else
    {   alert("Can't find DOM Element with ID: " + domElementID);   }


    var mycurrent_row=document.createElement("tr");
    mytablebody.appendChild(mycurrent_row);

    var mycurrent_cell = document.createElement("th");
    mycurrent_cell.innerHTML = "Modules";
    mycurrent_row.appendChild(mycurrent_cell);
    mycurrent_cell = document.createElement("th");
    mycurrent_cell.innerHTML = "Common";
    mycurrent_row.appendChild(mycurrent_cell);
    mycurrent_cell = document.createElement("th");
    mycurrent_cell.innerHTML = "Specific";
    mycurrent_row.appendChild(mycurrent_cell);


    //Cell 1: List with all modules
    mycurrent_row=document.createElement("tr");
    mycurrent_cell = document.createElement("td");
    var module_list = document.createElement("ul");
    module_list.setAttribute("id", "UI_ModuleList");
    module_list.onclick = function(event) {
        var target = EarthServerGenericClient.getEventTarget(event);
        var UIID = target.id;
        UIID = UIID.split(":");
        EarthServerGenericClient_MainScene.currentUIElement = UIID[2];

        //Set all style to none
        for (var i = 0; i < EarthServerGenericClient_MainScene.models.length; i++)
        {
            var div = document.getElementById("EarthServerGenericClient_SliderDiv_" +i);
            div.style.display = "none";
            div = document.getElementById("EarthServerGenericClient_SPECIFICDiv_" + i);
            div.style.display = "none";
        }
        //Set the chosen one to be shown
        var theDiv = document.getElementById("EarthServerGenericClient_SliderDiv_" + EarthServerGenericClient_MainScene.currentUIElement);
        theDiv.setAttribute("class", "active");
        theDiv.style.display = "block";
        theDiv = document.getElementById("EarthServerGenericClient_SPECIFICDiv_" + EarthServerGenericClient_MainScene.currentUIElement);
        theDiv.setAttribute("class", "active");
        theDiv.style.display = "block";

    };

    for (i = 0; i < cntModels; i++)
    {
        var module = document.createElement("li");
        module.setAttribute("id", "EarthServerGenericClient:MODULE:"+i);
        module.innerHTML= EarthServerGenericClient_MainScene.getModelName(i);
        module_list.appendChild(module);
    }

    mycurrent_cell.appendChild(module_list);
    mycurrent_row.appendChild(mycurrent_cell);
    mytablebody.appendChild(mycurrent_row);

    //Cell 2: Slider for the positioning X-Y-Z Axis
    mycurrent_cell = document.createElement("td");
    mycurrent_cell.setAttribute("id","EarthServerGenericClient_SliderCell");
    mycurrent_row.appendChild(mycurrent_cell);

    for (i = 0; i < cntModels; i++)
    {
        var modelDiv = document.createElement("div");
        modelDiv.setAttribute("id","EarthServerGenericClient_SliderDiv_" + i);
        modelDiv.style.display = "none";
        mycurrent_cell.appendChild(modelDiv);

        EarthServerGenericClient.appendXYZASlider(modelDiv,i);
    }

    //Cell 4: Some specific stuff
    mycurrent_cell = document.createElement("td");
    mycurrent_cell.setAttribute("id","EarthServerGenericClient_SPECIFIC_Cell");
    mycurrent_row.appendChild(mycurrent_cell);

    for (var i = 0; i < cntModels; i++)
    {
        var modelDiv = document.createElement("div");
        modelDiv.setAttribute("id","EarthServerGenericClient_SPECIFICDiv_" + i);
        modelDiv.style.display = "none";
        mycurrent_cell.appendChild(modelDiv);

        EarthServerGenericClient_MainScene.setSpecificElement(i,modelDiv);
    }

    //Make div 1 active
    var div1 = document.getElementById("EarthServerGenericClient_SliderDiv_0");
    div1.setAttribute("class", "active");
    div1.style.display = "block";
    div1 = document.getElementById("EarthServerGenericClient_SPECIFICDiv_0");
    div1.setAttribute("class", "active");
    div1.style.display = "block";

};

EarthServerGenericClient.appendXYZASlider = function(element, moduleNumber){
    //X-Axis
    var XDiv = document.createElement("div");
    XDiv.setAttribute("id","EarthServerGenericClient_SliderCell_XDiv_" + moduleNumber );
    XDiv.innerHTML ="X Translation:";
    element.appendChild(XDiv);
    var XSlider = new Rj.widget.HorizontalSlider("#EarthServerGenericClient_SliderCell_XDiv_" + moduleNumber, -EarthServerGenericClient_MainScene.cubeSizeX, EarthServerGenericClient_MainScene.cubeSizeX);
    XSlider.addListener("hSliderListener", "valuechanged", function(value){
        EarthServerGenericClient_MainScene.updateOffset(moduleNumber,0,value);
    });

    var startValue = EarthServerGenericClient_MainScene.getModelOffsetX(moduleNumber) * EarthServerGenericClient_MainScene.cubeSizeX;
    XSlider.$value = startValue;
    XSlider.$instantChange = true;

    //Y-Axis
    var YDiv = document.createElement("div");
    YDiv.setAttribute("id","EarthServerGenericClient_SliderCell_YDiv_" + moduleNumber );
    YDiv.innerHTML = "Y Translation:";
    element.appendChild(YDiv);
    var YSlider = new Rj.widget.HorizontalSlider("#EarthServerGenericClient_SliderCell_YDiv_" + moduleNumber, -EarthServerGenericClient_MainScene.cubeSizeY, EarthServerGenericClient_MainScene.cubeSizeY);
    YSlider.addListener("hSliderListener", "valuechanged", function(value){
        EarthServerGenericClient_MainScene.updateOffset(moduleNumber,1,value);
    });

    startValue = EarthServerGenericClient_MainScene.getModelOffsetY(moduleNumber) * EarthServerGenericClient_MainScene.cubeSizeY;
    YSlider.$value = startValue;
    YSlider.$instantChange = true;

    //Z-Axis
    var ZDiv = document.createElement("div");
    ZDiv.setAttribute("id","EarthServerGenericClient_SliderCell_ZDiv_" + moduleNumber );
    ZDiv.innerHTML = "Z Translation:";
    element.appendChild(ZDiv);
    var ZSlider = new Rj.widget.HorizontalSlider("#EarthServerGenericClient_SliderCell_ZDiv_" + moduleNumber, -EarthServerGenericClient_MainScene.cubeSizeZ, EarthServerGenericClient_MainScene.cubeSizeZ);
    ZSlider.addListener("hSliderListener", "valuechanged", function(value){
        EarthServerGenericClient_MainScene.updateOffset(moduleNumber,2,value);
    });

    startValue = EarthServerGenericClient_MainScene.getModelOffsetZ(moduleNumber) * EarthServerGenericClient_MainScene.cubeSizeZ;
    ZSlider.$value = startValue;
    ZSlider.$instantChange = true;

    //AlphaChannel
    var ADiv = document.createElement("div");
    ADiv.setAttribute("id","EarthServerGenericClient_SliderCell_ADiv_" + moduleNumber );
    ADiv.innerHTML = "Transparency:";
    element.appendChild(ADiv);
    var ASlider = new Rj.widget.HorizontalSlider("#EarthServerGenericClient_SliderCell_ADiv_" + moduleNumber, 0, 100);
    ASlider.addListener("hSliderListener", "valuechanged", function(value){
        value = parseFloat(value/100);
        EarthServerGenericClient_MainScene.updateTransparency(moduleNumber,value);
    });

    startValue = EarthServerGenericClient_MainScene.getModelTransparency(moduleNumber)*100;
    ASlider.$value = startValue;
    ASlider.$instantChange = true;

};

EarthServerGenericClient.appendElevationSlider = function(element,moduleNumber){
    var Div = document.createElement("div");
    Div.setAttribute("id","EarthServerGenericClient_SPECIFICCell_Div_" + moduleNumber );
    Div.innerHTML = "Elevation:";
    element.appendChild(Div);
    var ElevationSlider = new Rj.widget.HorizontalSlider("#EarthServerGenericClient_SPECIFICCell_Div_" + moduleNumber, 0,100);
    ElevationSlider.addListener("hSliderListener", "valuechanged", function(value){
        EarthServerGenericClient_MainScene.updateElevation(moduleNumber,value);
    });
    ElevationSlider.$value = 10;
    ElevationSlider.$instantChange = true;

};

EarthServerGenericClient.createProgressBar =  function(DivID)
{
    $( DivID ).progressbar({ value: 0, max: 100 });
    $( DivID ).on( "progressbarcomplete", function( event, ui ) {
        $( DivID ).toggle( "blind" );
        } );

    this.updateValue = function(value)
    {
        $( DivID ).progressbar( "option", "value", value );
    };
};

