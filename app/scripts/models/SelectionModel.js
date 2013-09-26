
(function() {
	'use strict';
	var root = this;
	root.define(['backbone','communicator'],
	function( Backbone, Communicator ) {
		var SelectionModel = Backbone.Model.extend({
			selections:[] 
		});
		return {'SelectionModel':SelectionModel};
	});
}).call( this );