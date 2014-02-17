define([
	'backbone.marionette',
	'app',
	'./RectangularBoxViewController'
], function(Marionette, App, Communicator, RectangularBoxViewController) {

	'use strict';

	var RectangularBoxViewRouterController = function(rbv_controller) {
		this.rbv_controller = rbv_controller;
	};

	_.extend(RectangularBoxViewRouterController.prototype, {
		show: function() {
			this.rbv_controller.show();
		}
	});

	return RectangularBoxViewRouterController;
});