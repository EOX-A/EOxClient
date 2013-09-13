(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/UIElement',
		'underscore'
	],

	function( Backbone, Communicator, UIElementTmpl ) {

		var UIElementView = Backbone.Marionette.ItemView.extend({

			template: {type: 'handlebars', template: UIElementTmpl},

			initialize: function(options) {

			}

		});

		return {'UIElementView':UIElementView};

	});

}).call( this );