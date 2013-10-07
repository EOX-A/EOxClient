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
		"libcoverage",
		'core/SplitView/SplitViewModule'
	],
	function ( Backbone, App, Communicator ) {

		// FIXXME: MH: that took me a while:
		// document.getElementsByTagName() returns a NodeList. However, if x3dom.js is included together with OpenLayers.js
		// it is magically returning an Array. The OpenLayers.Map constructor tries to access the returned value with ret.item(i),
		// which is of course not working on an Array, only on a NodeList.
		// I couldn't find the problem in the x3dom.js file, so for now I'm patching the Array object with an 'item' function.
		// If someone knows what is going on here give me a hint ;-)
		Array.prototype.item = function(idx) {
			return this[idx];
		};

		// // Testcode: If x3dom.js is not included, this code works fine (as it should). With x3dom.js included 'nodes' is an
		// // Array instead of a NodeList, which does not include a .item() function:
		// var nodes = document.getElementsByTagName('link');
		// console.dir(nodes);
		// for (var i = 0, len = nodes.length; i < len; ++i) {
		// 	console.log("link: " + nodes.item(i).href);
		// }

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
					} else {
						alert('Your browser has no "History API" support. Be aware that the application could behave in unexpected ways. Please consider updating your browser!')
					}
				});	
				App.configure(values);
				App.start({
					viewerRegion: App.map
				});
				App.setupGui();
			});				
		});
		
	});
}).call( this );