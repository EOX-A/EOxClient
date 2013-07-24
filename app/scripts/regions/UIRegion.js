(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'backbone.marionette'
	],

	function( Backbone, Communicator ) {

		var UIRegion = Backbone.Marionette.Region.extend({

            constructor: function(){
		    },
		 
		    onShow: function(view){
		    	view.$('.close').on("click", _.bind(this.onClose, this));
		    },

		    onClose: function(){
		    	this.close();
		    }

		});
		return UIRegion;
	});

}).call( this );