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
		'app',
		'backbone',
		'communicator',
		'backbone.marionette'
	],

	function( App, Backbone, Communicator ) {

		App.addInitializer(function (options) {
            //Create a new Router
            App.router = new Router();
            //start history
            Backbone.history.start({pushState: false});
        });


		var Router = Backbone.Marionette.AppRouter.extend({
			initialize: function(options) {

				this.listenTo(Communicator.mediator, "router:setUrl", this.setUrl);
			},

			setUrl: function(data){
				 //round to two decimals
                data.x = Math.round(data.x * 100)/100;
                data.y = Math.round(data.y * 100)/100;
                var urlFragment = 'map/'+data.x+'/'+data.y+'/'+data.l;  
                App.router.navigate(urlFragment, 
                    {trigger:false});
			},

			routes : {
                "map/:x/:y/:l" : "centerAndZoom"
            },

            centerAndZoom : function(x,y,l){
                Communicator.mediator.trigger('map:center', {x:x, y:y, l:l});
            }
		});

		return Router;
	});
}).call( this);


