

define(['backbone',
		'communicator',
		'globals',
		'openlayers',
		'models/MapModel'],
		function( Backbone, Communicator, globals ) {

			var MapView = Backbone.View.extend({

				render: function() {
					this.map = new OpenLayers.Map("map");
					console.log("Created Map");

					//listen to moeveend event in order to keep router uptodate
					this.map.events.register("moveend", this.map, function(data) {
			            Communicator.mediator.trigger("Router:SetUrl", { x: data.object.center.lon, y: data.object.center.lat, l: data.object.zoom});
			        });

					this.listenTo(Communicator.mediator, "Map:CenterAtLatLongAndZoom", this.centerMap);
					this.listenTo(Communicator.mediator, "Map:ChangeBaseLayer", this.changeBaseLayer);

					//Go through all defined baselayer and add them to the map
					globals.baseLayers.each(function(baselayer) {
						this.map.addLayer(this.createLayer(baselayer));
					}, this);

					// Go through all products and add them to the map
					globals.products.each(function(product){
						this.map.addLayer(this.createLayer(product));
					}, this);

					//Set attributes of map based on mapmodel attributes
				    var mapmodel = globals.objects.get('mapmodel');
				    this.map.setCenter(new OpenLayers.LonLat(mapmodel.get("center")), mapmodel.get("zoom") );
				    return this;
				},
				//method to create layer depending on protocol
				//setting possible description attributes
				createLayer: function (layer) {
					var return_layer = null;

					switch(layer.get("protocol")){
						case "WMTS":
							return_layer = new OpenLayers.Layer.WMTS({
								name: layer.get("name"),
						        layer: layer.get("id"),
						        protocol: layer.get("protocol"),
						        url: layer.get("urls"),
						        matrixSet: layer.get("matrixSet"),
						        style: layer.get("style"),
						        format: layer.get("format"),
						        maxExtent: layer.get("maxExtent"),
						        resolutions: layer.get("resolutions"),
						        projection: layer.get("projection"),
						        gutter: layer.get("gutter"),
						        buffer: layer.get("buffer"),
						        units: layer.get("units"),
						        transitionEffect: layer.get("transitionEffect"),
						        isphericalMercator: layer.get("isphericalMercator"),
						        isBaseLayer: layer.get("isBaseLayer"),
						        wrapDateLine: layer.get("wrapDateLine"),
						        zoomOffset: layer.get("zoomOffset"),
						        visible: layer.get("visible"),
						        time: layer.get("time")
							});
							break;
						case "WMS":
						return_layer = new OpenLayers.Layer.WMS(
								layer.get("name"),
						        layer.get("urls")[0],
						        {
						        	layers: layer.get("id"),
						        	transparent: "true",
        							format: "image/png",
        							time: layer.get("time")
						    	},
						        {
						        	format: 'image/png',
							        matrixSet: layer.get("matrixSet"),
							        style: layer.get("style"),
							        format: layer.get("format"),
							        maxExtent: layer.get("maxExtent"),
							        resolutions: layer.get("resolutions"),
							        projection: layer.get("projection"),
							        gutter: layer.get("gutter"),
							        buffer: layer.get("buffer"),
							        units: layer.get("units"),
							        transitionEffect: layer.get("transitionEffect"),
							        isphericalMercator: layer.get("isphericalMercator"),
							        isBaseLayer: layer.get("isBaseLayer"),
							        wrapDateLine: layer.get("wrapDateLine"),
							        zoomOffset: layer.get("zoomOffset"),
							        visibility: layer.get("visible")
							    }
							);
							break;

					};
					return return_layer;		
				},

				centerMap: function(data){
					this.map.setCenter(new OpenLayers.LonLat(data.x, data.y), data.l );
				},

				changeBaseLayer: function(options){
					if (options.isBaseLayer){
						globals.baseLayers.forEach(function(model, index) {
						    model.set("visible", false);
						});
						globals.baseLayers.find(function(model) { return model.get('name') == options.name; }).set("visible", true);
						this.map.setBaseLayer(this.map.getLayersByName(options.name)[0]);
					}else{
						this.map.getLayersByName(options.name)[0].setVisibility(options.visible);
					}
				}
			});
			return MapView;
	});


