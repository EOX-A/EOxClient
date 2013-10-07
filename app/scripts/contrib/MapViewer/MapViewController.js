define([
	'backbone.marionette',
	'app',
	'communicator',
	'./MapView'
], function(Marionette, App, Communicator, MapView) {

	'use strict';

	// The Controller takes care of the (private) implementation of a module. All functionality
	// is solely accessed via the controller. Therefore, also the Module.Router uses the Controller
	// for triggering actions caused by routing events.
	// The Controller has per definition only direct access to the View, it does not i.e. access
	// the Application object directly.
	var MapViewController = Backbone.Marionette.Controller.extend({

		initialize: function(options) {
			this.mapView = new MapView();
			this.connectToView();
		},

		getView: function(id) {
			if (id === 'main') {
				return this.mapView;
			} else {
				console.log('[MapViewController::getView] Error: Unknown view "' + id + "' requested!");
			}
		},

		centerAndZoom: function(x, y, l) {
			this.mapView.centerMap({
				x: x,
				y: y,
				l: l
			});
		},

		connectToView: function() {
			this.listenTo(Communicator.mediator, "map:center", _.bind(this.mapView.centerMap, this.mapView));
			this.listenTo(Communicator.mediator, "map:layer:change", _.bind(this.mapView.changeLayer, this.mapView));
			this.listenTo(Communicator.mediator, "productCollection:sortUpdated", _.bind(this.mapView.onSortProducts, this.mapView));
			this.listenTo(Communicator.mediator, "selection:activated", _.bind(this.mapView.onSelectionActivated, this.mapView));
			this.listenTo(Communicator.mediator, "map:load:geojson", _.bind(this.mapView.onLoadGeoJSON, this.mapView));
			this.listenTo(Communicator.mediator, "map:export:geojson", _.bind(this.mapView.onExportGeoJSON, this.mapView));

			this.mapView.listenTo(this.mapView.model, 'change', function(model, options) {
				Communicator.mediator.trigger("router:setUrl", {
					x: model.get('center')[0],
					y: model.get('center')[1],
					l: model.get('zoom')
				});
			});
		}
	});

	return MapViewController;
});