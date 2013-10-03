define([
	'backbone',
	'underscore',
	'communicator',
	'app',
	'contrib/MapViewer/MapView'
], function(Backbone, _, Communicator, App, MapView) {

	'use strict';

	App.module('MapViewer', function(Module) {

		this.startsWithParent = true;

		// This is the start routine of the module, called automatically by Marionette
		// after the core system is loaded. The module is responsible for creating its
		// private implementation, the Module.Controller. The Module.Controller is the
		// connected to the event system of the application via the Communicator.
		// Moreover the Router responsible for this module is activated in this routine.
		this.on('start', function(options) {
			var controller = new Module.Controller({
				viewerRegion: options.viewerRegion
			});

			registerWithCommunicator(controller);
			setupRouter(controller);

			console.log('[MapViewerModule] Finished module initialization');
		});

		var registerWithCommunicator = function(map_controller) {
			Communicator.registerEventHandler("viewer:show:map", function() {
				Backbone.history.navigate("map", {
					trigger: true
				});
			});
		};

		var setupRouter = function(map_controller) {
			new Module.Router({
				controller: new Module.RouterController(map_controller)
			});
		};

		// The Controller takes care of the (private) implementation of a module. All functionality
		// is solely accessed via the controller. Therefore, also the Module.Router uses the Controller
		// for triggering actions caused by routing events.
		// The Controller has per definition only direct access to the View, it does not i.e. access
		// the Application object directly.
		Module.Controller = Backbone.Marionette.Controller.extend({

			initialize: function(options) {
				this.mapView = new MapView();
				this.connectToView();

				this.region = options.viewerRegion;

				if (typeof(this.region) === 'undefined') {
					console.log('[MapViewerModule] Please specify a region for this module to be shown in.')
				}
			},

			show: function() {
				this.region.show(this.mapView);
			},

			centerAndZoom: function(x, y, l) {
				this.mapView.centerMap({
					x: x,
					y: y,
					l: l
				});
			},

			connectToView: function() {
				this.listenTo(Communicator.mediator, "map:center", _.bind(this.mapView.centerMap, this.mapView));
				this.listenTo(Communicator.mediator, "map:layer:change", _.bind(this.mapView.changeLayer, this.mapView));
				this.listenTo(Communicator.mediator, "productCollection:sortUpdated", _.bind(this.mapView.onSortProducts, this.mapView));
				this.listenTo(Communicator.mediator, "selection:activated", _.bind(this.mapView.onSelectionActivated, this.mapView));
				this.listenTo(Communicator.mediator, "map:load:geojson", _.bind(this.mapView.onLoadGeoJSON, this.mapView));
				this.listenTo(Communicator.mediator, "map:export:geojson", _.bind(this.mapView.onExportGeoJSON, this.mapView));

				this.mapView.listenTo(this.mapView.model, 'change', function(model, options) {
					Communicator.mediator.trigger("router:setUrl", {
						x: model.get('center')[0],
						y: model.get('center')[1],
						l: model.get('zoom')
					});
				});
			}
		});

		// The Router maps the history API of the browser to the application in defining
		// routes, which are then mapped to calls to the internal Module.RouterController.
		// The RouterController knows how to react to those events.
		Module.Router = Backbone.Marionette.AppRouter.extend({
			appRoutes: {
				"map": "show",
				"map/:x/:y/:l": "centerAndZoom"
			},
		});

		// The RouterController provides the (private) implementation of the Router. Internally it
		// maps routing events to functionality provided by the Module.Controller.
		Module.RouterController = Backbone.Marionette.Controller.extend({

			initialize: function(map_controller) {
				this.mapController = map_controller;
				this.listenTo(Communicator.mediator, "router:setUrl", this.setUrl);
			},

			setUrl: function(data) {
				//round to two decimals
				data.x = Math.round(data.x * 100) / 100;
				data.y = Math.round(data.y * 100) / 100;
				var urlFragment = 'map/' + data.x + '/' + data.y + '/' + data.l;
				Backbone.history.navigate(urlFragment, {
					trigger: false
				});
			},

			centerAndZoom: function(x, y, l) {
				// When calling the back button from within another viewer widget the map is not
				// shown in the region, it therefore has to be shown explicitly here.
				this.show();
				
				this.mapController.centerAndZoom(x, y, l);
			},

			show: function() {
				this.mapController.show();
			}
		});
	});
});