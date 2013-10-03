define([
	'backbone.marionette',
	'app',
	'communicator',
	'./VirtualGlobeView'
], function(Marionette, App, Communicator, VirtualGlobeView) {

	'use strict';

	var VirtualGlobeViewController = Marionette.Controller.extend({

		initialize: function(options) {
			this.globeView = undefined;

			this.region = options.viewerRegion;

			if (typeof(this.region) === 'undefined') {
				console.log('[MapViewerController] Please specify a region for this module to be shown in.')
			}
		},

		show: function() {
			if (typeof(this.globeView) == 'undefined') {
				this.globeView = new VirtualGlobeView();
			}

			this.region.show(this.globeView);
		}
	});

	return VirtualGlobeViewController;
});