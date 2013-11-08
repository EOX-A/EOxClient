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
			regions: {
				baseLayers: "#baseLayers",
				products: "#products",
				overlays: "#overlays"
			},
			className: "panel panel-default layercontrol not-selectable",
			events: {},

			initialize: function(options) {
			},

			onShow: function(view){
		    	this.$('.close').on("click", _.bind(this.onClose, this));
		    	this.$el.draggable({
		    		handle: '.panel-heading',
		    		containment: "#content" ,
		    		scroll: false,
		    		start: function(event, ui) {
						$( ".ui-slider" ).detach();
						$('.fa-adjust').toggleClass('active')
						$('.fa-adjust').popover('hide');
					},
		    	});
		    },

			onClose: function() {
				this.close();
			}

		});

		return LayerControlLayout;

	});

}).call( this );
