define([
	'backbone.marionette',
	'jquery',
	'underscore'
], function(Marionette, $, _) {

	'use strict';

	/* This object encapsulates functionality common to all the V-MANIP viewers:
	 *  - Management of the context bindings based on visibility
	 *  - Display of an 'empty view' if no content is selected yet
	 *  - Executing a custom resize callback when the view is visible
	 */
	var BaseView = Marionette.View.extend({

		/* If set to 'true' the viewer will not be destroyed when the 'onClose' function is called
		 * on the view. If 'false' the viewer will be destroyed.
		 * CAUTION: The viewer object must implement a 'destroy' function for that functionality to
		 * work. If not the code will not break, an error message will be displayed instead. However,
		 * this results in possible memory leaks!
		 */
		cacheViewerInstance: true,

		/* Stores the 'context' (accessible in the child object via 'this.context()') and sets up
		 * the base configuration.
		 */
		initialize: function(opts) {
			// Necessary for SplitView object:
			this.isClosed = true;
			this.isEmpty = true;
			this.emtpyViewIsActive = false;

			if (_.isFunction(this.onResize)) {
				this.onResizeF = this.onResize.bind(this);
			}

			if (typeof opts.context === 'undefined') {
				throw '[BaseView::initialize] "context" property has to be set in the options! If no context is needed for the view set it to "null"';
			}

			// Encapsulate the context object to ensure it is not unintendently
			// changed from outside:
			this.context = function() {
				return opts.context;
			}
		},

		/*
		 * Shows the content or the empty view, depending on the current setting and binds the view to the context
		 * if necessary. Also manages the resize functionality. The child's 'didInsertElement' method is also
		 * called, if defined.
		 */
		onShow: function() {
			if (this.isClosed) {
				if (_.isFunction(this.didInsertElement)) {
					this.didInsertElement();
				}

				if (this.onResizeF) {
					$(window).resize(this.onResizeF);
				}

				this.isClosed = false;
			}

			if (this.isEmpty) {
				if (_.isFunction(this.showEmptyView)) {
					this.showEmptyView();
				}
				this.emtpyViewIsActive = true;
				return;
			}

			if (this.emtpyViewIsActive) {
				if (_.isFunction(this.hideEmptyView)) {
					this.hideEmptyView();
				}
				this.emtpyViewIsActive = false;
			}

			if (!this.viewer) {
				if (!_.isFunction(this.createViewer)) {
					throw '[BaseView::onShow] It is mandatory to provide a "createViewer" implementation!';
				}
				this.viewer = this.createViewer();
			}
		},

		/* Unbinds the context bindings and the resize functionality. Also destroys the viewer if the
		 * 'cheViewerInstance' property is set to 'true'. The child's 'didRemoveElement' method is also
		 * called, if defined.
		 */
		onClose: function() {
			if (!_.isFunction(this.didRemoveElement)) {
				this.didRemoveElement();
			}

			if (this.onResizeF) {
				$(window).off('resize', this.onResizeF);
			}

			if (!this.cacheViewerInstance) {
				if (_.isFunction(this.viewer.destroy)) {
					this.viewer.destroy();
				} else {
					console.error('[BaseView::onClose] The "viewer" object does not provide a "destroy" function, but "cacheViewerInstance" is set to false. The "viewer" property will only be set to "undefined"');
				}
				this.viewer = undefined;
				this.isEmpty = true;
			}

			// NOTE: The 'listenTo' bindings are automatically unbound by marionette
			this.isClosed = true;
		},

		/* Determines if the empty view is shown, or not.
		 */
		enableEmptyView: function(flag) {
			this.isEmpty = flag;
		},

		/* Returs the viewer. Strictly speaking this method is not necessary, the viewer can also
		 * be retrieved via the 'this.viewer' property. However, this seems for me to be a clearer
		 * approach to me.
		 */
		setViewer: function(viewer) {
			this.viewer = viewer;
		},

		/* Sets the viewer. Strictly speaking this method is not necessary, the viewer can also
		 * be set via the 'this.viewer' property directly. However, this seems to be a clearer
		 * approach to me.
		 */
		getViewer: function() {
			return this.viewer;
		},
	});

	return BaseView;
});