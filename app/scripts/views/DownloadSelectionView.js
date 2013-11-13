(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/DownloadSelection',
		'underscore',
		"bootstrap-datepicker"
	],

	function( Backbone, Communicator, DownloadSelectionTmpl ) {

		var DownloadSelectionView = Backbone.Marionette.CompositeView.extend({  

			tagName: "div",
			className: "panel panel-default downloadselection not-selectable",
			template: {type: 'handlebars', template: DownloadSelectionTmpl},
			events: {
				'click #btn-draw-bbox':'onBBoxClick',
				"click #btn-clear-bbox" : 'onClearClick',
				"click #btn-download" : 'onDownloadClick',
				"change #txt-minx" : "onBBoxChange",
				"change #txt-maxx" : "onBBoxChange",
				"change #txt-miny" : "onBBoxChange",
				"change #txt-maxy" : "onBBoxChange",
				'changeDate': "onChangeDate"
			},

			/*initialize: function  (model) {
				this.times = model.get("ToI");
			},		*/

			onShow: function (view) {

				this.listenTo(Communicator.mediator, 'time:change', this.onTimeChange);
	        	this.listenTo(Communicator.mediator, "selection:changed", this.onSelectionChange);

				this.$('.close').on("click", _.bind(this.onClose, this));
				this.$el.draggable({ 
		    		containment: "#content" ,
		    		scroll: false,
		    		handle: '.panel-heading'
		    	});

		    	this.$('#div-date-begin input[type="text"]').datepicker({autoclose: true, format: "dd/mm/yyyy"});
		    	this.$('#div-date-begin input[type="text"]').datepicker('update', this.model.get('ToI').start);
		    	this.$('#div-date-begin input[type="text"]').datepicker('setDate', this.model.get('ToI').start);

		    	this.$('#div-date-end input[type="text"]').datepicker({autoclose: true, format: "dd/mm/yyyy"});
		    	this.$('#div-date-end input[type="text"]').datepicker('update', this.model.get('ToI').end);

				$(document).on('touch click', '#div-date-begin .input-group-addon', function(e){
				    $('input[type="text"]', $(this).parent()).focus();
				});
				$(document).on('touch click', '#div-date-end .input-group-addon', function(e){
				    $('input[type="text"]', $(this).parent()).focus();
				});

			},

			onBBoxClick: function() {
				$("#txt-minx").val("");
				$("#txt-maxx").val("");
				$("#txt-miny").val("");
				$("#txt-maxy").val("");
				Communicator.mediator.trigger('selection:activated',{id:"bboxSelection",active:true});
			},

			onClearClick: function () {
				Communicator.mediator.trigger('selection:activated',{id:"bboxSelection",active:false});
				$("#txt-minx").val("");
				$("#txt-maxx").val("");
				$("#txt-miny").val("");
				$("#txt-maxy").val("");
			},

			onDownloadClick: function () {
				Communicator.mediator.trigger("dialog:open:download", true);
			},

			onTimeChange: function (time) {
		    	this.$('#div-date-begin input[type="text"]').datepicker('update', this.model.get('ToI').start);
		    	this.$('#div-date-end input[type="text"]').datepicker('update', this.model.get('ToI').end);
			},

			onChangeDate: function (evt) {
				var opt = {
					start: this.$('#div-date-begin input[type="text"]').datepicker('getDate'),
					end: this.$('#div-date-end input[type="text"]').datepicker('getDate')
				};
				Communicator.mediator.trigger('date:selection:change', opt);
			},

			onSelectionChange: function (obj) {
				if (obj){
					$("#txt-minx").val(obj.bounds.left);
					$("#txt-maxx").val(obj.bounds.right);
					$("#txt-miny").val(obj.bounds.bottom);
					$("#txt-maxy").val(obj.bounds.top);
				}
				
			},

			onBBoxChange: function (event) {

				var values = {
					left: parseFloat($("#txt-minx").val()),
					right: parseFloat($("#txt-maxx").val()),
					bottom: parseFloat($("#txt-miny").val()),
					top: parseFloat($("#txt-maxy").val())
				};

				if(!isNaN(values.left) && !isNaN(values.right) &&
					!isNaN(values.bottom) && !isNaN(values.top) ) {
					
					if ( !(values.left > values.right || values.bottom > values.top)){
						Communicator.mediator.trigger('selection:bbox:changed',values);
					}
				}
			},


			onClose: function() {
				this.close();
			}
			
		});
		return {'DownloadSelectionView':DownloadSelectionView};
	});

}).call( this );