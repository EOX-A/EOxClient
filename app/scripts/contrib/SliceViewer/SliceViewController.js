define([
    'backbone.marionette',
    'app',
    'communicator',
    'globals',
    './SliceView'
], function(Marionette, App, Communicator, globals, SliceView) {

    'use strict';

    var SliceViewController = Marionette.Controller.extend({

        initialize: function(opts) {
            this.id = opts.id;
            this.view = new SliceView({
                context: Communicator.mediator
            });
        },

        getView: function(id) {
            return this.view;
        },

        show: function() {
            this.region.show(this.view);
        },

        isActive: function() {
            return !this.view.isClosed;
        }
    });

    return SliceViewController;
});