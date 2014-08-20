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
    'timeslider',
    'timeslider_plugins',
    'globals',
    'underscore',
    'd3'
  ],
  function( Backbone, Communicator, timeslider, timeslider_plugins, globals) {
    var TimeSliderView = Backbone.Marionette.ItemView.extend({
      id: 'timeslider',
      events: {
        'selectionChanged': 'onChangeTime',
        'coverageselected': 'onCoverageSelected'
      },
      initialize: function(options){
        this.options = options;
        this.active_products = [];
      },

      render: function(options){

      },
      onShow: function(view) {

        this.listenTo(Communicator.mediator, 'date:selection:change', this.onDateSelectionChange);
        this.listenTo(Communicator.mediator, "map:layer:change", this.changeLayer);
        this.listenTo(Communicator.mediator, "map:position:change", this.updateExtent);
        this.listenTo(Communicator.mediator, "date:selection:change", this.onDateSelectionChange);

        var selectionstart = new Date(this.options.brush.start);
        var selectionend = new Date(this.options.brush.end);

        this.activeWPSproducts = [];

       this.slider = new TimeSlider(this.el, {

          domain: {
            start: new Date(this.options.domain.start),
            end: new Date(this.options.domain.end)
          },
          brush: {
            start: selectionstart,
            end: selectionend
          },
          debounce: 300,
          ticksize: 5,

          datasets: []

        });

       this.slider.hide();

        Communicator.mediator.trigger('time:change', {start:selectionstart, end:selectionend});
      }, 

      onChangeTime: function(evt){
        Communicator.mediator.trigger('time:change', evt.originalEvent.detail);
      },
      
      onDateSelectionChange: function(opt) {
        this.slider.select(opt.start, opt.end);
      },

      changeLayer: function (options) {
        if (!options.isBaseLayer){
          var product = globals.products.find(function(model) { return model.get('name') == options.name; });
          if (product){
            if(options.visible && product.get('timeSlider')){

              switch (product.get("timeSliderProtocol")){

                case "WMS":
                  this.slider.addDataset({
                    id: "id"+strHash(product.get('view').id),
                    color: product.get('color'),
                    data: new TimeSlider.Plugin.WMS({
                      url: product.get('view').urls[0],
                      eoid: product.get('view').id,
                      dataset: "id"+strHash(product.get('view').id)
                    })
                  });
                  this.active_products.push("id"+strHash(product.get('view').id));
                  break;

                case "EOWCS":
                  this.slider.addDataset({
                    id: "id"+strHash(product.get('download').id),
                    color: product.get('color'),
                    data: new TimeSlider.Plugin.EOWCS({
                        url: product.get('download').url,
                        eoid: product.get('download').id,
                        dataset: "id"+strHash(product.get('download').id)
                     })
                  });
                  this.active_products.push("id"+strHash(product.get('download').id));
                  break;

                case "WPS":
                  var extent = Communicator.reqres.request('map:get:extent');
                  this.slider.addDataset({
                    id: "id"+strHash(product.get('download').id),
                    color: product.get('color'),
                    data: new TimeSlider.Plugin.WPS({
                        url: product.get('download').url,
                        eoid: product.get('download').id,
                        dataset: "id"+strHash(product.get('download').id),
                        bbox: [extent.left, extent.bottom, extent.right, extent.top]
                     })
                  });
                  this.activeWPSproducts.push("id"+strHash(product.get('download').id));
                  this.active_products.push("id"+strHash(product.get('download').id));
                  // For some reason updateBBox is needed, altough bbox it is initialized already.
                  // Withouth this update the first time activating a layer after the first map move
                  // the bbox doesnt seem to be defined in the timeslider library and the points shown are wrong
                  this.slider.updateBBox([extent.left, extent.bottom, extent.right, extent.top], "id"+strHash(product.get('download').id));
                  break;
              }
              
              this.slider.show();
            }else{
              if (product.get("timeSliderProtocol") == "WMS"){

                this.slider.removeDataset("id"+strHash(product.get('view').id));

                if (this.active_products.indexOf("id"+strHash(product.get('view').id))!=-1)
                  this.active_products.splice(this.active_products.indexOf("id"+strHash(product.get('view').id)), 1);

              }else{

                this.slider.removeDataset("id"+strHash(product.get('download').id));

                if (this.activeWPSproducts.indexOf("id"+strHash(product.get('download').id))!=-1)
                  this.activeWPSproducts.splice(this.activeWPSproducts.indexOf("id"+strHash(product.get('download').id)), 1);

                if (this.active_products.indexOf("id"+strHash(product.get('download').id))!=-1)
                  this.active_products.splice(this.active_products.indexOf("id"+strHash(product.get('download').id)), 1);
              }
              
              if (this.active_products.length == 0)
                this.slider.hide();
            }
          }
        }
      },

      updateExtent: function(extent){
        
        for (var i=0; i<this.activeWPSproducts.length; i++){
          console.log(this.activeWPSproducts[i]);
          this.slider.updateBBox([extent.left, extent.bottom, extent.right, extent.top], this.activeWPSproducts[i]);
        }
      },

      onCoverageSelected: function(evt){
        if (evt.originalEvent.detail.bbox){
          var bbox = evt.originalEvent.detail.bbox.replace(/[()]/g,'').split(',').map(parseFloat);
          this.slider.select(evt.originalEvent.detail.start, evt.originalEvent.detail.end);
          Communicator.mediator.trigger("map:set:extent", bbox);
        }
      }

    });
    return {'TimeSliderView':TimeSliderView};
  });
}).call( this );