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
			className: "panel panel-default toolcontrol not-selectable",

			initialize: function(options) {
			},

			onShow: function(view){
		    	this.$('.close').on("click", _.bind(this.onClose, this));
		    	this.$el.draggable({ 
		    		containment: "#content",
		    		scroll: false,
		    		handle: '.panel-heading'
	    		});
		    },

			onClose: function() {
				this.close();
			}

		});

		return ToolControlLayout;

	});

}).call( this );
