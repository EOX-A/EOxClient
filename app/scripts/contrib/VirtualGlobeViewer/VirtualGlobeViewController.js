define([
	'backbone.marionette',
	'app',
	'communicator',
	'globals',
	'./VirtualGlobeView'
], function(Marionette, App, Communicator, globals, VirtualGlobeView) {

	'use strict';

	var VirtualGlobeViewController = Marionette.Controller.extend({

		initialize: function(opts) {
			this.id = opts.id;
			this.startPosition = opts.startPosition;
			if (typeof this.startPosition === 'undefined') {
				this.startPosition = {
					center: [74, 15],
					distance: 10000000,
					duration: 1000,
					tilt: 45
				};
			}

			var startProduct = globals.baseLayers.find(function(model) {
				return model.get('name') === 'Terrain Layer';
			});

			this.globeView = new VirtualGlobeView({
				startPosition: opts.startPosition,
				startProduct: startProduct
			});

			this.listenTo(Communicator.mediator, 'selection:changed', this.addAreaOfInterest);
			this.listenTo(Communicator.mediator, 'router:setUrl', this.zoomTo);
			this.listenTo(Communicator.mediator, 'map:layer:change', this.selectProduct);
		},

		getView: function(id) {
			return this.globeView;
		},

		show: function() {
			this.region.show(this.globeView);
		},

		selectProduct: function(opts) {
			var layerModel = undefined;
			if (opts.isBaseLayer) {
				layerModel = globals.baseLayers.find(function(model) {
					return model.get('name') === opts.name;
				});
			} else {
				layerModel = globals.products.find(function(model) {
					return model.get('name') === opts.name;
				});
			}

			if (typeof layerModel === 'undefined') {
				throw Error('Product ' + opts.name + ' is unknown!');
			}

			this.globeView.selectProduct(layerModel, opts.isBaseLayer);
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
		},

		isActive: function() {
			return !this.globeView.isClosed;
		}
	});

	return VirtualGlobeViewController;
});