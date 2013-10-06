define([
	'backbone.marionette',
	'app',
	'communicator',
	'./RectangularBoxViewController',
	'./RectangularBoxViewRouter'
], function(Marionette, App, Communicator, RectangularBoxViewController, RectangularBoxViewRouter) {

	'use strict';

	App.module('RectangularBoxViewer', function(Module) {

		this.startsWithParent = true;

		this.on('start', function(options) {
			var controller = new RectangularBoxViewController();

			registerWithCommunicator(controller);
			// FIXXME: Routing system has to be reworked to integrate it with multiple views!
			//setupRouter(controller);

			console.log('[RectangularBoxViewer] Finished module initialization');

		});

		var registerWithCommunicator = function(rbv_controller) {
			Communicator.registerEventHandler("viewer:show:rectangularboxviewer", function() {
				Backbone.history.navigate("rbv", {
					trigger: true
				});
			});

			Communicator.registerEventHandler("viewer:hide:rectangularboxviewer", function() {
				rbv_controller.hide();
			});			
		};

		var setupRouter = function(rbv_controller) {
			var Router = Backbone.Marionette.AppRouter.extend({
				appRoutes: {
					"rbv": "show"
				}
			});

			new Router({
				controller: new RectangularBoxViewRouter(rbv_controller)
			});
		};
	});
});