//-------------------------------------------------------------------------------
//
// Project: EOxClient <https://github.com/EOX-A/EOxClient>
// Authors: Daniel Santillan <daniel.santillan@eox.at>
//
//-------------------------------------------------------------------------------
// Copyright (C) 2014 EOX IT Services GmbH
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies of this Software or works derived from this Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//-------------------------------------------------------------------------------

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
		"text!config.json",
		"util",
		"libcoverage"
	],
	function ( Backbone, App ) {

		$.get("scripts/config.json", function(values) {
			
			// Configure Debug options
			setuplogging(values.debug);

			var viewModules = [];
			var models = [];
			var templates = [];
			var options = {};
			var config = {};

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
				values.mapConfig.visualizationLibs, 	//Visualizations such as Openlayers or GlobWeb
				values.mapConfig.module, 				//Which module should be used for map visualization
				values.mapConfig.model,					//Which model to use for saving map data
				viewModules,							//All "activated" views are loaded
				models,
				templates
			), function(){
				App.configure(values);
				App.start();
			});

			

				
		});
		
	});
}).call( this );