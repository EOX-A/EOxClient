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
			},

			onDialogOpenAbout: function(event){
				console.log("Controller got Dialog Open About Event" + event);
				App.dialogRegion.show(App.DialogContentView);
				
			}
		});
		return new ContentController();
	});

}).call( this );