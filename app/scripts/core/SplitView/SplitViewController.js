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
			this.connectToView();
		},

		getView: function() {
			return this.view;
		},

		registerViews: function(views) {
			this.view.registerViews(views);
		},

		connectToView: function() {
			this.listenTo(Communicator.mediator, "layout:switch:singleview", _.bind(this.view.setFullscreen, this.view));
			this.listenTo(Communicator.mediator, "layout:switch:splitview", _.bind(this.view.setSplitscreen, this.view));
			//this.listenTo(Communicator.mediator, "layout:switch:quadview", _.bind(this.view.centerMap, this.view));

		},

		showViewInRegion: function(viewid, regionid) {
			this.view.showViewInRegion(viewid, regionid);
		},

		setSinglescreen: function(regionid) {
			this.view.setFullscreen(regionid);
		},

		setSplitscreen: function() {
			this.view.setSplitscreen();
		},

		setQuadscreen: function(regionid) {
			this.view.setFullscreen(regionid);
		}
	});

	return SplitViewController;
});