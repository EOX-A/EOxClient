// Create 3d wcps wcps layer with single colour and gaps.

var geoModelUtils={};

/*
 * serviceURL - URL for WCPS service
 * coverage - name of coverage with elevation values
 * title - to put in legend
 * aoi - array of geographic bounds for labelling [xmin, ymin, xmax, ymax] (x,y horizontal geographic coords)
 * crs - URI string for CRS to be used in WCPS query
 * boxScale - array of three ratios of how returned layer should be scaled relative to the "fishtank box" [xscale, yscale, zxcale] (x, y, z in x3d coords so y is vertical up screen and z is into screen)
 * res - what resolution image and dem to request to be returned
 * nullValue - the value representing gaps in the surface
 * rgb - array of red, green and blue values to colour surface
 */
geoModelUtils.createModel = function(serviceUrl, coverage, title, aoi, crs, boxScale, res, nullValue, rgb) {
  var model = new EarthServerGenericClient.Model_WCPSDemWCPS();
  model.setName(title);
  model.setURLs(serviceUrl);
  model.setCoverages(coverage, coverage);
  model.setAreaOfInterest(aoi[0], aoi[1], aoi[3],aoi[4]);
  model.setHeightResolution(aoi[5] - aoi[2]);
  model.setHeightMinimum(aoi[2]);
  model.setCoordinateReferenceSystem(crs);
  model.setScale(boxScale[0],boxScale[1],boxScale[2]);//Size within the cube 100%width, 100%height and 100%length
  model.setResolution(res[0],res[1]);//Resolution of the model
  var query = 'for i in ( $CI ) ';
  query += 'return encode( ';
  query += '{ ';
  query += 'red: (char) scale((i = i) * ' + rgb[0] + ', {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {}); ';
  query += 'green: (char) scale((i = i) * ' + rgb[1] + ', {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {}); ';
  query += 'blue: (char) scale((i = i) * ' + rgb[2] + ', {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {}) ';
  query += '} ';
  query += ', "png"';
  model.setWCPSImageQuery(query);
  var demquery = 'for i in ( $CD ) ';
  demquery += 'return encode( ';
  demquery += ' scale(((i != ' + nullValue + ') * i) + (-45 * (i = ' + nullValue + ')),  {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {}) ';
  demquery += ', "csv" )';
  model.setWCPSDemQuery(demquery);
  model.setDemNoDataValue(-45);

  model.appendUIElements = function(container) {
    var i = this.index;
    var transformid = 'EarthServerGenericClient_modelTransform' + i;
    var cfn = function() { 
      var el = document.getElementById(transformid); 
      if (this.checked) {el.setAttribute("render", true)} 
      else 
      {el.setAttribute("render", false)} 
      };
    var header = document.createElement("h3");
    $(header).html('<span style="display: inline-block; height: 1em; width: 1em"></span>&nbsp;<input type="checkbox" checked="checked">'+this.name);
    //header.innerHTML = this.name;
    var div = document.createElement("div");
    header.setAttribute("id","EarthServerGenericClient_ModelHeader_"+i);
    div.setAttribute("id","EarthServerGenericClient_ModelDiv_"+i);
    var backgroundColor = 'rgb('+rgb[0]+','+rgb[1]+','+rgb[2]+')';
    $(header).find('span').css('background-color',backgroundColor);
    $(header).find('input').change(cfn);

    container.appendChild(header);
    container.appendChild(div);

    EarthServerGenericClient.appendAlphaSlider(div,i);
  };
  return model;
};

/**
 * Creates the basic UI suitable for geology layers rather than the generic client one
 * @param domElementID - Dom element to append the UI to.
 */

geoModelUtils.createBasicUI = function(domElementID)
{
    var UI_DIV = document.getElementById(domElementID);
    if( !UI_DIV )
    {
        alert("Can't find DomElement for UI with ID " +domElementID);
        return;
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
