define([
	'backbone.marionette',
	'app',
	'communicator',
	'./X3DOMView',
	'globals',
	'underscore',
	'jqueryui'
], function(Marionette, App, Communicator, X3DOMView, globals, _) {

	'use strict';

	var BoxView = X3DOMView.extend({
		createScene: function(opts) {
			this.opts = opts;

			// basic setup:
			EarthServerGenericClient.MainScene.resetScene();
			EarthServerGenericClient.MainScene.setTimeLog(opts.setTimeLog);
			EarthServerGenericClient.MainScene.addLightToScene(opts.addLightToScene);
			// background of the render window
			//EarthServerGenericClient.MainScene.setBackground("0.8 0.8 0.95 0.4 0.5 0.85 0.3 0.5 0.85 0.31 0.52 0.85", "0.9 1.5 1.57", "0.8 0.8 0.95 0.4 0.5 0.85 0.3 0.5 0.85 0.31 0.52 0.85", "0.9 1.5 1.57");
			// EarthServerGenericClient.MainScene.setBackground("0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2", "0.9 1.5 1.57", "0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2", "0.9 1.5 1.57");
			EarthServerGenericClient.MainScene.setBackground(opts.background[0], opts.background[1], opts.background[2], opts.background[3]);

			// Onclick function example
			EarthServerGenericClient.MainScene.OnClickFunction = opts.onClickFunction;

			var scene = new EarthServerGenericClient.Model_WMSDemWMS();
			// scene.setURLs('http://neso.cryoland.enveo.at/cryoland/ows', 'http://data.eox.at/elevation?');
			scene.setURLs(opts.wmsUrl, opts.wcsUrl);
			// scene.setCoverages('daily_FSC_PanEuropean_Optical', 'ACE2');
			scene.setCoverages(opts.wmsLayer, opts.wcsLayer);
			// scene.setAreaOfInterest(-11.25, 22.5, 0, 33.75);
			scene.setAreaOfInterest(opts.aoi[0], opts.aoi[1], opts.aoi[2], opts.aoi[3]);
			scene.setTimespan(opts.toi);
			scene.setOutputCRS(opts.outputCRS);
			scene.setResolution(opts.resolution[0], opts.resolution[1]);
			// scene.setOffset(0, 0.2, 0);
			// scene.setScale(1, 3, 1);
			scene.setWMSVersion(opts.wmsVersion);
			scene.setWCSVersion(opts.wcsVersion);
			scene.setWCSMimeType(opts.wcsMimeType);
			scene.setWCSDataType(opts.wcsDataType);
			scene.setCoordinateReferenceSystem(opts.CRS[0], opts.CRS[1]);
			// This value will be considered as NODATA in the DEM. Vertices with that value will not be used and gaps are left.
			scene.setDemNoDataValue(0);
			// The user can set the height of the model manually to make sure multiple models have the same scaling.
			// Per default this value will be determined by the difference between the dems's min and max values.
			// scene.setHeightResolution(100);
			//scene.setSidePanels(true);

			scene.registerMIMETypeHandler('image/x-aaigrid', function(receivedData, responseData) {
				var lines = receivedData.split('\n');
				var ncols = parseInt(lines[8].replace('ncols', ''));
				var nrows = parseInt(lines[9].replace('nrows', ''));

				var heightmap = [];
				var maxValue = 0;
				var minValue = 0;
				for (var i = 0; i < nrows; ++i) {
					var value_array = lines[i + 13].split(' ');
					heightmap.push(value_array);

					for (var idx = 0; idx < value_array.length; idx++) {
						var val = parseFloat(value_array[idx]);
						if (maxValue < val) {
							maxValue = value_array[idx];
						}
						if (minValue > val) {
							minValue = value_array[idx];
						}
					};
				};

				responseData.height = ncols-1;
				responseData.width = nrows-1;

				responseData.maxHMvalue = maxValue;
				responseData.minHMvalue = minValue;
				responseData.minXvalue = 0;
				responseData.minZvalue = 0;
				responseData.maxXvalue = ncols-1;
				responseData.maxZvalue = nrows-1;

				responseData.heightmap = heightmap;

				return true;
			});

			EarthServerGenericClient.MainScene.addModel(scene);

			// create the scene: Cube has 60% height compared to width and length
			// EarthServerGenericClient.MainScene.createScene('x3dScene', 'theScene', 1, 0.6, 1);
			// EarthServerGenericClient.MainScene.createScene('x3dScene', 'x3dScene', 1, 0.6, 1);
			// FIXXME: this was the only combination that worked, investigate API!
			EarthServerGenericClient.MainScene.createScene(opts.x3dscene_id, opts.x3dscene_id, 1, 0.8, 1);

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
		},

		createSceneVolume: function(opts) {
			//var EarthServerGenericClient = EarthServerGenericClient || {};
			EarthServerGenericClient.MainScene.setTimeLog(false);
			EarthServerGenericClient.MainScene.addLightToScene(false);
			//EarthServerGenericClient.MainScene.setBackground("0.8 0.8 0.95 0.4 0.5 0.85 0.3 0.5 0.85 0.31 0.52 0.85", "0.9 1.5 1.57", "0.8 0.8 0.95 0.4 0.5 0.85 0.3 0.5 0.85 0.31 0.52 0.85", "0.9 1.5 1.57");
			EarthServerGenericClient.MainScene.setBackground("0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2", "0.9 1.5 1.57", "0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2", "0.9 1.5 1.57");

			var volume = new EarthServerGenericClient.Model_LayerAndTime();
			volume.setName("Volume");
			volume.setURL("http://earthserver.services.meeo.it/petascope");
			volume.setCoverage("MACC_Q_4326_1125");
			volume.setCoverageTime("1203113");
			volume.setLayers("1:7");
			volume.setScale(1, 1, 1);
			volume.setDataModifier(10000);

			EarthServerGenericClient.MainScene.addModel(volume);
			// FIXXME: this was the only combination that worked, investigate API!
			EarthServerGenericClient.MainScene.createScene(opts.x3dscene_id, opts.x3dscene_id, 1, 0.8, 1);

			EarthServerGenericClient.MainScene.createAxisLabels("Latitude", "Height", "Longitude");

			var pb = new EarthServerGenericClient.createProgressBar("progressbar");
			EarthServerGenericClient.MainScene.setProgressCallback(pb.updateValue);
			pb = null;

			EarthServerGenericClient.MainScene.createModels();
			EarthServerGenericClient.MainScene.createUI('x3domUI');
		},

		createSceneBla: function(opts) {
			// basic setup:
			EarthServerGenericClient.MainScene.setTimeLog(false); //TimeLogging: outputs time of loading and building the models to the console
			EarthServerGenericClient.MainScene.addLightToScene(true); //Adds a light into the scene
			// background of the render window
			//EarthServerGenericClient.MainScene.setBackground("0.8 0.8 0.95 0.4 0.5 0.85 0.3 0.5 0.85 0.31 0.52 0.85", "0.9 1.5 1.57", "0.8 0.8 0.95 0.4 0.5 0.85 0.3 0.5 0.85 0.31 0.52 0.85", "0.9 1.5 1.57");
			EarthServerGenericClient.MainScene.setBackground("0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2", "0.9 1.5 1.57", "0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2", "0.9 1.5 1.57");

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
			// EarthServerGenericClient.MainScene.addModel(BGS_LOW);
			// EarthServerGenericClient.MainScene.addModel(glasgow_witi_t);
			// EarthServerGenericClient.MainScene.addModel(Bedrock);

			// create the scene: Cube has 60% height compared to width and length
			// EarthServerGenericClient.MainScene.createScene('x3dScene', 'theScene', 1, 0.6, 1);
			// EarthServerGenericClient.MainScene.createScene('x3dScene', 'x3dScene', 1, 0.6, 1);
			// FIXXME: this was the only combination that worked, investigate API!
			EarthServerGenericClient.MainScene.createScene(opts.x3dscene_id, opts.x3dscene_id, 1, 0.8, 1);

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
		},

		setAreaOfInterest: function(area) {
			if (area) {
				var defaults = {
					setTimeLog: false,
					addLightToScene: true,
					background: ["0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2",
						"0.9 1.5 1.57",
						"0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2",
						"0.9 1.5 1.57"
					],
					onClickFunction: function(modelIndex, hitPoint) {
						var height = EarthServerGenericClient.MainScene.getDemValueAt3DPosition(modelIndex, hitPoint[0], hitPoint[2]);
						console.log("Height at clicked position: ", height)
					},

					resolution: [500, 500],

					outputCRS: 'http://www.opengis.net/def/crs/EPSG/0/4326',
					CRS: ['SRS', 'EPSG:4326'],

					wmsUrl: 'http://tiles.maps.eox.at/wms?service=wms&version=',
					// wmsLayer: 'bluemarble',
					wmsLayer: 'terrain',
					// wmsUrl: 'http://neso.cryoland.enveo.at/cryoland/ows',
					// wmsLayer: 'daily_FSC_PanEuropean_Optical',
					wmsVersion: '1.1.1',

					wcsUrl: 'http://data.eox.at/elevation?',
					wcsLayer: 'ACE2',
					wcsVersion: '2.0.0',
					wcsMimeType: 'image/x-aaigrid',
					wcsDataType: 'text'
				};

				var toi = this.timeOfInterest;
				// In case no ToI was set during the lifecycle of this viewer we can access
				// the time of interest from the global context:
				if (!toi) {
					var starttime = new Date(globals.context.timeOfInterest.start);
					var endtime = new Date(globals.context.timeOfInterest.end);

					toi = this.timeOfInterest = starttime.toISOString() + '/' + endtime.toISOString();
				}

				var bounds = area.bounds;
				this.currentAoI = [bounds.left, bounds.bottom, bounds.right, bounds.top];

				this.createScene(_.extend(defaults, this.options, {
					aoi: this.currentAoI,
					toi: toi
				}));
			}
		},

		onTimeChange: function(time) {
			var defaults = {
				setTimeLog: false,
				addLightToScene: true,
				background: ["0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2",
					"0.9 1.5 1.57",
					"0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2 0.2",
					"0.9 1.5 1.57"
				],
				onClickFunction: function(modelIndex, hitPoint) {
					var height = EarthServerGenericClient.MainScene.getDemValueAt3DPosition(modelIndex, hitPoint[0], hitPoint[2]);
					console.log("Height at clicked position: ", height)
				},

				resolution: [500, 500],

				outputCRS: 'http://www.opengis.net/def/crs/EPSG/0/4326',
				CRS: ['SRS', 'EPSG:4326'],

				// wmsUrl: 'http://wms.jpl.nasa.gov/wms.cgi?',
				// wmsLayer: 'BMNG',
				wmsUrl: 'http://neso.cryoland.enveo.at/cryoland/ows',
				wmsLayer: 'daily_FSC_PanEuropean_Optical',
				wmsVersion: '1.1.1',

				wcsUrl: 'http://data.eox.at/elevation?',
				wcsLayer: 'ACE2',
				wcsVersion: '2.0.0',
				wcsMimeType: 'image/x-aaigrid',
				wcsDataType: 'text'
			};

			var starttime = new Date(time.start);
			var endtime = new Date(time.end);

			this.timeOfInterest = starttime.toISOString() + '/' + endtime.toISOString();

			this.createScene(_.extend(defaults, this.options, {
				aoi: this.currentAoI,
				toi: this.timeOfInterest
			}));
		}
	});

	return BoxView;

}); // end module definition