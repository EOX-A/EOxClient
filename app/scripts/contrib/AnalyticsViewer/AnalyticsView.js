define(['backbone.marionette',
		'communicator',
		'app',
		'models/AnalyticsModel',
		'globals',
		'd3'
	],
	function(Marionette, Communicator, App, AnalyticsModel, globals) {

		var AnalyticsView = Marionette.View.extend({

			model: new AnalyticsModel.AnalyticsModel(),
			className: "d3test",

			initialize: function(options) {

				$(window).resize(function() {
					this.onResize();
				}.bind(this));
			},

			onShow: function() {
				this.isClosed = false;



				/*###############################################################*/
				/*########################### D3JS Test #########################*/
				/*###############################################################*/

				//console.log(this.$el.width());

				var margin = {top: 60, right: 40, bottom: 80, left: 70},
				    width = this.$el.width() - margin.left - margin.right,
				    height = this.$el.height() - margin.top - margin.bottom;

				var x = d3.scale.linear()
				    .range([0, width]);

				var y = d3.scale.linear()
				    .range([height, 0]);

				var color = d3.scale.category10();

				var xAxis = d3.svg.axis()
				    .scale(x)
				    .orient("bottom");

				var yAxis = d3.svg.axis()
				    .scale(y)
				    .orient("left");

				var svg = d3.select(this.el).append("svg")
				    .attr("width", width + margin.left + margin.right)
				    .attr("height", height + margin.top + margin.bottom)
				  .append("g")
				    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

				d3.tsv("data.tsv", function(error, data) {
				  data.forEach(function(d) {
				    d.sepalLength = +d.sepalLength;
				    d.sepalWidth = +d.sepalWidth;
				  });

				  x.domain(d3.extent(data, function(d) { return d.sepalWidth; })).nice();
				  y.domain(d3.extent(data, function(d) { return d.sepalLength; })).nice();

				  svg.append("g")
				      .attr("class", "x axis")
				      .attr("transform", "translate(0," + height + ")")
				      .call(xAxis)
				    .append("text")
				      .attr("class", "label")
				      .attr("x", width)
				      .attr("y", -6)
				      .style("text-anchor", "end")
				      .text("Sepal Width (cm)");

				  svg.append("g")
				      .attr("class", "y axis")
				      .call(yAxis)
				    .append("text")
				      .attr("class", "label")
				      .attr("transform", "rotate(-90)")
				      .attr("y", 6)
				      .attr("dy", ".71em")
				      .style("text-anchor", "end")
				      .text("Sepal Length (cm)")

				  svg.selectAll(".dot")
				      .data(data)
				    .enter().append("circle")
				      .attr("class", "dot")
				      .attr("r", 3.5)
				      .attr("cx", function(d) { return x(d.sepalWidth); })
				      .attr("cy", function(d) { return y(d.sepalLength); })
				      .style("fill", function(d) { return color(d.species); });

				  var legend = svg.selectAll(".legend")
				      .data(color.domain())
				    .enter().append("g")
				      .attr("class", "legend")
				      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

				  legend.append("rect")
				      .attr("x", width - 18)
				      .attr("width", 18)
				      .attr("height", 18)
				      .style("fill", color);

				  legend.append("text")
				      .attr("x", width - 24)
				      .attr("y", 9)
				      .attr("dy", ".35em")
				      .style("text-anchor", "end")
				      .text(function(d) { return d; });

			      });
		/*###############################################################*/
		/*########################### D3JS Test End #####################*/
		/*###############################################################*/


				this.onResize();
				return this;
			},

			onResize: function() {
			},

			changeLayer: function(options) {},
			onSortProducts: function(productLayers) {},
			onSelectionActivated: function(arg) {},
			onTimeChange: function () {},

			onClose: function(){
				this.$el.empty();
				this.isClosed = true;
				
			}
		});

		return AnalyticsView;
	});