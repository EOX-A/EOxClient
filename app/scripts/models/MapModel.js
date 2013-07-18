

(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator'
	],

	function( Backbone, Communicator ) {

		var MapModel = Backbone.Model.extend({
			visualizationTools : []
		});

		return MapModel;

	});

}).call( this );