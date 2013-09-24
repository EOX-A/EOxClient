(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'underscore'
	],

	function( Backbone, Communicator, UIElementTmpl ) {

		var BaseLayerSelectionView = Backbone.Marionette.CollectionView.extend({

			tagName: "ul",
			className: "radio",

			initialize: function(options) {
			},
			
			onShow: function(view){
			}

		});

		return {'BaseLayerSelectionView':BaseLayerSelectionView};

	});

}).call( this );