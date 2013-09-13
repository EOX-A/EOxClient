(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'underscore'
	],

	function( Backbone, Communicator ) {

		var ContentView = Backbone.Marionette.ItemView.extend({

			initialize: function(options) {
				/*_.bindAll(this);
				//this.listenTo(Communicator.mediator, "dialog:open:about", this.onDialogOpenAbout);
				this.$el.on("hide", this.onClose);
				this.listenTo(this.$el, "hidden", this.onClose)*/
			},

			/*getEl: function(selector){
		      var $el = $('.modal');
		      $el.on("hidden", this.onClose);
		      return $el;
		    },

			onClose: function(event){
				console.log("ContentView: Close event triggered");
			},

			onDialogOpenAbout: function(){
				alert("dialog open event reached View");
			}*/


		});


		/*Communicator.mediator.on("dialog:open:about", function(){
		  alert("dialog open event reached View");
		});*/



		return {"ContentView":ContentView};

	});

}).call( this );