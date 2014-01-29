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
				context: Communicator.mediator,
				x3dtag_id: 'x3d',
				// x3dtag_id: 'x3dom-wrapper',
				x3dscene_id: 'x3dScene',
				x3dhidden_id: 'x3dom-hidden'
			});
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