define(['backbone.marionette',
		'communicator',
		'app',
		'models/AnalyticsModel',
		'globals',
		'd3',
		'analytics'
	],
	function(Marionette, Communicator, App, AnalyticsModel, globals) {

		var AnalyticsView = Marionette.View.extend({

			model: new AnalyticsModel.AnalyticsModel(),
			className: "analytics",

			initialize: function(options) {

				$(window).resize(function() {
					this.onResize();
				}.bind(this));
			},

			events: {
				'click .scatter-btn': function() {
					this.render('scatter');
				},

				'click .box-btn': function() {
					this.render('box');	
				},

				'click .parallel-btn': function() {
					this.render('parallel');
				}
			},

			onShow: function() {
				this.isClosed = false;

				this.$el.append(
					"<div class='d3canvas'></div>" +
					"<div class='gui'>" +
						"<div class='scatter-btn highlight '><i class='sprite sprite-scatter' style='widht:22px'></i></div>" +
						"<div class='box-btn highlight '><i class='sprite sprite-box'></i></div>" +
						"<div class='parallel-btn highlight '><i class='sprite sprite-parallel'></i></div>" +
					"</div> ");

				this.render('scatter');
				
				return this;
			},

			onResize: function() {
			},

			render: function(type) {

				var plotdata = null;
				var args = {
					selector: this.$('.d3canvas')[0],
					data: plotdata
				};

				switch (type){
					case 'scatter':
						analytics.scatterPlot(args);
						break;
					case 'box':
						analytics.boxPlot(args);
						break;
					case 'parallel':
						analytics.parallelsPlot(args);
						break;
				}

				this.onResize();
			},

			changeLayer: function(options) {},
			onSortProducts: function(productLayers) {},
			onSelectionChanged: function(feature) {
				console.log(feature);
			},
			onTimeChange: function () {},

			onClose: function(){
				this.$el.empty();
				this.isClosed = true;
				
			}
		});

		return AnalyticsView;
	});