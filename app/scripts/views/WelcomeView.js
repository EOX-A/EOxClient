
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
    'hbs!tmpl/WelcomeView',
    'underscore'
  ],

  function( Backbone, Communicator, WelcomeViewTmpl ) {

    var WelcomeView = Backbone.Marionette.ItemView.extend({

      tagName: "div",
      className: "welcomeview",
      template: {type: 'handlebars', template: WelcomeViewTmpl},

      initialize: function(options) {
        
        // setup welcome message that fades upon click anywhere else
        var $welcome = this.$el;
        this.handler = _.bind(function(event) {
          var $target = $(event.target);
          if ($target.parents().index($welcome) < 0) {
            this.hide("slow");
          }
        }, this);
    
        document.body.addEventListener("mousedown", this.handler, true);
      },

      onShow: function(view){
        $("#openhelp").on("click",this.openhelp);
      },

      hide: function(speed) {
        if (speed) {
          this.$el.fadeOut("slow");
        }
        this.$el.hide();
        document.body.removeEventListener("mousedown", arguments, true);
      },

      openhelp: function(){
        Communicator.mediator.trigger("dialog:open:help");
      }

    });

    return {"WelcomeView":WelcomeView};

  });

}).call( this );
