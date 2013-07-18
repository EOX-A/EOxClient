

(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone'
	],

	function( Backbone ) { // initializer

		var LayerModel = Backbone.Model.extend({
			name: '',
			id : '',
			urls : [],
			protocol: "",
			attribution: '',
			matrixSet: '',
			style: 'default',
			format: '',
			resolutions: [],
			maxExtent: [],
			projection: '',
			gutter: null,
			buffer: null,
			units: '',
			transitionEffect: '',
			isphericalMercator: null,
			isBaseLayer: null,
			wrapDateLine: null,
			zoomOffset: null
		});

		return LayerModel;
	});

	

}).call( this );
