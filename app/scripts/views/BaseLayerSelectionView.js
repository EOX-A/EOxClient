(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'underscore'
	],

	function( Backbone, Communicator, UIElementTmpl ) {

		var LayerSelectionView = Backbone.Marionette.CollectionView.extend({

			tagName: "ul",

			initialize: function(options) {
			},
			onShow: function(view){
			}

		});

		return LayerSelectionView;

	});

}).call( this );