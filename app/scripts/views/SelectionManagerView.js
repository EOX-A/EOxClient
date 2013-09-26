(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/SelectionManager',
		'underscore'
	],

	function( Backbone, Communicator, SelectionManagerTmpl ) {

		var SelectionManagerView = Backbone.Marionette.ItemView.extend({
			tagName: "div",
      		className: "well selectionManager",
			template: {type: 'handlebars', template: SelectionManagerTmpl},

			initialize: function(options) {
			},

			onShow: function (view){
				this.$('.close').on("click", _.bind(this.onClose, this));
        		this.$el.draggable({ containment: "#content" , scroll: false});
			},

			events: {
		        "change #upload-selection": "onUploadSelectionChanged",
		        "click #btn-export-selection": "onExportSelectionClicked",
		        "click #btn-save-selection": "onSaveSelectionClicked",
		        'change input[type="checkbox"]': "onSelectionSelected"
	      	},

	      	onUploadSelectionChanged: function(evt) {
	      		var reader = new FileReader();
				reader.onloadend = function(evt) {
					Communicator.mediator.trigger("map:load:geojson", evt.target.result);
				}

				reader.readAsText(evt.target.files[0]);
	      	},

	      	onExportSelectionClicked: function() {
	      		Communicator.mediator.trigger("map:export:geojson");
	      	},

	      	onSaveSelectionClicked: function() {

	      	},

	      	onSelectionSelected: function() {

	      	},

	      	onClose: function(){
	      		Communicator.mediator.trigger("ui:close", "selectionManager");
	      		this.close();
	      	}

		});

		return {'SelectionManagerView':SelectionManagerView};

	});

}).call( this );