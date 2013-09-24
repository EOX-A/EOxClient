(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'underscore'
	],

	function( Backbone, Communicator ) {

		var ContentView = Backbone.Marionette.ItemView.extend({

			initialize: function(options) {
			},

		});

		return {"ContentView":ContentView};

	});

}).call( this );