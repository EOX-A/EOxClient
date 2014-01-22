define([
	'xtk',
	'xtk-gui'
], function(X, dat) {

	'use strict';

	function XTKViewer(elem) {
		// create and initialize a 3D renderer
		var r = this.renderer = new X.renderer3D();
		r.container = elem;
		r.bgColor = [1, 1, 1];
		r.init();

		// create a X.volume
		var volume = new X.volume();
		// .. and attach the single-file dicom in .NRRD format
		// this works with gzip/gz/raw encoded NRRD files but XTK also supports other
		// formats like MGH/MGZ
		// volume.file = 'data/avf.nrrd';
		volume.file = 'data/H2O.nii.gz';
		// volume.file = 'data/Pressure.nii.gz';
		// volume.file = 'data/Temperature.nii.gz';

		volume.volumeRendering = true;
		volume.upperThreshold = 219;
		volume.opacity = 0.3;
		volume.minColor = [0.4, 0.4, 0.4];
		volume.maxColor = [0, 0, 0];
		//volume.reslicing = true;

		// //the segmentation is a X.mesh
		// var mesh = new X.mesh();
		// // .. and is loaded from a .VTK file
		// mesh.file = 'data/avf.vtk';
		// // we set the color to a lighter red
		// mesh.color = [0.7, 0.25, 0.25];
		// mesh.opacity = 0.7;
		// // and also set the visibility to false, since we add a 'load-on-demand'
		// // option for it
		// mesh.visible = false;

		// only add the volume for now, the mesh gets loaded on request
		r.add(volume);

		// the onShowtime method gets executed after all files were fully loaded and
		// just before the first rendering attempt
		r.onShowtime = function() {
			if (this.baseInitDone) {
				return;
			}

			//
			// The GUI panel
			//
			// (we need to create this during onShowtime(..) since we do not know the
			// volume dimensions before the loading was completed)

			// indicate if the mesh was loaded
			var meshWasLoaded = false;

			var gui = new dat.GUI({
				autoPlace: true
			});

			//var customContainer = document.getElementById('my-gui-container');
			r.container.appendChild(gui.domElement);

			// the following configures the gui for interacting with the X.volume
			var volumegui = gui.addFolder('Volume');
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
			//volumegui.open();

			// // now we configure the gui for interacting with the X.mesh
			// var meshgui = gui.addFolder('Mesh');
			// // the visible controller shows/hides the volume but also loads the file on
			// // demand (only the first time)
			// var meshVisibleController = meshgui.add(mesh, 'visible');
			// // .. the mesh color
			// var meshColorController = meshgui.addColor(mesh, 'color');
			// meshgui.open();

			// // meshgui callbacks
			// meshVisibleController.onChange(function(value) {

			//     if (!meshWasLoaded) {

			//         // this only gets executed the first time to load the mesh, after we
			//         // just toggle the visibility
			//         r.add(mesh);

			//         // we set the onShowtime function to a void since we don't want to
			//         // create the GUI again here
			//         //r.onShowtime = function() {};

			//         // set the loaded flag
			//         meshWasLoaded = true;
			//     }
			// });

			this.baseInitDone = true;
		}.bind(this);

		// adjust the camera position a little bit, just for visualization purposes
		r.camera.position = [120, 80, 160];

		// showtime! this triggers the loading of the volume and executes
		// r.onShowtime() once done
		r.render();
	};

	XTKViewer.prototype.onResize = function() {
		this.renderer.resetBoundingBox();
		this.renderer.resetViewAndRender();
	};

	return XTKViewer;
});