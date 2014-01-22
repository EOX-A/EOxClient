define([
    'backbone.marionette',
    'app',
    'communicator',
    './XTKViewer/Viewer'
], function(Marionette, App, Communicator, XTKViewer) {

    'use strict';

    var SliceView = Marionette.View.extend({
        className: 'sliceview',

        // template: {
        // 	type: 'handlebars',
        // 	template: VirtualSliceViewTmpl
        // },

        // ui: {
        // 	viewport: '#myglobe',
        // 	gui: '.gui'
        // },

        initialize: function(opts) {
            this.viewer = null;
            this.isClosed = true;
            this.baseInitDone = false;

            $(window).resize(function() {
                if (this.viewer) {
                    this.onResize();
                }
            }.bind(this));
        },

        onResize: function() {
            this.viewer.onResize();
        },

        onShow: function() {
            if (!this.viewer) {
                this.createRenderer();
            }
            this.isClosed = false;
            // this.onResize();
        },

        onClose: function() {
            this.isClosed = true;
        },

        createRenderer: function() {
            this.viewer = new XTKViewer(this.el);
        }

        // addInitialLayer: function(model, isBaseLayer) {
        //     this.initialLayers[model.get('name')] = {
        //         model: model,
        //         isBaseLayer: isBaseLayer
        //     };
        // },

        // addAreaOfInterest: function(geojson) {
        //     this.x.addAreaOfInterest(geojson);
        // },

        // addLayer: function(model, isBaseLayer) {
        //     this.x.addLayer(model, isBaseLayer);
        // },

        // removeLayer: function(model, isBaseLayer) {
        //     this.x.removeLayer(model, isBaseLayer);
        // },

        // removeAllOverlays: function() {
        //     this.x.removeAllOverlays();
        // },

        // onLayerChange: function(model, isBaseLayer, isVisible) {
        //     if (isVisible) {
        //         this.addLayer(model, isBaseLayer);
        //         console.log('[SliceView::onLayerChange] selected ' + model.get('name'));
        //     } else {
        //         this.removeLayer(model, isBaseLayer);
        //         console.log('[SliceView::onLayerChange] deselected ' + model.get('name'));
        //     }
        // },

        // onOpacityChange: function(layer_name, opacity) {
        //     this.x.onOpacityChange(layer_name, opacity);
        // },

        // onTimeChange: function(time) {
        //     this.x.setTimeSpanOnLayers(time);
        // },

        // sortOverlayLayers: function() {
        //     this.x.sortOverlayLayers();
        // },

        // initLayers: function() {
        //     this.x.clearCache();
        //     _.each(this.initialLayers, function(desc, name) {
        //         this.x.addLayer(desc.model, desc.isBaseLayer);
        //     }.bind(this));
        //     this.sortOverlayLayers();
        // },

        // createRenderer: function() {
        //     this.x = new X({
        //         canvas: this.el
        //     });

        //     if (!this.initialLayerSetupDone) {
        //         this.initLayers();
        //         this.sortOverlayLayers(); // FIXXME: necessary?
        //         this.initialLayerSetupDone = true;
        //     }
        // },

        // onResize: function() {
        //     this.x.updateViewport();
        // },

        // onShow: function() {
        //     if (!this.x) {
        //         this.createSlice();
        //     }
        //     this.isClosed = false;
        //     this.onResize();
        //     this.zoomTo(this.startPosition);
        // },

        // zoomTo: function(position) {
        //     if (this.x) {
        //         this.x.zoomTo(position);
        //     }
        // },

        // onClose: function() {
        //     this.isClosed = true;
        // },

        // dumpLayerConfig: function() {
        //     this.x.dumpLayerConfig();
        // }
    });

    return SliceView;

}); // end module definition