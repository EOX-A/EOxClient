define([
    'core/BaseView',
    'app',
    'communicator',
    './GlobeRenderer/Globe'
], function(BaseView, App, Communicator, Globe) {

    'use strict';

    var GlobeView = BaseView.extend({

        tagName: 'canvas',

        className: 'globe',

        initialize: function(opts) {
            BaseView.prototype.initialize.call(this, opts);
            this.enableEmptyView(false);

            this._startPosition = opts.startPosition;
            if (typeof this._startPosition === 'undefined') {
                this._startPosition = {
                    geoCenter: [15, 47],
                    distance: 0,
                    duration: 3000,
                    tilt: 40
                }
            };

            this._initialLayers = {};
            this._initialLayerSetupDone = false;
        },

        didInsertElement: function() {
            if (!this.globe) {
                this._createGlobe();
                this._zoomTo(this._startPosition);
            }

            this.listenTo(Communicator.mediator, 'selection:changed', this._addAreaOfInterest);
            this.listenTo(Communicator.mediator, 'map:setUrl', this._zoomTo);
            this.listenTo(Communicator.mediator, 'map:center', this._onMapCenter);
            this.listenTo(Communicator.mediator, 'map:layer:change', this._onLayerChange);
            this.listenTo(Communicator.mediator, 'time:change', this._onTimeChange);
            this.listenTo(Communicator.mediator, 'productCollection:updateOpacity', this._onOpacityChange);
            this.listenTo(Communicator.mediator, 'productCollection:sortUpdated', this._onSortChange);
        },

        didRemoveElement: function() {
            // NOTE: The 'listenTo' bindings are automatically unbound by marionette
        },

        onResize: function() {
            this.globe.updateViewport();
        },

        addInitialLayer: function(model, isBaseLayer) {
            this._initialLayers[model.get('name')] = {
                model: model,
                isBaseLayer: isBaseLayer
            };
        },

        _addAreaOfInterest: function(geojson) {
            this.globe.addAreaOfInterest(geojson);
        },

        _addLayer: function(model, isBaseLayer) {
            this.globe.addLayer(model, isBaseLayer);
        },

        _removeLayer: function(model, isBaseLayer) {
            this.globe.removeLayer(model, isBaseLayer);
        },

        _removeAllOverlays: function() {
            this.globe.removeAllOverlays();
        },

        _onLayerChange: function(model, isBaseLayer, isVisible) {
            if (isVisible) {
                this.addLayer(model, isBaseLayer);
                console.log('[GlobeView::onLayerChange] selected ' + model.get('name'));
            } else {
                this.removeLayer(model, isBaseLayer);
                console.log('[GlobeView::onLayerChange] deselected ' + model.get('name'));
            }
        },

        _onOpacityChange: function(layer_name, opacity) {
            this.globe.onOpacityChange(layer_name, opacity);
        },

        _onTimeChange: function(time) {
            this.globe.setTimeSpanOnLayers(time);
        },

        _sortOverlayLayers: function() {
            this.globe.sortOverlayLayers();
        },

        _initLayers: function() {
            this.globe.clearCache();
            _.each(this._initialLayers, function(desc, name) {
                this.globe.addLayer(desc.model, desc.isBaseLayer);
            }.bind(this));
            this._sortOverlayLayers();
        },

        _createGlobe: function() {
            this.globe = new Globe({
                canvas: this.el
            });

            if (!this._initialLayerSetupDone) {
                this._initLayers();
                this._sortOverlayLayers(); // FIXXME: necessary?
                this._initialLayerSetupDone = true;
            }
        },

        _zoomTo: function(position) {
            if (this.globe) {
                this.globe.zoomTo(position);
            }
        },

        _dumpLayerConfig: function() {
            this.globe.dumpLayerConfig();
        }
    });

    return GlobeView;

}); // end module definition