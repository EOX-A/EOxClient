(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/LayerControl',
		'underscore'
	],

	function( Backbone, Communicator, LayerControlTmpl ) {

		var LayerControlLayout = Backbone.Marionette.Layout.extend({

			template: {type: 'handlebars', template: LayerControlTmpl},
			regions: {baseLayers: "#baseLayers", products: "#products"},
			className: "well",

			initialize: function(options) {
			},

			onShow: function(view){
		    	this.$('.close').on("click", _.bind(this.onClose, this));
		    },

			onClose: function() {
				console.log("Layer close triggered");
				this.close();
			}

		});

		return LayerControlLayout;

	});

}).call( this );