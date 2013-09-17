(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'underscore'
	],

	function( Backbone, Communicator, UIElementTmpl ) {

		var ToolSelectionView = Backbone.Marionette.CollectionView.extend({

			tagName: "ul",
			className: "toolcontrolview",

			initialize: function(options) {
			},

			onShow: function(view){
				//this.listenTo(Communicator.mediator, "productCollection:update-sort", this.updateSort);
			}

		});

		return {'ToolSelectionView':ToolSelectionView};

	});

}).call( this );