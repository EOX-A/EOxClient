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
		return this.objects[key];	
	}

	_.extend(ObjectStore.prototype, Backbone.Events);

  return ObjectStore;
})


