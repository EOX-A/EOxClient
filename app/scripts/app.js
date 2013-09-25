(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator','globals',
		'regions/DialogRegion','regions/UIRegion',
		'layouts/LayerControlLayout',
		'layouts/ToolControlLayout',
		'jquery', 'backbone.marionette',
		'controller/ContentController',
		'controller/DownloadController',
		'router'
	],

	function( Backbone, Communicator, globals, DialogRegion, 
			  UIRegion, LayerControlLayout, ToolControlLayout ) {

		var Application = Backbone.Marionette.Application.extend({
			initialize: function(options) {
			},

			configure: function(config) {

				var v = {}; //views
				var m = {};	//models
				var t = {};	//templates

				// Application regions are loaded and added to the Marionette Application
				_.each(config.regions, function(region) {
					var obj ={};
					obj[region.name] = "#" + region.name;
					this.addRegions(obj);
					console.log("Added region " + obj[region.name]);
				}, this);

				//Load all configured views
				_.each(config.views, function(viewDef) {
					var View = require(viewDef);
					$.extend(v, View);
				}, this);

				//Load all configured models
				_.each(config.models, function(modelDef) {
					var Model = require(modelDef);
					$.extend(m, Model);
				}, this);

				//Load all configured templates
				_.each(config.templates, function(tmplDef) {
					var Tmpl = require(tmplDef.template);
					t[tmplDef.id] = Tmpl;
				}, this);


				//Map attributes are loaded and added to the global map model
				globals.objects.add('mapmodel', new m.MapModel({
						visualizationLibs : config.mapConfig.visualizationLibs,
						center: config.mapConfig.center,
						zoom: config.mapConfig.zoom
					})
				);

				//Base Layers are loaded and added to the global collection
				_.each(config.mapConfig.baseLayers, function(baselayer) {
					
					globals.baseLayers.add(
						new m.LayerModel({
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
							zoomOffset: baselayer.zoomOffset,
							visible: baselayer.visible,
							time: baselayer.time
						})
					);
					console.log("Added baselayer " + baselayer.id );
				}, this);

				//Productsare loaded and added to the global collection
				_.each(config.mapConfig.products, function(products) {
					
					globals.products.add(
						new m.LayerModel({
							id : products.id,
							urls : products.urls,
							visualization: products.visualization,
							protocol: products.protocol,
							name: products.name,
							projection: products.projection,
							attribution: products.attribution,
							matrixSet: products.matrixSet,
							style: products.style,
							format: products.format,
							resolutions: products.resolutions,
							maxExtent: products.maxExtent,	
							gutter: products.gutter,
							buffer: products.buffer,
							units: products.units,
							transitionEffect: products.transitionEffect,
							isphericalMercator: products.isphericalMercator,
							isBaseLayer: products.isBaseLayer,
							wrapDateLine: products.wrapDateLine,
							zoomOffset: products.zoomOffset,
							visible: products.visible,
							time: products.time
						})
					);
					console.log("Added product " + products.id );
				}, this);


				// Create map view and execute show of its region
				this.viewer.show(new v.MapView);
				//this.map.show(new v.VirtualGlobeView);
				// If Navigation Bar is set in configuration go trhough the 
				// defined elements creating a item collection to rendered
				// by the marionette collection view
				if (config.navBarConfig) {

					var navBarItemCollection = new m.NavBarCollection;

					_.each(config.navBarConfig.items, function(list_item){
						navBarItemCollection.add(
							new m.NavBarItemModel({
								name:list_item.name,
								eventToRaise:list_item.eventToRaise
							}));
					}, this);

					this.topBar.show(new v.NavBarCollectionView(
						{template: t.NavBar({
							title: config.navBarConfig.title,
							url: config.navBarConfig.url}),
						className:"navbar navbar-fixed-top transparent", 
						itemView: v.NavBarItemView, tag: "div",
						collection: navBarItemCollection}));

				};

				// Added region to test combination of backbone 
				// functionality combined with jQuery UI
				this.addRegions({dialogRegion: DialogRegion.extend({el: "#viewContent"})});
				this.DialogContentView = new v.ContentView({ 
					template: {type: 'handlebars', template: t.Info},
					className: "modal hide fade",
					attributes: {"data-keyboard":"false", "data-backdrop":"static"} 
				});

				// Create the views - these are Marionette.CollectionViews that render ItemViews
                this.baseLayerView = new v.BaseLayerSelectionView({
                	collection:globals.baseLayers,
                	itemView: v.LayerItemView.extend({
                		template: {
                			type:'handlebars',
                			template: t.BulletLayer},
                		className: "radio" 
                	})
                });

                this.productsView = new v.LayerSelectionView({
                	collection:globals.products,
                	itemView: v.LayerItemView.extend({
                		template: {
                			type:'handlebars',
                			template: t.CheckBoxLayer},
                		className: "ui-state-default checkbox"
                	}),
                	className: "sortable"
                });

                // Create layout that will hold the child views
                this.layout = new LayerControlLayout();


                // Define collection of selection tools
                var selectionToolsCollection = new m.ToolCollection();
                _.each(config.selectionTools, function(selTool) {
					selectionToolsCollection.add(
							new m.ToolModel({
								id: selTool.id,
								description: selTool.description,
								icon:selTool.icon,
								enabled: true,
								active: false,
								type: "selection"
							}));
				}, this);

                // Define collection of visualization tools
                var visualizationToolsCollection = new m.ToolCollection();
                _.each(config.visualizationTools, function(visTool) {
					visualizationToolsCollection.add(
							new m.ToolModel({
								id: visTool.id,
								eventToRaise: visTool.eventToRaise,
								description: visTool.description,
								icon:visTool.icon,
								enabled: visTool.enabled,
								active: visTool.active,
								type: "tool"
							}));
				}, this);
                
                // Create Collection Views to hold set of views for selection tools
                this.visualizationToolsView = new v.ToolSelectionView({
                	collection:visualizationToolsCollection,
                	itemView: v.ToolItemView.extend({
                		template: {
                			type:'handlebars',
                			template: t.ToolIcon}
                	})
                });

                // Create Collection Views to hold set of views for visualization tools
                this.selectionToolsView = new v.ToolSelectionView({
                	collection:selectionToolsCollection,
                	itemView: v.ToolItemView.extend({
                		template: {
                			type:'handlebars',
                			template: t.ToolIcon}
                	})
                });



                // Create layout to hold collection views
                this.toolLayout = new ToolControlLayout();


                this.timeSliderView = new v.TimeSliderView();
                this.bottomBar.show(this.timeSliderView);


				//this.router = new Router({views: this.views, regions: this.regions});


				//this.downloadView = new v.DownloadView();
				
								
			}



		});

		return new Application();
	});
}).call( this );