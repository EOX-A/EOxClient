define([
	'backbone.marionette',
	'app',
	'communicator',
	'./VirtualGlobeViewController',
	'./VirtualGlobeViewRouter'
], function(Marionette, App, Communicator, VirtualGlobeViewController, VirtualGlobeViewRouter) {

	'use strict';

	App.module('VirtualGlobeViewer', function(Module) {

		this.startsWithParent = true;

		// I like the idea of a 'module' that holds together the controllers and
		// views. The module-controller-view concept allows to delegate the responsibilities of 
		// each component clearly. E.g. the module only communicates with the App and the 
		// Communicator object. A controller only talks to its module and to its views. A view
		// is connected only to its controller via events. No other communication is allowed,
		// i.e. a controller is not allowed to directly talk to the Communicator.
		this.on('start', function(options) {
			var controller = new VirtualGlobeViewController({
				viewerRegion: options.viewerRegion
			});
			
			registerWithCommunicator(controller);
			setupRouter(controller);

			console.log('[VirtualGlobeViewer] Finished module initialization');

		});

		var registerWithCommunicator = function(globe_controller) {
			Communicator.registerEventHandler("viewer:show:virtualglobeviewer", function() {
				Backbone.history.navigate("vgv", {
					trigger: true
				});
			});
		};

		var setupRouter = function(globe_controller) {
			var Router = Backbone.Marionette.AppRouter.extend({
				appRoutes: {
					"vgv": "show"
				}
			});

			new Router({
				controller: new VirtualGlobeViewRouter(globe_controller)
			});
		};		
	});
});