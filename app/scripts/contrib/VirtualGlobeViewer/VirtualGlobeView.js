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

            this.initialLayers = {};

            $(window).resize(function() {
                if (this.globe) {
                    this.onResize();
                }
            }.bind(this));
        },

        addInitialLayer: function(model, isBaseLayer) {
            this.initialLayers[model.get('name')] = {
                model: model,
                isBaseLayer: isBaseLayer
            };
        },

        addAreaOfInterest: function(geojson) {
            this.globe.addAreaOfInterest(geojson);
        },

        addLayer: function(model, isBaseLayer) {
            this.globe.addLayer(model, isBaseLayer);
        },

        removeLayer: function(model, isBaseLayer) {
            this.globe.removeLayer(model, isBaseLayer);
        },

        removeAllOverlays: function() {
            this.globe.removeAllOverlays();
        },

        onLayerChange: function(model, isBaseLayer, isVisible) {
            if (isVisible) {
                this.addLayer(model, isBaseLayer);
                console.log('[GlobeView::onLayerChange] selected ' + model.get('name'));
                console.log('ordinal: '+ model.get('ordinal'));
            } else {
                this.removeLayer(model, isBaseLayer);
                console.log('[GlobeView::onLayerChange] deselected ' + model.get('name'));
            }
        },

        onOpacityChange: function(layer_name, opacity) {
            this.globe.onOpacityChange(layer_name, opacity);
        },

        onTimeChange: function(time) {
            this.globe.setTimeSpanOnLayers(time);
        },

        sortOverlayLayers: function() {
            this.globe.sortOverlayLayers();
        },

        initLayers: function() {
            this.globe.clearCache();
            _.each(this.initialLayers, function(desc, name) {
                this.globe.addLayer(desc.model, desc.isBaseLayer);
            }.bind(this));
            this.sortOverlayLayers();
        },

        createGlobe: function() {
            this.globe = new Globe({
                canvas: this.el
            });

            if (!this.initialLayerSetupDone) {
                this.initLayers();
                this.sortOverlayLayers();
                this.initialLayerSetupDone = true;
            }
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