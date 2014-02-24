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
	root.define([
		'backbone',
		'communicator',
		'globals',
		'hbs!tmpl/BulletLayer',
		'underscore'
	],
	function( Backbone, Communicator, globals, BulletLayerTmpl) {
		var LayerItemView = Backbone.Marionette.ItemView.extend({
			tagName: "li",
			events: {
				'drop' : 'drop',
				'change': 'onChange',
				'click .fa-adjust': 'onOpenSlider',
				'slide .ui-slider': 'onOpacityAdjust'
			},

			initialize: function(options) {

				this.$slider = $('<div>').slider({
			        range: "max",
			        max: 100,
			        min: 0
			    });
			    this.$slider.width(100);
			},
			onShow: function(view){

				$( ".sortable" ).sortable({
					revert: true,
					delay: 90,
					containment: ".layercontrol .panel-body",
					axis: "y",
					forceHelperSize: true,
					forcePlaceHolderSize: true,
					placeholder: "sortable-placeholder",
					handle: '.fa-sort',
					start: function(event, ui) {
						$( ".ui-slider" ).detach();
						$('.fa-adjust').toggleClass('active')
						$('.fa-adjust').popover('hide');
					},
					stop: function(event, ui) {
						ui.item.trigger('drop', ui.item.index());
		        	}
			    });

			    $('.fa-adjust').popover({
        			trigger: 'manual'
    			});
			},


			onChange: function(evt){
                var isBaseLayer = false;
                if (this.model.get('view').isBaseLayer)
                	isBaseLayer = true;
                var options = { name: this.model.get('name'), isBaseLayer: isBaseLayer, visible: evt.target.checked };

                var product = globals.products.find(function(model) { return model.get('name') == options.name; });

				if (product){

					if (options.visible && product.get("view").protocol=="WMS"){
						var getmap = "?LAYERS="+product.get("view").id+"&TRANSPARENT=true&FORMAT=image%2Fpng&SERVICE=WMS&VERSION=1.1.0&REQUEST=GetMap&STYLES=&SRS=EPSG%3A4326&BBOX=33.75,56.25,39.375,61.875&WIDTH=256&HEIGHT=256&TIME=2014-02-19T00:00:00Z/2014-02-19T00:00:00Z"
						$.get(product.get("view").urls[0] + getmap, function (){
							Communicator.mediator.trigger('map:layer:change', options);
						}, 'text');
					} else {
						Communicator.mediator.trigger('map:layer:change', options);
					}
				}else{
					Communicator.mediator.trigger('map:layer:change', options);
				}
            },

            drop: function(event, index) {
		        Communicator.mediator.trigger('productCollection:updateSort', {model:this.model, position:index});
		    },

		    onOpenSlider: function(evt){

		    	if (this.$('.fa-adjust').toggleClass('active').hasClass('active')) {
		            this.$('.fa-adjust').popover('show');
		            this.$('.popover-content')
		                .empty()
		                .append(this.$slider);
		            this.$( ".ui-slider" ).slider( "option", "value", this.model.get("opacity") * 100 );


		        } else {
		            this.$slider.detach();
		            this.$('.fa-adjust').popover('hide');
		        }
		    },

		    onOpacityAdjust: function(evt, ui) {
		    	this.model.set("opacity", ui.value/100);
		    	Communicator.mediator.trigger('productCollection:updateOpacity', {model:this.model, value:ui.value/100});
		    }

		});
		return {'LayerItemView':LayerItemView};
	});
}).call( this );
