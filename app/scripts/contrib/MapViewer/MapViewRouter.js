define([
	'backbone.marionette',
	'app',
	'communicator', // FIXXME: The communicator does not belong here!
	'./MapViewController'
], function(Marionette, App, Communicator, MapViewController) {

	'use strict';

	// The RouterController provides the (private) implementation of the Router. Internally it
	// maps routing events to functionality provided by the Module.Controller.
	var MapViewRouterController = Marionette.Controller.extend({

		initialize: function(map_controller) {
			this.mapController = map_controller;
			// FIXXME: setUrl() should be refactored, it does not belong here!
			this.listenTo(Communicator.mediator, "router:setUrl", this.setUrl);
		},

		// FIXXME: This function should be refactored, it does not belong here!
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

	return MapViewRouterController;
});