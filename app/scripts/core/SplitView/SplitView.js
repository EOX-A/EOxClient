define([
	'backbone.marionette',
	'hbs!tmpl/SplitView',
], function(Marionette, SplitViewTmpl) {

	'use strict';

	var SplitView = Marionette.Layout.extend({

		className: "splitview",

		template: {
			type: 'handlebars',
			template: SplitViewTmpl
		},

		regions: {
			view1: '.view1 > .viewport',
			view2: '.view2 > .viewport',
			view3: '.view3 > .viewport',
			view4: '.view4 > .viewport'
		},

		ui: {
			view1: '.view1',
			view2: '.view2',
			view3: '.view3',
			view4: '.view4'
		},

		initialize: function() {
			this.views = undefined;
		},

		registerViews: function(views) {
			this.views = views;
		},

		showViewInRegion: function(viewid, regionid) {
			var region = this[regionid];
			if (!region) {
				// FIXXME: replace with exception!
				console.log('[SplitView::setView] Region "' + regionid + '" is not known. Valid regions are: FIXXME');
				return;
			}

			var view = this.views[viewid];
			if (!view) {
				// FIXXME: replace with exception!
				console.log('[SplitView::setView] View "' + viewid + '" is not known. Valid views are: FIXXME');
				return;
			}

			region.show(view);
		},

		setFullscreen: function(regionid) {

			_.each(this.ui, function(desc, key){
				this.ui[key].removeClass("halfscreen quarterscreen");
				if(key == regionid){
					this.ui[key].addClass('fullscreen');
				}else{
					this.ui[key].addClass('disabled');
				}
			}, this);
			
			this.updateViewSize();
		},

		setSingleScreen: function(){

		},

		setSplitscreen: function() {


			_.each(this.ui, function(desc, key){
				this.ui[key].addClass("disabled").removeClass("fullscreen quarterscreen");
				if(key == 'view1' || key == 'view2'){
					this.ui[key].addClass('halfscreen').removeClass("disabled");
				}
			}, this);
			
			this.updateViewSize();

		},

		setQuadscreen: function(){

			_.each(this.ui, function(desc, key){
				this.ui[key].removeClass("disabled fullscreen halfscreen").addClass("quarterscreen");
			}, this);
			
			this.updateViewSize();

		},

		updateViewSize: function() {
			_.each(this.views, function(view) {
				if (view.onResize) {
					view.onResize();
				}
			});
		}

	});

	return SplitView;
});