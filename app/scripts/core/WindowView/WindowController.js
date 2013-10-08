define([
	'backbone.marionette',
	'app',
	'communicator',
	'./WindowView'
], function(Marionette, App, Communicator, WindowView) {

	'use strict';

	var WindowController = Marionette.Controller.extend({

		initialize: function() {
			this.view = new WindowView();
			this.connectToView();
		},

		getView: function() {
			return this.view;
		},

		registerViews: function(views) {
			this.view.registerViews(views);
		},

		connectToView: function() {
			/*this.listenTo(Communicator.mediator, "window:switch:mapview", _.bind(this.view.setFullscreen, this.view));
			this.listenTo(Communicator.mediator, "window:switch:globeview", _.bind(this.view.setSplitscreen, this.view));
			this.listenTo(Communicator.mediator, "window:switch:globeview", _.bind(this.view.setSplitscreen, this.view));
			this.listenTo(Communicator.mediator, "window:switch:globeview", _.bind(this.view.setSplitscreen, this.view));*/

		},

		showViewInRegion: function(viewid, regionid) {
			this.view.showViewInRegion(viewid, regionid);
		}

	});

	return WindowController;
});