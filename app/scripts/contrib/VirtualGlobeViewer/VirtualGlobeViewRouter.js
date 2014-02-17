define([
    'backbone.marionette',
    'app',
    './VirtualGlobeViewController'
], function(Marionette, App, Communicator, VirtualGlobeViewController) {

    'use strict';

    var VirtualGlobeViewRouterController = function(globe_controller) {
        this.globe_controller = globe_controller;
    };

    _.extend(VirtualGlobeViewRouterController.prototype, {
        show: function() {
            this.globe_controller.show();
        }
    });

    return VirtualGlobeViewRouterController;
});