(function() {
  'use strict';
  var root = this;
  root.define([
    'backbone',
    'communicator',
    'timeslider',
    'globals',
    'underscore',
    'd3'
  ],
  function( Backbone, Communicator, timeslider, globals) {
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

        var selectionstart = new Date(this.options.brush.start);
        var selectionend = new Date(this.options.brush.end);

        var slider = new TimeSlider(this.el, {

          domain: {
            start: new Date(this.options.domain.start),
            end: new Date(this.options.domain.end)
          },
          brush: {
            start: selectionstart,
            end: selectionend
          },
          datasets: []
        });

        var string = getISODateTimeString(selectionstart) + "/"+ getISODateTimeString(selectionend);
        
        globals.products.each(function(product) {
            if(product.get("timeSlider")){
                product.set('time', string);
            }
         
        }, this);

        Communicator.mediator.trigger('time:change');
      }, 

      onChangeTime: function(evt){
        
        var string = getISODateTimeString(evt.originalEvent.detail.start) + "/"+ getISODateTimeString(evt.originalEvent.detail.end);
        
        globals.products.each(function(product) {
            if(product.get("timeSlider")){
                product.set('time', string);
            }
         
        }, this);

        Communicator.mediator.trigger('time:change');
         
      }

    });
    return {'TimeSliderView':TimeSliderView};
  });
}).call( this );