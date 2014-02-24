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
		'hbs!tmpl/BulletLayer',
		'underscore'
	],
	function( Backbone, Communicator, BulletLayerTmpl) {
		var ToolItemView = Backbone.Marionette.ItemView.extend({
			events: {
				'click': 'onClick'
			},

			initialize: function(options) {
				this.listenTo(Communicator.mediator, "selection:activated", this.onSelectionActivated);
				this.listenTo(Communicator.mediator, "ui:close", this.onDialogClose);
				this.listenTo(Communicator.mediator, "selection:enabled", this.onSelectionEnabled);
			},

			onClick: function(evt){
				if(this.model.get('enabled')){
					if(this.model.get('type') == 'selection'){
						if(this.model.get('active')){
		                	Communicator.mediator.trigger('selection:activated',{id:this.model.get('id'),active:false});
		                	this.model.set({active:false});
		                }else{
		                	Communicator.mediator.trigger('selection:activated',{id:this.model.get('id'),active:true});
		                	this.model.set({active:true});
		                }
					}else{
						if(this.model.get('active')){
		                	Communicator.mediator.trigger(this.model.get('eventToRaise'), false);
		                	this.model.set({active:false});
		                }else{
		                	Communicator.mediator.trigger(this.model.get('eventToRaise'), true);
		                	this.model.set({active:true});
		                }
					}
	                this.render();
	            }
            },
            onSelectionActivated: function(arg) {
            	if(arg.active){
	        		if(this.model.get('id') != arg.id && this.model.get('active')){
	            		this.model.set({active:false});
	            		this.render();
	            	}
            	}
            },

            onDialogClose: function(id) {
            	if(this.model.get('id') == id){
            		this.model.set({active:false});
            		this.render();
            	}
            },

            onSelectionEnabled: function(arg) {
            	if(this.model.get('id')==arg.id){
            		this.model.set({enabled: arg.enabled});
            		this.render();
            	}
            },
            onRender: function () {
                if(this.$el.is("div")) {
                    this.setElement($(this.$el.children()[0]).unwrap());
                } else if(this.$el.is("button")) {
                    this.setElement($(this.$el.children()[0]).unwrap());
                }
            }
		});
		return {'ToolItemView':ToolItemView};
	});
}).call( this );
