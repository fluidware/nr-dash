/**
 * nr-dash
 *
 * New Relic Dashboard
 *
 * @author Jason Mulligan <jmulligan@fluidware.com>
 * @copyright 2014 Fluidware
 * @license MIT <https://raw.github.com/fluidware/nr-dash/master/LICENSE>
 * @link http://fluidware.com
 * @version 0.1.1
 */
( function ( document, window, keigai, moment, dimple ) {
"use strict";

var store     = keigai.store,
    grid      = keigai.grid,
    list      = keigai.list,
    util      = keigai.util,
    $         = util.$,
    array     = util.array,
    element   = util.element,
    log       = util.log,
    stop      = util.stop,
    prevent   = util.prevent,
    request   = util.request,
    target    = util.target,
    when      = util.when,
    hash      = document.location.hash.replace( "#", "" ),
    headers   = {},
    config    = {},
    stores    = {},
    templates = {"list_applications":"<div>\n\t<strong class=\"{{health_status}}\">{{name}}</strong>\n\t<span class=\"metric response\">\n\t\t<span class=\"name\">Response Time</span>\n\t\t<span class=\"value\">{{application_summary.response_time}} ms</span>\n\t</span>\n\t<span class=\"metric score\">\n\t\t<span class=\"name\">Score</span>\n\t\t<span class=\"value\">{{application_summary.apdex_score}}</span>\n\t</span>\n\t<span class=\"metric throughput\">\n\t\t<span class=\"name\">Throughput (RPM)</span>\n\t\t<span class=\"value\">{{application_summary.throughput}}</span>\n\t</span>\n</div>\n","list_servers":"<div>\n\t<strong>{{name}}</strong>\n\t<span class=\"metric score\">\n\t\t<span class=\"name\">CPU</span>\n\t\t<span class=\"value\">{{summary.cpu}} %</span>\n\t</span>\n\t<span class=\"metric throughput\">\n\t\t<span class=\"name\">Memory</span>\n\t\t<span class=\"value\">{{summary.memory}} %</span>\n\t</span>\n</div>\n"},
    render    = window.requestAnimationFrame || util.delay,
    PILLS     = $( "ul.pills" )[0],     // expected Element
    COPY      = $( "section.copy" )[0], // expected Element
    NOTHASH   = /.*\#/,
    OPTIONS, DEFAULT;

/**
 * Chart factory
 *
 * @method chart
 * @param  {String} target  Target Element
 * @param  {Object} data    Data for the chart
 * @param  {Object} options [Optional] Chart options / descriptor
 * @return {Object}         keigai Deferred
 */
function chart ( target, data, options ) {
	options       = options || {};
	var defer     = util.defer(),
	    deferreds = [],
	    width     = options.width  || 600,
	    height    = options.height || 400;

	render( function () {
		var charts = [];

		if ( hash === "applications" ) {
			charts.push( {name: "Response time"} );
		}
		else if ( hash === "servers" ) {

		}

		array.each( charts, function ( i ) {
			var defer = util.defer(),
			    el, dSvg, dChart;

			deferreds.push( defer );

			try {
				el     = element.create( "div", {"class": "chart"}, target );
				dSvg   = dimple.newSvg( "#" + el.id, width, height );
				dChart = new dimple.chart( dSvg, data || [] );

				// do something based on 'i'

				defer.resolve( dChart );
			}
			catch ( e ) {
				defer.reject ( e );
			}
		} );

		when( deferreds ).then( function () {
			log( "Rendered chart(s)" );
			defer.resolve( true );
		}, function ( e ) {
			log( "Failed to rendered chart(s)" );
			defer.reject( e );
		} );
	} );

	return defer;
}

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

	prevent( ev );
	stop( ev );

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

	request( "config" ).then( function ( arg ) {
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
 * Retrieves metrics, chains charts
 *
 * @method metrics
 * @return {Undefined} undefined
 */
function metrics () {
	var start     = moment().subtract( "days", 7 ).startOf( "day" ).toISOString(),
	    end       = moment().endOf( "day" ).toISOString(),
	    lhash     = hash,
	    defer     = util.defer(),
	    deferreds = [],
	    filter, metric;

	metric = config.pills.filter(function( i ) {
		return i.slug === hash;
	} )[0].links.filter( function ( i ) {
		return i.slug === "metrics";
	} );

	if ( metric !== undefined && metric[0] !== undefined ) {
		if ( metric[0].instances.length === 0 ) {
			defer.resolve( false );
		}
		else {
			filter = new Function ( "i", "return /^" + metric[0].instances.join( "|" ) + "$/i.test( i );" );

			stores[hash].select( {name: filter } ).then( function ( recs ) {
				array.each( recs, function ( i ) {
					var querystring = "?" + metric[0].filter.replace( ":start", start ).replace( ":end", end ) + "&names[]=" + metric[0].names.join( "&names[]=" );

					deferreds.push( request( metric[0].uri.replace( ":id", i.key ) + querystring, "GET", null, null, null, headers ) );
				} );

				when( deferreds ).then( function ( args ) {
					var data = array.mingle( recs, args );
					
					if ( hash === lhash ) {
						// Chart!
						defer.resolve( true );
					}
					else {
						defer.reject( new Error( "Hash has changed, data is stale" ) );
					}
				}, function ( e ) {
					defer.reject( e );
				} );
			}, function ( e ) {
				defer.reject( e );
			} );
		}
	}

	return defer;
}

/**
 * Transform data for charting
 *
 * @method transform
 * @param  {Array} data Data to transform
 * @return {Object}     keigai Deferred
 */
function transform ( data ) {
	var defer = util.defer(),
	    key   = "application_summary";

	log( "Transforming data for '" + hash + "'" );

	try {
		if ( hash === "servers" ) {
			key = "summary";
		}

		defer.resolve( data.map( function ( i ) {
			var obj = i[key];

			obj.id        = i.id;
			obj.name      = i.name;
			obj.timestamp = i.last_reported_at;

			return obj;
		} ) );
	}
	catch ( e ) {
		defer.reject( e );
	}

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
	    target = $( "#" + hash )[0],
	    callback, fields, order;

	if ( target.childNodes.length === 0 ) {
		log( "Rendering '" + hash + "'" );

		if ( /applications|servers/.test( hash ) ) {
			if ( hash === "applications" ) {
				order    = "application_summary.response_time desc, name asc";

				callback = function ( el ) {
					var rec = store.get( element.data( el, "key" ).toString() );

					if ( rec.data.application_summary === undefined || rec.data.application_summary.apdex_score === null ) {
						render( function () {
							array.each( element.find( el, ".metric" ), function ( i ) {
								element.klass( i, "hidden" );
							} );
						} );
					}
				};
			}
			else {
				order = "summary.memory desc, name asc";
			}

			render( function () {
				list( target, store, templates["list_" + hash], {callback: callback, order: order} );
				metrics();
			} );
		}
		else if ( hash === "transactions" ) {
			fields = ["name", "transaction_name", "application_summary.response_time", "application_summary.apdex_score", "application_summary.throughput"];
			order  = "application_summary.response_time desc, name asc";

			callback = function ( el ) {
				var target = element.find( el, "span.transaction_name" )[0],
				    text   = element.text( target );

				element.html( target, "<a title=\"" + text + "\" class=\"tooltip\">" + text + "</a>" );
			};

			render( function () {
				grid( target, store, fields, fields, {callback: callback, order: order}, true );
			} );
		}
	}
	else {
		log( "Viewing '" + hash + "'" );
	}
}

// Public interface
window.nrDash = {
	stores  : stores,
	version : "0.1.1"
};

// Initializing
init().then( function () {
	log( "nr-dash is running" );
}, function () {
	error( "nr-dash failed to start" );
} );
} )( document, window, keigai, moment, dimple );
