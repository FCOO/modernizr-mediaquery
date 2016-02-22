/***************************************************************************
	modernizr-mediaquery.js,

	(c) 2015, FCOO

	https://github.com/FCOO/modernizr-mediaquery
	https://github.com/FCOO

****************************************************************************/

;(function ($, window, document, Modernizr, undefined) {
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

	var plugin_count = 1000;

	function ModernizrMQDevice( options ) {
		this.plugin_count = plugin_count++;
		this.VERSION = "{VERSION}";

		this.modernizr		= Modernizr;
		this.globalEvents = new GlobalEvents();

		//Extend with device (https://github.com/matthewhudson/device.js.git)
		$.extend( this, window.device );

		this.options = $.extend({
			//Default options = Standard desttop screen
			referenceScreen: {
				width				: 1366,
				height			: 768,
				diagonal_inc: 20
			}
		}, options || {} );

		var docEl = window.document.documentElement;
		this.wnua	= window.navigator.userAgent;
 		this.devicePixelRatio = ('devicePixelRatio' in window) ? window.devicePixelRatio : 'unsupported';
		this.screen_width		= screen.width;
		this.screen_height	=	screen.height;

		//'Reads the different media queries from the css-file using the 'dummy' class "modernizr-mediaquery"
		this.meta = $('<meta class="modernizr-mediaquery">').appendTo(document.head);
		var mediaJSON = parseStyleToObject(this.meta.css('font-family'));

		this.mediaQuery = [];
		for (var id in mediaJSON)
			this.mediaQuery.push({
				id: id,
				mq: mediaJSON[id],
				on: false
			});

		//Set the 'change media-query event'
		$(window).on('resize.mmqd', $.proxy( this._onMediaQuery, this ));

		var THIS = this;

		$(function() {
			THIS._onMediaQuery();
		});




		this.client_width		= docEl.clientWidth;
		this.client_width		= docEl.clientHeight;

		this.screen_width_em	= this.screen_width/16;
		this.screen_height_em	=	this.screen_height/16;

		this.dpi = 96;
		for (var dpi=1; dpi<400; dpi++ )
			if ( Modernizr.mq('(resolution: '+dpi+'dpi)') ){
				this.dpi = dpi;
				break;
			}

		this.dpr = window.devicePixelRatio;
		if (!this.dpr){
			this.dpr = 1;
			for (var dpr=1; dpr<4; dpr=dpr+0.1 )
				if (
					Modernizr.mq('(-webkit-device-pixel-ratio: '+dpr+')') ||
					Modernizr.mq('(min--moz-device-pixel-ratio: '+dpr+')') ||
					Modernizr.mq('(-o-min-device-pixel-ratio: '+dpr+'/1)')
				){
					this.dpr = dpr;
					break;
				}
		}

		this.dpr = Math.round(100*this.dpr)/100;

		this.screen_diagonal = Math.sqrt( Math.pow(this.screen_width, 2) + Math.pow(this.screen_height,2) );
		this.screen_diagonal_inc = this.screen_diagonal/this.dpi; //Best guest !

		//Calculate the diagonal and dpi for the reference screen
		var ref_screen_diagonal = Math.sqrt( Math.pow(this.options.referenceScreen.width, 2) + Math.pow(this.options.referenceScreen.height, 2) );
		this.ref_dpi = ref_screen_diagonal/this.options.referenceScreen.diagonal_inc;

		//The scale is best guest for a scale (eq. html.style.font-size=this.scale) of the screen to have elements the same size as on the reference screen
		this.scale = 100;
		if ((this.dpr != 1) || (this.dpi != 96))
			this.scale = Math.sqrt(this.dpi / this.ref_dpi)*100;

		//Get a string with browser and version
		this.browser_version = function() {
			if(typeof navigator === 'undefined'){
				return 'unknown';
			}
			var ua = navigator.userAgent, tem,
			M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
			if(/trident/i.test(M[1])){
				tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
				return 'IE '+(tem[1] || '');
			}
			if(M[1]=== 'Chrome'){
				tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
				if(tem!== null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
			}
			M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
			if((tem= ua.match(/version\/(\d+)/i))!= null)
				M.splice(1, 1, tem[1]);
			return M.join(' ');
		}();



		//Create own instance of MobileDetect
		this.mobileDetect = new window.MobileDetect( this.wnua );

		//Set properties using device.js and mobile-detect.js
		this.isDesktop		= this.desktop();
		this.isMobile			= this.mobile() || this.tablet();
		this.mobileName		= this.mobileDetect.mobile();
		this.isPhone			= this.mobile();
		this.phoneName		= this.mobileDetect.phone();
		this.isTablet			= this.tablet();
		this.tabletName		= this.mobileDetect.tablet();
		this.mobileGrade	= this.mobileDetect.mobileGrade();

		this.userAgent		= this.mobileDetect.userAgent();
		this.isWindows		= this.windows();
		this.isIos				= this.ios();
		this.isAndroid		= this.android();

		this.os						= this.mobileDetect.os();

//		this.mobile				= this.mobileDetect.mobile();
//		this.phone				= this.mobileDetect.phone();
//		this.tablet				= this.mobileDetect.tablet();


		//Add device-tests to Modernizr
		Modernizr.addTest({
			desktop			: this.isDesktop,
			mobile			: this.isMobile,
			phone				: this.isPhone,
			tablet			: this.isTablet,
			mobilegradea: this.mobileGrade === 'A',
			windows			: this.isWindows,
			ios					: this.isIos,
			android			: this.isAndroid
		});

	}

  // expose access to the constructor
  ns.ModernizrMQDevice = ModernizrMQDevice;



	//Extend the prototype
	ns.ModernizrMQDevice.prototype = {

		//Methods to add media-query-events
		on	: function( mediaQueries, callback, context ){ this.globalEvents.on		(mediaQueries, callback, context );	},
		off	: function( mediaQueries, callback, context ){ this.globalEvents.off	(mediaQueries, callback, context );	},
		once: function( mediaQueries, callback, context ){ this.globalEvents.once	(mediaQueries, callback, context );	},
		one	: function( mediaQueries, callback, context ){ this.globalEvents.one	(mediaQueries, callback, context );	},

		_onMediaQuery: function( event ){
			var old_screen_width	= this.screen_width,
					old_screen_height	=	this.screen_height,
					i, mediaQuery, isOn;
			this.screen_width		= screen.width;
			this.screen_height	=	screen.height;

			for (i=0; i<this.mediaQuery.length; i++ ){
				mediaQuery = this.mediaQuery[i];
				isOn = !!this.modernizr.mq(mediaQuery.mq);
				$('html')
					.toggleClass(				mediaQuery.id,  isOn	)
					.toggleClass( 'no-'+mediaQuery.id, !isOn	);

				if (isOn && !mediaQuery.on){
					//Fire event
					console.log(this.globalEvents, mediaQuery.id);
					this.globalEvents.fire(mediaQuery.id, mediaQuery.id, this);
				}
				mediaQuery.on = isOn;
			}
		}


	};


	/******************************************
	Initialize/ready
	*******************************************/
	$(function() { //"$( function() { ... });" is short for "$(document).ready( function(){...});"


	}); //End of initialize/ready
	//******************************************



}(jQuery, this, document, Modernizr));

