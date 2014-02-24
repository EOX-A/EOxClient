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

	root.require([
		'backbone',
		'communicator',
    	'globals',
		'app',
		'views/DownloadView',
    	'models/DownloadModel'
	],

	function( Backbone, Communicator, globals, App, v, m ) {

		var DownloadController = Backbone.Marionette.Controller.extend({
			model: new m.DownloadModel(),

	    initialize: function(options){
	        //App.downloadView.model = this.model;
	      	this.model.set('products', {});
	        this.listenTo(Communicator.mediator, "map:layer:change", this.onChangeLayer);
	        this.listenTo(Communicator.mediator, 'time:change', this.onTimeChange);
	        this.listenTo(Communicator.mediator, "selection:changed", this.onSelectionChange);
	        this.listenTo(Communicator.mediator, "dialog:open:download", this.onDownloadToolOpen);
		},

		onChangeLayer: function (options) {
	        if (!options.isBaseLayer){
	            var layer = globals.products.find(function(model) { return model.get('name') == options.name; });
	            if (layer) { // Layer will be empty if it is an overlay layer
					var products = this.model.get('products');
		        	if(options.visible){
		        		products[layer.get('download').id] = layer;    
		          	}else{
		            	delete products[layer.get('download').id];
		          	}
		          	this.model.set('products', products);
	            }
	        }
        	this.checkDownload();
	    },

	    onTimeChange: function(time) {
	        this.model.set('ToI',time);
            this.checkDownload();
		},

	    onSelectionChange: function(selection) {
	        if (selection != null) {
	          if(selection.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
	            this.model.set('AoI', selection);
	          }
	        }else{
	          this.model.set('AoI', null);
	        }
            this.checkDownload();
		},

		checkDownload: function() {
	      	// Check that all necessary selections are available
	        if(this.model.get('ToI') != null &&
	           this.model.get('AoI') != null &&
	           _.size(this.model.get('products')) > 0){
	          Communicator.mediator.trigger('selection:enabled', {id:"download", enabled:true} );
	        }else{
	          Communicator.mediator.trigger('selection:enabled', {id:"download", enabled:false} );
	        }
	      },

		onDownloadToolOpen: function(toOpen) {
            if(toOpen){
              //App.downloadView.model = this.model;
              App.viewContent.show(new v.DownloadView({model:this.model}));
            }else{
              App.viewContent.close();
            }
          }
		});
		return new DownloadController();
	});

}).call( this );