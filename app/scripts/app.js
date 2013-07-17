(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'jquery',
		'backbone.marionette'
	],

	function( Backbone, Communicator ) {
		var Application = Backbone.Marionette.Application.extend({
			initialize: function(options) {
				// if options == string --> retrieve json config
				// else options are directly the config
				/*if (typeof options == "string") {
					$.get(options, this.configure);
				}
				else {
					this.configure(options);
				}*/
			},

			configure: function(config) {
				// Add application regions here

				_.each(config.regions, function(region) {
					var obj ={};
					obj[region.name] = "#".concat(region.name);
					this.addRegions(obj);
					console.log("Added region ".concat(obj[region.name]));
				}, this);


				/*_.each(config.views, function(viewDef) {
					var View = require(viewDef.module);
					this.views.push(new View(viewDef.options));
				}, this);*/



				//this.router = new Router({views: this.views, regions: this.regions});

			}

		});

		return new Application();
	});
}).call( this );