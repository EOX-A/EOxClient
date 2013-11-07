
(function() {
	'use strict';
	var root = this;
	root.define(['backbone','communicator'],
	function( Backbone, Communicator ) {
		var ToolModel = Backbone.Model.extend({
			id: "",
			description:"",
			active: false,
			enabled: true,
			icon:"",
			type:""
		});
		return {'ToolModel':ToolModel};
	});
}).call( this );
