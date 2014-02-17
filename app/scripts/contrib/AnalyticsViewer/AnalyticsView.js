define(['backbone.marionette',
		'communicator',
		'app',
		'models/AnalyticsModel',
		'globals',
		'hbs!tmpl/wps_getdata',
		'd3',
		'analytics',
		'nv'
	],
	function(Marionette, Communicator, App, AnalyticsModel, globals, wps_getdataTmpl) {

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

				var request_process = wps_getdataTmpl({
					layer: "SPOT4_Pente",
					start: getISODateTimeString(this.selected_time.start),
					end: getISODateTimeString(this.selected_time.end),
					list: list,
					srid: "4326"
				});
				console.log(request_process);

				$.post( "http://demo.v-manip.eox.at/browse/ows", request_process, function( data ) {
					that.plotdata = data;
					that.render(that.plot_type);
				});
			},

			close: function() {
	            this.isClosed = true;
	            this.triggerMethod('view:disconnect');
	        }

		});

		return AnalyticsView;
	});