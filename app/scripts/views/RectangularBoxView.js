define(["backbone.marionette", "app", "communicator", "jqueryui"],
	function(Marionette, App, Communicator) {

		'use strict';

		var BoxView = Marionette.View.extend({
			
			initialize: function() {
				this.isInitialized = false;

				$(window).resize(function() {
					this.onResize();
				}.bind(this));

				this.hide();
			},

			onResize: function() {
				$('.x3dom-canvas').attr("width", $(window).width() - 5);
				$('.x3dom-canvas').attr("height", $(window).height() - 5);
			},

			hide: function() {
				$("#x3dom").hide();
				$("#x3domUI").hide();
			},

			show: function() {
				this.onResize();

				$("#x3dom").show();
				$("#x3domUI").show();
			},

			onShow: function() {
				if (!this.isInitialized) {
					//x3dom.reload();
					// FIXXME: for whatever reason this global is necessary within the EarthServer library code!
					//         funny :-(
					window.EarthServerGenericClient_MainScene = new EarthServerGenericClient.SceneManager();
					EarthServerGenericClient_MainScene.setTimeLog(false);

					var q = new EarthServerGenericClient.Model_WCPSDemAlpha();
					q.setName("BGS High Resolution");
					q.setURL("http://earthserver.bgs.ac.uk/petascope");
					q.setCoverages("bgs_rs", "os_dtm");
					q.setAreaOfInterest(400000, 500000, 450000, 550000);
					//q.setAreaOfInterest(375000,475000,475000,575000);
					q.setScale(1.0, 0.3, 1.0);
					q.setResolution(600, 600);
					//q.setProgressiveLoading(true);

					// var WMS = new EarthServerGenericClient.Model_WMSDemWCS();
					// WMS.setName("WMS_WCS");
					// WMS.setURLs("http://planetserver.jacobs-university.de:8080/petascope/wms", "http://planetserver.jacobs-university.de:8080/petascope");
					// WMS.setCoverages("galehrsc_wms", "galehrscdtm");
					// WMS.setWMSVersion("1.1");
					// WMS.setCoordinateReferenceSystem("SRS", "EPSG:4326");
					// WMS.setAreaOfInterest(137, -6, 138, -5);
					// WMS.setResolution(1000, 1000);
					// WMS.setOffset(0, 0.4, 0);

					// var w = new EarthServerGenericClient.Model_WCPSDemAlpha();
					// w.setName("BGS Low Resolution");
					// w.setURL("http://earthserver.bgs.ac.uk/petascope");
					// w.setCoverages("bgs_rs", "os_dtm");
					// w.setAreaOfInterest(400000, 500000, 450000, 550000);
					// w.setScale(1.0, 0.2, 1.0);
					// w.setOffset(0, 0.4, 0);
					// w.setResolution(200, 200);
					// w.setWCPSForChannelRED('scale(trim($CI.red, {x($MINX:$MAXX), y($MINY:$MAXY) }), {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {});');
					// w.setWCPSForChannelGREEN('scale(trim($CI.green, {x($MINX:$MAXX), y($MINY:$MAXY) }), {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {});');
					// w.setWCPSForChannelBLUE('scale(trim($CI.blue, {x($MINX:$MAXX), y($MINY:$MAXY) }), {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {});');
					// w.setWCPSForChannelALPHA('(char) (((scale(trim(dtm , {x($MINX:$MAXX), y($MINY:$MAXY)}), {x:"CRS:1"(0:$RESX), y:"CRS:1"(0:$RESZ)}, {})) / 1349) * 255)');

					var g = new EarthServerGenericClient.Model_WCPSDemWCS();
					g.setURLs("http://planetserver.jacobs-university.de:8080/petascope/wcps.php", "http:///planetserver.jacobs-university.de:8080/petascope");
					g.setCoverages("FRT0000C51807L", "galehrscdtm");
					g.setAreaOfInterest(137, -6, 138, -5);
					g.setResolution(1000, 1000);
					g.setOffset(0, 0.4, 0);
					//g.setTransparency(0.5);

					var g_query = 'for data in ( $CI ) return encode( (char)({';
					g_query += 'red: (char) (255 / (max(((data.100)!=65535) * (data.100)) - min(data.100))) * ((data.100) - min(data.100));';
					g_query += 'green: (char) (255 / (max(((data.200)!=65535) * (data.200)) - min(data.200))) * ((data.200) - min(data.200));';
					g_query += 'blue: (char) (255 / (max(((data.300)!=65535) * (data.300)) - min(data.300))) * ((data.300) - min(data.300))';
					g_query += ', "png" )';
					g.setWCPSQuery(g_query);

					//EarthServerGenericClient_MainScene.addModel(q);
					EarthServerGenericClient_MainScene.addModel(g);

					EarthServerGenericClient_MainScene.createScene('dummy_not_used', "x3dScene", 1, 0.8, 1);

					EarthServerGenericClient_MainScene.addAnnotationsLayer("TEST", 50, "1 1 1", 25, 6, "1 1 1");
					EarthServerGenericClient_MainScene.addAnnotation("TEST", 310, 35, -170, "CityName");
					EarthServerGenericClient_MainScene.addAnnotation("TEST", 200, -45, 400, "You can annotate here");

					EarthServerGenericClient_MainScene.createUI('x3domUI');
					EarthServerGenericClient_MainScene.setAxisLabels("Latitude", "Height", "Longitude");
					EarthServerGenericClient_MainScene.createAxisLabels();

					//var pb = new EarthServerGenericClient.createProgressBar("progressbar");
					//EarthServerGenericClient_MainScene.setProgressCallback(pb.updateValue);

					EarthServerGenericClient_MainScene.createModels();

					this.onResize();

					this.isInitialized = true;
				}

				this.show();
			},

			onClose: function() {
				this.hide();
			}
		});

		// FIXXME: MH: create a module/controller!
		var _myView = undefined;
		Communicator.registerEventHandler("viewer:show:rectangularboxviewer", function() {
			if (!_myView) {
				_myView = new BoxView({
					el: $('#x3dom')
				});
			}
			App.map.show(_myView);
		});

		return BoxView;

	}); // end module definition