define([
	'backbone.marionette',
	'app',
	'communicator',
	'./GlobeRenderer/Globe'
	// 'hbs!tmpl/VirtualGlobeView',
], function(Marionette, App, Communicator, Globe /*, VirtualGlobeViewTmpl*/ ) {

	'use strict';

	var GlobeView = Marionette.View.extend({
		tagName: 'canvas',
		className: 'globe',

		// template: {
		// 	type: 'handlebars',
		// 	template: VirtualGlobeViewTmpl
		// },

		// ui: {
		// 	viewport: '#myglobe',
		// 	gui: '.gui'
		// },

		initialize: function(opts) {
			this.startPosition = opts.startPosition;

			if (typeof this.startPosition === 'undefined') {
				this.startPosition = {
					geoCenter: [15, 47],
					distance: 0,
					duration: 3000,
					tilt: 40
				}
			};

			$(window).resize(function() {
				if (this.globe) {
					this.onResize();
				}
			}.bind(this));
		},

		addAreaOfInterest: function(geojson) {
			this.globe.addAreaOfInterest(geojson);
		},

		selectProduct: function(model) {
			if (model.get("name") === "OpenStreetMap") {
				this.globe.setProduct({
					type: 'OSMLayer'
				});
			} else {
				this.globe.setProduct({
					type: 'BlueMarble'
				});
			}

			console.log("[GlobeView::selectProduct] selected " + model.get("name"));
		},

		createGlobe: function() {
			this.globe = new Globe({
				canvas: this.el
			});
		},

		onResize: function() {
			this.globe.updateViewport();
		},

		onShow: function() {
			if (!this.globe) {
				this.createGlobe();
				this.onResize();
				this.zoomTo(this.startPosition);
			}
		},

		zoomTo: function(position) {
			if (this.globe) {
				this.globe.zoomTo(position);
			}
		}
	});

	return GlobeView;

}); // end module definition