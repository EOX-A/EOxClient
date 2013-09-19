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
        'selectionChanged': 'onChangeTime'
      },
      render: function(options){

      },
      onShow: function(view) {
        var slider = new TimeSlider(this.el, {
          start: new Date("2012-07-01T00:00:00Z"),
          end: new Date("2013-07-01T00:00:00Z"),
          brush: {
            start: new Date("2013-06-05T00:00:00Z"),
            end: new Date("2013-06-08T00:00:00Z")
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

      onChangeTime: function(evt){
        console.log( "Time selection changed " + evt.originalEvent.detail.start + " " + evt.originalEvent.detail.end );
        Communicator.mediator.trigger('time:change', evt.originalEvent.detail);
      }

    });
    return {'TimeSliderView':TimeSliderView};
  });
}).call( this );