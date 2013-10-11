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

			this.tlview = new WindowView();
			this.trview = new WindowView();
			this.blview = new WindowView();
			this.brview = new WindowView();

			this.view.registerViews({
				tl:this.tlview,
				tr:this.trview,
				bl:this.blview,
				br:this.brview,
			});
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

		},

		showViewInRegion: function(viewid, regionid) {
			/*this.ulview.showView(App.module('VirtualGlobeViewer').createController().getView());

			this.view.showViewInRegion('ul','left');
			this.view.setFullscreen('left');*/
		},

		setSinglescreen: function() {
			this.view.showViewInRegion('tl','view1');
			this.view.setFullscreen('view1');
			this.tlview.showView(App.module('MapViewer').createController({id:'1'}).getView());
		},

		setSplitscreen: function() {

			this.view.showViewInRegion('tl','view1');
			this.view.showViewInRegion('tr','view2');
			this.view.setSplitscreen();

			this.tlview.showView(App.module('MapViewer').createController({id:'2'}).getView());
			this.trview.showView(App.module('VirtualGlobeViewer').createController({id:'3'}).getView());

			
		},

		setQuadscreen: function(regionid) {

			this.view.showViewInRegion('tl','view1');
			this.view.showViewInRegion('tr','view2');
			this.view.showViewInRegion('bl','view3');
			this.view.showViewInRegion('br','view4');
			this.view.setQuadscreen();

			this.tlview.showView(App.module('MapViewer').createController({id:'4'}).getView());
			this.trview.showView(App.module('VirtualGlobeViewer').createController({id:'5'}).getView());
			this.blview.showView(App.module('MapViewer').createController({id:'6'}).getView());
			this.brview.showView(App.module('VirtualGlobeViewer').createController({id:'7'}).getView());
		}
	});

	return SplitViewController;
});