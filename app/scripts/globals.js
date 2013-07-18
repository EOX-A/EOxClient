
// globals
define(['backbone', 'objectStore'], function(Backbone, ObjectStore) {
	console.log("Globals object initialized");
	return {
		objects: new ObjectStore(),
		selections: new ObjectStore(),
		baseLayers: new Backbone.Collection(),
		products: new Backbone.Collection(),
		overlays: new Backbone.Collection()
	}
});