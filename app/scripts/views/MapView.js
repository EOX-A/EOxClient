(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'models/MapModel'
	],

	function( Backbone, Communicator ) {

		var ViewManager = Backbone.Marionette.Controller.extend({
		
			initialize: function( options ) {
				console.log("Initialize a View Manager");

			}
		});

		var MapView = Backbone.Marionette.ItemView.extend({
            /*model: MapModel,
            template: '#tool-template',
            tagName: 'li', */
            events: {'click': 'itemClicked'},
            itemClicked: function(){
                console.log('ToolItemClicked: '+ this.model.get('name'));
                Communicator.mediator.trigger(this.model.get('eventToRaise'), this);
            },
            initialize: function( options ) {
            	var a=5;
			}

		
		});


	});

}).call( this );