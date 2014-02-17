define([
	'xtk',
	'xtk-gui',
	'jquery'
], function(X, dat, $) {

	'use strict';

	function XTKViewer(opts) {
		dat.GUI.prototype.removeFolder = function(name) {
			if (this.__folders[name]) {
				this.__folders[name].close();
				// this.__ul.removeChild(this.__folders[name].li);
				//dom.removeClass(this.__folders[name].li, 'folder');
				this.__folders[name] = undefined;
				this.onResize();
			}
		};

		this.volumes = {};
		this.mainGUI = null;
		this.cameraPosition = opts.cameraPosition || [120, 80, 160];
		this.backgroundColor = opts.backgroundColor || [1, 1, 1];

		// create and initialize a 3D renderer
		var r = this.renderer = new X.renderer3D();
		r.container = opts.elem;
		r.bgColor = this.backgroundColor;
		r.init();

		// the onShowtime method gets executed after all files were fully loaded and
		// just before the first rendering attempt
		r.onShowtime = function() {
			if (this.baseInitDone) {
				return;
			}

			// (we need to create the GUI during onShowtime(..) since we do not know the
			// volume dimensions before the loading was completed)
			var gui = this.mainGUI = new dat.GUI({
				autoPlace: true
			});

			//var customContainer = document.getElementById('my-gui-container');
			r.container.appendChild(gui.domElement);

			_.forEach(this.volumes, function(value, key) {
				this.addVolumeToGUI(key, value, gui);
			}.bind(this));

			this.baseInitDone = true;
		}.bind(this);

		// adjust the camera position a little bit, just for visualization purposes
		r.camera.position = this.cameraPosition;

		// showtime! this triggers the loading of the volume and executes
		// r.onShowtime() once done
		r.render();
	};

	XTKViewer.prototype.onResize = function() {
		this.renderer.resetBoundingBox();
		this.renderer.resetViewAndRender();
	};

	XTKViewer.prototype.addVolume = function(opts) {
		var volume = new X.volume();
		volume.file = opts.filename;

		volume.volumeRendering = opts.volumeRendering || undefined;
		volume.upperThreshold = opts.upperThreshold || undefined;
		volume.opacity = opts.opacity || undefined;
		volume.minColor = opts.minColor || undefined;
		volume.maxColor = opts.maxColor || undefined;
		volume.reslicing = opts.reslicing || undefined;

		var label = opts.label || 'Volume';
		this.volumes[label] = volume;
		this.renderer.add(volume);

		this.addVolumeToGUI(label, volume, this.mainGUI);
	};

	XTKViewer.prototype.addVolumeToGUI = function(label, volume) {
		this.mainGUI.removeFolder(label);

		// the following configures the gui for interacting with the X.volume
		var volumegui = this.mainGUI.addFolder(label);
		// now we can configure controllers which..
		// .. switch between slicing and volume rendering
		var vrController = volumegui.add(volume, 'volumeRendering');
		// the min and max color which define the linear gradient mapping
		var minColorController = volumegui.addColor(volume, 'minColor');
		var maxColorController = volumegui.addColor(volume, 'maxColor');
		// .. configure the volume rendering opacity
		var opacityController = volumegui.add(volume, 'opacity', 0, 1).listen();
		// .. and the threshold in the min..max range
		var lowerThresholdController = volumegui.add(volume, 'lowerThreshold',
			volume.min, volume.max);
		var upperThresholdController = volumegui.add(volume, 'upperThreshold',
			volume.min, volume.max);
		var lowerWindowController = volumegui.add(volume, 'windowLow', volume.min,
			volume.max);
		var upperWindowController = volumegui.add(volume, 'windowHigh', volume.min,
			volume.max);
		// the indexX,Y,Z are the currently displayed slice indices in the range
		// 0..dimensions-1
		var sliceXController = volumegui.add(volume, 'indexX', 0,
			volume.range[0] - 1);
		var sliceYController = volumegui.add(volume, 'indexY', 0,
			volume.range[1] - 1);
		var sliceZController = volumegui.add(volume, 'indexZ', 0,
			volume.range[2] - 1);
		volumegui.open();
	};

	XTKViewer.prototype.destroy = function() {
		this.renderer.destroy();
		this.removeGui(this.mainGUI);
	};

	XTKViewer.prototype.removeGui = function(gui) {
		var el = gui.domElement;
		el.parentNode.removeChild(el);
	}
	
	return XTKViewer;
});