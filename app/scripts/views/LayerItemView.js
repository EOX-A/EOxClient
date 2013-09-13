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
		var LayerItemView = Backbone.Marionette.ItemView.extend({
			tagName: "li",
			template: {
				type: 'handlebars',
				template: BulletLayerTmpl
			},
			events: {
				'drop' : 'drop',
				'change': 'onChange'
			},

			initialize: function(options) {
			}, 

			onChange: function(evt){
                console.log('LayerItemClicked: '+ this.model.get('name'));
                var isBaseLayer = false;
                if (this.model.get('isBaseLayer'))
                	isBaseLayer = true;
                var options = { name: this.model.get('name'), isBaseLayer: isBaseLayer, visible: evt.target.checked };
                Communicator.mediator.trigger('Map:ChangeBaseLayer', options);
            },

            drop: function(event, index) {
            	console.log("LayerItemView: drop event received")
		        Communicator.mediator.trigger('productCollection:update-sort', {model:this.model, position:index});
		    }

		});
		return {'LayerItemView':LayerItemView};
	});
}).call( this );