//-------------------------------------------------------------------------------
//
// Project: EOxClient <https://github.com/EOX-A/EOxClient>
// Authors: Daniel Santillan <daniel.santillan@eox.at>
//
//-------------------------------------------------------------------------------
// Copyright (C) 2014 EOX IT Services GmbH
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies of this Software or works derived from this Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//-------------------------------------------------------------------------------

(function() {
	'use strict';

	var root = this;

	root.define([
		'backbone',
		'communicator'
	],
	function( Backbone, Communicator ) {

		var RegionManager = Backbone.Marionette.Controller.extend({
		
			initialize: function( options ) {

				/* internal region manager */
				this._regionManager = new Backbone.Marionette.RegionManager();

				/* event API */
				Communicator.reqres.setHandler("RM:addRegion", this.addRegion, this);
				Communicator.reqres.setHandler("RM:removeRegion", this.removeRegion, this);
				Communicator.reqres.setHandler("RM:getRegion", this.getRegion, this);
			},

			/* add region facade */
			addRegion: function( regionName, regionId ) {
				return this._regionManager.addRegion( regionName, regionId );
			},

			/* remove region facade */
			removeRegion: function( regionName ) {
				this._regionManager.removeRegion( regionName );
			},

			/* get region facade */
			getRegion: function( regionName ) {
				return this._regionManager.get( regionName );
			}
		});

		return new RegionManager();
	});
}).call( this );