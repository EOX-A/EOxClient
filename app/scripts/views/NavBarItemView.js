(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'models/NavBarItemModel',
		'hbs!tmpl/NavBarItem'
	],

	function( Backbone, Communicator, NavBarItemModel, NavBarItemTmpl ) {

		var NavBarItemView = Backbone.Marionette.ItemView.extend({
            model: NavBarItemModel,
            template: {
                type: 'handlebars',
                template: NavBarItemTmpl
            },
            tagName: 'li', 
            cursor: 'pointer',
            events: {'click': 'itemClicked'},

            itemClicked: function(){
                console.log('Event triggered: '+ this.model.get('eventToRaise'));
                Communicator.mediator.trigger(this.model.get('eventToRaise'), this);
            }
            
		});
		return NavBarItemView;
	});

}).call( this );