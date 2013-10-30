(function() {
	'use strict';

	var root = this;

	root.require([
		'backbone',
		'communicator',
    	'globals',
		'app',
		'views/SelectionManagerView',
    	'models/SelectionModel'
	],

	function( Backbone, Communicator, globals, App, v, m ) {

		var SelectionManagerController = Backbone.Marionette.Controller.extend({
			model: new m.SelectionModel(),

	    initialize: function(options){
	      	this.model.set('selections', []);
	        this.listenTo(Communicator.mediator, "selection:changed:json", this.onSelectionChange);
	        this.listenTo(Communicator.mediator, "ui:open:selectionManager", this.onSelectionManagerOpen);
		},

	    onSelectionChange: function(selection) {
	        if (selection != null) {
	        	var selections = this.model.get('selections');
	        	selections.push(selection);
	            this.model.set('selections', selections);
	        }else{
	        	this.model.set('selections', []);
	        }
		},

		onSelectionManagerOpen: function(toOpen) {
            if(toOpen){
              App.viewContent.show(new v.SelectionManagerView({model:this.model}));
            }else{
              App.viewContent.close();
            }
          }
		});
		return new SelectionManagerController();
	});

}).call( this );