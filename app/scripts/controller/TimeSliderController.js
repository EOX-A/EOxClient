(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
    	'globals',
		'app',
		'views/TimeSliderView'
	],

	function( Backbone, Communicator, globals, App, v) {

		var TimeSliderController = Backbone.Marionette.Controller.extend({

	    initialize: function(config){
	      	this.listenTo(Communicator.mediator, "map:layer:change", this.changeLayer);
	      	this.active_layers = 0;
	      	this.timeSliderView = new v.TimeSliderView(config);
	      	this.app = require('app');
		},

	    changeLayer: function (options) {

	        if (!options.isBaseLayer){
	          var product = globals.products.find(function(model) { return model.get('name') == options.name; });
	          if (product){
	            if(options.visible && product.get('timeSlider')){
	              this.active_layers +=1;
	              if(this.active_layers==1){
	              	this.app.bottomBar.show(this.timeSliderView);
	              }
	              this.timeSliderView.addDataset(
	                {
	                  id: product.get('download').id,
	                  color: product.get('color'),
	                  data: new TimeSlider.Plugin.EOWCS({ url: product.get('download').url, eoid: product.get('download').id, dataset: product.get('download').id })
	                }
	              );
	            }else if(product.get('timeSlider')){
	              this.active_layers -=1;
	              this.timeSliderView.removeDataset(product.get('download').id);
	              if(this.active_layers == 0){
	              	this.app.bottomBar.close();
	              }
	            }
	          }
	        }

	    }


		});
		return TimeSliderController;
	});

}).call( this );