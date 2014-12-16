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

	root.require([
		'backbone',
		'communicator',
		'app'
	],

	function( Backbone, Communicator, App ) {

		var ContentController = Backbone.Marionette.Controller.extend({
            initialize: function(options){
            	this.listenTo(Communicator.mediator, "dialog:open:about", this.onDialogOpenAbout);
            	this.listenTo(Communicator.mediator, "dialog:open:help", this.onDialogOpenHelp);
            	this.listenTo(Communicator.mediator, "ui:open:legend", this.onOpenLegend);
            	this.listenTo(Communicator.mediator, "ui:open:layercontrol", this.onLayerControlOpen);
            	this.listenTo(Communicator.mediator, "ui:open:glacierlayercontrol", this.onGlacierLayerControlOpen);
            	this.listenTo(Communicator.mediator, "ui:open:toolselection", this.onToolSelectionOpen);
			},

			onOpenLegend: function(event){
				
				if (_.isUndefined(App.LegendView.isClosed) || App.LegendView.isClosed) {
				  	App.rightSideBar.show(App.LegendView);
				} else {
					App.rightSideBar.close();
                }
			},

			onDialogOpenAbout: function(event){
				App.dialogRegion.show(App.AboutView);
			},
			onDialogOpenHelp: function(event){
				App.dialogRegion.show(App.HelpView);
			},
			onLayerControlOpen: function(event){
				//We have to render the layout before we can
                //call show() on the layout's regions
                if (_.isUndefined(App.layout.isClosed) || App.layout.isClosed) {
				  	App.leftSideBar.show(App.layout);
	                App.layout.baseLayers.show(App.baseLayerView);
	                App.layout.products.show(App.productsView);
	                App.layout.overlays.show(App.overlaysView);
				} else {
					App.layout.close();
                }
               
			},
			onGlacierLayerControlOpen: function(event){
				//We have to render the layout before we can
                //call show() on the layout's regions
                if (_.isUndefined(App.glacierlayout.isClosed) || App.glacierlayout.isClosed) {
				  	App.leftSideBar.show(App.glacierlayout);
	                App.glacierlayout.products.show(App.glacierproductsView);
				} else {
					App.glacierlayout.close();
                }
               
			},

			onToolSelectionOpen: function(event){
				if (_.isUndefined(App.toolLayout.isClosed) || App.toolLayout.isClosed) {
					App.rightSideBar.show(App.toolLayout);
					App.toolLayout.selection.show(App.selectionToolsView);
					App.toolLayout.visualization.show(App.visualizationToolsView);
				} else {
					App.toolLayout.close();
				}
			}
		});
		return new ContentController();
	});

}).call( this );