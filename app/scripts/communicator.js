(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'backbone.marionette'
	],
	function( Backbone ) {

		var Communicator = Backbone.Marionette.Controller.extend({
			initialize: function( options ) {

				// create a pub sub
				this.mediator = new Backbone.Wreqr.EventAggregator();

				// Allow of logging all events when debug activated
				this.mediator.on("all", function(event){
					console.log(event);
				});

				//create a req/res
				this.reqres = new Backbone.Wreqr.RequestResponse();

				// create commands
				this.command = new Backbone.Wreqr.Commands();

				this.on('all')
			}
		});

		return new Communicator();
	});
}).call( this );