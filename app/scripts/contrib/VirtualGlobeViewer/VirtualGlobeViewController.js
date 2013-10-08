define([
	'backbone.marionette',
	'app',
	'communicator',
	'./VirtualGlobeView'
], function(Marionette, App, Communicator, VirtualGlobeView) {

	'use strict';

	var VirtualGlobeViewController = Marionette.Controller.extend({

		initialize: function(opts) {
			this.id = opts.id;
			this.startPosition = opts.startPosition;

			this.globeView = new VirtualGlobeView({
				startPosition: opts.startPosition
			});

			this.listenTo(Communicator.mediator, 'selection:changed', this.addAreaOfInterest);
			this.listenTo(Communicator.mediator, 'router:setUrl', this.zoomTo);
		},

		getView: function(id) {
			return this.globeView;
		},

		show: function() {
			this.region.show(this.globeView);
		},

		addAreaOfInterest: function(geojson) {
			this.globeView.addAreaOfInterest(geojson);
		},

		zoomTo: function(pos) {
			var position = {
				center: [pos.x, pos.y],
				distance: 10000000,	
				duration: 1000,
				tilt: 45
			}
			this.globeView.zoomTo(position);
		},

		getStartPosition: function() {
			return this.startPosition;
		}
	});

	return VirtualGlobeViewController;
});