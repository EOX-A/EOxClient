define([
	'backbone.marionette',
	'app',
	'communicator',
	'./VirtualGlobeView'
], function(Marionette, App, Communicator, VirtualGlobeView) {

	'use strict';

	var VirtualGlobeViewController = Marionette.Controller.extend({

		initialize: function(options) {
			this.globeView = new VirtualGlobeView();

			this.listenTo(Communicator.mediator, 'selection:changed', function(data) {
				this.addAreaOfInterest(data);
			}.bind(this));
		},

		getView: function(id) {
			if (id === 'main') {
				return this.globeView;
			} else {
				console.log('[VirtualGlobeViewController::getView] Error: Unknown view "' + id + "' requested!");
			}
		},

		show: function() {
			this.region.show(this.globeView);
		},

		addAreaOfInterest: function(geojson) {
			this.globeView.addAreaOfInterest(geojson);
		}
	});

	return VirtualGlobeViewController;
});