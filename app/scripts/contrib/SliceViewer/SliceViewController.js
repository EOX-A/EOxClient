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
            this.view = new SliceView();

            this.connectToView();

            this.baseSetupDone = false;
        },

        connectToView: function() {
            this.listenTo(Communicator.mediator, 'selection:changed', _.bind(this.view.setAreaOfInterest, this.view));
            this.listenTo(Communicator.mediator, 'time:change', _.bind(this.view.onTimeChange, this.view));
            
            this.listenTo(this.view, 'view:disconnect', function() {
                this.stopListening();
                console.log('splitview disconnect');
            }.bind(this));

            this.listenTo(this.view, 'view:connect', function() {
                this.connectToView();
                console.log('splitview connect');
            }.bind(this));
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