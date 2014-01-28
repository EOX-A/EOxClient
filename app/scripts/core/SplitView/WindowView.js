
define([
	'backbone.marionette',
	'hbs!tmpl/Window',
	'communicator'
],function(Marionette, WindowTmpl, Communicator) {

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

		events: {
			'click .mapview-btn': function() {
				var options = {window:this, viewer:'MapViewer'};
				Communicator.mediator.trigger('window:view:change', options);

			},

			'click .globeview-btn': function() {
				var options = {window:this, viewer:'VirtualGlobeViewer'};
				Communicator.mediator.trigger('window:view:change', options);
			},

			'click .boxview-btn': function() {
				// var options = {window:this, viewer:'SliceViewer'};
				var options = {window:this, viewer:'RectangularBoxViewer'};
				Communicator.mediator.trigger('window:view:change', options);
			},

			'click .sliceview-btn': function() {
				var options = {window:this, viewer:'SliceViewer'};
				Communicator.mediator.trigger('window:view:change', options);
			},

			'click .analyticsview-btn': function() {
				var options = {window:this, viewer:'AnalyticsViewer'};
				Communicator.mediator.trigger('window:view:change', options);
			}
		},

		initialize: function() {
			//this.view = null;
		},

		showView: function(view) {
			this.viewport.show(view);
			if (view.onResize) {
				view.onResize();
			}
		}

	});

	return WindowView;
});
