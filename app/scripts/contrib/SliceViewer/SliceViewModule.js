define([
    'backbone.marionette',
    'app',
    'communicator',
    './SliceViewController'
], function(Marionette, App, Communicator, SliceViewController, SliceViewRouter) {

    'use strict';

    App.module('SliceViewer', function(Module) {

        this.startsWithParent = true;

        this.on('start', function(options) {
            this.instances = {};
            this.idx = 0;

            console.log('[SliceViewer] Finished module initialization');
        });

        this.createController = function(opts) {
            var id = null;

            // Go through instances and return first free one
            for (var contr in this.instances) {
                if (!this.instances[contr].isActive()) {
                    console.log("Free SliceViewer returned " + contr);
                    return this.instances[contr];
                }
            };

            // If there are no free insances create a new one
            if (typeof id === 'undefined') {
                id = 'SliceViewer.' + this.idx++;
            }

            var controller = new SliceViewController();
            this.instances[id] = controller;

            // setupKeyboardShortcuts(controller);

            return controller;
        };

        var setupKeyboardShortcuts = function(controller) {
            keypress.combo("a", function() {
                var pos = controller.getStartPosition();
                // FIXXME: not that nice...
                controller.zoomTo({
                    x: pos.center[0],
                    y: pos.center[1],
                    l: undefined
                });
            });

            // REMOVE: only for debugging...
            keypress.combo("d", function() {
                controller.dumpLayerConfig();
            });
        };
    });
});