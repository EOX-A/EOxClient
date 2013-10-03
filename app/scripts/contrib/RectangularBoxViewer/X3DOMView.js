define([
	"backbone.marionette"
], function(Marionette) {

	'use strict';

	// X3DOM is initializing the X3D elements found in the DOM when the library is loaded. As their are errors when
	// creating the X3D element after the loading of the library and x3dom.reload() did not work as expected this
	// X3DOMView takes care that there is always a X3D element in the DOM. However, the visual appeareance acts as
	// you would expect from a Marionette view, regarding its showing and closing in regions.

	// Usage: 
	//
	// var X3DOMScene = X3DOMView.extend({
	// 	createScene: function() {
	// 		// Implement this function to create the X3DOM scene
	// 	}
	// });
	//
	// var myX3DomScene = new X3DOMScene({
	// 	x3did: '#x3dom',    // -> the element id containing a X3D element or the X3D element id itself
	// 	hideid: '#hidden'   // -> the element id of a hidden (css: 'display: none') container in the DOM
	// });

	var X3DOMView = Marionette.View.extend({
		initialize: function(options) {
			this.sceneIsInitialized = false;

			$(window).resize(function() {
				this.onResize();
			}.bind(this));

			// FIXXME: document!
			this.$x3del = $(options.x3did);
			this.$hideel = $(options.hideid);

			if (!this.$x3del) {
				alert('[X3DOMView::initialize] Please specify a X3D element id or an element id containing an X3D element!');
			}

			if (!this.$hideel) {
				alert('[X3DOMView::initialize] Please specify an element id that acts as a hidden container!');
			}
		},

		createScene: function() {
			alert('[X3DOMView::createScene] Implement in extended object!');
		},

		onShow: function() {
			if (!this.isInitialized) {
				this.createScene();
				this.isInitialized = true;
			}

			this.show();
		},

		onResize: function() {
			// Hardcoded as this element is created by the x3dom environment:
			$('.x3dom-canvas').attr("width", $(window).width() - 2);
			$('.x3dom-canvas').attr("height", $(window).height() - 2);
		},

		hide: function() {
			this.$hideel.append(this.$x3del);
		},

		show: function() {
			this.$el.append(this.$x3del);

			this.$x3del.width($(window).width());
			this.$x3del.height($(window).height());

			this.onResize();
		},

		onBeforeClose: function() {
			this.hide();
		}
	});

	return X3DOMView;
});