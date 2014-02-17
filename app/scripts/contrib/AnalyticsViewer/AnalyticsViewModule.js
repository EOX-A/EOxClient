define([
	'backbone.marionette',
	'app',
	'communicator',
	'./AnalyticsViewController',
	'./AnalyticsViewRouter'
], function(Marionette, App, Communicator, AnalyticsViewController, AnalyticsViewRouterController) {

	'use strict';

	App.module('AnalyticsViewer', function(Module) {

		this.startsWithParent = true;

		// This is the start routine of the module, called automatically by Marionette
		// after the core system is loaded. The module is responsible for creating its
		// private implementation, the Module.Controller. The Module.Controller is the
		// connected to the event system of the application via the Communicator.
		// Moreover the Router responsible for this module is activated in this routine.
		this.on('start', function(options) {
			this.instances = {};
			this.idx = 0;

			console.log('[AnalyticsViewerModule] Finished module initialization');
		});

		this.createController = function(opts) {
			var id = undefined;
			

			if (typeof opts !== 'undefined') {
				id = opts.id;
			} 

			// Go through instances and return first free one
			for (var contr in this.instances) {
				if(!this.instances[contr].isActive()){
					console.log("Free analytics viewer returned " +contr);
					this.instances[contr].connectToView();
					return this.instances[contr];
				}
			};

			// If there are no free insances create a new one
			if (typeof id === 'undefined') {
				id = 'AnalyticsViewer.' + this.idx++;
			}
			console.log("New analytics viewer returned " +id);
			var controller = new AnalyticsViewController({});
			this.instances[id] = controller;

			return controller;
		};
	});
});