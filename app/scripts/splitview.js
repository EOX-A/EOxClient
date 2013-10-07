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
			left: '.leftpane > .viewport',
			right: '.rightpane > .viewport'
		},

		ui: {
			leftgui: '.leftpane > .gui',
			rightgui: '.rightpane > .gui',
			leftpane: '.leftpane',
			rightpane: '.rightpane',
			fullscreenBtn: '.fullscreenbutton',
			splitscreenBtn: '.splitscreenbutton'
		},

		triggers: {
			'click .leftpane .fullscreen-btn': 'fullscreenLeftClicked',
			'click .rightpane .fullscreen-btn': 'fullscreenRightClicked',
			'click .splitscreen-btn': 'splitscreenClicked'
		},

		initialize: function(views) {
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
			if (regionid === 'left') {
				this.ui.rightpane.addClass('disabled').removeClass('halfscreen');
				this.ui.leftpane.addClass('fullscreen').removeClass('halfscreen');

				this.ui.rightgui.addClass('disabled');
			} else if (regionid === 'right') {
				this.ui.leftpane.addClass('disabled').removeClass('halfscreen');
				this.ui.rightpane.addClass('fullscreen').removeClass('halfscreen');

				this.ui.leftgui.addClass('disabled');
			} else {
				alert('[SplitView::setFullscreen] Unknown regionid: ' + regionid);
				return;
			}

			this.updateViewSize();
		},

		setSplitscreen: function() {
			this.ui.leftpane.removeClass('fullscreen disabled');
			this.ui.rightpane.removeClass('fullscreen disabled');

			this.ui.leftpane.addClass('halfscreen');
			this.ui.rightpane.addClass('halfscreen');

			this.ui.leftgui.removeClass('disabled');
			this.ui.rightgui.removeClass('disabled');

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