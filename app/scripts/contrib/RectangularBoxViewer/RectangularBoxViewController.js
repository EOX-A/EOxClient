define([
	'backbone',
	'app',
	'communicator',
	'./RectangularBoxView'
], function(Backbone, App, Communicator, RectangularBoxView) {

	'use strict';

	var RectangularBoxViewController = Backbone.Marionette.Controller.extend({

		initialize: function(options) {
			this.rbvView = undefined;
		},

		show: function() {
			if (typeof(this.rbvView) == 'undefined') {
				this.rbvView = new RectangularBoxView({
					x3did: '#x3dom',
					hideid: '#hidden'
				});
			}

			this.region.show(this.rbvView);
		}
	});

	return RectangularBoxViewController;
});