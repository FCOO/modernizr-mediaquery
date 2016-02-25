# modernizr-mediaquery

[Modernizr]: https://modernizr.com/

## Description

Instead of using pure css media-queries a la `@media screen and (max-width: 640px){ ... }` this package uses JavaScript and the `onResize` event to detect the change in 'media' state

It uses the css-style by [Modernizr] where the `<html>` element get class-name `[STATE]` or `no-[STATE]` where `[STATE]` can be the different breakpoints defined or orientation (`landscape` / `portrait`) or `print`  

In contrast to traditional media queries this allows dynamic recalculation of the breakpoints if the global font-size (at `<html>`) is changed to allow resizing the contents of the page, if elements sizing is using unit `rem` or `em`. 

**Example** The font-size of `<html>` is 16px. A media query is defined as `@media screen and (max-width: 30em){ ... }` witch corresponds to 480px. If the font-size of `<html>` is changed to 24px, the media query will still 'active' at 480px or **20em** instead of 30em.    

With modernizr-mediaquery the breakpoints are recalculated when the font-size of `<html>` is changed, and the breakpoint will still be at 30em witch now correspond to 720px. 


This package contains of a JavaScript object `ModernizrMediaquery`, and a css-file `modernizr-mediaquery.css` with classes to hide or show elements for different 'media-queries' screen dimensions, orientations (portrait/landscape), and print.

[Modernizr] must be included.


## Installation
### bower
    bower install https://github.com/FCOO/modernizr-mediaquery.git --save

## Demo
http://FCOO.github.io/modernizr-mediaquery/demo/ 

## Usage

### ModernizrMediaquery-object (modernizr-mediaquery.js)


```var myModernizrMediaquery = new ModernizrMediaquery( options );```

#### Default options
	{ useWindowClientDim: true	}

#### Properties
| Id | Description |
| :--: | --- |
| <code>useWindowClientDim</code>| **true**: Use `window.clientWidth()` and `windowe.clientHeight()` to determinate the *state* of the screen<br>**false**: Use `Modernizr.md( mediaquery )` to determinate the *state* of the screen |


#### Methods

##### Change font-size of page 
	.setHtmlFontSizePx( fontSizePx )	       //Set the font-size of <html> to fontSizePx px and recalculate the breakpoints 
	.setHtmlFontSizePercent( fontSizePercent ) //Set the font-size of <html> to fontSizePersent % and recalculate the breakpoints 


##### media-query-events
When the orientation or size of the screen is changed an "media-query-event" is fired.
To add a function to the event use

	.on( eventName, callback, context ) //callback = function( eventName, modernizrMediaquery )
	.once( eventName, callback, context ) //Only called once. callback = function( eventName, modernizrMediaquery )

Where `eventName` is `small, small-down, small-up,...., portrait, landscape`
`
To remove a event use

	.off( eventName, callback, context )

###### Example
	myModernizrMediaquery.on('large-down', function(){ console.log('The screen is now large or smaller'); });


### modernizr-mediaquery.css

The css-classes is based on the visibility classes by [ZURB Foundation](http://foundation.zurb.com/docs/components/visibility.html) and the syntax used by [Modernizr].

A number of different 'states' - named `STATE` in the syntax - is set in the css as in [Modernizr] by adding or removing the classes `STATE` and `no-STATE` to/from the `<html>` element


#### Hide/Show classes
To control if a element is displayed (show) or hidden (hide) when a given 'state' is on or off there are the following classes defined for each 'state'

	(hide|show)-for[-no]-STATE[-down | -up]

The `[-down | -up]` is only for **screen sizes** and `[-no]` is not used for **print** 

#### States

There are tree 'groups' of 'states': 

- **Screen size** - show or hide for different screen sizes
- **Orientation** - landscape or portrait
- **Print** - show or hide on print

##### Screen size

The breakpoints for screen size are given in the `src/modernizr-mediaquery.scss` and can be changed by overwriting `$breakpoints`

The default breakpoints are the same as [uikit](http://getuikit.com/) and named `mini`, `small`, `medium`, `large`, and `xlarge`

| Class | Window width | Screen |
| :--: | :--: | :---- |
| mini | <b>0</b>-479px | Phone portrait |
| small | <b>480</b>-767px | Phone landscape |
| medium | <b>768</b>-959px | Tablet portrait |
| large | <b>960</b>-1199px | Tablet landscape and desktop | 
| xlarge | <b>>=1200px</b> | Large desktop

For each size-class `SCREENSIZE` there are the following classes

	show-for-SCREENSIZE      //Displayed for screen size in range
	hide-for-SCREENSIZE      //Hidden for screen size in range
	show-for-SCREENSIZE-up   //Displayed for all screen size equal to or bigger than min
	hide-for-SCREENSIZE-up 	 //Hidden for all screen size equal to or bigger than min
	show-for-SCREENSIZE-down //Displayed for all screen size less than or equal to max
	hide-for-SCREENSIZE-down //Hidden for all screen size less than or equal to max
	show-for-no-SCREENSIZE   //Displayed for screen size outside range
	hide-for-no-SCREENSIZE   //Hidden for screen size outside range

Example

	<p class="show-for-medium-up">The screen width is >= 768px</p> 

##### Orientation
Four classes are provided
	
	show-for-portrait / hide-for-portrait
	show-for-landscape / hide-for-landscape


##### Print
Two classes are provided

	show-for-print / hide-for-print


#### Additional css and scss

The classes in `modernizr-mediaquery.css` only controls the display of elements under sertent conditions.
But other properties can be controlled by using the `STATE` and `no-STATE` classes

Example: To define a class `green-when-in-portrait` that displays a element in green when orientation is portrait:

	css:
	.portrait .green-when-in-portrait { color: green; }

	scss:
	.portrait {
	  .green-when-in-portrait { color: green; }
	  ...
	}


#### Examples

	<div class="show-for-landscape">This device is in LANDSCAPE mode</div>
	<div class="show-for-portrait">This device is in PORTRAIT mode</div>

	<div class="show-for-small">The screen IS a SMALL screen</div>
	<div class="hide-for-small">The screen is NOT a SMALL screen</div>
	<div class="show-for-medium">The screen IS a MEDIUM screen</div>
	<div class="hide-for-medium">The screen is NOT a MEDIUM screen</div>
	<div class="show-for-medium-down">The screen is a MEDIUM OR smaller screen</div>

	<div class="show-for-large">The screen IS a LARGE screen</div>
	<div class="hide-for-large">The screen is NOT a LARGE screen</div>
	<div class="show-for-large-down">The screen is a LARGE OR smaller screen</div>

	<div class="hide-for-print">This text is only on the SCREEN</div>
	<div class="show-for-print">This text is only on the PRINT</div>
	


## Copyright and License
This plugin is licensed under the [MIT license](https://github.com/FCOO/modernizr-mediaquery/LICENSE).

Copyright (c) 2016 [FCOO](https://github.com/FCOO)

## Contact information

Niels Holt nho@fcoo.dk


## Credits and acknowledgements


## Known bugs

## Troubleshooting

## Changelog



