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
                this.viewer = this.createViewer({
                    elem: this.el,
                    backgroundColor: [1, 1, 1],
                    cameraPosition: [120, 80, 160]
                });
            }

            this.isClosed = false;
            // this.onResize();
        },

        onClose: function() {
            this.isClosed = true;
            // this.viewer.destroy(); //necessary?
        },

        createViewer: function(opts) {
            return new XTKViewer(opts);
        },

        // addInitialLayer: function(model, isBaseLayer) {
        //     this.initialLayers[model.get('name')] = {
        //         model: model,
        //         isBaseLayer: isBaseLayer
        //     };
        // },

        setAreaOfInterest: function(area) {
            // console.log('[SliceView::setAreaOfInterest] ', area);

            // If the releases the mouse button to finish the selection of
            // an AoI the 'area' parameter is set, otherwise it is 'null'.
            if (area) {
                // 1. get AoI
                // 2. get ToI
                // 3. Request data via W3DS-GetScene
                
                // 4. Display the data
                this.viewer.addVolume({
                    filename: 'data/H2O.nii.gz',
                    label: 'H2O',
                    volumeRendering: true,
                    upperThreshold: 219,
                    opacity: 0.3,
                    minColor: [0.4, 0.4, 0.4],
                    maxColor: [0, 0, 0],
                    reslicing: false
                });
            }
        }

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

        // createViewer: function() {
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