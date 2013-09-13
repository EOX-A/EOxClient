(function() {
  'use strict';
  var root = this;
  root.define([
    'backbone',
    'communicator',
    'timeslider',
    'underscore',
    'd3'
  ],
  function( Backbone, Communicator, timeslider) {
    var TimeSliderView = Backbone.Marionette.ItemView.extend({
      className: 'timeslider',
      events: {
        'selectionChanged': 'onChange'
      },
      render: function(options){

      },
      onShow: function(view) {
        var slider = new TimeSlider(this.el, {
          start: new Date("2012-01-01T00:00:00Z"),
          end: new Date("2013-01-01T00:00:00Z"),
          brush: {
            start: new Date("2012-01-05T00:00:00Z"),
            end: new Date("2012-01-10T00:00:00Z")
          },
          datasets: [
            {
              id: 'img2012',
              color: 'red',
              data: function(start, end) {
                return [];
              }
            }
          ]
        });
      }, 

      onChange: function(evt){
        console.log("timeslider selection change");
        //Communicator.mediator.trigger('Map:ChangeBaseLayer', options);
      }

    });
    return {'TimeSliderView':TimeSliderView};
  });
}).call( this );