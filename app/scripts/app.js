//-------------------------------------------------------------------------------
//
// Project: EOxClient <https://github.com/EOX-A/EOxClient>
// Authors: Daniel Santillan <daniel.santillan@eox.at>
//
//-------------------------------------------------------------------------------
// Copyright (C) 2014 EOX IT Services GmbH
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies of this Software or works derived from this Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//-------------------------------------------------------------------------------

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
		'controller/SelectionManagerController',
		'controller/LoadingController',
		'router'
	],

	function( Backbone, Communicator, globals, DialogRegion,
			  UIRegion, LayerControlLayout, ToolControlLayout ) {

		var Application = Backbone.Marionette.Application.extend({
			initialize: function(options) {
			},

			configure: function(config) {

				// Load jquery ui tooltip tool
                $("body").tooltip({ 
			    	selector: '[data-toggle=tooltip]',
			    	position: { my: "left+5 center", at: "right center" },
					hide: { effect: false, duration: 0 },
					show:{ effect: false, delay: 700}
			    });

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
							name: baselayer.name,
							visible: baselayer.visible,
							view: {
								id : baselayer.id,
								urls : baselayer.urls,
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
								visible: baselayer.visible,
								wrapDateLine: baselayer.wrapDateLine,
								zoomOffset: baselayer.zoomOffset,
								time: baselayer.time,
								requestEncoding: baselayer.requestEncoding,
								isBaseLayer: true
							}
						})
					);
					console.log("Added baselayer " + baselayer.id );
				}, this);

				var autoColor = {
		            colors : d3.scale.category10(),
		            index : 0,
		            getColor: function () { return this.colors(this.index++) }
		        }

				//Productsare loaded and added to the global collection
				_.each(config.mapConfig.products, function(products) {
					var p_color = products.color ? products.color : autoColor.getColor();
					globals.products.add(
						new m.LayerModel({
							name: products.name,
							visible: products.visible,
							timeSlider: products.timeSlider,
							// Default to WMS if no protocol is defined
 							timeSliderProtocol: (products.timeSliderProtocol) ? products.timeSliderProtocol : "EOWCS",
							color: p_color,
							time: products.time,
							opacity: 1,
							view:{
								id : products.view.id,
								protocol: products.view.protocol,
								urls : products.view.urls,
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
								requestEncoding: products.view.requestEncoding
							},
							download: {
								id : products.download.id,
								protocol: products.download.protocol,
								url : products.download.url
							}
						})
					);
					console.log("Added product " + products.view.id );
				}, this);

				//Overlays are loaded and added to the global collection
				_.each(config.mapConfig.overlays, function(overlay) {

					globals.overlays.add(
						new m.LayerModel({
							name: overlay.name,
							visible: overlay.visible,
							view: {
								id : overlay.id,
								urls : overlay.urls,
								protocol: overlay.protocol,
								projection: overlay.projection,
								attribution: overlay.attribution,
								matrixSet: overlay.matrixSet,
								style: overlay.style,
								format: overlay.format,
								resolutions: overlay.resolutions,
								maxExtent: overlay.maxExtent,
								gutter: overlay.gutter,
								buffer: overlay.buffer,
								units: overlay.units,
								transitionEffect: overlay.transitionEffect,
								isphericalMercator: overlay.isphericalMercator,
								isBaseLayer: false,
								wrapDateLine: overlay.wrapDateLine,
								zoomOffset: overlay.zoomOffset,
								time: overlay.time,
								requestEncoding: overlay.requestEncoding
							}
						})
					);
					console.log("Added overlay " + overlay.id );
				}, this);

				this.timeSliderView = new v.TimeSliderView(config.timeSlider);
                this.bottomBar.show(this.timeSliderView);


				// Create map view and execute show of its region
				this.map.show(new v.MapView({el: $("#map")}));

				// If Navigation Bar is set in configuration go trhough the
				// defined elements creating a item collection to rendered
				// by the marionette collection view
				if (config.navBarConfig) {

					var navBarItemCollection = new m.NavBarCollection;

					_.each(config.navBarConfig.items, function(list_item){
						navBarItemCollection.add(
							new m.NavBarItemModel({
								name:list_item.name,
                                icon:list_item.icon,
								eventToRaise:list_item.eventToRaise
							}));
					}, this);

					this.topBar.show(new v.NavBarCollectionView(
						{template: t.NavBar({
							title: config.navBarConfig.title,
							url: config.navBarConfig.url}),
						className:"navbar navbar-inverse navbar-fixed-top not-selectable",
						itemView: v.NavBarItemView, tag: "div",
						collection: navBarItemCollection}));

				};

				// Added region to test combination of backbone
				// functionality combined with jQuery UI
				this.addRegions({dialogRegion: DialogRegion.extend({el: "#viewContent"})});
				this.DialogContentView = new v.ContentView({
					template: {type: 'handlebars', template: t.Info},
                    id: "about",
                    className: "modal fade",
                    attributes: {
                        role: "dialog",
                        tabindex: "-1",
                        "aria-labelledby": "about-title",
                        "aria-hidden": true,
                        "data-keyboard": true,
                        "data-backdrop": "static"
                    }
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
                		className: "sortable-layer"
                	}),
                	className: "sortable"
                });

                this.overlaysView = new v.BaseLayerSelectionView({
                	collection:globals.overlays,
                	itemView: v.LayerItemView.extend({
                		template: {
                			type:'handlebars',
                			template: t.CheckBoxOverlayLayer},
                		className: "checkbox"
                	}),
                	className: "check"
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
								type: "selection",
                                selectionType: selTool.selectionType
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
								disabledDescription: visTool.disabledDescription,
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
                


               

				// Add a trigger for ajax calls in order to display loading state
				// in mouse cursor to give feedback to the user the client is busy
				$(document).ajaxStart(function() {
				  Communicator.mediator.trigger("progress:change", true);
				});

				$(document).ajaxStop(function() {
				  Communicator.mediator.trigger("progress:change", false);
				});

				$(document).ajaxError(function( event, request, settings ) {
					var statuscode = "";
					if (request.status != 0)
						statuscode =  '; Status Code: '+ request.status;
					$("#error-messages").append(
					  	'<div class="alert alert-warning alert-danger">'+
						  '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+
						  '<strong>Warning!</strong> Error response on HTTP ' + settings.type + ' to '+ settings.url.split("?")[0] +
						  statuscode +
						'</div>'
					);

				});

				// Go through Navigation Bar items and throw activation event for all
                // elements that are marked with show == true
                if (config.navBarConfig) {

					_.each(config.navBarConfig.items, function(list_item){
						if(list_item.show){
							Communicator.mediator.trigger(list_item.eventToRaise);
						}
					}, this);
				}

				// Remove loading screen when this point is reached in the script
				$('#loadscreen').remove();

			}



		});

		return new Application();
	});
}).call( this );
