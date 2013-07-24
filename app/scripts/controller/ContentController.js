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
			},

			onDialogOpenAbout: function(event){
				App.dialogRegion.show(App.DialogContentView);
			},
			onUIOpenElement: function(event){
				App.UIRegion.show(App.UIView);
			}
		});
		return new ContentController();
	});

}).call( this );