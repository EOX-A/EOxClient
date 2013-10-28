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
			this.instances = {};
			this.idx = 0;

			console.log('[MapViewerModule] Finished module initialization');
		});

		this.createController = function(opts) {
			var id = undefined;
			var startPosition = undefined;

			if (typeof opts !== 'undefined') {
				id = opts.id;
				startPosition = opts.startPosition;

			} else {
				startPosition = {
					x: 15,
					y: 47,
					l: 6
				};
			}

			// Go through instances and return first free one
			for (var contr in this.instances) {
				if(!this.instances[contr].isActive()){
					console.log("Free map viewer returned " +contr);
					this.instances[contr].connectToView();
					return this.instances[contr];
				}
			};

			// If there are no free insances create a new one

			if (typeof id === 'undefined') {
				id = 'MapViewer.' + this.idx++;
			}

			var controller = new MapViewController({
				id: id,
				startPosition: startPosition
			});
			this.instances[id] = controller;

			setupKeyboardShortcuts(controller);

			return controller;
		};

		var setupKeyboardShortcuts = function(controller) {
			keypress.combo("a", function() {
				var pos = controller.getStartPosition();
				controller.centerAndZoom(pos.x, pos.y, pos.l);
			});
		};

		// FIXXME: the router/history concept has to be redesigned for the multiple view approach!
		// var setupRouter = function(map_controller) {
		// 	// The Router maps the history API of the browser to the application in defining
		// 	// routes, which are then mapped to calls to the internal MapViewRouterController.
		// 	// The RouterController knows how to react to those events.
		// 	var MapViewRouter = Marionette.AppRouter.extend({
		// 		appRoutes: {
		// 			"map": "show",
		// 			"map/:x/:y/:l": "centerAndZoom"
		// 		}
		// 	});

		// 	new MapViewRouter({
		// 		controller: new MapViewRouterController(map_controller)
		// 	});
		// };
	});
});