/**
 * nr-dash
 *
 * New Relic Dashboard
 *
 * @author Jason Mulligan <jmulligan@fluidware.com>
 * @copyright 2014 Fluidware
 * @license MIT <https://raw.github.com/fluidware/nr-dash/master/LICENSE>
 * @link http://fluidware.com
 * @version 0.1.0
 */
( function ( document, window, keigai ) {
"use strict";

var util    = keigai.util,
    $       = util.$,
    array   = util.array,
    element = util.element,
    stop    = util.stop,
    prevent = util.prevent,
    target  = util.target,
    hash    = document.location.hash.replace( "#", "" ),
    headers = {},
    config  = {},
    stores  = [],
    render  = window.requestAnimationFrame || util.delay,
    NOTHASH = /.*\#/,
    OPTIONS, DEFAULT;

/**
 * Navigation click listener
 *
 * @method click
 * @param  {Object} ev
 * @return {Undefined} undefined
 */
function click ( ev ) {
	var el = target( ev );

	if ( el.nodeName === "LI" ) {
		prevent( ev );
		stop( ev );

		if ( document.location.hash.replace( "#", "" ) !== el.childNodes[0].href.replace( NOTHASH, "" ) ) {
			element.dispatch( el.childNodes[0], "click" );
		}
	}
}

/**
 * Generic error handler
 *
 * @method error
 * @param  {Object} err Error
 * @return {Undefined}
 */
function error ( err ) {
	util.log( err, "error" );
}

/**
 * Wires events & listeners
 *
 * @method events
 * @return {Undefined}
 */
function events () {
	// Setting listeners
	window.addEventListener( "hashchange", hashchange, false );
	$( "nav" )[0].addEventListener( "click", click, false );

	// Setting state
	if ( hash !== "" && array.contains( OPTIONS, hash ) ) {
		element.klass( $( "#" + hash )[0], "hidden", false );
		element.klass( $( "a[href='#" + hash + "']" )[0].parentNode, "active" );
	}
	else {
		document.location.hash = DEFAULT;
	}
}

/**
 * Generates the UI from `config.pills`
 *
 * @method generate
 * @return {Object} Deferred
 */
function generate () {
	var defer    = util.defer(),
	    sections = array.keys( config.pills ).sort( array.sort ),
	    pills    = [],
	    copy     = [];

	array.each(sections, function ( i ) {
		pills.push( "<li><a href=\"#" + i.toLowerCase() + "\">" + i + "</a></li>" );
		copy.push( "<div id=\"" + i.toLowerCase() + "\" class=\"hidden\"></div>" );
	} );

	render( function () {
		// DOM injection
		element.html( $( "ul.pills" )[0], pills.join( "\n" ) );
		element.html( $( "section.copy" )[0], copy.join( "\n" ) );

		// Psuedo constants
		OPTIONS = $( "ul.pills li a" ).map( function ( i ) { return i.href.replace( NOTHASH, "" ); } );
		DEFAULT = OPTIONS[0];

		defer.resolve( true );
	} );

	return defer;
}

/**
 * Hash listen
 *
 * @method hashchange
 * @param  {Object} ev
 * @return {Undefined} undefined
 */
function hashchange ( ev ) {
	var oldHash  = ev.oldURL.indexOf( "#" ) > -1 ? ev.oldURL.replace( NOTHASH, "" ) : null,
	    newHash  = ev.newURL.indexOf( "#" ) > -1 ? ev.newURL.replace( NOTHASH, "" ) : null,
	    $oldDiv  = oldHash ? $( "#" + oldHash )[0] : null,
	    $newDiv  = newHash ? $( "#" + newHash )[0] : null,
	    $oldItem = oldHash ? $( "a[href='#" + oldHash + "']" )[0] : null,
	    $newItem = newHash ? $( "a[href='#" + newHash + "']" )[0] : null;

	ev.preventDefault();
	ev.stopPropagation();

	if ( $oldItem && $oldDiv ) {
		element.klass( $oldItem.parentNode, "active", false );
		element.klass( $oldDiv, "hidden" );
	}

	if ( $newItem && $newDiv ) {
		element.klass( $newItem.parentNode, "active" );
		element.klass( $newItem, "hidden", false );
	}
	else {
		document.location.hash = DEFAULT;
	}
}

/**
 * Initializes nr-dash
 *
 * @method init
 * @return {Object} Deferred
 */
function init () {
	var defer = util.defer();

	util.request( "config" ).then( function ( arg ) {
		if ( !arg.keys.api ) {
			error( new Error( "API key not found" ) );
		}
		else {
			util.merge( config, arg );
			headers["X-Api-Key"] = config.keys.api;

			generate().then(function () {
				events();
				defer.resolve( true );
			} );
		}
	}, function ( e ) {
		error( e );
		defer.reject( e );
	} );

	return defer;
}

// Public interface
window.nrDash = {
	stores  : stores,
	version : "0.1.0"
};

// Initializing
init();
} )( document, window, keigai );
