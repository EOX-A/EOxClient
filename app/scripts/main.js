(function() {
    'use strict';

    var root = this;

    function setuplogging (enable) {

    	// Check if console exists (difference in browsers and if it is enabled)
    	if (!enable || typeof console === 'undefined' || !console.log ) {
		  window.console = {
		    debug: function() {},
		    trace: function() {},
		    log: function() {},
		    info: function() {},
		    warn: function() {},
		    error: function() {}
		  };
		}
    	
    }

    root.require([
		'backbone',
		'app',
		'backbone.marionette',
		'regionManager',
		'jquery',
		'jqueryui',
		"text!../config.json",
		"util",
		"libcoverage"
	],
	function ( Backbone, App ) {

		

		$.get("config.json", function(values) {

			var origvalues = values;

			$.get(values.mapConfig.dataconfigurl, function(values) {
				
				_.extend(origvalues.mapConfig, values);

					// Configure Debug options
				setuplogging(values.debug);

				var viewModules = [];
				var models = [];
				var templates = [];
				var options = {};
				var config = {};

				_.each(origvalues.views, function(view) {
					viewModules.push(view);
				}, this);

				_.each(origvalues.models, function(model) {
					models.push(model);
				}, this);

				_.each(origvalues.templates, function(tmpl) {
					templates.push(tmpl.template);
				}, this);

				root.require([].concat(
					origvalues.mapConfig.visualizationLibs, 	//Visualizations such as Openlayers or GlobWeb
					origvalues.mapConfig.module, 				//Which module should be used for map visualization
					origvalues.mapConfig.model,					//Which model to use for saving map data
					viewModules,							//All "activated" views are loaded
					models,
					templates
				), function(){
					App.configure(origvalues);
					App.start();
				});

			});

		});
		
	});
}).call( this );
