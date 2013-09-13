
(function() {
	'use strict';
	var root = this;
	root.define(['backbone','communicator', 'models/NavBarItemModel'],
	function( Backbone, Communicator, NavBarItemModel ) {
		var NavBarCollection = Backbone.Collection.extend({
			model: NavBarItemModel,
		});
		return {'NavBarCollection':NavBarCollection};
	});
}).call( this );