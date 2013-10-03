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

		selectProduct: function(model) {
			if (model.get("name") === "OpenStreetMap") {
				var osmLayer = new GlobWeb.OSMLayer({
					baseUrl: "http://tile.openstreetmap.org"
				});
				this.globe.setBaseImagery(osmLayer);
			} else {
				var blueMarbleLayer = new GlobWeb.WMSLayer({
					baseUrl: "http://demonstrator.telespazio.com/wmspub",
					layers: "BlueMarble",
					opacity: 0.1
				});
				this.globe.setBaseImagery(blueMarbleLayer);
			}

			console.log("[GlobeView::selectProduct] selected " + model.get("name"));
		},

		createGlobe: function() {
			this.globe = new Globe({
				canvas: this.el
			});
		},

		onResize: function() {
			this.globe.setViewport(this.$el.width(), this.$el.height());
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