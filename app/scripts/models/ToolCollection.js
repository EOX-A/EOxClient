
(function() {
	'use strict';
	var root = this;
	root.define(['backbone','communicator', 'models/ToolModel'],
	function( Backbone, Communicator, ToolModel ) {
		var ToolCollection = Backbone.Collection.extend({
			model: ToolModel,
		});
		return {'ToolCollection':ToolCollection};
	});
}).call( this );