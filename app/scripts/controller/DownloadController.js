(function() {
	'use strict';

	var root = this;

	root.require([
		'backbone',
		'communicator',
    	'globals',
		'app',
		'views/DownloadView',
		'views/DownloadSelectionView',
    	'models/DownloadModel'
	],

	function( Backbone, Communicator, globals, App, v, ds, m ) {

		var DownloadController = Backbone.Marionette.Controller.extend({
			model: new m.DownloadModel(),

	    initialize: function(options){
	        //App.downloadView.model = this.model;
	      	this.model.set('products', {});
	        this.listenTo(Communicator.mediator, "map:layer:change", this.onChangeLayer);
	        this.listenTo(Communicator.mediator, 'time:change', this.onTimeChange);
	        this.listenTo(Communicator.mediator, "selection:changed", this.onSelectionChange);
	        this.listenTo(Communicator.mediator, "dialog:open:download", this.onDownloadToolOpen);
	        this.listenTo(Communicator.mediator, "dialog:open:downloadSelection", this.onDwonloadSelectionOpen);
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
        	//this.checkDownload();
	    },

	    onTimeChange: function(time) {
	        this.model.set('ToI',time);
            //this.checkDownload();
		},

	    onSelectionChange: function(selection) {
	        if (selection != null) {
	          if(selection.CLASS_NAME == "OpenLayers.Geometry.Polygon"){
	            this.model.set('AoI', selection);
	          }
	        }else{
	          this.model.set('AoI', null);
	        }
            //this.checkDownload();
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
        },

		onDwonloadSelectionOpen: function (event) {
			//App.rightSideBar.show(App.downloadSelectionView);
			App.viewContent.show(new ds.DownloadSelectionView({model:this.model}));
		}

		});
		return new DownloadController();
	});

}).call( this );