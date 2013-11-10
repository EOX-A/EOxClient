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
					startPosition: this.position
            });
			}else{
            this.globeView = new VirtualGlobeView({
                startPosition: opts.startPosition,
                startProduct: startProduct
            });
			}


            this.connectToView();
        },

        connectToView: function() {
            this.listenTo(Communicator.mediator, 'selection:changed', this.addAreaOfInterest);
            this.listenTo(Communicator.mediator, 'map:setUrl', this.zoomTo);
            this.listenTo(Communicator.mediator, 'map:center', this.onMapCenter);
            this.listenTo(Communicator.mediator, 'map:layer:change', this.onLayerChange);
            this.listenTo(Communicator.mediator, 'time:change', this.onTimeChange);
            this.listenTo(Communicator.mediator, 'productCollection:updateOpacity', this.onOpacityChange);
        },

        getView: function(id) {
            return this.globeView;
        },

        show: function() {
            this.region.show(this.globeView);
        },

        getLayerModel: function(options) {
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

        onLayerChange: function(options) {
            var layerModel = this.getLayerModel(options); // options: { name: 'xy', isBaseLayer: 'true/false'}
            this.globeView.onLayerChange(layerModel, options.isBaseLayer, options.visible);
        },

        onOpacityChange: function(options) {
            this.globeView.onOpacityChange(options.model.get('name'), options.value);
        },

        onTimeChange: function(time) {
            this.globeView.setTimeSpanOnLayers(time);
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

        onMapCenter: function(pos) {
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