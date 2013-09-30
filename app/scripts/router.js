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


