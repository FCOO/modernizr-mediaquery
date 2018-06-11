/***************************************************************************
    modernizr-mediaquery.js,

    (c) 2015, FCOO

    https://github.com/FCOO/modernizr-mediaquery
    https://github.com/FCOO

****************************************************************************/

(function (Modernizr, $, window, document, undefined) {
    "use strict";

    //***********************************************
    // Thank you: https://github.com/sindresorhus/query-string
    function parseStyleToObject(str) {
        var styleObject = {};
        if (typeof str !== 'string')
            return styleObject;

        str = str.trim().slice(1, -1); // browsers re-quote string style values
        if (!str)
            return styleObject;

        styleObject = str.split('&').reduce(function(ret, param) {
            var parts = param.replace(/\+/g, ' ').split('='),
                key = parts[0],
                val = parts[1];
            key = decodeURIComponent(key);

            // missing `=` should be `null`:
            // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
            val = val === undefined ? null : decodeURIComponent(val);

            if (!ret.hasOwnProperty(key)) {
                ret[key] = val;
            } else
                if (Array.isArray(ret[key])) {
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
        this.modernizr           = Modernizr;
        this.globalEvents        = new window.GlobalEvents();
        this.defaultHtmlFontSize = this._getHtmlFontSize();

        this.options = $.extend({
            //Default options
            VERSION             : "1.3.1",
            htmlFontSize        : 16,
            createFIRSTup       : false, //When true the media query FIRST-up (allway display) and no-FIRST-up (allways hidden) are created. MUST MATCH $create-FIRST-up
            createLASTdown      : false, //When true the media query LAST-down (allway display) and no-LAST-down (allways hidden) are created. MUST MATCH $create-LAST-down
            useWindowClientDim: true,
        }, options || {} );

        var _this = this,
            meta,
            mediaJSON  = {},
            minMaxJSON = {};

        if (this.options.breakpoints){
            //Create mediaJSON and minMaxJSON from options.breakpoints
            var breakpointList = [];
            $.each( this.options.breakpoints, function( id, minPx ){
                breakpointList.push( {id: id, minPx: minPx} );
            });
            breakpointList.sort( function( bp1, bp2 ){return bp1 > bp2; });

            $.each( breakpointList, function( index, bp ){
                //Set max eq next min - 1
                var id = bp.id,
                    minPx = bp.minPx,
                    maxPx = (index == breakpointList.length-1) ? 0 : breakpointList[index+1].minPx-1,
                    min = minPx / _this.options.htmlFontSize,
                    minEm = min+'em',
                    max = maxPx / _this.options.htmlFontSize,
                    maxEm = max+'em',
                    mq     = '',
                    mqUp   = '',
                    mqDown = '';

                if (min > 0) {
                    mq   = mq   + ' and (min-width: '+ minEm+')';
                    mqUp = mqUp + ' and (min-width: '+ minEm+')';
                }
                if (max > 0) {
                    mq     = mq     + ' and (max-width: '+ maxEm+')';
                    mqDown = mqDown + ' and (max-width: '+ maxEm+')';
                }

                //Add mediaquery and minMax for id
                mediaJSON[id]  = 'screen' + mq;
                minMaxJSON[id] = minPx + 'px_' + maxPx+'px';

                //Add mediaquery for id-down
                if ((index < breakpointList.length-1) || options.createLASTdown){
                    mediaJSON[id+'-down']  = 'screen' + mqDown;
                    minMaxJSON[id+'-down'] = '0_' + maxPx+'px';
                }

                //Add mediaquery for id-up
                if (index || options.createFIRSTup){
                    mediaJSON[id+'-up']  = 'screen' + mqUp;
                    minMaxJSON[id+'-up'] = minPx + 'px_0';
                }
            });

            //Add special values for portrait and landscape
            mediaJSON['landscape'] = 'screen and (orientation: landscape)';
            minMaxJSON['landscape'] = '0_1_1';
            mediaJSON['portrait'] = 'screen and (orientation: portrait)';
            minMaxJSON['portrait'] = '0_1_0_1';
        }
        else {
            //Reads the different media queries from the css-file using the 'dummy' class "modernizr-mediaquery-media-query"
            meta      = $('<meta class="modernizr-mediaquery-media-query">').appendTo(document.head);
            mediaJSON = parseStyleToObject(meta.css('font-family'));
            meta.remove();

            //Reads the different min-max-intervalls from the css-file using the 'dummy' class "modernizr-mediaquery-min-max"
            meta      = $('<meta class="modernizr-mediaquery-min-max">').appendTo(document.head);
            minMaxJSON = parseStyleToObject(meta.css('font-family'));
            meta.remove();
        }

        //Convert mediaJSON
        this.mediaQueryList = [];
        $.each( mediaJSON, function( id, mq ){
            _this.mediaQueryList.push({id: id, mq: mq, on: false });
        });

        //Convert minMaxJSON
        this.minMaxRatioList = [];
        $.each( minMaxJSON, function( id, value ){
            var minMaxRatio = value.split('_');
            _this.minMaxRatioList.push({
                id      : id,
                min     : parseFloat(minMaxRatio[0]),
                max     : parseFloat(minMaxRatio[1]) || 100000,
                minRatio: minMaxRatio.length > 2 ? parseFloat(minMaxRatio[2]) : 100000,
                maxRatio: minMaxRatio.length > 3 ? parseFloat(minMaxRatio[3]) : 100000,
                on      : false
            });
        });


        //Set the 'change media-query event'
        $(window).on('resize.mmq', $.proxy( this._onMediaQuery, this ));

        this._onMediaQuery();
    }

    // expose access to the constructor
    ns.ModernizrMediaquery = ModernizrMediaquery;

    //Extend the prototype
    ns.ModernizrMediaquery.prototype = {

        //Methods to add media-query-events
        on  : function( mediaQueries, callback, context ){ this.globalEvents.on(   mediaQueries, callback, context ); },
        off : function( mediaQueries, callback, context ){ this.globalEvents.off(  mediaQueries, callback, context ); },
        once: function( mediaQueries, callback, context ){ this.globalEvents.once( mediaQueries, callback, context ); },
        one : function( mediaQueries, callback, context ){ this.globalEvents.one(  mediaQueries, callback, context ); },


        setHtmlFontSizePx: function( fontSizePx ){
            $('html').css('font-size', fontSizePx);
            $(window).trigger('resize.mmq');
            return fontSizePx;
        },

        setHtmlFontSizePercent: function( fontSizePercent ){
            return this.setHtmlFontSizePx( fontSizePercent/100*this.defaultHtmlFontSize );
        },

        _getHtmlFontSize: function(){ return parseFloat( $('html').css('font-size') ); },

        _isOn_mediaQueryMode: function( mediaQuery ){
            return !!this.modernizr.mq(mediaQuery.mq);
        },
        _isOn_minMaxRatioMode: function( minMaxRatio ){
            return ( (this.window_width_em >= (minMaxRatio.min / this.defaultHtmlFontSize)) &&
                     (this.window_width_em <= (minMaxRatio.max / this.defaultHtmlFontSize)) ) ||
                   ( (this.window_ratio >= minMaxRatio.minRatio) &&
                     ( this.window_ratio <= minMaxRatio.maxRatio ) );
        },

        _onMediaQuery: function( /*event*/ ){
            var i, list, listElem, isOn, isOnFunc;
            this.screen_width  = screen.width;
            this.screen_height = screen.height;
            this.window_width  = window.innerWidth;
            this.window_height = window.innerHeight;
            this.htmlFontSize  = this._getHtmlFontSize();

            this.window_width_em  = this.window_width / this.htmlFontSize;
            this.window_height_em = this.window_height / this.htmlFontSize;

            this.window_ratio = this.window_width / this.window_height;

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
                window.modernizrToggle( listElem.id,  isOn );

                if (isOn && !listElem.on)
                    //Fire event
                    this.globalEvents.fire(listElem.id, listElem.id, this);

                listElem.on = isOn;
            }
        }


    };

}(window.Modernizr, jQuery, this, document));

