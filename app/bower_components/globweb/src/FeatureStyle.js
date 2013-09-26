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

 define( function() {
 
 
// Simple colors
var simple_colors = {
   aliceblue: 'f0f8ff',
   antiquewhite: 'faebd7',
   aqua: '00ffff',
   aquamarine: '7fffd4',
   azure: 'f0ffff',
   beige: 'f5f5dc',
   bisque: 'ffe4c4',
   black: '000000',
   blanchedalmond: 'ffebcd',
   blue: '0000ff',
   blueviolet: '8a2be2',
   brown: 'a52a2a',
   burlywood: 'deb887',
   cadetblue: '5f9ea0',
   chartreuse: '7fff00',
   chocolate: 'd2691e',
   coral: 'ff7f50',
   cornflowerblue: '6495ed',
   cornsilk: 'fff8dc',
   crimson: 'dc143c',
   cyan: '00ffff',
   darkblue: '00008b',
   darkcyan: '008b8b',
   darkgoldenrod: 'b8860b',
   darkgray: 'a9a9a9',
   darkgreen: '006400',
   darkkhaki: 'bdb76b',
   darkmagenta: '8b008b',
   darkolivegreen: '556b2f',
   darkorange: 'ff8c00',
   darkorchid: '9932cc',
   darkred: '8b0000',
   darksalmon: 'e9967a',
   darkseagreen: '8fbc8f',
   darkslateblue: '483d8b',
   darkslategray: '2f4f4f',
   darkturquoise: '00ced1',
   darkviolet: '9400d3',
   deeppink: 'ff1493',
   deepskyblue: '00bfff',
   dimgray: '696969',
   dodgerblue: '1e90ff',
   feldspar: 'd19275',
   firebrick: 'b22222',
   floralwhite: 'fffaf0',
   forestgreen: '228b22',
   fuchsia: 'ff00ff',
   gainsboro: 'dcdcdc',
   ghostwhite: 'f8f8ff',
   gold: 'ffd700',
   goldenrod: 'daa520',
   gray: '808080',
   green: '008000',
   greenyellow: 'adff2f',
   honeydew: 'f0fff0',
   hotpink: 'ff69b4',
   indianred : 'cd5c5c',
   indigo : '4b0082',
   ivory: 'fffff0',
   khaki: 'f0e68c',
   lavender: 'e6e6fa',
   lavenderblush: 'fff0f5',
   lawngreen: '7cfc00',
   lemonchiffon: 'fffacd',
   lightblue: 'add8e6',
   lightcoral: 'f08080',
   lightcyan: 'e0ffff',
   lightgoldenrodyellow: 'fafad2',
   lightgrey: 'd3d3d3',
   lightgreen: '90ee90',
   lightpink: 'ffb6c1',
   lightsalmon: 'ffa07a',
   lightseagreen: '20b2aa',
   lightskyblue: '87cefa',
   lightslateblue: '8470ff',
   lightslategray: '778899',
   lightsteelblue: 'b0c4de',
   lightyellow: 'ffffe0',
   lime: '00ff00',
   limegreen: '32cd32',
   linen: 'faf0e6',
   magenta: 'ff00ff',
   maroon: '800000',
   mediumaquamarine: '66cdaa',
   mediumblue: '0000cd',
   mediumorchid: 'ba55d3',
   mediumpurple: '9370d8',
   mediumseagreen: '3cb371',
   mediumslateblue: '7b68ee',
   mediumspringgreen: '00fa9a',
   mediumturquoise: '48d1cc',
   mediumvioletred: 'c71585',
   midnightblue: '191970',
   mintcream: 'f5fffa',
   mistyrose: 'ffe4e1',
   moccasin: 'ffe4b5',
   navajowhite: 'ffdead',
   navy: '000080',
   oldlace: 'fdf5e6',
   olive: '808000',
   olivedrab: '6b8e23',
   orange: 'ffa500',
   orangered: 'ff4500',
   orchid: 'da70d6',
   palegoldenrod: 'eee8aa',
   palegreen: '98fb98',
   paleturquoise: 'afeeee',
   palevioletred: 'd87093',
   papayawhip: 'ffefd5',
   peachpuff: 'ffdab9',
   peru: 'cd853f',
   pink: 'ffc0cb',
   plum: 'dda0dd',
   powderblue: 'b0e0e6',
   purple: '800080',
   red: 'ff0000',
   rosybrown: 'bc8f8f',
   royalblue: '4169e1',
   saddlebrown: '8b4513',
   salmon: 'fa8072',
   sandybrown: 'f4a460',
   seagreen: '2e8b57',
   seashell: 'fff5ee',
   sienna: 'a0522d',
   silver: 'c0c0c0',
   skyblue: '87ceeb',
   slateblue: '6a5acd',
   slategray: '708090',
   snow: 'fffafa',
   springgreen: '00ff7f',
   steelblue: '4682b4',
   tan: 'd2b48c',
   teal: '008080',
   thistle: 'd8bfd8',
   tomato: 'ff6347',
   turquoise: '40e0d0',
   violet: 'ee82ee',
   violetred: 'd02090',
   wheat: 'f5deb3',
   white: 'ffffff',
   whitesmoke: 'f5f5f5',
   yellow: 'ffff00',
   yellowgreen: '9acd32'
};

var parseHex = /^(\w{2})(\w{2})(\w{2})$/;
var parseRgb = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
var parseRgba = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3},\s*(\d{1,3}))\)$/;


/**************************************************************************************************************/

/** @name FeatureStyle
	@class
	The style to display a Feature
	@param style an object containing the following style properties
		<ul>
			<li>strokeColor : the color for line, or polygon outline</li>
			<li>strokeWidth : the width of a line</li>
			<li>fillColor : the color for solid polygon or point</li>
			<li>fillTextureUrl : the texture for solid polygon</li>
			<li>iconUrl : the icon to be used for point</li>
			<li>pointMaxSize : maximum size (in meter) for a point</li>
		</ul>
 */
var FeatureStyle = function(style)
{
	// Color used for lines or polygon outline
	this.strokeColor = [1.0, 0.0, 0.0, 1.0];
	// Color used to full polygon
	this.fillColor = [1.0, 0.0, 0.0, 1.0];
	this.fillTextureUrl = null;
    this.fillTexture = null;
    this.fillShader = null;
	this.strokeWidth = 1;
	this.iconUrl = null;
	this.icon = null;
	this.label = null;
	this.textColor = [1.0, 1.0, 1.0, 1.0];
	this.fill = false;
	this.pointMaxSize = 40;
	this.opacity = 1.;
	
	if ( style )
	{
		for ( var s in style )
		{
			this[s] = style[s];
		}
	}
}


/**************************************************************************************************************/

/**
 * Convert a color from a string to RGB
 */
FeatureStyle.fromStringToColor = function(color_string)
{
	var r = 0, g = 0, b = 0, a = 255;
	var match;
	
	color_string = color_string.trim();
	color_string = color_string.toLowerCase();
	// strip any leading #
	if (color_string.charAt(0) == '#') { // remove # if any
	   color_string = color_string.substr(1,6);
	}
	
	// Convert a litteral color to rgb string
	if ( simple_colors.hasOwnProperty(color_string) )
	{
		color_string = simple_colors[color_string];
	}
	
	match = parseHex.exec(color_string);
	if ( match )
	{
		r = parseInt(match[1],16);
		g = parseInt(match[2],16);
		b = parseInt(match[3],16);
	}
	
	match = parseRgb.exec(color_string);
	if ( match )
	{
		r = parseInt(match[1]);
		g = parseInt(match[2]);
		b = parseInt(match[3]);
	}
	
	match = parseRgba.exec(color_string);
	if ( match )
	{
		r = parseInt(match[1]);
		g = parseInt(match[2]);
		b = parseInt(match[3]);
		a = parseInt(match[4]);
	}

	// validate/cleanup values
	r = (r < 0) ? 0 : ((r > 255) ? 255 : r);
	g = (g < 0) ? 0 : ((g > 255) ? 255 : g);
	b = (b < 0) ? 0 : ((b > 255) ? 255 : b);
	a = (a < 0) ? 0 : ((a > 255) ? 255 : a);

	return [r / 255.0, g / 255.0, b / 255.0, a / 255.0];
}

/**************************************************************************************************************/

/** 
 * Convert an internal color to a string based color representation
 */
FeatureStyle.fromColorToString = function(color)
{		
   var hashColor = '#';
   for ( var i=0; i<3; i++ )
   {
      var component = parseInt( color[i] * 255.0 ).toString(16)
      hashColor += (component < 10) ? '0'+component : component;
   }

	return hashColor;
}

/**************************************************************************************************************/

/** 
 * Check if a style is equals to render poly
 */
FeatureStyle.prototype.isEqualForPoly = function(style)
{
	return this.fill == style.fill;
}

/**************************************************************************************************************/

/** 
 * Check if a style is equals to render poly
 */
FeatureStyle.prototype.isEqualForLine = function(style)
{
	return this.strokeColor[0] == style.strokeColor[0]
		&& this.strokeColor[1] == style.strokeColor[1]
		&& this.strokeColor[2] == style.strokeColor[2]
		&& this.strokeColor[3] == style.strokeColor[3]
		&& this.strokeWidth == style.strokeWidth;
}

/**************************************************************************************************************/

/** 
 * Check if a style is equals to render point
 */
FeatureStyle.prototype.isEqualForPoint = function(style)
{
	return this.iconUrl == style.iconUrl
		&& this.icon == style.icon
		&& this.label == style.label;
}

/**************************************************************************************************************/

return FeatureStyle;

});

