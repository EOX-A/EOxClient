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
      		className: "well selectionManager",
			template: {type: 'handlebars', template: SelectionManagerTmpl},

			initialize: function(options) {

				/*localStorage.setObject = [
					{id:1, name:"test1", date:"2013"},
					{id:2, name:"test2", date:"2013"},
					{id:3, name:"test3", date:"2013"}
				];*/

			},

			onShow: function (view){
				this.$('.close').on("click", _.bind(this.onClose, this));
        		this.$el.draggable({ containment: "#content" , scroll: false});


        		//console.log(localStorage.getItem('selections'));
        		_.each(localStorage.getObject('selections'), function(selection) {
        			console.log(selection);
					var $html = $(SelectionTemplate(selection));
					$('#selectionList').append($html);
				}, this);
			},



			events: {
		        "change #upload-selection": "onUploadSelectionChanged",
		        "click #btn-export-selection": "onExportSelectionClicked",
		        "click #btn-save-selection": "onSaveSelectionClicked",
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
	      		var selections = localStorage.getObject('selections');
	      		var selectedfeatures = this.model.get('selections');

	      		for(var i in selectedfeatures){
	      			//features = console.log(selectedfeatures[i].components[0].components);
	      			_.extend(features, selectedfeatures[i]);
	      		}
	      		console.log(features);
	      		_.extend(selections, features);
	      		//
	      		
	      		localStorage.setObject('selections', selections);

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