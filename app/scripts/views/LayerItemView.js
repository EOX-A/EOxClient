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
			events: {
				'drop' : 'drop',
				'change': 'onChange'
			},

			initialize: function(options) {
			}, 

			onChange: function(evt){
                var isBaseLayer = false;
                if (this.model.get('isBaseLayer'))
                	isBaseLayer = true;
                var options = { name: this.model.get('name'), isBaseLayer: isBaseLayer, visible: evt.target.checked };
                Communicator.mediator.trigger('map:layer:change', options);
            },

            drop: function(event, index) {
		        Communicator.mediator.trigger('productCollection:updateSort', {model:this.model, position:index});
		    }

		});
		return {'LayerItemView':LayerItemView};
	});
}).call( this );