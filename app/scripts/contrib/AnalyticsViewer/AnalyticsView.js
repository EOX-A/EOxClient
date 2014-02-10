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
				this.isClosed = true;
				this.selection_list = [];
				this.plotdata = [];
				this.plot_type = 'scatter';
				this.selected_time = Communicator.reqres.request('get:time');
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
				
				//this.delegateEvents();
				this.isClosed = false;
				//this.triggerMethod('view:connect');

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

				this.$('.d3canvas').empty();
				var args = {
					selector: this.$('.d3canvas')[0],
					data: this.plotdata
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
				
				if(feature){
					this.selection_list.push(feature);
					this.sendRequest();
				}else{
					this.plotdata = [];
					this.selection_list = [];
					this.render(this.plot_type);
				}

				
			},

			onTimeChange: function (time) {
				this.selected_time = time;
				this.sendRequest();
			},

			sendRequest: function(){

				var that = this;

				var list = "";
				for (var i=0;i<this.selection_list.length;i++){
					list += this.selection_list[i].x +','+ this.selection_list[i].y + ';';
				}
				list = list.substring(0, list.length - 1);

				request_process = '<?xml version="1.0" encoding="UTF-8"?>'+
				'<wps:Execute version="1.0.0" service="WPS" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wps/1.0.0" xmlns:wfs="http://www.opengis.net/wfs" xmlns:wps="http://www.opengis.net/wps/1.0.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wcs="http://www.opengis.net/wcs/1.1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsAll.xsd">'+
				  '<ows:Identifier>getdata</ows:Identifier>'+
				  '<wps:DataInputs>'+
				    '<wps:Input>'+
				      '<ows:Identifier>collection</ows:Identifier>'+
				      '<wps:Data>'+
				        '<wps:LiteralData>SPOT4_Pente</wps:LiteralData>'+
				      '</wps:Data>'+
				    '</wps:Input>'+
				    '<wps:Input>'+
				      '<ows:Identifier>begin_time</ows:Identifier>'+
				      '<wps:Data>'+
				        '<wps:LiteralData>'+ getISODateTimeString(this.selected_time.start) +'</wps:LiteralData>'+
				      '</wps:Data>'+
				    '</wps:Input>'+
				    '<wps:Input>'+
				      '<ows:Identifier>end_time</ows:Identifier>'+
				      '<wps:Data>'+
				        '<wps:LiteralData>'+ getISODateTimeString(this.selected_time.end) +'</wps:LiteralData>'+
				      '</wps:Data>'+
				    '</wps:Input>'+
				    '<wps:Input>'+
				      '<ows:Identifier>coord_list</ows:Identifier>'+
				      '<wps:Data>'+
				        '<wps:LiteralData>'+ list +'</wps:LiteralData>'+
				      '</wps:Data>'+
				    '</wps:Input>'+
				    '<wps:Input>'+
				      '<ows:Identifier>srid</ows:Identifier>'+
				      '<wps:Data>'+
				        '<wps:LiteralData>4326</wps:LiteralData>'+
				      '</wps:Data>'+
				    '</wps:Input>'+
				  '</wps:DataInputs>'+
				  '<wps:ResponseForm>'+
				    '<wps:RawDataOutput mimeType="text/plain">'+
				      '<ows:Identifier>processed</ows:Identifier>'+
				    '</wps:RawDataOutput>'+
				  '</wps:ResponseForm>'+
				'</wps:Execute>';

				$.post( "http://demo.v-manip.eox.at/browse/ows", request_process, function( data ) {
					that.plotdata = data;
					that.render(that.plot_type);
				});
			},

			close: function() {
	            this.isClosed = true;
	            this.triggerMethod('view:disconnect');
	        },

			/*onClose: function(){
				this.$el.empty();
				this.isClosed = true;
				
			}*/
		});

		return AnalyticsView;
	});