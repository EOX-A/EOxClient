define([
    'core/BaseView',
    'app',
    'communicator',
    'globals',
    './XTKViewer/Viewer'
], function(BaseView, App, Communicator, globals, XTKViewer) {

    'use strict';

    var SliceView = BaseView.extend({

        className: 'sliceview',

        cacheViewerInstance: true, // this is the default

        // template: {
        // 	type: 'handlebars',
        // 	template: VirtualSliceViewTmpl
        // },

        initialize: function(opts) {
            BaseView.prototype.initialize.call(this, opts);

            this.viewer = null;
            this.timeOfInterest = null;
            this.areaOfInterest = null;

            var backend = globals.context.backendConfig['MeshFactory'];
            this.baseURL = backend.url + 'service=W3DS&request=GetScene&crs=EPSG:4326&format=model/nii-gz&version=' + backend.version;

            this.enableEmptyView(true); // this is the default
        },

        createViewer: function() {
            return new XTKViewer({
                elem: this.el,
                backgroundColor: [1, 1, 1],
                cameraPosition: [120, 80, 160]
            });
        },

        didInsertElement: function() {
            this.listenTo(this.context(), 'selection:changed', this._setAreaOfInterest);
            this.listenTo(this.context(), 'time:change', this._onTimeChange);
        },

        didRemoveElement: function() {
            // NOTE: The 'listenTo' bindings are automatically unbound by marionette
        },

        showEmptyView: function() {
            // FIXXME: use marionette's templating mechanism for that!
            this.$el.html('<div class="empty-view">Please select an Area of Interest (AoI) in one of the map viewer!</div>');
        },

        hideEmptyView: function() {
            // CAUTION: simply removing the content of the view's div can have sideeffects, e.g if
            // 'createViewer' was called before, which creates child DOM elements. Be cautious not
            // to accidently remove those!
            this.$el.html('');
        },

        _setAreaOfInterest: function(area) {
            // If the releases the mouse button to finish the selection of
            // an AoI the 'area' parameter is set, otherwise it is 'null'.
            if (area) {
                // 1. store current AoI bounds
                this.areaOfInterest = area.bounds.toString();

                // 2. store current ToI interval
                var toi = this.timeOfInterest;
                // In case no ToI was set during the lifecycle of this viewer we can access
                // the time of interest from the global context:
                if (!toi) {
                    var starttime = new Date(globals.context.timeOfInterest.start);
                    var endtime = new Date(globals.context.timeOfInterest.end);

                    toi = this.timeOfInterest = starttime.toISOString() + '/' + endtime.toISOString();
                }

                // 3. store the current layer
                // FIXXME: integrate with context!
                this.layer = 'h2o_vol_demo';

                // 4. add the data to the viewer
                this.addVolume(this.timeOfInterest, this.areaOfInterest, this.layer);
            }
        },

        _onTimeChange: function(time) {
            var starttime = new Date(time.start);
            var endtime = new Date(time.end);

            this.timeOfInterest = starttime.toISOString() + '/' + endtime.toISOString();

            this.addVolume(this.timeOfInterest, this.areaOfInterest, this.layer);
        },

        addVolume: function(aoi, toi, layer) {
            // CAUTION: onShow() internally also instantiates the viewer, which uses a DOM element
            // to show its content. The 'enableEmptyView(false)' and 'onShow()' cause the 
            // 'hideEmptyView' function to be called. In the case here the DOM element representing
            // this view gets wiped out there, which also would destroy the DOM element the viewer
            // is using.
            // Baseline: be aware of what is happening when the view switches from the empty view to
            // the ordinary view, which will call the 'hideEmptyView' function.
            // @see hideEmptyView
            this.enableEmptyView(false);
            this.onShow();

            var url = this.baseURL;
            url += '&bbox=' + aoi;
            url += '&time=' + toi;
            url += '&layer=' + layer;

            this.getViewer().addVolume({
                // FIXXME: creative hack to satisfy xtk, which obviously determines the format of the volume data by the ending of the url it gets.
                // I appended a dummy file here, so xtk gets the format, the backend W3DS server will simply discard the extra parameter...
                filename: url + '&dummy.nii.gz',
                label: layer,
                volumeRendering: true,
                upperThreshold: 219,
                opacity: 0.3,
                minColor: [0.4, 0.4, 0.4],
                maxColor: [0, 0, 0],
                reslicing: false
            });
        },

        onResize: function() {
            if (this.getViewer()) {
                this.getViewer().onResize();
            }
        },
    });

    return SliceView;

}); // end module definition