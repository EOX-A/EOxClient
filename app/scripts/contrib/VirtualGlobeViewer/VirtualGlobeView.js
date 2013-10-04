define([
	'backbone.marionette',
	'app',
	'communicator',
	'./GlobeRenderer/Globe'
], function(Marionette, App, Communicator, Globe) {

	'use strict';

	var GlobeView = Marionette.View.extend({
		tagName: "canvas",

		className: "globe",

		initialize: function() {
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
			}
		}
	});

	return GlobeView;

}); // end module definition