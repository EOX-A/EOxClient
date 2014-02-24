//-------------------------------------------------------------------------------
//
// Project: EOxClient <https://github.com/EOX-A/EOxClient>
// Authors: Daniel Santillan <daniel.santillan@eox.at>
//
//-------------------------------------------------------------------------------
// Copyright (C) 2014 EOX IT Services GmbH
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies of this Software or works derived from this Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//-------------------------------------------------------------------------------

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
