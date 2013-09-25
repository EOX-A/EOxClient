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
			},

			registerEventHandler: function(eventid, handler) {
				// FIXXME: create a list of eventid to keep track!
				// this.eventlist.push(eventid);

				// Register a new handler for the given eventid.
				this.command.setHandler(eventid, handler);
				
				// Tell the mediator to call the above command handler if the
				// event is fired somewhere in the application, i.e. via the toolbar. 
				this.mediator.on(eventid, function() {
					this.command.execute(eventid);
				}.bind(this));
			}
		});

		return new Communicator();
	});
}).call( this );