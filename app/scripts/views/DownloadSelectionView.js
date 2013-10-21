(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/DownloadSelection',
		'underscore'
	],

	function( Backbone, Communicator, DownloadSelectionTmpl ) {

		var DownloadSelectionView = Backbone.Marionette.CompositeView.extend({  

			tagName: "div",
			className: "well downloadselection",
			template: {type: 'handlebars', template: DownloadSelectionTmpl},
			events: {
				'click #btn-draw-bbox':'onBBoxClick',
				"click #btn-clear-bbox" : 'onClearClick',
				"click #btn-download" : 'onDownloadClick'
			},


			

			onShow: function (view) {

				this.listenTo(Communicator.mediator, 'time:change', this.onTimeChange);
	        	this.listenTo(Communicator.mediator, "selection:changed", this.onSelectionChange);

				this.$('.close').on("click", _.bind(this.onClose, this));
				this.$el.draggable({ 
		    		containment: "#content" ,
		    		scroll: false
		    	});
			},

			onBBoxClick: function() {
				Communicator.mediator.trigger('selection:activated',{id:"bboxSelection",active:true});
			},

			onClearClick: function () {
				Communicator.mediator.trigger('selection:activated',{id:"bboxSelection",active:false});
			},

			onDownloadClick: function () {
				Communicator.mediator.trigger("dialog:open:download", true);
			},

			onTimeChange: function () {

			},

			onSelectionChange: function () {

			},


			onClose: function() {
				this.close();
			}
			
		});
		return {'DownloadSelectionView':DownloadSelectionView};
	});

}).call( this );