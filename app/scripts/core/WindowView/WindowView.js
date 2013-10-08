define([
	'backbone.marionette',
	'hbs!tmpl/Window',
], function(Marionette, WindowTmpl) {

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
			},

			'click .globeview-btn': function() {
			},

			'click .boxview-btn': function() {
			},

			'click .analyticsview-btn': function() {
			}
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
		}

	});

	return WindowView;
});