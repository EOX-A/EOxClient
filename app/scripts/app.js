(function() {
	'use strict';

	var root = this;

	root.define([
			'backbone',
			'globals',
			'regions/DialogRegion', 'regions/UIRegion',
			'layouts/LayerControlLayout',
			'layouts/ToolControlLayout',
			'core/SplitView/WindowView',
			'communicator',
			'jquery', 'backbone.marionette',
			'controller/ContentController',
			'controller/DownloadController',
			'controller/SelectionManagerController'
		],

		function(Backbone, globals, DialogRegion,
			UIRegion, LayerControlLayout, ToolControlLayout, WindowView, Communicator) {

			var Application = Backbone.Marionette.Application.extend({
				initialize: function(options) {},

				configure: function(config) {

					var v = {}; //views
					var m = {}; //models
					var t = {}; //templates

					// Application regions are loaded and added to the Marionette Application
					_.each(config.regions, function(region) {
						var obj = {};
						obj[region.name] = "#" + region.name;
						this.addRegions(obj);
						//console.log("Added region " + obj[region.name]);
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
						visualizationLibs: config.mapConfig.visualizationLibs,
						center: config.mapConfig.center,
						zoom: config.mapConfig.zoom
					}));

					//Base Layers are loaded and added to the global collection
					_.each(config.mapConfig.baseLayers, function(baselayer) {

						globals.baseLayers.add(
							new m.LayerModel({
								name: baselayer.name,
								visible: baselayer.visible,
								view: {
									id: baselayer.id,
									urls: baselayer.urls,
									protocol: baselayer.protocol,
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
									isBaseLayer: true,
									wrapDateLine: baselayer.wrapDateLine,
									zoomOffset: baselayer.zoomOffset,
									time: baselayer.time
								}
							})
						);
						console.log("Added baselayer " + baselayer.id);
					}, this);

					//Productsare loaded and added to the global collection
					_.each(config.mapConfig.products, function(products) {

						globals.products.add(
							new m.LayerModel({
								name: products.name,
								visible: products.visible,
								view: {
									id: products.view.id,
									protocol: products.view.protocol,
									urls: products.view.urls,
									visualization: products.view.visualization,
									projection: products.view.projection,
									attribution: products.view.attribution,
									matrixSet: products.view.matrixSet,
									style: products.view.style,
									format: products.view.format,
									resolutions: products.view.resolutions,
									maxExtent: products.view.maxExtent,
									gutter: products.view.gutter,
									buffer: products.view.buffer,
									units: products.view.units,
									transitionEffect: products.view.transitionEffect,
									isphericalMercator: products.view.isphericalMercator,
									isBaseLayer: false,
									wrapDateLine: products.view.wrapDateLine,
									zoomOffset: products.view.zoomOffset,
									time: products.view.time
								},
								download: {
									id: products.download.id,
									protocol: products.download.protocol,
									url: products.download.url
								}
							})
						);
						console.log("Added product " + products.view.id);
					}, this);

					// If Navigation Bar is set in configuration go trhough the 
					// defined elements creating a item collection to rendered
					// by the marionette collection view
					if (config.navBarConfig) {

						var navBarItemCollection = new m.NavBarCollection;

						_.each(config.navBarConfig.items, function(list_item) {
							navBarItemCollection.add(
								new m.NavBarItemModel({
									name: list_item.name,
									eventToRaise: list_item.eventToRaise
								}));
						}, this);

						this.topBar.show(new v.NavBarCollectionView({
							template: t.NavBar({
								title: config.navBarConfig.title,
								url: config.navBarConfig.url
							}),
							className: "navbar navbar-fixed-top transparent",
							itemView: v.NavBarItemView,
							tag: "div",
							collection: navBarItemCollection
						}));

					};

					// Added region to test combination of backbone 
					// functionality combined with jQuery UI
					this.addRegions({
						dialogRegion: DialogRegion.extend({
							el: "#viewContent"
						})
					});
					this.DialogContentView = new v.ContentView({
						template: {
							type: 'handlebars',
							template: t.Info
						},
						className: "modal hide fade",
						attributes: {
							"data-keyboard": "false",
							"data-backdrop": "static"
						}
					});

					// Create the views - these are Marionette.CollectionViews that render ItemViews
					this.baseLayerView = new v.BaseLayerSelectionView({
						collection: globals.baseLayers,
						itemView: v.LayerItemView.extend({
							template: {
								type: 'handlebars',
								template: t.BulletLayer
							},
							className: "radio"
						})
					});

					this.productsView = new v.LayerSelectionView({
						collection: globals.products,
						itemView: v.LayerItemView.extend({
							template: {
								type: 'handlebars',
								template: t.CheckBoxLayer
							},
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
								icon: selTool.icon,
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
								icon: visTool.icon,
								enabled: visTool.enabled,
								active: visTool.active,
								type: "tool"
							}));
					}, this);

					// Define collection of visualization modes
					var visualizationModesCollection = new m.ToolCollection();
					_.each(config.visualizationModes, function(visMode) {
						visualizationModesCollection.add(
							new m.ToolModel({
								id: visMode.id,
								eventToRaise: visMode.eventToRaise,
								description: visMode.description,
								icon: visMode.icon,
								enabled: visMode.enabled,
								active: visMode.active,
								type: "vis_mode"
							}));
					}, this);

					// Create Collection Views to hold set of views for selection tools
					this.visualizationToolsView = new v.ToolSelectionView({
						collection: visualizationToolsCollection,
						itemView: v.ToolItemView.extend({
							template: {
								type: 'handlebars',
								template: t.ToolIcon
							}
						})
					});

					// Create Collection Views to hold set of views for visualization tools
					this.selectionToolsView = new v.ToolSelectionView({
						collection: selectionToolsCollection,
						itemView: v.ToolItemView.extend({
							template: {
								type: 'handlebars',
								template: t.ToolIcon
							}
						})
					});

					// Create Collection Views to hold set of views for visualization modes
					this.visualizationModesView = new v.ToolSelectionView({
						collection: visualizationModesCollection,
						itemView: v.ToolItemView.extend({
							template: {
								type: 'handlebars',
								template: t.ToolIcon
							}
						})
					});



					// Create layout to hold collection views
					this.toolLayout = new ToolControlLayout();


					this.timeSliderView = new v.TimeSliderView();
					this.bottomBar.show(this.timeSliderView);


					//this.router = new Router({views: this.views, regions: this.regions});


					//this.downloadView = new v.DownloadView();				
				},

				// The GUI is setup after the application is started. Therefore all modules
				// are already registered and can be requested to populate the GUI.
				setupGui: function() {

					// Starts the SplitView module and registers it with the Communicator.
					this.module('SplitView').start();
					var splitview = this.module('SplitView').createController();
					this.main.show(splitview.getView());

					splitview.setSinglescreen();
					//splitview.showViewInRegion('ul', 'viewport');

					// Register the views which are available to the SplitView with an Id.
					/*splitview.registerViews({
						'view1': windowView1,
						'view2': windowView2
					});

					// Retrieves the SplitView module and creates a new splitted view.
					//var splitview = this.module('SplitView').createController();

					// Be sure to insert the view into the DOM before adding the child view. E.g.
					// OpenLayers.Map fails to initialize if its div is not within the DOM.
					this.main.show(splitview.getView());

					// Configure the SplitView:
					splitview.setSplitscreen();
					//splitview.setSinglescreen('left'); 


					// Set the views into the desired areas of the SplitView
					splitview.showViewInRegion('view1', 'left');
					splitview.showViewInRegion('view2', 'right');

					
					//this.main.show(windowController.getView());

					var vgv = this.module('VirtualGlobeViewer').createController();
					var map = this.module('MapViewer').createController();

					windowView1.registerViews({
						'vgv': vgv.getView(),
						'map': map.getView()
					});
					windowView1.showViewInRegion('map', 'viewport');



					var vgv2 = this.module('VirtualGlobeViewer').createController();
					var map2 = this.module('MapViewer').createController();
					windowView2.registerViews({
						'vgv': vgv2.getView(),
						'map': map2.getView()
					});
					windowView2.showViewInRegion('map', 'viewport');*/


					
					
				},

				// Initially sets the products to be displayed.
				selectInitialProducts: function() {
					Communicator.mediator.trigger('map:layer:change', {
						name: "Terrain Layer",
						isBaseLayer: true
					});
				}
			});

			return new Application();
		});
}).call(this);