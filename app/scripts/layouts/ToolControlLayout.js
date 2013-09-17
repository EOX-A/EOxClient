(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/ToolControl',
		'underscore'
	],

	function( Backbone, Communicator, ToolControlTmpl ) {

		var ToolControlLayout = Backbone.Marionette.Layout.extend({

			template: {type: 'handlebars', template: ToolControlTmpl},
			regions: {selection: "#selection", visualization: "#visualization"},
			className: "well toolcontrol",

			initialize: function(options) {
			},

			onShow: function(view){
		    	this.$('.close').on("click", _.bind(this.onClose, this));
		    	this.$el.draggable({ containment: "#content" , scroll: false});
		    },

			onClose: function() {
				console.log("Tools Control close triggered");
				this.close();
			}

		});

		return ToolControlLayout;

	});

}).call( this );