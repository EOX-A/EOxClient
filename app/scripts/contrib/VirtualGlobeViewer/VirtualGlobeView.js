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
			this.isClosed = true;

			this.startPosition = opts.startPosition;
			if (typeof this.startPosition === 'undefined') {
				this.startPosition = {
					geoCenter: [15, 47],
					distance: 0,
					duration: 3000,
					tilt: 40
				}
			};

			this.startProduct = opts.startProduct;

			$(window).resize(function() {
				if (this.globe) {
					this.onResize();
				}
			}.bind(this));
		},

		addAreaOfInterest: function(geojson) {
			this.globe.addAreaOfInterest(geojson);
		},

		selectProduct: function(model, isBaseLayer) {

			this.globe.selectProduct(model, isBaseLayer);

			console.log("[GlobeView::selectProduct] selected " + model.get("name"));
		},

		createGlobe: function() {
			this.globe = new Globe({
				canvas: this.el
			});
			if (typeof this.startProduct !== 'undefined') {
				this.globe.selectProduct(this.startProduct, true);
			};
		},

		onResize: function() {
			this.globe.updateViewport();
		},

		onShow: function() {
			if (!this.globe) {
				this.createGlobe();
			}
			this.isClosed = false;
			this.onResize();
			this.zoomTo(this.startPosition);
		},

		zoomTo: function(position) {
			if (this.globe) {
				this.globe.zoomTo(position);
			}
		},

		onClose: function() {
			this.isClosed = true;
		}
	});

	return GlobeView;

}); // end module definition