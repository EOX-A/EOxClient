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

define(['backbone',
		'communicator',
		'globals',
		'openlayers',
		'models/MapModel',
		'filesaver'
		],
		function( Backbone, Communicator, globals ) {

			var MapView = Backbone.View.extend({
				
				onShow: function() {

					this.ol_baseLayers = {};
					this.ol_products = {};
					this.ol_overlays = {};

					//this.tileManager = new ol.TileManager();
					this.map = new ol.Map({
						renderer: 'canvas',
						  target: 'map',
						  //maxResolution: resolutions[1],
						  view: new ol.View2D({
						    center: [9, 45],
						    zoom: 6,
						    projection: ol.proj.get('EPSG:4326')
						  }),
						
						//tileManager: this.tileManager
					});

					console.log("Created Map");

					//listen to moeveend event in order to keep router uptodate
					this.map.on("moveend", function(evt) {
						var view = evt.map.getView();
						var center = view.getCenter();
			            Communicator.mediator.trigger("router:setUrl", { x: center[0], y: center[1], l: view.getZoom()});
			        });

					this.listenTo(Communicator.mediator, "map:center", this.centerMap);
					this.listenTo(Communicator.mediator, "map:layer:change", this.changeLayer);
					this.listenTo(Communicator.mediator, "productCollection:sortUpdated", this.onSortProducts);
					this.listenTo(Communicator.mediator, "productCollection:updateOpacity", this.onUpdateOpacity);
					this.listenTo(Communicator.mediator, "selection:activated", this.onSelectionActivated);
					this.listenTo(Communicator.mediator, "map:load:geojson", this.onLoadGeoJSON);
					this.listenTo(Communicator.mediator, "map:export:geojson", this.onExportGeoJSON);
					this.listenTo(Communicator.mediator, 'time:change', this.onTimeChange);

					//Communicator.reqres.setHandler('get:selection:json', _.bind(this.onGetGeoJSON, this));

					var style =  new ol.style.Style({
						fill: new ol.style.Fill({
					    	color: 'rgba(255, 255, 255, 0.2)'
						}),
						stroke: new ol.style.Stroke({
							color: '#ffcc33',
					    	width: 2
						}),
						image: new ol.style.Circle({
					    	radius: 7,
					    	fill: new ol.style.Fill({
					    		color: '#ffcc33'
							})
						})
					});


					this.source = new ol.source.Vector();

					this.vector = new ol.layer.Vector({
						source: this.source,
						style: style
					});

					
	                this.boxstart = undefined;

	                this.drawControls = {
	                    pointSelection: new ol.interaction.Draw({source: this.source, type: 'Point'}),
	                    lineSelection: new ol.interaction.Draw({source: this.source, type: 'LineString'}),
	                    polygonSelection: new ol.interaction.Draw({source: this.source, type: 'Polygon'}),
	                    bboxSelection: new ol.interaction.DragBox({style: style})
	                };

	                this.drawControls.bboxSelection.on('boxstart', function(evt){
	                	this.boxstart = evt.getCoordinate();
	                }, this);

	                this.drawControls.bboxSelection.on('boxend', function(evt){
	                	var boxend = evt.getCoordinate();
						var polygon = new ol.geom.Polygon([
							[ 
								[this.boxstart[0], this.boxstart[1]],
								[this.boxstart[0], boxend[1]],
								[boxend[0], boxend[1]],
								[boxend[0], this.boxstart[1]]
							]
						]);

						var feature = new ol.Feature();
					    feature.setGeometry(polygon);
					    this.source.addFeature(feature);

	                }, this);


					//Go through all defined baselayer and add them to the map
					globals.baseLayers.each(function(baselayer) {
						var layer = this.createLayer(baselayer);
						this.ol_baseLayers[baselayer.get('view').id] = layer;
						this.map.addLayer(layer);
					}, this);

					// Go through all products and add them to the map
					globals.products.each(function(product){
						var layer = this.createLayer(product);
						this.ol_products[product.get('view').id] = layer;
						this.map.addLayer(layer);
					}, this);

					// Go through all products and add them to the map
					globals.overlays.each(function(overlay){
						var layer = this.createLayer(overlay);
						this.ol_overlays[overlay.get('view').id] = layer;
						this.map.addLayer(layer);
					}, this);

					// Order (sort) the product layers based on collection order
					this.onSortProducts();

					// Openlayers format readers for loading geojson selections
					/*var io_options = {
		                'internalProjection': this.map.baseLayer.projection,
		                'externalProjection': new OpenLayers.Projection('EPSG:4326')
		            }; 

					this.geojson = new OpenLayers.Format.GeoJSON(io_options);


					//Set attributes of map based on mapmodel attributes
				    var mapmodel = globals.objects.get('mapmodel');
				    this.map.setCenter(new OpenLayers.LonLat(mapmodel.get("center")), mapmodel.get("zoom") );*/
				    this.map.addLayer(this.vector);
				    return this;
				},
				//method to create layer depending on protocol
				//setting possible description attributes
				createLayer: function (layerdesc) {
					var return_layer = null;
					var layer = layerdesc.get('view');

					//var projection = ol.proj.get('EPSG:900913');
					var projection = ol.proj.get('EPSG:4326');
					var projectionExtent = projection.getExtent();
					var size = ol.extent.getWidth(projectionExtent) / 256;
					var resolutions = new Array(18);
					var matrixIds = new Array(18);
					for (var z = 0; z < 18; ++z) {
					  // generate resolutions and matrixIds arrays for this WMTS
					  resolutions[z] = size / Math.pow(2, z+1);
					  matrixIds[z] = z;
					}

					switch(layer.protocol){
						case "WMTS":
							/*return_layer = new OpenLayers.Layer.WMTS({
								name: layerdesc.get("name"),
						        layer: layer.id,
						        protocol: layer.protocol,
						        url: layer.urls,
						        matrixSet: layer.matrixSet,
						        style: layer.style,
						        format: layer.format,
						        maxExtent: layer.maxExtent,
						        resolutions: layer.resolutions,
						        projection: layer.projection,
						        gutter: layer.gutter,
						        buffer: layer.buffer,
						        units: layer.units,
						        transitionEffect: layer.transitionEffect,
						        isphericalMercator: layer.isphericalMercator,
						        isBaseLayer: layer.isBaseLayer,
						        wrapDateLine: layer.wrapDateLine,
						        zoomOffset: layer.zoomOffset,
						        visible: layerdesc.get("visible"),
						        time: layerdesc.time,
						        requestEncoding: layer.requestEncoding
							});*/
							return_layer = new ol.layer.Tile({
						      //opacity: 0.7,
						      visible: layer.visible,
						      source: new ol.source.WMTS({
						        urls: layer.urls,
						        layer: layer.id,
						        matrixSet: layer.matrixSet,
						        format: layer.format,
						        projection: layer.projection,
						        //requestEncoding: layer.requestEncoding,
						        tileGrid: new ol.tilegrid.WMTS({
							        origin: ol.extent.getTopLeft(projectionExtent),
							        resolutions: resolutions,
							        matrixIds: matrixIds
						        }),
						        style: layer.style
						      })
						    })
							break;

						case "WMS":
						/*return_layer = new OpenLayers.Layer.WMS(
								layerdesc.get("name"),
						        layer.urls[0],
						        {
						        	layers: layer.id,
						        	transparent: "true",
        							format: "image/png",
        							time: layer.time
						    	},
						        {
						        	format: 'image/png',
							        matrixSet: layer.matrixSet,
							        style: layer.style,
							        format: layer.format,
							        maxExtent: layer.maxExtent,
							        resolutions: layer.resolutions,
							        projection: layer.projection,
							        gutter: layer.gutter,
							        buffer: layer.buffer,
							        units: layer.units,
							        transitionEffect: layer.transitionEffect,
							        isphericalMercator: layer.isphericalMercator,
							        isBaseLayer: layer.isBaseLayer,
							        wrapDateLine: layer.wrapDateLine,
							        zoomOffset: layer.zoomOffset,
							        visibility: layerdesc.get("visible")
							    }
							);*/
							 return_layer = new ol.layer.Tile({
							 	visible: layerdesc.get("visible"),
							    source: new ol.source.TileWMS({
							      crossOrigin: 'anonymous',
							      params: {
							      	'LAYERS': layer.id,
							      	'VERSION': '1.1.0',
							      	'FORMAT': 'image/png'
							      },
							      url: layer.urls[0]
							    })
							  })
							break;

					};
					// for progress indicator
				   /* return_layer.events.register("loadstart", this, function() {
				      Communicator.mediator.trigger("progress:change", true);
				    });
				    return_layer.events.register("loadend", this, function() {
				      Communicator.mediator.trigger("progress:change", false);
				    });*/
					return return_layer;		
				},

				centerMap: function(data){
					this.map.getView().setCenter([data.x, data.y]);
					this.map.getView().setZoom(data.l);
				},

				changeLayer: function(options){
					if (options.isBaseLayer){
						globals.baseLayers.forEach(function(model, index) {
						    model.set("visible", false);
						});
						$.each(this.ol_baseLayers, function(index, layer) {
						    layer.setVisible(false);
						}); 
						globals.baseLayers.find(function(model) { return model.get('view').id == options.id; }).set("visible", true);
						this.ol_baseLayers[options.id].setVisible(true);
					}else{
						var product = globals.products.find(function(model) { return model.get('view').id == options.id; });
						if (product){
							product.set("visible", options.visible);
							this.ol_products[options.id].setVisible(options.visible);
						}else{
							globals.overlays.find(function(model) { return model.get('view').id == options.id; }).set("visible", options.visible);
							this.ol_overlays[options.id].setVisible(options.visible);
						}
						
						
					}
				},

				onSortProducts: function() {

					//TODO: Check if there is no other way to do this then 
					// removing and adding all layers, not happy with this
					// altough it does not seem to be slow on browser

					var that = this;
					$.each(this.ol_products, function(index, layer) {
					    that.map.removeLayer(layer);
					}, that); 

					$.each(this.ol_overlays, function(index, layer) {
					    that.map.removeLayer(layer);
					}, that); 

					_.each(globals.products.last(globals.products.length).reverse(), function(product){ 
						this.map.addLayer(this.ol_products[product.get('view').id]);
					}, this);

					_.each(globals.overlays.last(globals.overlays.length).reverse(), function(product){ 
						this.map.addLayer(this.ol_overlays[product.get('view').id]);
					}, this);

				    console.log("Map products sorted");
				},

				onUpdateOpacity: function(options) {
					this.ol_products[options.model.get('view').id].setOpacity(options.value);
					

				},

				onSelectionActivated: function(arg){
					if(arg.active){
						for(key in this.drawControls) {
		                    var control = this.drawControls[key];
		                    if(arg.id == key) {
		                        this.map.addInteraction(control);
		                    } else {
		                        this.map.removeInteraction(control);
		                        var features = this.source.getAllFeatures();
			                    for (var i in features){
			                    	this.source.removeFeature(features[i]);
			                    }
		                        Communicator.mediator.trigger("selection:changed", null);
		                    }
		                }
		            }else{
		            	for(key in this.drawControls) {
		                    var control = this.drawControls[key];
		                    this.map.removeInteraction(control);
		                    var features = this.source.getAllFeatures();
		                    for (var i in features){
		                    	this.source.removeFeature(features[i]);
		                    }
		                    Communicator.mediator.trigger("selection:changed", null);
	                    
	                	}	
		            }
				},

				onLoadGeoJSON: function (data) {

					 var old_features = this.source.getAllFeatures();
                    for (var i in old_features){
                    	this.source.removeFeature(old_features[i]);
                    }

					var vectorSource = new ol.source.GeoJSON({object:data});
					var features = vectorSource.getAllFeatures();
					var bounds;

		            if(features) {
		                for(var i=0; i<features.length; ++i) {
		                    if (!bounds) {
		                        bounds = features[i].getGeometry().getExtent();
		                    } else {
		                        bounds.extend(features[i].getGeometry().getExtent());
		                    }

		                }
		                this.source.addFeatures(features);
		                this.map.getView().fitExtent(bounds, this.map.getSize());
					}
				},

				onExportGeoJSON: function() {	
					var blob;	
					//var geojsonstring = this.geojson.write(this.vectorLayer.features, true);
					
					//var blob = new Blob([geojsonstring], {type: "text/plain;charset=utf-8"});
					//saveAs(blob, "selection.geojson");
				},
				
				onDone: function (evt) {
					// TODO: How to handle multiple draws etc has to be thought of
					// as well as what exactly is comunicated out
					Communicator.mediator.trigger("selection:changed", evt.feature.geometry);
				},

				onTimeChange: function (time) {

					var string = getISODateTimeString(time.start) + "/"+ getISODateTimeString(time.end);

					$.each(this.ol_products, function(index, layer) {
					    var params = layer.getSource().getParams();

					});

					globals.products.each(function(product) {
						if(product.get("timeSlider")){
							var params = this.ol_products[product.get('view').id].getSource().getParams();
							params['TIME'] = string;
							this.ol_products[product.get('view').id].getSource().updateParams(params);
						}
				     
				    }, this);

				},

				onGetGeoJSON: function () {
					return this.geojson.write(this.vectorLayer.features, true);
				}
			});
			return {"MapView":MapView};
	});


