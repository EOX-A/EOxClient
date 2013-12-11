define([
    'backbone.marionette',
    'app',
    'communicator',
    'xtk',
    'xtk-gui'
], function(Marionette, App, Communicator, X, dat) {

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
            this.renderer = null;
            this.isClosed = true;
            this.baseInitDone = false;

            $(window).resize(function() {
                if (this.renderer) {
                    this.onResize();
                }
            }.bind(this));
        },

        onResize: function() {
            this.renderer.resetBoundingBox();
            this.renderer.resetViewAndRender();
        },

        onShow: function() {
            if (!this.renderer) {
                this.createRenderer();
            }
            this.isClosed = false;
            // this.onResize();
        },

        onClose: function() {
            this.isClosed = true;
        },

        createRenderer: function() {
            // create and initialize a 3D renderer
            var r = this.renderer = new X.renderer3D();
            r.container = this.el;
            r.bgColor = [.2, .2, 0.2];
            r.init();

            // create a X.volume
            var volume = new X.volume();
            // .. and attach the single-file dicom in .NRRD format
            // this works with gzip/gz/raw encoded NRRD files but XTK also supports other
            // formats like MGH/MGZ
            // volume.file = 'http://x.babymri.org/?avf.nrrd';
            // volume.file = 'data/Temperature.nii.gz';
            volume.file = 'data/avf.nrrd';

            // the segmentation is a X.mesh
            var mesh = new X.mesh();
            // .. and is loaded from a .VTK file
            // mesh.file = 'http://x.babymri.org/?avf.vtk';
            mesh.file = 'data/avf.vtk';
            // we set the color to a lighter red
            mesh.color = [0.7, 0.25, 0.25];
            mesh.opacity = 0.7;
            // and also set the visibility to false, since we add a 'load-on-demand'
            // option for it
            mesh.visible = false;

            // only add the volume for now, the mesh gets loaded on request
            r.add(volume);

            // the onShowtime method gets executed after all files were fully loaded and
            // just before the first rendering attempt
            r.onShowtime = function() {
                if (this.baseInitDone) {
                    return;
                }

                //
                // The GUI panel
                //
                // (we need to create this during onShowtime(..) since we do not know the
                // volume dimensions before the loading was completed)
    
                // indicate if the mesh was loaded
                var meshWasLoaded = false;

                var gui = new dat.GUI({
                    autoPlace: true
                });

                //var customContainer = document.getElementById('my-gui-container');
                this.el.appendChild(gui.domElement);

                // the following configures the gui for interacting with the X.volume
                var volumegui = gui.addFolder('Volume');
                // now we can configure controllers which..
                // .. switch between slicing and volume rendering
                var vrController = volumegui.add(volume, 'volumeRendering');
                // the min and max color which define the linear gradient mapping
                var minColorController = volumegui.addColor(volume, 'minColor');
                var maxColorController = volumegui.addColor(volume, 'maxColor');
                // .. configure the volume rendering opacity
                var opacityController = volumegui.add(volume, 'opacity', 0, 1).listen();
                // .. and the threshold in the min..max range
                var lowerThresholdController = volumegui.add(volume, 'lowerThreshold',
                    volume.min, volume.max);
                var upperThresholdController = volumegui.add(volume, 'upperThreshold',
                    volume.min, volume.max);
                var lowerWindowController = volumegui.add(volume, 'windowLow', volume.min,
                    volume.max);
                var upperWindowController = volumegui.add(volume, 'windowHigh', volume.min,
                    volume.max);
                // the indexX,Y,Z are the currently displayed slice indices in the range
                // 0..dimensions-1
                var sliceXController = volumegui.add(volume, 'indexX', 0,
                    volume.range[0] - 1);
                var sliceYController = volumegui.add(volume, 'indexY', 0,
                    volume.range[1] - 1);
                var sliceZController = volumegui.add(volume, 'indexZ', 0,
                    volume.range[2] - 1);
                volumegui.open();

                // now we configure the gui for interacting with the X.mesh
                var meshgui = gui.addFolder('Mesh');
                // the visible controller shows/hides the volume but also loads the file on
                // demand (only the first time)
                var meshVisibleController = meshgui.add(mesh, 'visible');
                // .. the mesh color
                var meshColorController = meshgui.addColor(mesh, 'color');
                meshgui.open();

                // meshgui callbacks
                meshVisibleController.onChange(function(value) {

                    if (!meshWasLoaded) {

                        // this only gets executed the first time to load the mesh, after we
                        // just toggle the visibility
                        r.add(mesh);

                        // we set the onShowtime function to a void since we don't want to
                        // create the GUI again here
                        //r.onShowtime = function() {};

                        // set the loaded flag
                        meshWasLoaded = true;
                    }
                });

                this.baseInitDone = true;
            }.bind(this);

            // adjust the camera position a little bit, just for visualization purposes
            r.camera.position = [120, 80, 160];

            // showtime! this triggers the loading of the volume and executes
            // r.onShowtime() once done
            r.render();
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