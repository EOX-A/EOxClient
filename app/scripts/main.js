(function() {
    'use strict';

    var root = this;

    root.require([
		'backbone',
		'app',
		'backbone.marionette',
		'regionManager',
		'jquery',
		"text!config.json"
	],
	function ( Backbone, App ) {
		$.get("scripts/config.json", function(values) {
			// TODO: parse config
			// TODO: require modules from config
			// get "components" from modules and initialze them
			var viewModules = [];
			var options = {};
			var config = {};

			_.each(values.views, function(view) {
					viewModules.push(view.module);
				}, this);

			root.require([].concat(
				values.mapConfig.visualizationTools, 	//Visualizations such as Openlayers or GlobWeb
				values.mapConfig.module, 				//Which module should be used for map visualization
				values.mapConfig.model,					//Which model to use for saving map data
				viewModules								//All "activated" views are loaded
			));


			var Application = App;
			//Application.initialize(options);
			Application.configure(values);
			Application.start();	
		});
		
	});
}).call( this );