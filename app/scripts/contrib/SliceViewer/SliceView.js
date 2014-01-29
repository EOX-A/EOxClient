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

        initialize: function(opts) {
            this.context = opts.context;
            this.viewer = null;
            this.isClosed = true;
            this.isEmpty = true;
            this.timeOfInterest = null;

            var backend = globals.context.backendConfig['MeshFactory'];
            this.baseURL = backend.url + 'service=W3DS&request=GetScene&crs=EPSG:4326&format=model/nii-gz&version=' + backend.version;
        },

        onShow: function() {
            if (this.isClosed) {
                this._bindContext();
                $(window).resize(this._onResize.bind(this));
                this.isClosed = false;
            }

            if (!this.isEmpty) {
                if (!this.viewer) {
                    this.$el.html('');
                    this.viewer = this._createViewer({
                        elem: this.el,
                        backgroundColor: [1, 1, 1],
                        cameraPosition: [120, 80, 160]
                    });
                }
            } else {
                // FIXXME: for some reason the 'tempalte' property did not work, fix that!
                this.$el.html('<div class="rbv-empty">Please select an Area of Interest (AoI) in one of the map viewer!</div>');
            }
        },

        onClose: function() {
            // NOTE: The 'listenTo' bindings are automatically unbound by marionette
            $(window).off("resize", this.onResizeF);
            this.isClosed = true;
        },

        // addInitialLayer: function(model, isBaseLayer) {
        //     this.initialLayers[model.get('name')] = {
        //         model: model,
        //         isBaseLayer: isBaseLayer
        //     };
        // },

        _setAreaOfInterest: function(area) {
            // If the releases the mouse button to finish the selection of
            // an AoI the 'area' parameter is set, otherwise it is 'null'.
            if (area) {
                this.isEmpty = false;
                this.onShow();

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

        _onTimeChange: function(time) {
            this.isEmpty = false;

            var starttime = new Date(time.start);
            var endtime = new Date(time.end);

            this.timeOfInterest = starttime.toISOString() + '/' + endtime.toISOString();
            // console.log('starttime: ' + starttime.toISOString());
            // console.log('endtime: ' + endtime.toISOString());

            this.onShow();
        },

        _bindContext: function(context) {
            this.listenTo(this.context, 'selection:changed', this._setAreaOfInterest);
            this.listenTo(this.context, 'time:change', this._onTimeChange);
        },

        _createViewer: function(opts) {
            return new XTKViewer(opts);
        },

        _onResize: function() {
            if (this.viewer) {
                this.viewer.onResize();
            }
        },
    });

    return SliceView;

}); // end module definition