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
			}, 

			onClick: function(evt){
                if(this.model.get('active')){
                	Communicator.mediator.trigger('selection:deactivated',this.model);
                	console.log("Event triggered: "+ 'selection:deactivated'+this.model.get('id'));
                	this.model.set({active:false});
                }else{
                	Communicator.mediator.trigger('selection:activated',this.model);
                	console.log("Event triggered: "+ 'selection:activated'+this.model.get('id'))
                	this.model.set({active:true});
                }
                this.render();
            },
            onSelectionActivated:function(model) {
            	if(this.model != model && this.model.get('active')){
            		this.model.set({active:false});
            		this.render();
            	}
            }

		});
		return {'ToolItemView':ToolItemView};
	});
}).call( this );