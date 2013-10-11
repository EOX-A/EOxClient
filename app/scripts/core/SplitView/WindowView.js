
define([
	'backbone.marionette',
	'hbs!tmpl/Window',
],function(Marionette, WindowTmpl) {

	'use strict';

	var WindowView = Marionette.Layout.extend({

		className: "windowview",

		template: {
			type: 'handlebars',
			template: WindowTmpl
		},

		regions: {
			viewport: '.viewport'
		},

		/*ui: {
			mapviewBtn: '.fullscreenbutton',
			splitscreenBtn: '.splitscreenbutton'
		},*/

		events: {
			'click .mapview-btn': function() {
				//this.registerViews('map': this.module('MapViewer').createController().getView());
				//this.showViewInRegion('map', 'viewport');
			},

			'click .globeview-btn': function() {
				//this.registerViews('vgv': this.module('VirtualGlobeViewer').createController().getView());
				//this.showViewInRegion('vgv', 'viewport');
			},

			'click .boxview-btn': function() {
			},

			'click .analyticsview-btn': function() {
			}
		},

		initialize: function() {
			//this.view = null;
		},

		/*registerViews: function(views) {
			this.views = views;
		},*/

		showView: function(view) {
			/*var region = this[regionid];
			if (!region) {
				// FIXXME: replace with exception!
				//console.log('[SplitView::setView] Region "' + regionid + '" is not known. Valid regions are: FIXXME');
				return;
			}

			var view = this.views[viewid];
			if (!view) {
				// FIXXME: replace with exception!
				//console.log('[SplitView::setView] View "' + viewid + '" is not known. Valid views are: FIXXME');
				return;
			}*/

			this.viewport.show(view);
		}

	});

	return WindowView;
});
