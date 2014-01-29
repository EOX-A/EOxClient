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

            this.position = {
                center: [74, 15],
                distance: 10000000,
                duration: 1000,
                tilt: 45
            };

            if (!opts.startPosition) {
                this.globeView = new VirtualGlobeView({
                    context: Communicator.mediator,
                    startPosition: this.position
                });
            } else {
                this.globeView = new VirtualGlobeView({
                    context: Communicator.mediator,
                    startPosition: opts.startPosition
                });
            }
        },

        getView: function(id) {
            return this.globeView;
        },

        show: function() {
            this.region.show(this.globeView);
        },

        getStartPosition: function() {
            return this.startPosition;
        },

        isActive: function() {
            return !this.globeView.isClosed;
        },

        dumpLayerConfig: function() {
            this.globeView.dumpLayerConfig();
        }
    });

    return VirtualGlobeViewController;
});