
// globals
define(['backbone', 'objectStore'], function(Backbone, ObjectStore) {
	return {
		objects: new ObjectStore(),
		selections: new ObjectStore(),
		baseLayers: new Backbone.Collection(),
		products: new Backbone.Collection(),
		overlays: new Backbone.Collection()
	}
});