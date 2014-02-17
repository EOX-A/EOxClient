define([
    'core/BaseView',
    'app',
    'communicator',
    'globals',
    './GlobeRenderer/Globe'
], function(BaseView, App, Communicator, globals, Globe) {

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
        },

        didInsertElement: function() {
            if (!this.getViewer()) {
                this.setViewer(this._createGlobe());
                this._setLayersFromAppContext();
                this._zoomTo(this._startPosition);
            }

            this.listenTo(Communicator.mediator, 'selection:changed', this._addAreaOfInterest);
            this.listenTo(Communicator.mediator, 'map:setUrl', this._zoomTo);
            this.listenTo(Communicator.mediator, 'map:center', this._onMapCenter);
            this.listenTo(Communicator.mediator, 'map:layer:change', this._onLayerChange);
            this.listenTo(Communicator.mediator, 'time:change', this._onTimeChange);
            this.listenTo(Communicator.mediator, 'productCollection:updateOpacity', this._onOpacityChange);
            this.listenTo(Communicator.mediator, 'productCollection:sortUpdated', this._sortOverlayLayers);
        },

        didRemoveElement: function() {
            // NOTE: The 'listenTo' bindings are automatically unbound by marionette
        },

        onResize: function() {
            this.getViewer().updateViewport();
        },

        _addInitialLayer: function(model, isBaseLayer) {
            this._initialLayers[model.get('name')] = {
                model: model,
                isBaseLayer: isBaseLayer
            };
        },

        /** Adds the layers selected in the GUI and performs their setup (opacity, sorting oder, etc.).
         *  Layers are either baselayers, products or overlays.
         */
        _setLayersFromAppContext: function() {
            globals.baseLayers.each(function(model) {
                if (model.get('visible')) {
                    this._addInitialLayer(model, true);
                    console.log('[VirtualGlobeViewController::setLayersFromAppContext] added baselayer "' + model.get('name') + '"');
                };
            }.bind(this));

            globals.products.each(function(model) {
                if (model.get('visible')) {
                    this._addInitialLayer(model, false);
                    console.log('[VirtualGlobeViewController::setLayersFromAppContext] added products "' + model.get('name') + '"');
                }
            }.bind(this));

            globals.overlays.each(function(model) {
                if (model.get('visible')) {
                    this._addInitialLayer(model, false);
                    console.log('[VirtualGlobeViewController::setLayersFromAppContext] added overlays "' + model.get('name') + '"');
                }
            }.bind(this));

            this._initLayers();
        },

        _getLayerModel: function(options) {
            var layerModel = undefined;
            if (options.isBaseLayer) {
                layerModel = globals.baseLayers.find(function(model) {
                    return model.get('name') === options.name;
                });
            } else {
                layerModel = globals.products.find(function(model) {
                    return model.get('name') === options.name;
                });

                if (!layerModel) {
                    layerModel = globals.overlays.find(function(model) {
                        return model.get('name') === options.name;
                    });
                }
            }

            if (typeof layerModel === 'undefined') {
                throw Error('Product ' + options.name + ' is unknown!');
            }

            return layerModel;
        },

        _addAreaOfInterest: function(geojson) {
            this.getViewer().addAreaOfInterest(geojson);
        },

        _addLayer: function(model, isBaseLayer) {
            this.getViewer().addLayer(model, isBaseLayer);
        },

        _removeLayer: function(model, isBaseLayer) {
            this.getViewer().removeLayer(model, isBaseLayer);
        },

        _removeAllOverlays: function() {
            this.getViewer().removeAllOverlays();
        },

        _onLayerChange: function(options) {
            var model = this._getLayerModel(options); // options: { name: 'xy', isBaseLayer: 'true/false', visible: 'true/false'}

            if (options.visible) {
                this._addLayer(model, options.isBaseLayer);
                console.log('[GlobeView::onLayerChange] selected ' + model.get('name'));
            } else {
                this._removeLayer(model, options.isBaseLayer);
                console.log('[GlobeView::onLayerChange] deselected ' + model.get('name'));
            }
        },

        _onOpacityChange: function(options) {
            this.getViewer().onOpacityChange(options.model.get('name'), options.value);
        },

        _onTimeChange: function(time) {
            // FIXXME: currently all overlay layers are destroyed and recreated with the new time set. This
            // should be changed to set the new time on existing layers in the Globe's layerChache.
            this._removeAllOverlays();
            this._setLayersFromAppContext();
        },

        _sortOverlayLayers: function() {
            this.getViewer().sortOverlayLayers();
        },

        _initLayers: function() {
            this.getViewer().clearCache();
            _.each(this._initialLayers, function(desc, name) {
                this.getViewer().addLayer(desc.model, desc.isBaseLayer);
            }.bind(this));
            this._sortOverlayLayers();
        },

        _onMapCenter: function(pos) {
            var dis = 0;
            switch (pos.l) {
                case 0:
                    dis = 50000000;
                    break;
                case 1:
                    dis = 30000000;
                    break;
                case 2:
                    dis = 18000000;
                    break;
                case 3:
                    dis = 9000000;
                    break;
                case 4:
                    dis = 4800000;
                    break;
                case 5:
                    dis = 2400000;
                    break;
                case 6:
                    dis = 1200000;
                    break;
                case 7:
                    dis = 700000;
                    break;
                case 8:
                    dis = 300000;
                    break;
                case 9:
                    dis = 80000;
                    break;
                case 10:
                    dis = 30000;
                    break;
                case 11:
                    dis = 9000;
                    break;
                case 12:
                    dis = 7000;
                    break;
                case 13:
                    dis = 5000;
                    break;
                case 14:
                    dis = 4000;
                    break;
            }

            var position = {
                center: [pos.x, pos.y],
                distance: dis,
                duration: 100,
                tilt: 45
            }
            this._zoomTo(position);
        },

        _zoomTo: function(position) {
            this.getViewer().zoomTo(position);
        },

        _createGlobe: function() {
            return new Globe({
                canvas: this.el
            });
        },

        _dumpLayerConfig: function() {
            this.getViewer().dumpLayerConfig();
        }
    });

    return GlobeView;

}); // end module definition