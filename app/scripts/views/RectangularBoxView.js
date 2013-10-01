define([
	'backbone.marionette',
	'app',
	'communicator',
	'./X3DOMView',
	'jqueryui'
], function(Marionette, App, Communicator, X3DOMView) {

	'use strict';

	var BoxView = X3DOMView.extend({
		createScene: function() {
			// basic setup:
			EarthServerGenericClient.MainScene.setTimeLog(false); //TimeLogging: outputs time of loading and building the models to the console
			EarthServerGenericClient.MainScene.addLightToScene(true); //Adds a light into the scene
			// background of the render window
			EarthServerGenericClient.MainScene.setBackground("0.8 0.8 0.95 0.4 0.5 0.85 0.3 0.5 0.85 0.31 0.52 0.85", "0.9 1.5 1.57", "0.8 0.8 0.95 0.4 0.5 0.85 0.3 0.5 0.85 0.31 0.52 0.85", "0.9 1.5 1.57");

			// Onclick function example
			EarthServerGenericClient.MainScene.OnClickFunction = function(modelIndex, hitPoint) {
				var height = EarthServerGenericClient.MainScene.getDemValueAt3DPosition(modelIndex, hitPoint[0], hitPoint[2]);
				console.log("Height at clicked position: ", height);
			};

			var BGS = new EarthServerGenericClient.Model_WCPSDemWCPS();
			BGS.setName("BGS 2x WCPS");
			BGS.setURLs("http://earthserver.bgs.ac.uk/petascope");
			BGS.setCoverages("bgs_rs", "os_dtm");
			BGS.setAreaOfInterest(400000, 500000, 450000, 550000);
			BGS.setResolution(500, 500);
			BGS.setOffset(0, 0.2, 0);
			BGS.setScale(1, 0.3, 1);
			BGS.setCoordinateReferenceSystem("http://www.opengis.net/def/crs/EPSG/0/27700");
			BGS.setSidePanels(true);

			var BGS_LOW = new EarthServerGenericClient.Model_WCPSDemAlpha();
			BGS_LOW.setName("BGS Low Resolution");
			BGS_LOW.setURL("http://earthserver.bgs.ac.uk/petascope");
			BGS_LOW.setCoverages("bgs_rs", "os_dtm"); // can be referenced as "$CI" and "$CD" in the WCPS Query
			BGS_LOW.setAreaOfInterest(400000, 500000, 450000, 550000);
			BGS_LOW.setCoordinateReferenceSystem("http://www.opengis.net/def/crs/EPSG/0/27700");
			BGS_LOW.setScale(1.0, 0.2, 1.0);
			BGS_LOW.setOffset(0, 0.8, 0);
			BGS_LOW.setResolution(200, 200);
			BGS_LOW.setWCPSForChannelRED('scale(trim($CI.red, {x:$CRS($MINX:$MAXX), y:$CRS($MINY:$MAXY) }), {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {});');
			BGS_LOW.setWCPSForChannelGREEN('scale(trim($CI.green, {x:$CRS($MINX:$MAXX), y:$CRS($MINY:$MAXY) }), {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {});');
			BGS_LOW.setWCPSForChannelBLUE('scale(trim($CI.blue, {x:$CRS($MINX:$MAXX), y:$CRS($MINY:$MAXY) }), {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {});');
			BGS_LOW.setWCPSForChannelALPHA('(char) (((scale(trim($CD , {x:$CRS($MINX:$MAXX), y:$CRS($MINY:$MAXY)}), {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {})) / 1349) * 255)');

			var Bedrock = new EarthServerGenericClient.Model_WMSDemWCPS();
			Bedrock.setName("Bedrock geology on ground surface");
			Bedrock.setURLs("http://ogc.bgs.ac.uk/cgi-bin/BGS_Bedrock_and_Superficial_Geology/wms", "http://earthserver.bgs.ac.uk/petascope");
			Bedrock.setCoverages("GBR_BGS_625k_BLS", "os_dtm");
			Bedrock.setAreaOfInterest(254750.0, 659824.9, 265250.0, 670024.9);
			Bedrock.setWMSCoordinateReferenceSystem("CRS", "EPSG:27700");
			Bedrock.setWCPSCoordinateReferenceSystem("http://www.opengis.net/def/crs/EPSG/0/27700");
			Bedrock.setScale(1.0, 0.3, 1.0); // Size within the cube 100%width, 30%height and 100%length
			Bedrock.setOffset(0, 1.0, 0);
			Bedrock.setResolution(256, 256); // Resolution of the model

			var glasgow_witi_t = new EarthServerGenericClient.Model_WCPSDemWCPS();
			glasgow_witi_t.setName("Wilderness Till Formation");
			glasgow_witi_t.setURLs("http://earthserver.bgs.ac.uk/petascope", "http://earthserver.bgs.ac.uk/petascope");
			glasgow_witi_t.setCoverages("glasgow_witi_t", "glasgow_witi_t");
			glasgow_witi_t.setAreaOfInterest(254750.0, 659824.9, 265250.0, 670024.9);
			glasgow_witi_t.setCoordinateReferenceSystem("http://www.opengis.net/def/crs/EPSG/0/27700");
			glasgow_witi_t.setScale(1.0, 0.3, 1.0); // Size within the cube 100%width, 30%height and 100%length
			glasgow_witi_t.setOffset(0, 0.4, 0);
			glasgow_witi_t.setResolution(105, 102); // Resolution of the model
			// This value will be considered as NODATA in the DEM. Vertices with that value will not be used and gaps are left.
			glasgow_witi_t.setDemNoDataValue(0);
			// The user can set the height of the model manually to make sure multiple models have the same scaling.
			// Per default this value will be determined by the difference between the dems's min and max values.
			glasgow_witi_t.setHeightResolution(100);
			var query = 'for i in ( $CI ) ';
			query += 'return encode( ';
			query += '{ ';
			query += 'red: (char) 0; ';
			query += 'green: (char) scale((i != -340282346638528859811704183484516925440.0) * 240, {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {}); ';
			query += 'blue: (char) 0 ';
			query += '} ';
			query += ', "png", "nodata=0,0,0")';
			glasgow_witi_t.setWCPSImageQuery(query);
			var demquery = 'for i in ( glasgow_witi_t ) ';
			demquery += 'return encode( ';
			demquery += ' scale((i != -340282346638528859811704183484516925440.0) * i, {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {}) ';
			demquery += ', "csv" )';
			glasgow_witi_t.setWCPSDemQuery(demquery);

			// add models to the scene
			EarthServerGenericClient.MainScene.addModel(BGS);
			EarthServerGenericClient.MainScene.addModel(BGS_LOW);
			EarthServerGenericClient.MainScene.addModel(glasgow_witi_t);
			EarthServerGenericClient.MainScene.addModel(Bedrock);

			// create the scene: Cube has 60% height compared to width and length
			// FIXXME: retrieve ids via options
			EarthServerGenericClient.MainScene.createScene('x3dScene', 'theScene', 1, 0.6, 1);

			EarthServerGenericClient.MainScene.createAxisLabels("Latitude", "Height", "Longitude");

			// register a progressbar (you can register your own or just delete this lines)
			var pb = new EarthServerGenericClient.createProgressBar("progressbar");
			EarthServerGenericClient.MainScene.setProgressCallback(pb.updateValue);

			// create the UI
			EarthServerGenericClient.MainScene.createUI('x3domUI');
			// starts loading and creating the models
			// here the function starts as soon as the html page is fully loaded
			// you can map this function to e.g. a button
			EarthServerGenericClient.MainScene.createModels();
		}
	});

	return BoxView;

}); // end module definition