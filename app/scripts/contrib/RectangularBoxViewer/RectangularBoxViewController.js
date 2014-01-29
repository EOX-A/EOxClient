define([
	'backbone',
	'app',
	'communicator',
	'./RectangularBoxView'
], function(Backbone, App, Communicator, RectangularBoxView) {

	'use strict';

	var RectangularBoxViewController = Backbone.Marionette.Controller.extend({

		initialize: function(options) {
			this.createView();
		},

		createView: function() {
			this.view = new RectangularBoxView({
				x3dtag_id: 'x3d',
				// x3dtag_id: 'x3dom-wrapper',
				x3dscene_id: 'x3dScene',
				x3dhidden_id: 'x3dom-hidden'
			});

			this.connectToView();
		},

		connectToView: function() {
			// FIXXME: this is a big mess at the moment and leads to multiple listenTo calls, where only one is necessary. Clean up!
			this.listenTo(Communicator.mediator, 'selection:changed', _.bind(this.view.setAreaOfInterest, this.view));
			this.listenTo(Communicator.mediator, 'time:change', _.bind(this.view.onTimeChange, this.view));

			this.listenTo(this.view, 'view:disconnect', function() {
				this.stopListening();
				console.log('rbv disconnect');

				this.listenTo(this.view, 'view:connect', function() {
					this.connectToView();
					console.log('rbv connect 22');
				}.bind(this));
			}.bind(this));

			this.listenTo(this.view, 'view:connect', function() {
				this.connectToView();
				console.log('rbv connect');
			}.bind(this));
		},

		getView: function() {
			return this.view;
		},

		isActive: function() {
			return !this.view.isClosed;
		}

	});

	return RectangularBoxViewController;
});