define([
	'backbone',
	'communicator',
	'app',
	'views/VirtualGlobeView'
], function(Backbone, Communicator, App, VirtualGlobeView) {

	'use strict';

	App.module('VirtualGlobeViewer', function(Module) {

		this.startsWithParent = true;

		Module.Controller = Backbone.Marionette.Controller.extend({

			initialize: function(options) {
				this.globeView = undefined;
			},

			show: function() {
				if (typeof(this.globeView) == 'undefined') {
					this.globeView = new VirtualGlobeView();
				}

				App.map.show(this.globeView);
			}
		});

		// I like the idea of a 'module' that holds together the controllers and
		// views. The module-controller-view concept allows to delegate the responsibilities of 
		// each component clearly. E.g. the module only communicates with the App and the 
		// Communicator object. A controller only talks to its module and to its views. A view
		// is connected only to its controller via events. No other communication is allowed,
		// i.e. a controller is not allowed to directly talk to the Communicator.
		this.on('start', function(options) {
			var controller = new Module.Controller();

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

			var RouteController = function() {};

			_.extend(RouteController.prototype, {
				show: function() {
					globe_controller.show();
				}
			});

			new Router({
				controller: new RouteController(globe_controller)
			});
		};		
	});
});