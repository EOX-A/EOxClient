(function() {
	'use strict';
	var root = this;
	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/BulletLayer',
		'underscore'
	],
	function( Backbone, Communicator, BulletLayerTmpl) {
		var ProductSelectionView = Backbone.Marionette.ItemView.extend({
			template: {type: 'handlebars', template: BulletLayerTmpl},
			initialize: function(options) {
			}

		});
		return ProductSelectionView;
	});
}).call( this );