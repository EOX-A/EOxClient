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
            // this.listenTo(Communicator.mediator, 'map:layer:change', this.onLayerChange);
            // this.listenTo(Communicator.mediator, 'time:change', this.onTimeChange);
            // this.listenTo(Communicator.mediator, 'productCollection:updateOpacity', this.onOpacityChange);
            // this.listenTo(Communicator.mediator, 'productCollection:sortUpdated', this.onSortChange);
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