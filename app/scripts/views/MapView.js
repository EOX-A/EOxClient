

define(['backbone',
		'communicator',
		'globals',
		'openlayers'],
		function( Backbone, Communicator, globals ) {

			//my_template_html = '<div id="<%= args.id %>" style="width:100%;height:100%"></div>';
			var MapView = Backbone.View.extend({

				render: function() {

					console.log(globals.baseLayers.at(0).get("id") + "  "  + globals.baseLayers.at(0).get("urls")[0].url);

					var wmts = new OpenLayers.Layer.WMTS({
					    name: globals.baseLayers.at(0).get("id"),
					    url: globals.baseLayers.at(0).get("urls")[0].url,
					    layer: globals.baseLayers.at(0).get("id"),
					    style: "default",
					    matrixSet: "WGS84",
					    style: 'default',
      				format: 'image/png'
					});

	   			map = new OpenLayers.Map("map");
			    map.addLayer(wmts);
			    map.setCenter(new OpenLayers.LonLat(13.41,52.52), 5 );
			    return this;

				}
			});

			return MapView;
	});


