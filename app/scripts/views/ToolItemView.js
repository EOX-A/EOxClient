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
