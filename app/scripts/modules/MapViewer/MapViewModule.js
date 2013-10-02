define([
	'backbone.marionette',
	'app',
	'communicator',
	'./MapViewController',
	'./MapViewRouter'
], function(Marionette, App, Communicator, MapViewController, MapViewRouterController) {

	'use strict';

	App.module('MapViewer', function(Module) {

		this.startsWithParent = true;

		// This is the start routine of the module, called automatically by Marionette
		// after the core system is loaded. The module is responsible for creating its
		// private implementation, the Module.Controller. The Module.Controller is the
		// connected to the event system of the application via the Communicator.
		// Moreover the Router responsible for this module is activated in this routine.
		this.on('start', function(options) {
			var controller = new MapViewController({
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
			// The Router maps the history API of the browser to the application in defining
			// routes, which are then mapped to calls to the internal MapViewRouterController.
			// The RouterController knows how to react to those events.
			var MapViewRouter = Marionette.AppRouter.extend({
				appRoutes: {
					"map": "show",
					"map/:x/:y/:l": "centerAndZoom"
				}
			});

			new MapViewRouter({
				controller: new MapViewRouterController(map_controller)
			});
		};
	});
});