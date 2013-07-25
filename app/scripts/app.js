(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'globals',
		'views/MapView',
		'models/LayerModel',
		'models/MapModel',
		'views/NavBarCollectionView',
		'models/NavBarItemModel',
		'hbs!tmpl/NavBar',
		'hbs!tmpl/NavBarItem',
		'models/NavBarCollection',
		'views/NavBarItemView',
		'views/ContentView',
		'hbs!tmpl/Info',
		'regions/DialogRegion',
		'regions/UIRegion',
		'views/UIElementView',
		'jquery',
		'backbone.marionette',
		'controller/ContentController',
		'router'	
	],

	function( Backbone, Communicator, globals, MapView, LayerModel, 
			  MapModel , NavBarCollectionView, NavBarItemModel, 
			  NavBarTmpl, NavBarItemTmpl, NavBarCollection, NavBarItemView,
			  ContentView, InfoTmpl, DialogRegion, UIRegion, UIElementView ) {

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


				// Application regions are loaded and added to the Marionette Application
				_.each(config.regions, function(region) {
					var obj ={};
					obj[region.name] = "#" + region.name;
					this.addRegions(obj);
					console.log("Added region " + obj[region.name]);
				}, this);


				//Map attributes are loaded and added to the global map model
				globals.objects.add('mapmodel', new MapModel({
						visualizationLibs : config.mapConfig.visualizationLibs,
						center: config.mapConfig.center,
						zoom: config.mapConfig.zoom
					})
				);

				//Base Layers are loaded and added to the global collection
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


				//TODO: Everything below has to be done automatically based on configuration

				this.background.show(new MapView({el: $("#map")}));

				if (config.navBarConfig) {

					var navBarItemCollection = new NavBarCollection();

					_.each(config.navBarConfig.items, function(list_item){
						navBarItemCollection.add(new NavBarItemModel({name:list_item.name, eventToRaise:list_item.eventToRaise}));
					}, this);

					this.topBar.show(new NavBarCollectionView(
						{template: NavBarTmpl({title: config.navBarConfig.title, url: config.navBarConfig.url}), className:"navbar navbar-fixed-top transparent", 
						itemView: NavBarItemView, tag: "div",
						collection: navBarItemCollection}));

				};

				this.addRegions({dialogRegion: DialogRegion.extend({el: "#viewContent"})});
				this.DialogContentView = new ContentView({ template: {type: 'handlebars', template: InfoTmpl},
															className: "modal hide fade",
															attributes: {"data-keyboard":"false", "data-backdrop":"static"} });

				this.addRegions({UIRegion: UIRegion.extend({el: "#rightSideBar"})});
				this.UIView = new UIElementView({ className: "well sidepane" });
				

				/*var model = new NavBarItemModel({name:"test", content:"", link:"#"});
				var somecollection = new NavBarCollection([model]);

				this.topBar.show(new NavBarCollectionView(
					{template: NavBarTmpl(), className:"navbar navbar-fixed-top transparent", 
					itemView: NavBarItemView, 
					collection: somecollection}));*/





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