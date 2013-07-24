(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'backbone.marionette'
	],

	function( Backbone, Communicator ) {

		var DialogRegion = Backbone.Marionette.Region.extend({

            constructor: function(){
		      _.bindAll(this);
		      Backbone.Marionette.Region.prototype.constructor.apply(this, arguments);
		      this.on("show", this.showModal, this);
		    },
		 
		    getEl: function(selector){
		      var $el = $(selector);
		      $el.on("hidden", this.close);
		      return $el;
		    },
		 
		    showModal: function(view){
		      view.on("close", this.hideModal, this);
		      view.$el.modal('show');
		    },
		 
		    hideModal: function(){
		      //$el.modal('hide');
		    }

		});
		return DialogRegion;
	});

}).call( this );