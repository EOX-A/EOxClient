(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'backbone.marionette'
	],

	function( Backbone, Communicator ) {
		var Router = Backbone.Marionette.AppRouter.extend({
			initialize: function(options) {
				var routes = [];
				_.each(options.regions, function(region){
					// TODO: add regio.routes to `routes` if not already contained
				}, this);

				_.each(routes, function(route) {
					this.route(route, "onRoute");
				}, this);
			},

			onRoute: function(def) {
				// TODO: "close" all regions that are not associated with the route
				// TODO: "show" all regions that are associated with the route
			}
		});

		return Router;
	});
}).call( this);


