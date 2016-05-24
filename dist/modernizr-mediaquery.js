/***************************************************************************
	modernizr-mediaquery.js,

	(c) 2015, FCOO

	https://github.com/FCOO/modernizr-mediaquery
	https://github.com/FCOO

****************************************************************************/

;(function ($, window, document, undefined) {
	"use strict";

	//***********************************************
	// Thank you: https://github.com/sindresorhus/query-string
	function parseStyleToObject(str) {
		var styleObject = {};

	  if (typeof str !== 'string') {
		  return styleObject;
	  }

	  str = str.trim().slice(1, -1); // browsers re-quote string style values

	  if (!str) {
		  return styleObject;
	  }

	  styleObject = str.split('&').reduce(function(ret, param) {
		  var parts = param.replace(/\+/g, ' ').split('=');
			var key = parts[0];
	    var val = parts[1];
		  key = decodeURIComponent(key);

	    // missing `=` should be `null`:
		  // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
			val = val === undefined ? null : decodeURIComponent(val);

	    if (!ret.hasOwnProperty(key)) {
		    ret[key] = val;
			} else if (Array.isArray(ret[key])) {
				ret[key].push(val);
	    } else {
		    ret[key] = [ret[key], val];
			}
	    return ret;
		}, {});

	  return styleObject;
	}
	//***********************************************


	var ns = window;

	var plugin_count = 1;

	function ModernizrMediaquery( options ) {
		this.plugin_count = plugin_count++;
		

		this.modernizr						= Modernizr;
		this.globalEvents					= new window.GlobalEvents();
		this.defaultHtmlFontSize	= this._getHtmlFontSize();

		this.options = $.extend({
			//Default options
			VERSION							: "1.2.9",
			DEBUG								: false,
			'useWindowClientDim': true,
			
		}, options || {} );


		//'Reads the different media queries from the css-file using the 'dummy' class "modernizr-mediaquery-media-query"
		var id,
				meta			= $('<meta class="modernizr-mediaquery-media-query">').appendTo(document.head),
				mediaJSON = parseStyleToObject(meta.css('font-family'));
		meta.remove();		

		this.mediaQueryList = [];
		for (id in mediaJSON)
			this.mediaQueryList.push({
				id: id,
				mq: mediaJSON[id],
				on: false
			});
	
			
		//'Reads the different min-max-intervalls from the css-file using the 'dummy' class "modernizr-mediaquery-min-max"
		meta			= $('<meta class="modernizr-mediaquery-min-max">').appendTo(document.head);
		mediaJSON = parseStyleToObject(meta.css('font-family'));
		meta.remove();		

		this.minMaxRatioList = [];
		for (id in mediaJSON){
			var minMaxRatio = mediaJSON[id].split('_');			
			this.minMaxRatioList.push({
				id: id,
				min				: parseFloat(minMaxRatio[0]),
				max				: parseFloat(minMaxRatio[1]) || 100000, 
				minRatio	: minMaxRatio.length > 2 ? parseFloat(minMaxRatio[2]) : 100000,
				maxRatio	: minMaxRatio.length > 3 ? parseFloat(minMaxRatio[3]) : 100000,
				on: false
			});
		}

		//Set the 'change media-query event'
		$(window).on('resize.mmq', $.proxy( this._onMediaQuery, this ));
		var THIS = this;

		$(function() {
			THIS._onMediaQuery();
		});

	}

  // expose access to the constructor
  ns.ModernizrMediaquery = ModernizrMediaquery;

	//Extend the prototype
	ns.ModernizrMediaquery.prototype = {

		//Methods to add media-query-events
		on	: function( mediaQueries, callback, context ){ this.globalEvents.on		(mediaQueries, callback, context );	},
		off	: function( mediaQueries, callback, context ){ this.globalEvents.off	(mediaQueries, callback, context );	},
		once: function( mediaQueries, callback, context ){ this.globalEvents.once	(mediaQueries, callback, context );	},
		one	: function( mediaQueries, callback, context ){ this.globalEvents.one	(mediaQueries, callback, context );	},


		setHtmlFontSizePx			: function( fontSizePx )			{ 
			$('html').css('font-size', fontSizePx);
			$(window).trigger('resize.mmq');
			return fontSizePx;
		},
		
		setHtmlFontSizePercent: function( fontSizePercent )	{ 
			return this.setHtmlFontSizePx( fontSizePercent/100*this.defaultHtmlFontSize );
		},

		_getHtmlFontSize: function(){ return parseFloat( $('html').css('font-size') ); },

		_isOn_mediaQueryMode: function( mediaQuery ){
			return !!this.modernizr.mq(mediaQuery.mq);
		},
		_isOn_minMaxRatioMode: function( minMaxRatio ){
			return	( (this.window_width_em >= (minMaxRatio.min / this.defaultHtmlFontSize)) && (this.window_width_em <= (minMaxRatio.max / this.defaultHtmlFontSize)) ) ||
							(	(this.window_ratio >= minMaxRatio.minRatio) && ( this.window_ratio <= minMaxRatio.maxRatio ) );
		},
		
		
		_onMediaQuery: function( /*event*/ ){
			var i, list, listElem, isOn, isOnFunc;
			this.screen_width			= screen.width;
			this.screen_height		=	screen.height;
			this.window_width			= window.innerWidth;
			this.window_height		= window.innerHeight;
			this.htmlFontSize			= this._getHtmlFontSize();

			this.window_width_em	= this.window_width / this.htmlFontSize;
			this.window_height_em	= this.window_height / this.htmlFontSize;

			this.window_ratio			= this.window_width / this.window_height;

			if (this.options.useWindowClientDim){
				list = this.minMaxRatioList; 
				isOnFunc = $.proxy(this._isOn_minMaxRatioMode, this);
			}
			else {
				list = this.mediaQueryList;
				isOnFunc = $.proxy(this._isOn_mediaQueryMode, this);
			}

			for (i=0; i<list.length; i++ ){
				listElem = list[i];
				isOn = isOnFunc(listElem);
				$('html')
					.toggleClass(				listElem.id,  isOn	)
					.toggleClass( 'no-'+listElem.id, !isOn	);

				if (isOn && !listElem.on){
					if (this.options.DEBUG)
						console.log('DEBUG', listElem.id, '.isOn=',isOn);

					//Fire event
					this.globalEvents.fire(listElem.id, listElem.id, this);
				}
				listElem.on = isOn;
			}
		}


	};


	/******************************************
	Initialize/ready
	*******************************************/
	$(function() { //"$( function() { ... });" is short for "$(document).ready( function(){...});"


	}); //End of initialize/ready
	//******************************************



}(jQuery, this, document));

