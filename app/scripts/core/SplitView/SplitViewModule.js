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
			
			this.instances = {};
			this.idx = 0;

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

			var controller = new SplitViewController();

			// Keep track of the created SplitView controllers. Not used at the moment,
			// but maybe in future releases to switch between view setups.
			this.instances[id] = controller;

			return controller;
		};
	});
});