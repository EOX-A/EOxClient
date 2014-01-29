define([
	'backbone.marionette',
	'app',
	'communicator',
	'./AnalyticsView'
], function(Marionette, App, Communicator, AnalyticsView) {

	'use strict';

	// The Controller takes care of the (private) implementation of a module. All functionality
	// is solely accessed via the controller. Therefore, also the Module.Router uses the Controller
	// for triggering actions caused by routing events.
	// The Controller has per definition only direct access to the View, it does not i.e. access
	// the Application object directly.
	var AnalyticsViewController = Backbone.Marionette.Controller.extend({

		initialize: function(opts) {
			this.id = opts.id;
			
			this.analyticsView = new AnalyticsView({});

			this.connectToView();
		},

		getView: function(id) {
			return this.analyticsView;
		},

		connectToView: function() {
			this.listenTo(Communicator.mediator, "map:layer:change", _.bind(this.analyticsView.changeLayer, this.analyticsView));
			this.listenTo(Communicator.mediator, "productCollection:sortUpdated", _.bind(this.analyticsView.onSortProducts, this.analyticsView));
			this.listenTo(Communicator.mediator, "selection:changed", _.bind(this.analyticsView.onSelectionChanged, this.analyticsView));
			this.listenTo(Communicator.mediator, 'time:change', _.bind(this.analyticsView.onTimeChange, this.analyticsView));

			this.listenTo(this.analyticsView, 'view:disconnect', function() {
                this.stopListening();
                console.log('splitview disconnect');
            }.bind(this));

            this.listenTo(this.analyticsView, 'view:connect', function() {
                this.connectToView();
                console.log('splitview connect');
            }.bind(this));

		},


		isActive: function(){
			return !this.analyticsView.isClosed;
		}
	});

	return AnalyticsViewController;
});