define(['backbone'], function() {

	var ObjectStore = function() {
		this.objects = {};
	}

	ObjectStore.prototype.add = function(key, value) {
		this.objects[key] = value;
		this.trigger("add", value);
	}

	ObjectStore.prototype.remove = function(key) {
		var value = this.object[key];
		delete this.objects[key];
		this.trigger("remove", value);
	}

	ObjectStore.prototype.get = function(key) {
		return this.object[key];	
	}

	_.extend(ObjectStore, Backbone.Events);

  return ObjectStore;
})


