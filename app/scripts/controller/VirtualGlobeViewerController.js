'use strict';

require([
		'backbone',
		'communicator',
		'app',
		'views/VirtualGlobeView'
	],

	function(Backbone, Communicator, App, VirtualGlobe) {

		var VirtualGlobeViewController = Backbone.Marionette.Controller.extend({

			initialize: function(options) {
				this.globeView = undefined;
			},

			show: function() {
				if (typeof(this.globeView) == 'undefined') {
					this.globeView = new VirtualGlobe.VirtualGlobeView();
				}

				App.map.show(this.globeView);
			}
		});

		// I like the idea of a 'module' that holds together the controllers and
		// views. The module-controller-view concept allows to delegate the responsibilities of 
		// each component clearly. E.g. the module only communicates with the App and the 
		// Communicator object. A controller only talks to its module and to its views. A view
		// is connected only to its controller via events. No other communication is allowed,
		// i.e. a controller is not allowed to directly talk to the Communicator. There is one
		// exception for practical reasons: A controller is allowed to access a region via the
		// App object for showing a view. See line 23 in this file for an example.

		// FIXXME: MH: The module definition is packed into this controller file, as the necessary
		// architecture is not yet provided by the Webclient-Framework. This is file is basically
		// a showcase for the module-controller-view paradigm that has to be discussed.

		function initializeModule() {

			var registerWithCommunicator = function(globe_controller) {
				Communicator.registerEventHandler("viewer:show:virtualglobeviewer", function() {
					App.router.navigate("vgv", {
						trigger: true
					});
				});
			};

			var setupRouter = function(globe_controller) {
				var Router = Backbone.Marionette.AppRouter.extend({
					appRoutes: {
						"vgv": "show"
					}
				});

				var RouteController = function() {};

				_.extend(RouteController.prototype, {
					show: function() {
						globe_controller.show();
					}
				});

				new Router({
					controller: new RouteController(globe_controller)
				});
			};

			var controller = new VirtualGlobeViewController();

			registerWithCommunicator(controller);
			setupRouter(controller);

			console.log('[VirtualGlobeViewer] Finished module initialization');
		};

		initializeModule();
		//return VirtualGlobeViewController;
	});