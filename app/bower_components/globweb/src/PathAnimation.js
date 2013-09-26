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

 define(['./Utils','./Animation','./CoordinateSystem','./Numeric'], function(Utils,Animation,CoordinateSystem,Numeric) {

/**************************************************************************************************************/

/** @export
	@constructor
  PathAnimation is an animation defined with a path.
 */
var PathAnimation = function(coords,speed,valueSetter)
{
    // Call ancestor constructor
    Animation.prototype.constructor.call(this);

    this.speed = speed * CoordinateSystem.heightScale / 1000;
	this.nodes = [];
	for ( var i = 0; i < coords.length; i++ )
	{
		var node = { position: CoordinateSystem.fromGeoTo3D(coords[i]),
					velocity: null,
					distance: 0.0 };
		this.nodes.push( node );
		if ( i > 0 )
		{
			var dx = this.nodes[i].position[0] - this.nodes[i-1].position[0];
			var dy = this.nodes[i].position[1] - this.nodes[i-1].position[1];
			var dz = this.nodes[i].position[2] - this.nodes[i-1].position[2];
			this.nodes[i-1].distance = Math.sqrt( dx*dx + dy*dy + dz*dz );
		}
	}
	
	for ( var i = 1; i <  coords.length - 1; i++ )
	{
		var vec1 = vec3.subtract( this.nodes[i+1].position, this.nodes[i].position, vec3.create() );
		var vec2 = vec3.subtract( this.nodes[i-1].position, this.nodes[i].position, vec3.create() );
		vec3.normalize(vec1);
		vec3.normalize(vec2);
		this.nodes[i].velocity = vec3.subtract( vec1, vec2, vec3.create() );
		vec3.normalize(this.nodes[i].velocity);
	}
	
	// Start velocity
	var temp = vec3.subtract( this.nodes[1].position, this.nodes[0].position, vec3.create() );
	vec3.scale( temp, ( 3 / this.nodes[0].distance ) );
	this.nodes[0].velocity = vec3.subtract( temp, this.nodes[1].velocity, vec3.create() );
	vec3.scale( this.nodes[0].velocity, 0.5 );
	
	// End velocity
	var i = coords.length - 1;
	var temp = vec3.subtract( this.nodes[i].position, this.nodes[i-1].position, vec3.create() );
	vec3.scale( temp, ( 3 / this.nodes[i-1].distance ) );
	this.nodes[i].velocity = vec3.subtract( temp, this.nodes[i-1].velocity, vec3.create() );
	vec3.scale( this.nodes[i].velocity, 0.5 );

	this.index = 0;
	this.currentDistance = 0;
	this.previousTime = -1;
	this.currentDirection = [];
	this.centerOffset = -0.2;
	this.altitudeOffset = 1000;
	
	var that = this;
	if ( valueSetter )
	{
		this.valueSetter = valueSetter;
	}
	else
	{
		this.valueSetter = function(value,direction)
		{				
			var up = vec3.normalize( value, vec3.create() );
			
			var geoEye = CoordinateSystem.from3DToGeo( value );
			geoEye[2] = that.globe.getElevation( geoEye[0], geoEye[1] ) + that.altitudeOffset;
			var eye =  CoordinateSystem.fromGeoTo3D( geoEye );
			
			//var eye = vec3.add( vec3.scale(up, (that.altitudeOffset+elevation) * CoordinateSystem.heightScale, vec3.create()), value );
			var dirn = vec3.normalize( direction, vec3.create() );
			var center = vec3.add( eye, dirn, vec3.create() );
			vec3.add( center, vec3.scale(up, that.centerOffset, vec3.create()) );
			mat4.lookAt( eye, center, up, that.globe.renderContext.viewMatrix );
		};
	}
}

/**************************************************************************************************************/

Utils.inherits(Animation,PathAnimation);

/**************************************************************************************************************/

/**
	Set the speed
 */
PathAnimation.prototype.setSpeed = function(val)
{
    this.speed = parseFloat(val) * CoordinateSystem.heightScale / 1000;
}

/**************************************************************************************************************/

/**
	Set the altitude offset
 */
PathAnimation.prototype.setAltitudeOffset = function(val)
{
	this.altitudeOffset = parseFloat(val);
}

/**************************************************************************************************************/

/**
	Set the direction angle
 */
PathAnimation.prototype.setDirectionAngle = function(vertical)
{
	this.centerOffset = Math.tan( parseFloat(vertical) * Math.PI / 180.0 );
}

/**************************************************************************************************************/

/** @export
	Start the animation
 */
PathAnimation.prototype.start = function()
{
	var previousStartTime = -1;
	if ( this.pauseTime != -1 )
	{
		previousStartTime = this.startTime;
	}

    Animation.prototype.start.call(this);
	
	if ( previousStartTime != -1 )
	{
		this.previousTime += this.startTime - previousStartTime;
	}
	else
	{
		this.previousTime = -1;
	}
}

/**************************************************************************************************************/

/*
	Animation update method
*/
PathAnimation.prototype.update = function(now)
{
	if ( this.previousTime == -1 )
	{
		this.index = 0;
		this.currentDistance = 0;
	}
	else
	{
		this.currentDistance += (now - this.previousTime) * this.speed;
	}
	this.previousTime = now;

	while ( this.currentDistance >= this.nodes[this.index].distance && this.index < this.nodes.length - 1 )
	{
		this.currentDistance -= this.nodes[this.index].distance;
		this.index = this.index + 1;
	}
	
	if ( this.index < this.nodes.length - 1 )
	{
		var t = this.currentDistance / this.nodes[this.index].distance;
		var startPos = this.nodes[this.index].position;
		var endPos = this.nodes[this.index+1].position;
		var startVel = vec3.scale( this.nodes[this.index].velocity, this.nodes[this.index].distance, vec3.create() );
		var endVel = vec3.scale( this.nodes[this.index+1].velocity, this.nodes[this.index].distance, vec3.create() );
		var position = Numeric.cubicInterpolation( t, startPos, startVel, endPos, endVel );
		var direction = Numeric.cubicInterpolationDerivative( t, startPos, startVel, endPos, endVel );
		this.valueSetter( position, direction );
	}
	else if ( this.index == this.nodes.length - 1 )
	{
		this.valueSetter( this.nodes[this.index].position, this.nodes[this.index].velocity );
	}
	else
	{
		this.stop();
	}
}

/**************************************************************************************************************/

return PathAnimation;

});
