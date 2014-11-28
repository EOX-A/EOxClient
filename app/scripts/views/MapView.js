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

					var mousePositionControl = new ol.control.MousePosition({
						coordinateFormat: ol.coordinate.createStringXY(4),
						projection: 'EPSG:4326',
						undefinedHTML: '&nbsp;'
					});

					this.geojson_format = new ol.format.GeoJSON();

					//this.tileManager = new ol.TileManager();
					this.map = new ol.Map({
						controls: ol.control.defaults().extend([mousePositionControl]),
						renderer: 'canvas',
						  target: 'map',
						  //maxResolution: resolutions[1],
						  view: new ol.View({
						    center: [9, 45],
						    zoom: 6,
						    projection: ol.proj.get('EPSG:4326')
						  }),
						
						//tileManager: this.tileManager
					});

					console.log("Created Map");

					//listen to moeveend event in order to keep router uptodate
					var self = this;
					this.map.on("moveend", function(evt) {
						var view = evt.map.getView();
						var center = view.getCenter();
			            Communicator.mediator.trigger("router:setUrl", { x: center[0], y: center[1], l: view.getZoom()});
			        	Communicator.mediator.trigger("map:position:change", self.onGetMapExtent());
					});

					this.listenTo(Communicator.mediator, "map:center", this.centerMap);
					this.listenTo(Communicator.mediator, "map:layer:change", this.changeLayer);
					this.listenTo(Communicator.mediator, 'map:set:extent', this.onSetExtent);
					this.listenTo(Communicator.mediator, "productCollection:sortUpdated", this.onSortProducts);
					this.listenTo(Communicator.mediator, "productCollection:updateOpacity", this.onUpdateOpacity);
					this.listenTo(Communicator.mediator, "selection:activated", this.onSelectionActivated);
					this.listenTo(Communicator.mediator, "map:load:geojson", this.onLoadGeoJSON);
					this.listenTo(Communicator.mediator, "map:export:geojson", this.onExportGeoJSON);
					this.listenTo(Communicator.mediator, 'time:change', this.onTimeChange);

					Communicator.reqres.setHandler('map:get:extent', _.bind(this.onGetMapExtent, this));
					Communicator.reqres.setHandler('get:selection:json', _.bind(this.onGetGeoJSON, this));

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

					this.source.on("change", this.onDone);

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
	                	this.boxstart = evt.coordinate;
	                }, this);

	                this.drawControls.bboxSelection.on('boxend', function(evt){
	                	var boxend = evt.coordinate;
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
					this.baseLayerGroup = new ol.layer.Group({
						layers: globals.baseLayers.map(function(baselayer) {
							return this.createLayer(baselayer);
						}, this)
					});

					this.map.addLayer(this.baseLayerGroup);

					// Go through all products and add them to the map
					this.productLayerGroup = new ol.layer.Group({
						layers: globals.products.map(function(product) {
							return this.createLayer(product);
						}, this)
					});

					this.map.addLayer(this.productLayerGroup);

					// if the product is visible, raise an event
					globals.products.each(function(product) {
						if(product.get("visible")){
							var options = { id: product.get('view').id, isBaseLayer: false, visible: true };
							Communicator.mediator.trigger('map:layer:change', options);
						}
					});

					// Go through all products and add them to the map
					this.overlayLayerGroup = new ol.layer.Group({
					 	layers: globals.overlays.map(function(overlay){
							return this.createLayer(overlay);
						}, this)
					 });

					this.map.addLayer(this.overlayLayerGroup);

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


				    // Remove attribution classes (hack to have our own styling)
				    $('.ol-attribution').attr('class', 'ol-attribution');

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
							return_layer = new ol.layer.Tile({
						      visible: layerdesc.get("visible"),
						      source: new ol.source.WMTS({
						        urls: layer.urls,
						        layer: layer.id,
						        matrixSet: layer.matrixSet,
						        format: layer.format,
						        projection: layer.projection,
						        tileGrid: new ol.tilegrid.WMTS({
							        origin: ol.extent.getTopLeft(projectionExtent),
							        resolutions: resolutions,
							        matrixIds: matrixIds
						        }),
						        style: layer.style,
						        attributions: [
								    new ol.Attribution({
								      html: layer.attribution
								  	})
								  ],
						      })
						    })
							break;

						case "WMS":
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
							    }),
							    attribution: layer.attribution,
							  })
							break;

					};
					if (return_layer) {
						return_layer.id = layer.id;
					}
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
					console.log(data);
					this.map.getView().setCenter([parseFloat(data.x), parseFloat(data.y)]);
					this.map.getView().setZoom(parseInt(data.l));
				},

				changeLayer: function(options){
					if (options.isBaseLayer){
						globals.baseLayers.forEach(function(model, index) {
							if (model.get("view").id == options.id)
								model.set("visible", true)
							else 
						    	model.set("visible", false);
						});
						this.baseLayerGroup.getLayers().forEach(function(layer) {
							if (layer.id == options.id)
								layer.setVisible(true);
							else
						    	layer.setVisible(false);
						});
					}else{
						var product = globals.products.find(function(model) { return model.get('view').id == options.id; });
						if (product){
							product.set("visible", options.visible);
							this.productLayerGroup.getLayers().forEach(function(layer) {
								if (layer.id == options.id) {
									layer.setVisible(options.visible);
								}
							});
						}else{
							globals.overlays.find(function(model) { 
								return model.get('view').id == options.id;
							}).set("visible", options.visible);
							this.overlayLayerGroup.getLayers().forEach(function(layer) {
								if (layer.id == options.id) {
									layer.setVisible(options.visible);
								}
							});
						}
					}
				},

				onSortProducts: function() {
					var layers = this.productLayerGroup.getLayers();

					// prepare an index lookup hash
					var indices = {};
					globals.products.each(function(product, index) {
						indices[product.get("view").id] = globals.products.length - (index + 1);
					});
					// sort the layers by the prepared indices
					var sorted = _.sortBy(layers.getArray(), function(layer) {
						return indices[layer.id];
					});

					this.productLayerGroup.setLayers(new ol.Collection(sorted));
				    console.log("Map products sorted");
				},

				onUpdateOpacity: function(options) {
					var id = options.model.get('view').id;
					this.productLayerGroup.getLayers().forEach(function(layer) {
						if (layer.id == id) {
							layer.setOpacity(options.value);
						}
					});
				},

				onSelectionActivated: function(arg){
					if(arg.active){
						for(key in this.drawControls) {
		                    var control = this.drawControls[key];
		                    if(arg.id == key) {
		                        this.map.addInteraction(control);
		                    } else {
		                        this.map.removeInteraction(control);
		                        var features = this.source.getFeatures();
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
		                    var features = this.source.getFeatures();
		                    for (var i in features){
		                    	this.source.removeFeature(features[i]);
		                    }
		                    Communicator.mediator.trigger("selection:changed", null);
	                    
	                	}	
		            }
				},

				onLoadGeoJSON: function (data) {

					 var old_features = this.source.getFeatures();
                    for (var i in old_features){
                    	this.source.removeFeature(old_features[i]);
                    }

					var vectorSource = new ol.source.GeoJSON({object:data});
					var features = vectorSource.getFeatures();
					var bounds;

		            if(features) {
		                if(features.constructor != Array) {
		                    features = [features];
		                }
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

					var features = this.vector.getSource().getFeatures();
					var geojson_string = JSON.stringify(this.geojson_format.writeFeatures(features));
					
					//var geojsonstring = this.geojson.write(this.vectorLayer.features, true);
					
					var blob = new Blob([geojson_string], {type: "text/plain;charset=utf-8"});
					saveAs(blob, "selection.geojson");
				},


				onGetGeoJSON: function () {
					var features = this.vector.getSource().getFeatures();
					var geojson = this.geojson_format.writeFeatures(features);

					return geojson;
				},

				onGetMapExtent: function(){
					var ext_arr = this.map.getView().calculateExtent(this.map.getSize());
					var extent = {
						left: ext_arr[0],
						bottom: ext_arr[1],
						right: ext_arr[2],
						top: ext_arr[3]
					};
					return extent;
				},

				onSetExtent: function(extent){
					this.map.getView().fitExtent(extent, this.map.getSize());
				},
				
				onDone: function (evt) {
					// TODO: How to handle multiple draws etc has to be thought of
					// as well as what exactly is comunicated out
					var feature =  evt.target.getFeatures().pop();
					var geometry = null;
					if(feature)
						geometry = feature.getGeometry();
					Communicator.mediator.trigger("selection:changed", geometry);
				},

				onTimeChange: function (time) {
					// TODO: for WMTS REST style URLs this needs to be separated by '--'
					var string = getISODateTimeString(time.start) + "/"+ getISODateTimeString(time.end);
					globals.products.each(function(product) {
						if (product.get("timeSlider")){
							var id = product.get('view').id
							this.productLayerGroup.getLayers().forEach(function(layer) {
								if (layer.id == id) {
									if (product.get("view").protocol == "WMS")
										layer.getSource().updateParams({"TIME": string});
									else if (product.get("view").protocol == "WMTS")
										layer.getSource().updateDimensions({"TIME": string});
								}
							});
						}
				     
				    }, this);

				}
			});
			return {"MapView":MapView};
	});


