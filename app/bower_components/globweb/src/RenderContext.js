/***************************************
 * Copyright 2011, 2012 GlobWeb contributors.
 *
 * This file is part of GlobWeb.
 *
 * GlobWeb is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, version 3 of the License, or
 * (at your option) any later version.
 *
 * GlobWeb is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with GlobWeb. If not, see <http://www.gnu.org/licenses/>.
 ***************************************/
 
define([ './Frustum', './Numeric', './CoordinateSystem', './glMatrix' ], 
	function( Frustum, Numeric, CoordinateSystem ) {

/**************************************************************************************************************/

/** 
	@constructor
	Function constructor for RencerContext
*/
var RenderContext = function(options)
{
	/**
	 * Private properties
	 */
	 
	/**
	 * Private method
	 */

	
	/**
	 * Constructor
	 */
	this.shadersPath = options['shadersPath'] || "../shaders/";
	this.tileErrorTreshold = options['tileErrorTreshold'] || 4;
	this.lighting = options['lighting'] || false;
	this.continuousRendering = options['continuousRendering'] || false;
	this.stats = null;

	// Init GL
	var canvas = null;
	
	// Check canvas options
	if (!options['canvas'])
		throw "GlobWeb : no canvas in options";
	

	if (typeof options['canvas'] == "string") 
	{
		canvas = document.getElementById(options['canvas']);
	}
	else
	{
		canvas = options['canvas'];
	}
	
	// Check canvas is valid
	if (!canvas instanceof HTMLCanvasElement)
		throw "GlobWeb : invalid canvas";
		
	// Create the webl context
	var names = ["webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
	var gl = null;
	for (var ii = 0; ii < names.length && gl == null; ++ii) 
	{
		try 
		{
		  gl = canvas.getContext(names[ii], RenderContext.contextAttributes);
		} 
		catch(e) {}
	}
	
	if ( gl == null )
		throw "GlobWeb : WebGL context cannot be initialized";

	
	if ( options['backgroundColor'] )
	{
		var color = options['backgroundColor'];
		gl.clearColor(color[0],color[1],color[2],color[3]);
	}
	else
	{
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
	}
	
	gl.pixelStorei( gl['UNPACK_COLORSPACE_CONVERSION_WEBGL'], gl.NONE );
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
		
	// Store local variable into static object
	this.viewMatrix = mat4.create();
	this.modelViewMatrix =  mat4.create();
	this.projectionMatrix = mat4.create();
	this.gl = gl;
	this.canvas = canvas;
	this.frustum = new Frustum();
	this.worldFrustum = new Frustum();
	this.localFrustum = new Frustum();
	this.eyePosition = vec3.create();
	this.eyeDirection = vec3.create();
	this.minNear = 0.00001;
	this.near = RenderContext.minNear;
	this.far = 6.0;
	this.numActiveAttribArray = 0;
	this.frameRequested = false;
	this.fov = 45;
	
	
	// Initialize the window requestAnimationFrame
	if ( !window.requestAnimationFrame ) 
	{
		window.requestAnimationFrame = ( function() {
			return window.webkitRequestAnimationFrame ||
				 window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame ||
				window.msRequestAnimationFrame ||
				function( callback, element ) { window.setTimeout( callback, 1000 / 60 );};
			} )();
	}
}

/**************************************************************************************************************/

/** 
	The context attributes used when creating WebGL context, see WebGL specification.
	Can be changed by the renderers if needed, or by an external interface.
*/
RenderContext.contextAttributes = {};

/**************************************************************************************************************/

/** 
	Request a frame
*/
RenderContext.prototype.requestFrame = function()
{	
	if (!this.frameRequested)
	{
		window.requestAnimationFrame(this.frame);
		this.frameRequested = true;
	}
}
/**************************************************************************************************************/

/** 
	Update properies that depends on the view matrix
*/
RenderContext.prototype.updateViewDependentProperties = function()
{
	var inverseViewMatrix = mat4.create();
	mat4.inverse( this.viewMatrix, inverseViewMatrix );
	
	vec3.set( [ 0.0, 0.0, 0.0 ], this.eyePosition );
	mat4.multiplyVec3( inverseViewMatrix, this.eyePosition );
	
	vec3.set( [ 0.0, 0.0, -1.0 ], this.eyeDirection );
	mat4.rotateVec3( inverseViewMatrix, this.eyeDirection );
	
	this.pixelSizeVector = this.computePixelSizeVector();
	
	// Init projection matrix
	mat4.perspective(this.fov, this.canvas.width / this.canvas.height, this.minNear, this.far, this.projectionMatrix);
	
	// Compute the frustum from the projection matrix
	this.frustum.compute(this.projectionMatrix);
	
	// Compute the world frustum
	this.worldFrustum.inverseTransform( this.frustum, this.viewMatrix );
	
	// Init near and far to 'invalid' values
	this.near = 1e9;
	this.far = 0.0;
}

/**************************************************************************************************************/

/**
	Get mouse coordinates relative to the canvas element
*/
RenderContext.prototype.getXYRelativeToCanvas = function(event)
{
	// cf. http://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
	var pos = [];
	if (event.pageX || event.pageY)
	{
		pos[0] = event.pageX;
		pos[1] = event.pageY;
	}
	else
	{ 
		pos[0] = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
		pos[1] = event.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
	}
	
	var element = this.canvas; 
	while (element)
	{
		pos[0] -= element.offsetLeft;
		pos[1] -= element.offsetTop;
		element = element.offsetParent;
	}
        
	return pos;
}


/**************************************************************************************************************/

/** 
	Compute the pixel size vector
*/
RenderContext.prototype.computePixelSizeVector = function( mv )
{
	// pre adjust P00,P20,P23,P33 by multiplying them by the viewport window matrix.
	// here we do it in short hand with the knowledge of how the window matrix is formed
	// note P23,P33 are multiplied by an implicit 1 which would come from the window matrix.
	// Robert Osfield, June 2002.
	
	var width = this.canvas.width;
	var height = this.canvas.height;
	var P = this.projectionMatrix;
	var V = mv || this.viewMatrix;
	
	// scaling for horizontal pixels
	var P00 = P[0]*width*0.5;
	var P20_00 = P[8]*width*0.5 + P[11]*width*0.5;
	var scale_00 = [ V[0]*P00 + V[2]*P20_00,
			V[4]*P00 + V[6]*P20_00,
			V[8]*P00 + V[10]*P20_00 ];

	// scaling for vertical pixels
	var P10 = P[5]*height*0.5;
	var P20_10 = P[9]*height*0.5 + P[11]*height*0.5;
	var scale_10 = [ V[1]*P10 + V[2]*P20_10,
			V[5]*P10 + V[6]*P20_10,
			V[9]*P10 + V[10]*P20_10 ];

	var P23 = P[11];
	var P33 = P[15];
	var pixelSizeVector = [V[2]*P23,
				V[6]*P23,
				V[10]*P23,
				V[14]*P23 + V[15]*P33];

	var scaleRatio  = 0.7071067811 / Math.sqrt( vec3.dot(scale_00,scale_00)+ vec3.dot(scale_10,scale_10) );
	pixelSizeVector[0] *= scaleRatio;
	pixelSizeVector[1] *= scaleRatio;
	pixelSizeVector[2] *= scaleRatio;
	pixelSizeVector[3] *= scaleRatio;

	return pixelSizeVector;
}
/**************************************************************************************************************/

/** 
	Get 3D from a pixel
*/
RenderContext.prototype.get3DFromPixel = function(x,y)
{
	// reverse y because (0,0) is top left but opengl's normalized
	// device coordinate (-1,-1) is bottom left
	var nx = ((x / this.canvas.width) * 2.0) - 1.0;
	var ny = -(((y / this.canvas.height) * 2.0) - 1.0);
	
	var tmpMat = mat4.create();
	mat4.multiply(this.projectionMatrix, this.viewMatrix, tmpMat);
	mat4.inverse(tmpMat);
	// Transform pos to world using inverse viewProjection matrix
	var worldPick = mat4.multiplyVec4(tmpMat, [ nx, ny, -1, 1]);
	worldPick[0] /= worldPick[3];
	worldPick[1] /= worldPick[3];
	worldPick[2] /= worldPick[3];
	
	// Shoot a ray from the camera to the picked point
	// Get camera position
	mat4.inverse(this.viewMatrix, tmpMat);
	var worldCam = [tmpMat[12], tmpMat[13], tmpMat[14]];
	var rayDirection = vec3.create();
	vec3.subtract(worldPick, worldCam, rayDirection);
	vec3.normalize(rayDirection);
	
	// Intersect earth sphere
	var t = Numeric.raySphereIntersection(worldCam, rayDirection, [0.0, 0.0, 0.0], CoordinateSystem.radius);
	if (t >= 0)
	{
		var pos3d = Numeric.pointOnRay(worldCam, rayDirection, t);
		return pos3d;
	}
	
	return null;
}

/**************************************************************************************************************/

/** 
	Get pixel from 3D
*/
RenderContext.prototype.getPixelFrom3D = function(x,y,z)
{
	var viewProjectionMatrix = mat4.create();
	mat4.multiply(this.projectionMatrix, this.viewMatrix, viewProjectionMatrix);
	
	// transform world to clipping coordinates
	var point3D = [x,y,z,1];
	mat4.project(viewProjectionMatrix, point3D);
	
	// transform clipping to window coordinates
	var winX = Math.round( ( 1 + point3D[0] ) * 0.5 * this.canvas.width );
	
	// reverse y because (0,0) is top left but opengl's normalized
	// device coordinate (-1,-1) is bottom left
	var winY = Math.round( ( 1 - point3D[1] ) * 0.5 * this.canvas.height );

	return [winX, winY];
}

/**************************************************************************************************************/

/** 
	Create a non power of two texture from an image
*/
RenderContext.prototype.createNonPowerOfTwoTextureFromImage = function(image)
{	
	var gl = this.gl;
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	return tex;
}

/**************************************************************************************************************/

return RenderContext;

});
