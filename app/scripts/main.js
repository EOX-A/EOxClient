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
		'communicator',
		'backbone.marionette',
		'regionManager',
		'jquery',
		'jqueryui',
		"text!config.json",
		"util",
		"libcoverage"
	],
	function ( Backbone, App, Communicator ) {
		$.get("scripts/config.json", function(values) {
			
			// Configure Debug options
			setuplogging(values.debug);

			var modules = [];
			var viewModules = [];
			var models = [];
			var templates = [];
			var options = {};
			var config = {};

			_.each(values.modules, function(module) {
				modules.push(module);
				console.log("[V-MANIP] Registered module from: " + module + ".js");
			});

			_.each(values.views, function(view) {
				viewModules.push(view);
			}, this);

			_.each(values.models, function(model) {
				models.push(model);
			}, this);

			_.each(values.templates, function(tmpl) {
				templates.push(tmpl.template);
			}, this);

			root.require([].concat(
				modules,                                // Webclient Modules
				values.mapConfig.visualizationLibs, 	// Visualizations such as Openlayers or GlobWeb
				values.mapConfig.module, 				// Which module should be used for map visualization
				values.mapConfig.model,					// Which model to use for saving map data
				viewModules,							// All "activated" views are loaded
				models,
				templates
			), function() {
				App.on("initialize:after", function(options) {
					if (Backbone.history) {
            			Backbone.history.start({
            				pushState: false
            			});
					}
				});	
				App.configure(values);
				App.start({
					viewerRegion: App.map
				});

				Communicator.mediator.trigger("viewer:show:map");
			});				
		});
		
	});
}).call( this );