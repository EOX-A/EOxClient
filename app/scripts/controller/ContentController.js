(function() {
	'use strict';

	var root = this;

	root.require([
		'backbone',
		'communicator',
		'app'
	],

	function( Backbone, Communicator, App ) {

		var ContentController = Backbone.Marionette.Controller.extend({
            initialize: function(options){
            	this.listenTo(Communicator.mediator, "dialog:open:about", this.onDialogOpenAbout);
            	this.listenTo(Communicator.mediator, "ui:open:uielement", this.onUIOpenElement);
            	this.listenTo(Communicator.mediator, "ui:open:layercontrol", this.onLayerControlOpen);
            	
			},

			onDialogOpenAbout: function(event){
				App.dialogRegion.show(App.DialogContentView);
			},
			onUIOpenElement: function(event){
				//App.UIRegion.show(App.UIView);
			},
			onLayerControlOpen: function(event){
				//We have to render the layout before we can
                //call show() on the layout's regions
                App.leftSideBar.show(App.layout);
                App.layout.baseLayers.show(App.baseLayerView);
                App.layout.products.show(App.productsView);
			}
		});
		return new ContentController();
	});

}).call( this );