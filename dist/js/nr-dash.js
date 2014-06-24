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

var store     = keigai.store,
    list      = keigai.list,
    util      = keigai.util,
    $         = util.$,
    array     = util.array,
    element   = util.element,
    log       = util.log,
    stop      = util.stop,
    prevent   = util.prevent,
    target    = util.target,
    when      = util.when,
    hash      = document.location.hash.replace( "#", "" ),
    headers   = {},
    config    = {},
    stores    = {},
    templates = {"list_applications":"<div id=\"{{key}}\">\n\t<strong>{{name}}</strong>\n</div>\n","list_servers":"<div id=\"{{key}}\">\n\t<strong>{{name}}</strong>\n\t<span class=\"metric score\">\n\t\t<span class=\"name\">CPU</span>\n\t\t<span class=\"value\">{{summary.cpu}} %</span>\n\t</span>\n\t<span class=\"metric throughput\">\n\t\t<span class=\"name\">Memory</span>\n\t\t<span class=\"value\">{{summary.memory}} %</span>\n\t</span>\n</div>\n","list_transactions":"<div>\n\t<h3>{{name}}</h3>\n\t<p>{{transaction_name}}</p>\n\t<span class=\"metric response\">\n\t\t<span class=\"name\">Response Time</span>\n\t\t<span class=\"value\">{{application_summary.response_time}} ms</span>\n\t</span>\n\t<span class=\"metric score\">\n\t\t<span class=\"name\">Score</span>\n\t\t<span class=\"value\">{{application_summary.apdex_score}}</span>\n\t</span>\n\t<span class=\"metric throughput\">\n\t\t<span class=\"name\">Throughput</span>\n\t\t<span class=\"value\">{{application_summary.throughput}}</span>\n\t</span>\n</div>\n"},
    render    = window.requestAnimationFrame || util.delay,
    PILLS     = $( "ul.pills" )[0],     // expected Element
    COPY      = $( "section.copy" )[0], // expected Element
    NOTHASH   = /.*\#/,
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
			log( "Dispatched click for navigation target/child" );
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
	log( err.stack || err.message || err, "error" );
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
	COPY.addEventListener( "render", view, false );

	log( "Set event listeners" );

	// Setting state
	if ( hash !== "" && array.contains( OPTIONS, hash ) ) {
		log( "Loading hash" );
		element.klass( $( "#" + hash )[0], "hidden", false );
		element.klass( $( "a[href='#" + hash + "']" )[0].parentNode, "active" );
		element.dispatch( COPY, "render" );
	}
	else {
		log( "Loading default" );
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
	    sections = array.keySort( config.pills, "name asc" ),
	    pills    = [],
	    copy     = [];

	array.each(sections, function ( i ) {
		pills.push( "<li><a href=\"#" + i.slug + "\">" + i.name + "</a></li>" );
		copy.push( "<div id=\"" + i.slug + "\" class=\"hidden\"></div>" );
	} );

	render( function () {
		var deferreds = [];

		// DOM injection
		element.html( PILLS, pills.join( "\n" ) );
		element.html( COPY, copy.join( "\n" ) );

		log( "Rendered Elements" );

		// Psuedo constants
		OPTIONS = $( "ul.pills li a" ).map( function ( i ) { return i.href.replace( NOTHASH, "" ); } );
		DEFAULT = OPTIONS[0];

		// Generating stores
		array.each( sections, function ( i ) {
			var lstore;

			if ( i.uri ) {
				lstore = store( null, {id: i.slug, expires: config.expire * 1000, headers: headers, key: "id", source: i.source} );
				deferreds.push( lstore.setUri( i.uri ) );
				stores[i.slug] = lstore;
			}
		} );

		log( "Created DataStores" );

		// Resolve deferred after we have data
		when( deferreds ).then( function () {
			log( "Retrieved API data" );
			defer.resolve( true );
		}, function ( e ) {
			error( e );
			defer.reject( e );
		} );
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
		hash = newHash;
		element.klass( $newItem.parentNode, "active" );
		element.klass( $newDiv, "hidden", false );
	}
	else {
		hash = DEFAULT;
		document.location.hash = DEFAULT;
	}

	element.dispatch( COPY, "render" );
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
			log( "Retrieved configuration" );

			util.merge( config, arg );
			headers["X-Api-Key"] = config.keys.api;

			generate().then(function () {
				events();
				defer.resolve( true );
			}, function ( e ) {
				defer.reject( e );
			} );
		}
	}, function ( e ) {
		defer.reject( e );
	} );

	return defer;
}

/**
 * Renders the view
 *
 * @method view
 * @return {Undefined} undefined
 */
function view () {
	var store  = stores[hash],
	    target = $( "#" + hash )[0];

	if ( target.childNodes.length === 0 ) {
		log( "Rendering '" + hash + "'" );

		if ( hash === "applications" ) {
			list( target, store, templates.list_applications, {order: "last_reported_at desc"});
		}
		else if ( hash === "servers" ) {
			list( target, store, templates.list_servers, {order: "summary.memory desc, name asc"});
		}
		else if ( hash === "transactions" ) {
			list( target, store, templates.list_transactions, {order: "application_summary.response_time desc, name asc"});
		}
	}
	else {
		log( "Viewing '" + hash + "'" );
	}
}

// Public interface
window.nrDash = {
	stores  : stores,
	version : "0.1.0"
};

// Initializing
init().then( function () {
	log( "nr-dash is running" );
}, function () {
	error( "nr-dash failed to start" );
} );
} )( document, window, keigai );
