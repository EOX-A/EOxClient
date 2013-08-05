(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/UIElement',
		'underscore'
	],

	function( Backbone, Communicator, UIElementTmpl ) {

		var LayerSelectionView = Backbone.Marionette.CollectionView.extend({

			//template: {type: 'handlebars', template: UIElementTmpl},

			initialize: function(options) {

			}

		});

		return LayerSelectionView;

	});

}).call( this );