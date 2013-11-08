(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'hbs!tmpl/SelectionManager',
		'hbs!tmpl/SelectionTemplate',
		'underscore',
		'lm'
	],

	function( Backbone, Communicator, SelectionManagerTmpl, SelectionTemplate ) {

		var SelectionManagerView = Backbone.Marionette.ItemView.extend({
			tagName: "div",
      		className: "panel panel-default selectionManager not-selectable",
			template: {type: 'handlebars', template: SelectionManagerTmpl},

			initialize: function(options) {
			},

			onShow: function (view){
				this.$('.close').on("click", _.bind(this.onClose, this));
        		this.$el.draggable({ 
        			containment: "#content",
        			scroll: false,
        			handle: '.panel-heading'
        		});
        		this.renderList();
        		
			},

			renderList: function() {
				$('#selection-list').empty();
				_.each(localStorage.getObject('selections'), function(selection, i) {
        			_.extend(selection, {id:i});
					var $html = $(SelectionTemplate(selection));
					$('#selection-list').append($html);
				}, this);
			},

			events: {
		        "change #upload-selection": "onUploadSelectionChanged",
		        "click #btn-export-selection": "onExportSelectionClicked",
		        "click #btn-save-selection": "onSaveSelectionClicked",
		        "click .delete-selection": "onDeleteSelection",
		        'change input[type="radio"]': "onSelectionSelected"
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

	      		var selec_name = prompt("Please enter a name for the selection","Selection");
				if (selec_name!=null && selec_name!="") {
					var selections = localStorage.getObject('selections');
		      		if (!selections)
		      			selections = [];

		      		var gjson = Communicator.reqres.request('get:selection:json');
		      		console.log(new Date());
		      		if(gjson != "" && gjson != null){
		      			selections.push({name: selec_name, date: new Date().toUTCString(), content: gjson});
		      			localStorage.setObject('selections', selections);
		      			this.renderList();
		      		}
				}
	      	},

	      	onDeleteSelection: function (evt) {
	      		var $target = $(evt.target);
	      		var index = $target.parent().parent().parent().find("input").val();
	      		if (index > -1){
	      			var selections = localStorage.getObject('selections');
		      		if (selections){
		      			selections.splice(index,1);
		      			console.log(selections);
		      			localStorage.setObject('selections', selections);
		      			this.renderList();
		      		}
	      		}
	      	},

	      	onSelectionSelected: function(evt) {
	      		var index = $('input[type=radio]:checked').val();
	      		Communicator.mediator.trigger("map:load:geojson", localStorage.getObject('selections')[index].content);
	      	},

	      	onClose: function(){
	      		Communicator.mediator.trigger("ui:close", "selectionManager");
	      		this.close();
	      	}

		});

		return {'SelectionManagerView':SelectionManagerView};

	});

}).call( this );
