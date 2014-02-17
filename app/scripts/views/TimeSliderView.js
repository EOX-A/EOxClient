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
        'selectionChanged': 'onChangeTime'
      },
      initialize: function(options){
        this.options = options;
      },

      render: function(options){

      },
      onShow: function(view) {

        this.listenTo(Communicator.mediator, "map:layer:change", this.changeLayer);
        Communicator.reqres.setHandler('get:time', this.returnTime);

        var selectionstart = new Date(this.options.brush.start);
        var selectionend = new Date(this.options.brush.end);

        this.slider = new TimeSlider(this.el, {

          domain: {
            start: new Date(this.options.domain.start),
            end: new Date(this.options.domain.end)
          },
          brush: {
            start: selectionstart,
            end: selectionend
          },
          debounce: 200,

          datasets: []

        });

        Communicator.mediator.trigger('time:change', {start:selectionstart, end:selectionend});

        // For viewers that are loaded after the TimeSlider announces its initial timespan there
        // has to be a way to get the timespan for their setup. This is a 'sloppy' way of 
        // accomplishing this:
        Communicator.mediator.timeOfInterest = {
          start: selectionstart,
          end: selectionend
        };
      }, 

      onChangeTime: function(evt){
        Communicator.mediator.trigger('time:change', evt.originalEvent.detail);
        // Update ToI in the global context:
        Communicator.mediator.timeOfInterest = {
          start: evt.originalEvent.detail.start,
          end: evt.originalEvent.detail.end
        };
      },

      changeLayer: function (options) {
        if (!options.isBaseLayer){
          var product = globals.products.find(function(model) { return model.get('name') == options.name; });
          if (product){
            if(options.visible && product.get('timeSlider')){
              this.slider.addDataset(
                {
                  /*id: product.get('download').id,
                  color: product.get('color'),
                  data: new TimeSlider.Plugin.EOWCS({ url: product.get('download').url, eoid: product.get('download').id, dataset: product.get('download').id })*/
                  id: product.get('view').id,
                  color: product.get('color'),
                  data: new TimeSlider.Plugin.WMS({ url: product.get('view').urls[0], eoid: product.get('view').id, dataset: product.get('view').id })
                }
              );
            }else{
              this.slider.removeDataset(product.get('download').id);
            }
          }
        }
      },

      returnTime: function(){
        return Communicator.mediator.timeOfInterest;
      }

    });
    return {'TimeSliderView':TimeSliderView};
  });
}).call( this );