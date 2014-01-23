define([
	'backbone',
	'app',
	'communicator',
	'./RectangularBoxView'
], function(Backbone, App, Communicator, RectangularBoxView) {

	'use strict';

	var RectangularBoxViewController = Backbone.Marionette.Controller.extend({

		initialize: function(options) {
			this.rbvView = new RectangularBoxView({
				x3dtag_id: 'x3d',
				x3dscene_id: 'x3dScene',
				x3dhidden_id: 'x3dom-hidden'
			});
		},

		show: function() {
			this.region.show(this.rbvView);
		},

		getView: function() {
			return this.rbvView;
		},

        isActive: function() {
            return !this.rbvView.isClosed;
        }	

	});

	return RectangularBoxViewController;
});