

(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone'
	],

	function( Backbone ) { // initializer

		var LayerModel = Backbone.Model.extend({
			name: '',
			timeSlider: false,
			time: null,
			view: {
				id : '',
				protocol: '',
				urls : [],

				visible: null,
				style: 'default',
				isBaseLayer: null,
				attribution: '',
				matrixSet: '',
				format: '',
				resolutions: [],
				maxExtent: [],
				projection: '',
				gutter: null,
				buffer: null,
				units: '',
				transitionEffect: '',
				isphericalMercator: null,
				wrapDateLine: null,
				zoomOffset: null,
			},

			download: {
				id : '',
				protocol: '',
				url : [],
			}
			
			
		});

		return {"LayerModel":LayerModel};
	});

	

}).call( this );
