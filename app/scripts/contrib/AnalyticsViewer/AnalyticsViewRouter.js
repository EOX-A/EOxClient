define([
	'backbone.marionette',
	'app',
	'./AnalyticsViewController'
], function(Marionette, App, AnalyticsViewController) {

	'use strict';

	// The RouterController provides the (private) implementation of the Router. Internally it
	// maps routing events to functionality provided by the Module.Controller.
	var AnalyticsViewRouterController = Marionette.Controller.extend({

		initialize: function(analytics_controller) {
			this.analyticsController = analytics_controller;
		},

		show: function() {
			this.analyticsController.show();
		}
	});

	return AnalyticsViewRouterController;
});