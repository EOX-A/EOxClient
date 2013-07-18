(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'globals',
		'views/MapView',
		'models/LayerModel',
		'jquery',
		'backbone.marionette'		
	],

	function( Backbone, Communicator, globals, MapView, LayerModel ) {
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
					obj[region.name] = "#" + region.name;
					this.addRegions(obj);
					console.log("Added region " + obj[region.name]);
				}, this);


				_.each(config.mapConfig.baseLayers, function(baselayer) {
					var urls = [];

					globals.baseLayers.add(
							new LayerModel({
								id : baselayer.id,
								urls : baselayer.urls,
								protocol: baselayer.protocol,
								name: baselayer.name,
								projection: baselayer.projection,
								attribution: baselayer.attribution,
								matrixSet: baselayer.matrixSet,
								style: baselayer.style,
								format: baselayer.format,
								resolutions: baselayer.resolutions,
								maxExtent: baselayer.maxExtent,	
								gutter: baselayer.gutter,
								buffer: baselayer.buffer,
								units: baselayer.units,
								transitionEffect: baselayer.transitionEffect,
								isphericalMercator: baselayer.isphericalMercator,
								isBaseLayer: baselayer.isBaseLayer,
								wrapDateLine: baselayer.wrapDateLine,
								zoomOffset: baselayer.zoomOffset
							})
						);
					console.log("Added baselayer " + baselayer.id );
				}, this);

				this.background.show(new MapView({el: $("#map")}));




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