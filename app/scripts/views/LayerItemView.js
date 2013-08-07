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
		var ProductSelectionView = Backbone.Marionette.ItemView.extend({

			template: {
				type: 'handlebars',
				template: BulletLayerTmpl
			},

			initialize: function(options) {
			}, 

			events: {'click': 'itemClicked'},
			itemClicked: function(evt){
                console.log('LayerItemClicked: '+ this.model.get('name'));
                var isBaseLayer = false;
                if (this.model.get('isBaseLayer'))
                	isBaseLayer = true;
                var options = { name: this.model.get('name'), isBaseLayer: isBaseLayer, visible: evt.target.checked };
                Communicator.mediator.trigger('Map:ChangeBaseLayer', options);
            }     

		});
		return ProductSelectionView;
	});
}).call( this );