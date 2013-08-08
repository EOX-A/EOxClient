(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator',
		'underscore'
	],

	function( Backbone, Communicator, UIElementTmpl ) {

		var LayerSelectionView = Backbone.Marionette.CollectionView.extend({

			tagName: "ul",

			/*events: {
		        'update-sort': 'updateSort'
		    },*/

			initialize: function(options) {
			},
			onShow: function(view){

				this.listenTo(Communicator.mediator, "productCollection:update-sort", this.updateSort);

				$( ".sortable" ).sortable({
					revert: true,

					stop: function(event, ui) {
						ui.item.trigger('drop', ui.item.index());
		        	}
			    });
			},

			updateSort: function(options) {      
				console.log("LayerSelectionView: updateSort event received");      
		        this.collection.remove(options.model);

		        this.collection.each(function (model, index) {
		            var ordinal = index;
		            if (index >= options.position)
		                ordinal += 1;
		            model.set('ordinal', ordinal);
		        });            

		        options.model.set('ordinal', options.position);
		        this.collection.add(options.model, {at: options.position});

		        //this.render();
		    }




		});

		return LayerSelectionView;

	});

}).call( this );