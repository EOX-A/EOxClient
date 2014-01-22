define([
    'backbone.marionette',
    'app',
    'communicator',
    'globals',
    './XTKViewer/Viewer'
], function(Marionette, App, Communicator, globals, XTKViewer) {

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
            this.timeOfInterest = null;

            $(window).resize(function() {
                if (this.viewer) {
                    this.onResize();
                }
            }.bind(this));

            var backend = globals.context.backendConfig['MeshFactory'];
            this.baseURL = backend.url + 'service=W3DS&request=GetScene&crs=EPSG:4326&format=model/nii-gz&version=' + backend.version;
            // console.log('base: ', this.baseURL);
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
            // If the releases the mouse button to finish the selection of
            // an AoI the 'area' parameter is set, otherwise it is 'null'.
            if (area) {
                var url = this.baseURL;
                // 1. get AoI bounds
                url += '&bbox=' + area.bounds.toString();
                // 2. get ToI
                var toi = this.timeOfInterest;
                // In case no ToI was set during the lifecycle of this viewer we can access
                // the time of interest from the global context:
                if (!toi) {
                    var starttime = new Date(globals.context.timeOfInterest.start);
                    var endtime = new Date(globals.context.timeOfInterest.end);

                    toi = this.timeOfInterest = starttime.toISOString() + '/' + endtime.toISOString();
                }
                url += '&time=' + toi;
                // 3. get relevant layers | FIXXME: how?
                url += '&layer=h2o_vol_demo';

                var label = 'H2O';

                // 4. add the data to the viewer
                this.viewer.addVolume({
                    // FIXXME: creative hack to satisfy xtk, which obviously determines the format of the volume data by the ending of the url it gets.
                    // I appended a dummy file here, so xtk gets the format, the backend W3DS server will simply discard the extra parameter...
                    filename: url + '&dummy.nii.gz',
                    label: label,
                    volumeRendering: true,
                    upperThreshold: 219,
                    opacity: 0.3,
                    minColor: [0.4, 0.4, 0.4],
                    maxColor: [0, 0, 0],
                    reslicing: false
                });
            }
        },

        onTimeChange: function(time) {
            var starttime = new Date(time.start);
            var endtime = new Date(time.end);

            this.timeOfInterest = starttime.toISOString() + '/' + endtime.toISOString();
            // console.log('starttime: ' + starttime.toISOString());
            // console.log('endtime: ' + endtime.toISOString());
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