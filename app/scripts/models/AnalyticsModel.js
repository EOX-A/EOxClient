
(function() {
	'use strict';
	var root = this;
	root.define(['backbone','communicator'],
	function( Backbone, Communicator ) {
		var AnalyticsModel = Backbone.Model.extend({
		
		});
		return {'AnalyticsModel':AnalyticsModel};
	});
}).call( this );