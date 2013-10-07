define([
	'backbone.marionette',
	'app',
	'communicator',
	'./SplitView'
], function(Marionette, App, Communicator, SplitView) {

	'use strict';

	var SplitViewController = Marionette.Controller.extend({

		initialize: function() {
			this.view = new SplitView();
		},

		getView: function() {
			return this.view;
		},

		registerViews: function(views) {
			this.view.registerViews(views);
		},

		showViewInRegion: function(viewid, regionid) {
			this.view.showViewInRegion(viewid, regionid);
		},

		setSplitscreen: function() {
			this.view.setSplitscreen();
		},

		setFullscreen: function(regionid) {
			this.view.setFullscreen(regionid);
		}
	});

	return SplitViewController;
});