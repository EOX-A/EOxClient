define([
	'virtualglobeviewer/GlobWeb',
	'openlayers' // FIXXME: replace OpenLayers with generic format!
], function(GlobWeb, OpenLayers) {

	'use strict';

	function Globe(options) {
		this.canvas = $(options.canvas);

		if (!this.canvas) {
			alert('[Globe::constructor] Please define a canvas element!. Aborting Globe construction...')
			return;
		}

		this.globe = new GlobWeb.Globe({
			canvas: options.canvas,
			lighting: false,
			tileErrorTreshold: 3,
			continuousRendering: false,
			backgroundColor: [0, 0, 0, 0],
			// backgroundColor: [0.8, 0.8, 0.8, 1],
			shadersPath: "../bower_components/virtualglobeviewer/shaders/"
		});

		this.aoiLayer = undefined;
		this.layerCache = {};

		this.navigation = new GlobWeb.Navigation(this.globe, {
			inertia: true
		});

		// Add stats
		// var stats = new GlobWeb.Stats(globe, {
		// 	element: 'fps',
		// 	verbose: false
		// });

		// var osmLayer = new GlobWeb.OSMLayer({
		// 	baseUrl: "http://tile.openstreetmap.org"
		// });
		// globe.setBaseImagery(osmLayer);

		// var blueMarbleLayer = new GlobWeb.WMSLayer({
		// 	baseUrl: "http://demonstrator.telespazio.com/wmspub",
		// 	layers: "BlueMarble",
		// 	opacity: 0.1
		// });
		// this.globe.setBaseImagery(blueMarbleLayer);
	};

	var convertFromOpenLayers = function(ol_geometry, altitude) {
		var verts = ol_geometry.getVertices();

		var coordinates = [];
		for (var idx = 0; idx < verts.length; ++idx) {
			var p = [];

			p.push(verts[idx].x);
			p.push(verts[idx].y);
			p.push(altitude);

			coordinates.push(p);
		}
		var p = [];

		p.push(verts[0].x);
		p.push(verts[0].y);
		p.push(altitude);
		coordinates.push(p);

		return coordinates;
	};

	Globe.prototype.addAreaOfInterest = function(geojson) {
		if (!this.aoiLayer) {
			this.aoiLayer = new GlobWeb.VectorLayer({
				style: style,
				opacity: 1
			});
			this.globe.addLayer(this.aoiLayer);
		}

		if (geojson) {
			var style = new GlobWeb.FeatureStyle({
				fillColor: [1, 0.5, 0.1, 0.5],
				strokeColor: [1, 0.5, 0.1, 1],
				extrude: true,
				fill: true
			});

			var altitude = 30000;
			var coordinates = convertFromOpenLayers(geojson, altitude);

			var selection0 = {
				"geometry": {
					"type": "Polygon",
					"coordinates": coordinates
				},
				"properties": {
					"style": style
				}
			};

			this.aoiLayer.addFeature(selection0);
		}
	};

	Globe.prototype.addProduct = function(model, isBaseLayer) {
		var layerDesc = this.layerCache[model.get('name')];
		var layer = undefined;

		if (typeof layerDesc === 'undefined') {
			if (model.get('view').protocol === 'WMTS') {
				layer = new GlobWeb.WMTSLayer({
					baseUrl: model.get('view').urls[0],
					style: model.get('view').style,
					layer: model.get('view').id,
					format: model.get('view').format,
					matrixSet: model.get('view').matrixSet,
					time: model.get('time'), // Note: time is only defined on compatible products
					transparent: "true"
				});
			} else if (model.get('view').protocol === 'WMS') {
				layer = new GlobWeb.WMSLayer({
					baseUrl: model.get('view').urls[0],
					layers: model.get('view').id,
					time: model.get('time'), // Note: time is only defined on compatible products
					transparent: "true"
				});
			}

			// Register the layer to the internal cache for removal or for changing the timespan later on:
			this.layerCache[model.get('name')] = {
				productName: model.get('name'),
				layer: layer,
				timeSupport: (model.get('time')) ? true : false,
				isBaseLayer: isBaseLayer
			}

			console.log('[Globe.selectProduct] added product "' + model.get('name') + '" to the cache.');
		} else {
			layer = layerDesc.layer;
			console.log('[Globe.selectProduct] retrieved product "' + model.get('name') + '" from the cache.');
		}

		if (isBaseLayer) {
			this.globe.setBaseImagery(layer);
		} else {
			this.globe.addLayer(layer);
		}
	};

	Globe.prototype.getLayerDescFromCache = function(layer_name) {
		// body...
	};

	Globe.prototype.removeProduct = function(model, isBaseLayer) {
		console.log('removeProduct: ' + model.get('name'));

		if (isBaseLayer) {
			this.globe.setBaseImagery(null);
		} else {
			var desc = this.getLayerDescFromCache(model.get('name'));
			this.globe.removeLayer(desc.layer);
		}
	};

	Globe.prototype.setTimeSpanOnLayers = function(newTimeSpan) {
		var updated_layer_descs = [];

		_.each(this.layerCache, function(layerDesc, name) {
			if (layerDesc.timeSupport) {
				var isotimespan = getISODateTimeString(newTimeSpan.start) + '/' + getISODateTimeString(newTimeSpan.end);
				layerDesc.layer.setTime(isotimespan);
				updated_layer_descs.push(layerDesc);
				//console.log('[Globe.setTimeSpanOnLayers] setting new timespan on "' + layerDesc.productName + '": ' + isotimespan);
			}
		});

		_.each(updated_layer_descs, function(desc, idx) {
			if (desc.isBaseLayer) {
				this.globe.setBaseImagery(desc.layer);
			} else {
				// FIXXME: is there an update() functionality somewhere?
				this.globe.removeLayer(desc.layer);
				this.globe.addLayer(desc.layer);
			}
		}.bind(this));
	};

	Globe.prototype.updateViewport = function() {
		// FIXXME: the height/width has to be set explicitly after setting the
		// the new css class. Why?
		this.globe.renderContext.canvas.width = this.canvas.width();
		this.globe.renderContext.canvas.height = this.canvas.height();

		// Adjust the globe's aspect ration and redraw:
		this.globe.renderContext.updateViewDependentProperties();
		this.globe.refresh();
	};

	Globe.prototype.zoomTo = function(pos) {
		this.navigation.zoomTo(pos.center, pos.distance, pos.duration, pos.tilt);
	};

	return Globe;
});



// var elevationLayer = new GlobWeb.WCSElevationLayer({
// 	baseUrl: "http://demonstrator.telespazio.com/wcspub",
// 	coverage: "GTOPO",
// 	version: "1.0.0"
// });
// globe.setBaseElevation(elevationLayer);


// var test_aoi = new TestAreaOfInterestRenderer(globe);
// test_aoi.run();

// TODO: refactor Tests to a more appropriate location!
//var test_selectiontool = new TestSelectionTool(App, globe, navigation);
//test_selectiontool.run();

// var atmosphere = new GlobWeb.AtmosphereLayer({
// 	visible: true,
// 	exposure: 1.4
// });
// globe.addLayer(atmosphere);

//globe.addLayer(new GlobWeb.EquatorialGridLayer({}));
//globe.addLayer(new GlobWeb.TileWireframeLayer());

// Add some vector layer
// $.ajax({
// 	url: "europe.json",
// 	success: function(data) {
// 		var vectorLayer = new GlobWeb.VectorLayer();
// 		vectorLayer.addFeatureCollection(data);
// 		globe.addLayer(vectorLayer);
// 		console.log("added vectorlayer");
// 	},
// 	error: function() {
// 		console.log("error");
// 	}
// });

// var effectLayer = new GlobWeb.EffectLayer();
// globe.addLayer(effectLayer);

// var effect_desc = {};
// effect_desc.id = "overlay_triangle";

// var vertexShader = "\
// 	attribute vec3 vertex;\n\
// 	attribute vec4 color;\n\
// 	varying vec4 vColor;\n\
//           uniform mat4 viewProjectionMatrix;\n\
//           void main(void) {\n\
//               gl_Position = viewProjectionMatrix * vec4(vertex, 1.0);\n\
//               /*gl_Position = vec4(vertex, 1.0);*/\n\
// 		vColor = color;\n\
//           }\n\
//           ";

// var fragmentShader = "\
//           precision mediump float;\n\
//           varying vec4 vColor;\n\
//           void main(void) {\n\
//               gl_FragColor = vColor;\n\
//           }\n\
//           ";

// effect_desc.program = new GlobWeb.Program(globe.renderContext);
// effect_desc.program.createFromSource(vertexShader, fragmentShader);

// effect_desc.mesh = new Mesh(globe.renderContext);

// // var vertices = [0.0, 0.5, 0.0, -0.5, -0.5, 0.0,
// // 0.5, -0.5, 0.0, 0.5, 0.5, 0.0];
// var vertices = [-1.5, -1.5, 0.0,
// 1.5, -1.5, 0.0, 0.0, 1.5, 0.0];
// var indices = [0, 1, 2];
// var colors = [0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0];
// effect_desc.mesh.setVertices(vertices);
// effect_desc.mesh.setIndices(indices);
// effect_desc.mesh.setColors(colors);

// effectLayer.addEffect(effect_desc);

// var geo = [47.070761, 15.439498, 100],
// 	dest = [];
// CoordinateSystem.fromGeoTo3D(geo, dest)
// console.log("Worldcoordinates:");
// console.dir(dest);



// var style = new GlobWeb.FeatureStyle({
// 	iconUrl: null,
// 	//icon: Text.generateImageData("Coucou!"),
// 	pointMaxSize: 4000,
// 	radius: 10,
// 	renderer: "pulsar"
// });

// var layer = new GlobWeb.VectorLayer({
// 	style: style
// });
// globe.addLayer(layer);

// // var geo = [47, 15, 600];
// // var dest = CoordinateSystem.fromGeoTo3D(geo);
// // console.log("test: ");
// // console.dir(dest);

// var geoJSON = {
// 	"type": "Feature",
// 	"geometry": {
// 		"type": "Point",
// 		"coordinates": [15.439498, 47.070761]
// 	}
// }
// layer.addFeature(geoJSON);
// layer.animate(0, 4);

// var canvas = this.el;
// var poi;
// canvas.onclick = function(event) {
// 	//if (poi) layer.removeFeature(poi);

// 	var pos = globe.renderContext.getXYRelativeToCanvas(event);
// 	var lonlat = globe.getLonLatFromPixel(pos[0], pos[1]);
// 	poi = {
// 		geometry: {
// 			type: "Point",
// 			coordinates: lonlat
// 		}
// 	};
// 	layer.addFeature(poi);
// };