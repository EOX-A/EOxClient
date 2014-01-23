define(['backbone.marionette',
		'communicator',
		'app',
		'models/AnalyticsModel',
		'globals',
		'd3',
		'analytics',
		'nv'
	],
	function(Marionette, Communicator, App, AnalyticsModel, globals) {

		var AnalyticsView = Marionette.View.extend({

			model: new AnalyticsModel.AnalyticsModel(),
			className: "analytics",

			initialize: function(options) {

				this.selection_list = [];
				this.plotdata = [];
				this.plot_type = 'scatter';
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
				
				this.delegateEvents();
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

				this.plot_type = type;

				
				var args = {
					selector: this.$('.d3canvas')[0],
					data: this.plotdata
				};

				console.log("Render: " + type);
				console.log(this.plotdata);

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

				var that = this;
				
				if(feature){
					this.selection_list.push(feature);
					var selected_features = this.selection_list.length;

					request_process = '<?xml version="1.0" encoding="UTF-8"?>'+
								'<wps:Execute version="1.0.0" service="WPS" '+
								'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '+
								'xmlns="http://www.opengis.net/wps/1.0.0" '+
								'xmlns:wfs="http://www.opengis.net/wfs" '+
								'xmlns:wps="http://www.opengis.net/wps/1.0.0" '+
								'xmlns:ows="http://www.opengis.net/ows/1.1" '+
								'xmlns:gml="http://www.opengis.net/gml" '+
								'xmlns:ogc="http://www.opengis.net/ogc" '+
								'xmlns:wcs="http://www.opengis.net/wcs/1.1.1" '+
								'xmlns:xlink="http://www.w3.org/1999/xlink" '+
								'xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">'+
								  '<ows:Identifier>random_gen</ows:Identifier>'+
								  '<wps:DataInputs>'+
								    '<wps:Input>'+
								      '<ows:Identifier>input</ows:Identifier>'+
								      '<wps:Data>'+
								        '<wps:LiteralData>'+ selected_features +'</wps:LiteralData>'+
								      '</wps:Data>'+
								    '</wps:Input>'+
								  '</wps:DataInputs>'+
								  '<wps:ResponseForm>'+
								    '<wps:RawDataOutput mimeType="text/plain">'+
								      '<ows:Identifier>output</ows:Identifier>'+
								    '</wps:RawDataOutput>'+
								  '</wps:ResponseForm>'+
								'</wps:Execute>';

					$.post( "http://localhost:9000/wps/cgi-bin/wps", request_process, function( data ) {
						that.plotdata = data;
						that.render(that.plot_type);
					});

				}else{
					this.plotdata = [];
					this.selection_list = [];
					this.render(this.plot_type);
				}

				
			},

			onTimeChange: function () {},

			onClose: function(){
				this.$el.empty();
				this.isClosed = true;
				
			}
		});

		return AnalyticsView;
	});