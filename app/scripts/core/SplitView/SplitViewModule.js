define([
	'backbone.marionette',
	'app',
	'communicator',
	'./SplitViewController'
], function(Marionette, App, Communicator, SplitViewController) {

	'use strict';

	App.module('SplitView', function(Module) {

		this.startsWithParent = true;

		this.on('start', function(options) {
			this.controllerMap = undefined;
			this.idx = 0;

			Communicator.reqres.setHandler("core:get:splitviewmodule", function() {
				return this;
			}.bind(this));

			console.log('[SplitView] Finished module initialization');

		});

		this.createController = function(opts) {
			var id = undefined;
			if (typeof opts !== 'undefined') {
				id = opts.id;
			}

			if (typeof id === 'undefined') {
				id = 'SplitView.' + this.idx++;
			}

			if (typeof this.controllerMap === 'undefined') {
				this.controllerMap = {};
			}

			var controller = new SplitViewController();

			// Keep track of the created SplitView controllers. Not used at the moment,
			// but maybe in future releases to switch between view setups.
			this.controllerMap[id] = controller;

			return controller;
		};
	});
});