console.log "'Allo from CoffeeScript!"

require.config({
    paths: {
        jquery: '../bower_components/jquery/jquery',
        openlayers: 'http://openlayers.org/api/OpenLayers',
        bootstrap: 'vendor/bootstrap'
    },
    shim: {
        bootstrap: {
            deps: ['jquery'],
            exports: 'jquery'
        }
    }
});

main = require ['jquery', 'openlayers'],() ->
  
    #$(".container").append("<div id='map_div'></div>")

    layerDefaults = {
      attribution: '&copy; EOX IT Services GmbH',
      url: [ 'http://a.maps.eox.at/tiles/wmts/','http://b.maps.eox.at/tiles/wmts/','http://c.maps.eox.at/tiles/wmts/','http://d.maps.eox.at/tiles/wmts/','http://e.maps.eox.at/tiles/wmts/' ],
      matrixSet: 'WGS84',
      style: 'default',
      format: 'image/png',
      resolutions: [ 0.70312500000000000000,0.35156250000000000000,0.17578125000000000000,0.08789062500000000000,0.04394531250000000000,0.02197265625000000000,0.01098632812500000000,0.00549316406250000000,0.00274658203125000000,0.00137329101562500000,0.00068664550781250000,0.00034332275390625000,0.00017166137695312500,0.00008583068847656250,0.00004291534423828120,0.00002145767211914060,0.00001072883605957030,0.00000536441802978516 ],
      maxExtent: new OpenLayers.Bounds(-180.000000,-90.000000,180.000000,90.000000),
      projection: new OpenLayers.Projection("EPSG:4326"),
      gutter: 0,
      buffer: 0,
      units: 'dd',
      transitionEffect: 'resize',
      isphericalMercator: false,
      isBaseLayer: false,
      wrapDateLine: true,
      zoomOffset: 0
    }

        
    bluemarble = new OpenLayers.Layer.WMTS(OpenLayers.Util.applyDefaults({ name: 'Blue Marble', layer: 'bluemarble_wgs84', isBaseLayer: true, attribution: 'BlueMarble { &copy; <a href="http://nasa.gov">NASA</a> }', }, layerDefaults));
    terrain = new OpenLayers.Layer.WMTS(OpenLayers.Util.applyDefaults({ name: 'Terrain', layer: 'terrain_wgs84', isBaseLayer: true, attribution: 'Terrain { GlobCover &copy; <a href="http://esa.int">ESA</a>, SRTM <a href="http://nasa.gov">NASA</a>, Rendering &copy EOX IT Services GmbH }' }, layerDefaults));

    #osm = new OpenLayers.Layer.OSM()
    map = new OpenLayers.Map 'map_div'
    map.addLayer(terrain)
    map.setCenter(new OpenLayers.LonLat(13.41,52.52), 5 )







