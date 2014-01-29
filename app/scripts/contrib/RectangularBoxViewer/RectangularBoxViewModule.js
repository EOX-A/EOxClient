define([
	'backbone.marionette',
	'app',
	'communicator',
	'./RectangularBoxViewController',
	'./RectangularBoxViewRouter'
], function(Marionette, App, Communicator, RectangularBoxViewController, RectangularBoxViewRouter) {

	'use strict';

	App.module('RectangularBoxViewer', function(Module) {

		this.startsWithParent = true;

		this.on('start', function(options) {
            this.instances = {};
            this.idx = 0;

            console.log('[VirtualGlobeViewer] Finished module initialization');
        });			

        this.createController = function(opts) {
            console.log("Entered create Controller");
            var id = undefined;

            if (typeof opts !== 'undefined') {
                id = opts.id;
            }

            // Go through instances and return first free one
            for (var contr in this.instances) {
                if (!this.instances[contr].isActive()) {
                    console.log("Free RB viewer returned " + contr);
                    return this.instances[contr];
                }
            };

            // If there are no free insances create a new one
            if (typeof id === 'undefined') {
                id = 'RectangularBoxViewer.' + this.idx++;
            }

            var controller = new RectangularBoxViewController();
            this.instances[id] = controller;

            return controller;	
        };
	});
});