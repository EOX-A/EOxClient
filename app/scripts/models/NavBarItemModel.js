
(function() {
	'use strict';
	var root = this;
	root.define(['backbone','communicator'],
	function( Backbone, Communicator ) {
		var NavBarItemModel = Backbone.Model.extend({
			name: "",
			icon: "",
			content: "",
			eventToRaise: ""

		});
		return {'NavBarItemModel':NavBarItemModel};
	});
}).call( this );
