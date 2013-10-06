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

		ui: {
			fullscreenBtn: '.fullscreenbutton',
			splitscreenBtn: '.spliscreenbutton'
		},

		events: {
			'click .fullscreenbutton': function() {
				this.setFullscreen('left');
			},

			'click .splitscreenbutton': function() {
				this.setSplitscreen();
			}			
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
				this.left.$el.removeClass('halfscreen');
				this.right.$el.removeClass('halfscreen');

				this.right.$el.addClass('disabled');
				this.left.$el.addClass('fullscreen');
			} else if (regionid === 'right') {
				this.left.$el.removeClass('halfscreen');
				this.right.$el.removeClass('halfscreen');
				
				this.left.$el.addClass('disabled');
				this.right.$el.addClass('fullscreen');
			} else {
				alert('[SplitView::setFullscreen] Unknown regionid: ' + regionid);
			}

			_.each(this.views, function(view) {
				if (view.onResize) {
					view.onResize();
				}
			});
		},

		setSplitscreen: function() {
			this.left.$el.removeClass('fullscreen disabled');
			this.right.$el.removeClass('fullscreen disabled');

			this.left.$el.addClass('halfscreen');
			this.right.$el.addClass('halfscreen');

			_.each(this.views, function(view) {
				if (view.onResize) {
					view.onResize();
				}
			});			
		}		

	});

	return SplitView;
});