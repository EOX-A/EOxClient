(function() {
    'use strict';

    var root = this; // to be used in nested context

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

    // assure all required JS modules + the configuration are available 
    // ... and trigger the main app's setup 
    root.require([
        'backbone',
        'app',                  // the main app
        'backbone.marionette',
        'regionManager',
        'jquery',
        'jqueryui',
        "util",                 // variaous utilities
        "libcoverage",          // WCS handling code
        "text!../config.json"   // static configuration file
    ],
    function ( Backbone, App ) {

        // load the app's static configuration 
        $.get("config.json", function(config_src) {

            // load the data content specification
            $.get(config_src.mapConfig.dataconfigurl, function(data_cfg) {

                _.extend(config_src.mapConfig, data_cfg);
            });

            // Configure Debug options
            setuplogging(config_src.debug);

            var viewModules = [];
            var models = [];
            var templates = [];
            var options = {};
            var config = {};

            // collect list of view modules
            _.each(config_src.views, function(view) {
                viewModules.push(view);
            }, this);

            // collect list of model modules
            _.each(config_src.models, function(model) {
                models.push(model);
            }, this);

            // collect list of template modules
            _.each(config_src.templates, function(tmpl) {
                templates.push(tmpl.template);
            }, this);

            // assure all required modules are available and start the main app
            root.require([].concat(
                config_src.mapConfig.visualizationLibs,     //Visualizations such as Openlayers or GlobWeb
                config_src.mapConfig.module,                //Which module should be used for map visualization
                config_src.mapConfig.model,                 //Which model to use for saving map data
                viewModules,                            //All "activated" views are loaded
                models,
                templates
            ), function(){
                App.configure(config_src);
                App.start();
            });

        });
        
    });
}).call( this );
