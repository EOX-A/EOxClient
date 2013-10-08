define([
	'backbone.marionette',
	'app',
	'communicator',
	'./WindowController'
], function(Marionette, App, Communicator, WindowController) {

	'use strict';

	App.module('WindowView', function(Module) {

		this.startsWithParent = true;

		this.on('start', function(options) {
			this.controllerMap = undefined;
			this.idx = 0;

			Communicator.reqres.setHandler("core:get:windowmodule", function() {
				return this;
			}.bind(this));

			console.log('[WindowView] Finished module initialization');

		});

		this.createController = function(opts) {
			var id = undefined;
			if (typeof opts !== 'undefined') {
				id = opts.id;
			}

			if (typeof id === 'undefined') {
				id = 'WindowView.' + this.idx++;
			}

			if (typeof this.controllerMap === 'undefined') {
				this.controllerMap = {};
			}

			var controller = new WindowController();

			// Keep track of the created SplitView controllers. Not used at the moment,
			// but maybe in future releases to switch between view setups.
			this.controllerMap[id] = controller;

			return controller;
		};
	});
});