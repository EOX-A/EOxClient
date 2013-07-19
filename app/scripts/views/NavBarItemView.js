(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'models/NavBarItemModel',
		'hbs!tmpl/listElement',
		'hbs!tmpl/NavBarItem'
	],

	function( Backbone, Communicator, NavBarItemModel, listElementTmpl, NavBarItemTmpl ) {

		var NavBarItemView = Backbone.Marionette.ItemView.extend({
            //model: new NavBarItemModel(),
            template: NavBarItemTmpl(),
            tagName: 'li', 
            events: {'click': 'itemClicked'},
            itemClicked: function(){
                console.log('ToolItemClicked: '+ this.model.get('name'));
                Communicator.mediator.trigger(this.model.get('eventToRaise'), this);
            }
            
		});
		return NavBarItemView;
	});

}).call( this );