define([
	'backbone.marionette',
	'app',
	'communicator',
	'./SplitView',
	'./WindowView'
], function(Marionette, App, Communicator, SplitView, WindowView) {

	'use strict';

	var SplitViewController = Marionette.Controller.extend({

		initialize: function() {
			this.view = new SplitView();
			this.connectToView();

			this.windowViews = {
				tl:new WindowView(),
				tr:new WindowView(),
				bl:new WindowView(),
				br:new WindowView()
			};
			this.view.registerViews(this.windowViews);
		},

		getView: function() {
			return this.view;
		},

		registerViews: function(views) {
			this.view.registerViews(views);
		},

		connectToView: function() {
			this.listenTo(Communicator.mediator, "layout:switch:singleview", this.setSinglescreen);
			this.listenTo(Communicator.mediator, "layout:switch:splitview", this.setSplitscreen);
			this.listenTo(Communicator.mediator, "layout:switch:quadview", this.setQuadscreen);
			this.listenTo(Communicator.mediator, "window:view:change", this.onChangeView);

		},

		showViewInRegion: function(viewid, regionid) {
			/*this.ulview.showView(App.module('VirtualGlobeViewer').createController().getView());

			this.view.showViewInRegion('ul','left');
			this.view.setFullscreen('left');*/
		},

		setSinglescreen: function() {
			this.view.showViewInRegion('tl','view1');
			this.view.setFullscreen('view1');
			this.windowViews.tl.showView(App.module('MapViewer').createController().getView());
		},

		setSplitscreen: function() {

			this.view.showViewInRegion('tl','view1');
			this.view.showViewInRegion('tr','view2');
			this.view.setSplitscreen();

			this.windowViews.tl.showView(App.module('MapViewer').createController().getView());
			this.windowViews.tr.showView(App.module('VirtualGlobeViewer').createController().getView());

			
		},

		setQuadscreen: function(regionid) {

			this.view.showViewInRegion('tl','view1');
			this.view.showViewInRegion('tr','view2');
			this.view.showViewInRegion('bl','view3');
			this.view.showViewInRegion('br','view4');
			this.view.setQuadscreen();

			this.windowViews.tl.showView(App.module('MapViewer').createController().getView());
			this.windowViews.tr.showView(App.module('VirtualGlobeViewer').createController().getView());
			this.windowViews.br.showView(App.module('MapViewer').createController().getView());
			this.windowViews.bl.showView(App.module('SliceViewer').createController().getView());
		},

		onChangeView: function(options){
			_.each(this.windowViews, function(view){
				if(view === options.window){
					view.showView(App.module(options.viewer).createController().getView());
				}
			}, this);

		}
	});

	return SplitViewController;
});