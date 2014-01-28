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
		initialize: function(opts) {
			this.isEmpty = true;
			this.isInitialized = false;

			X3DOMView.prototype.initialize.call(this, opts);
		},

		onShow: function() {
			if (!this.isEmpty) {
				if (!this.isInitialized) {
					this.$el.html('');
					X3DOMView.prototype.hide.call(this);
					this.isInitialized = true;
				}
				X3DOMView.prototype.onShow.call(this);
			} else {
				// FIXXME: for some reason the 'tempalte' property did not work, fix that!
				this.$el.html('<div class="rbv-empty">Please select an Area of Interest (AoI) in one of the map viewer!</div>');
			}
		},

		createScene: function(opts) {
			this.isEmpty = false;

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
					var value_array = lines[i + 14].split(' ');

					for (var idx = 1; idx < 500; /*value_array.length;*/ ++idx) {
						var val = parseFloat(value_array[idx]);
						if (maxValue < val) {
							maxValue = value_array[idx];
						}
						if (minValue > val) {
							minValue = value_array[idx];
						}
						if (typeof heightmap[idx - 1] === 'undefined') {
							heightmap[idx - 1] = [];
						}
						heightmap[idx - 1].push(value_array[idx])
					}
				}

				responseData.height = ncols - 1;
				responseData.width = nrows - 1;

				responseData.maxHMvalue = maxValue;
				responseData.minHMvalue = minValue;
				responseData.minXvalue = 0;
				responseData.minZvalue = 0;
				responseData.maxXvalue = ncols - 1;
				responseData.maxZvalue = nrows - 1;

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

			this.onShow();
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