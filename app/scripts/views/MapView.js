

define(['backbone',
		'communicator',
		'globals',
		'openlayers',
		'models/MapModel',
		'FileSaver'
		],
		function( Backbone, Communicator, globals ) {

			var MapView = Backbone.View.extend({
				
				onShow: function() {
					this.map = new OpenLayers.Map({div: "map", fallThrough: true});
					console.log("Created Map");

					//listen to moeveend event in order to keep router uptodate
					this.map.events.register("moveend", this.map, function(data) {
			            Communicator.mediator.trigger("router:setUrl", { x: data.object.center.lon, y: data.object.center.lat, l: data.object.zoom});
			        });

					this.listenTo(Communicator.mediator, "map:center", this.centerMap);
					this.listenTo(Communicator.mediator, "map:layer:change", this.changeLayer);
					this.listenTo(Communicator.mediator, "productCollection:sortUpdated", this.onSortProducts);
					this.listenTo(Communicator.mediator, "selection:activated", this.onSelectionActivated);
					this.listenTo(Communicator.mediator, "map:load:geojson", this.onLoadGeoJSON);
					this.listenTo(Communicator.mediator, "map:export:geojson", this.onExportGeoJSON);

					// Add layers for different selection methods
					this.pointLayer = new OpenLayers.Layer.Vector("Point Layer");
	                this.lineLayer = new OpenLayers.Layer.Vector("Line Layer");
	                this.polygonLayer = new OpenLayers.Layer.Vector("Polygon Layer");
	                this.boxLayer = new OpenLayers.Layer.Vector("Box layer");

	                this.map.addLayers([this.pointLayer, this.lineLayer, this.polygonLayer, this.boxLayer]);
	                this.map.addControl(new OpenLayers.Control.MousePosition());

	                this.drawControls = {
	                    pointSelection: new OpenLayers.Control.DrawFeature(this.pointLayer,
	                        OpenLayers.Handler.Point),
	                    lineSelection: new OpenLayers.Control.DrawFeature(this.lineLayer,
	                        OpenLayers.Handler.Path),
	                    polygonSelection: new OpenLayers.Control.DrawFeature(this.polygonLayer,
	                        OpenLayers.Handler.Polygon),
	                    bboxSelection: new OpenLayers.Control.DrawFeature(this.boxLayer,
	                        OpenLayers.Handler.RegularPolygon, {
	                            handlerOptions: {
	                                sides: 4,
	                                irregular: true
	                            }
	                        }
	                    )
	                };

	                for(var key in this.drawControls) {
	                    this.map.addControl(this.drawControls[key]);
	                    this.drawControls[key].events.register("featureadded",'', this.onDone);
	                }

					//Go through all defined baselayer and add them to the map
					globals.baseLayers.each(function(baselayer) {
						this.map.addLayer(this.createLayer(baselayer));
					}, this);

					// Go through all products and add them to the map
					globals.products.each(function(product){
						this.map.addLayer(this.createLayer(product));
					}, this);

					// Order (sort) the product layers based on collection order
					this.onSortProducts();

					// Openlayers format readers for loading geojson selections
					var io_options = {
		                'internalProjection': this.map.baseLayer.projection,
		                'externalProjection': new OpenLayers.Projection('EPSG:4326')
		            }; 

					this.geojson = new OpenLayers.Format.GeoJSON(io_options);


					//Set attributes of map based on mapmodel attributes
				    var mapmodel = globals.objects.get('mapmodel');
				    this.map.setCenter(new OpenLayers.LonLat(mapmodel.get("center")), mapmodel.get("zoom") );
				    return this;
				},
				//method to create layer depending on protocol
				//setting possible description attributes
				createLayer: function (layerdesc) {
					var return_layer = null;
					var layer = layerdesc.get('view');

					switch(layer.protocol){
						case "WMTS":
							return_layer = new OpenLayers.Layer.WMTS({
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
						        time: layer.time
							});
							break;

						case "WMS":
						return_layer = new OpenLayers.Layer.WMS(
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
							        visibility: layerdesc.get("visible"),
							    }
							);
							break;

					};
					return return_layer;		
				},

				centerMap: function(data){
					this.map.setCenter(new OpenLayers.LonLat(data.x, data.y), data.l );
				},

				changeLayer: function(options){
					if (options.isBaseLayer){
						globals.baseLayers.forEach(function(model, index) {
						    model.set("visible", false);
						});
						globals.baseLayers.find(function(model) { return model.get('name') == options.name; }).set("visible", true);
						this.map.setBaseLayer(this.map.getLayersByName(options.name)[0]);
					}else{
						globals.products.find(function(model) { return model.get('name') == options.name; }).set("visible", options.visible);
						this.map.getLayersByName(options.name)[0].setVisibility(options.visible);
					}
				},

				onSortProducts: function(productLayers) {
				    globals.products.each(function(product) {
				      var productLayer = this.map.getLayersByName(product.get("name"))[0];
				      var index = globals.products.indexOf(productLayer);
				      this.map.setLayerIndex(productLayer, index);
				    }, this);
				    console.log("Map products sorted");
				},

				onSelectionActivated: function(arg){
					if(arg.active){
						for(key in this.drawControls) {
		                    var control = this.drawControls[key];
		                    if(arg.id == key) {
		                        control.activate();
		                    } else {
		                    	control.layer.removeAllFeatures();
		                        control.deactivate();
		                        Communicator.mediator.trigger("selection:changed", null);
		                    }
		                }
		            }else{
		            	for(key in this.drawControls) {
		                    var control = this.drawControls[key];
		                    control.layer.removeAllFeatures();
		                    control.deactivate();
		                    Communicator.mediator.trigger("selection:changed", null);
	                    
	                	}	
		            }
				},

				onLoadGeoJSON: function (data) {
					var features = this.geojson.read(data);
					var bounds;
		            if(features) {
		                if(features.constructor != Array) {
		                    features = [features];
		                }
		                for(var i=0; i<features.length; ++i) {
		                    if (!bounds) {
		                        bounds = features[i].geometry.getBounds();
		                    } else {
		                        bounds.extend(features[i].geometry.getBounds());
		                    }

		                }
		                this.polygonLayer.addFeatures(features);
		                this.map.zoomToExtent(bounds);
					}
				},

				onExportGeoJSON: function() {
					var geojsonstring = [];
					var features = this.polygonLayer.features;

					_.each(features, function (feature) {
						geojsonstring.push(this.geojson.write(feature, true));
					},this);
					
					var blob = new Blob(geojsonstring, {type: "text/plain;charset=utf-8"});
					saveAs(blob, "selection.geojson");
				},
				
				onDone: function (evt) {
					// TODO: How to handle multiple draws etc has to be thought of
					// as well as what exactly is comunicated out
					Communicator.mediator.trigger("selection:changed", evt.feature.geometry);
				}
			});
			return {"MapView":MapView};
	});


