
(function() {
	'use strict';
	var root = this;
	root.define(['backbone','communicator'],
	function( Backbone, Communicator ) {
		var DownloadModel = Backbone.Model.extend({
			ToI:{},			// Time of interes
			AoI:[], 		// Area of Interest
			products: {} 	// Selected products
		
		});
		return {'DownloadModel':DownloadModel};
	});
}).call( this );