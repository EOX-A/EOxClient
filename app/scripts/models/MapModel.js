

(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator'
	],

	function( Backbone, Communicator ) {

		var MapModel = Backbone.Model.extend({
			visualizationLibs : [],
			center: [],
			zoom: 0
		});

		return {"MapModel":MapModel};

	});

}).call( this );