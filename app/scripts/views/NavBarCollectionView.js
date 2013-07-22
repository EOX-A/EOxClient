(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'views/NavBarItemView'
	],

	function( Backbone, Communicator, NavBarItemView ) {

		var NavBarCollectionView = Backbone.Marionette.CompositeView.extend({  
			appendHtml: function(collectionView, itemView, index){
				collectionView.$("ul").append(itemView.el);
			}
		});
		return NavBarCollectionView;
	});

}).call( this );