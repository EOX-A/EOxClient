

(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone'
	],

	function( Backbone ) { // initializer

		var LayerModel = Backbone.Model.extend({
			id : "",
			urls : []
		});

		return LayerModel;
	});

	

}).call( this );
