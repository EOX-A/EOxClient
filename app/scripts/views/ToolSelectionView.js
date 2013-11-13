(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'underscore'
	],

	function( Backbone, Communicator, UIElementTmpl ) {

		var ToolSelectionView = Backbone.Marionette.CollectionView.extend({

			tagName: "div",
			className: "btn-group-vertical",

			initialize: function(options) {
			},

			onShow: function(view){
			}

		});

		return {'ToolSelectionView':ToolSelectionView};

	});

}).call( this );
