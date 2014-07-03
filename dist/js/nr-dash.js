/**
 * nr-dash
 *
 * NewRelic Dashboard
 *
 * @author Jason Mulligan <jmulligan@fluidware.com>
 * @copyright 2014 Fluidware
 * @license MIT <https://raw.github.com/fluidware/nr-dash/master/LICENSE>
 * @link http://fluidware.com
 * @version 1.0.3
 */
( function ( document, window, keigai, moment, dimple ) {
"use strict";

var store     = keigai.store,
    grid      = keigai.grid,
    util      = keigai.util,
    $         = util.$,
    array     = util.array,
    element   = util.element,
    log       = util.log,
    stop      = util.stop,
    string    = util.string,
    prevent   = util.prevent,
    repeat    = util.repeat,
    request   = util.request,
    target    = util.target,
    when      = util.when,
    hash      = document.location.hash.replace( "#", "" ),
    headers   = {},
    config    = {},
    stores    = {},
    render    = util.render,
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
	options    = options || {};
	var defer  = util.defer(),
	    width  = options.width  || 500,
	    height = options.height || 420;

	render( function () {
		var el, dSvg, dChart, x, y, s;

		try {
			el     = element.create( "div", {"class": "chart"}, target );
			dSvg   = dimple.newSvg( "#" + el.id, width, height );
			dChart = new dimple.chart( dSvg, data || [] );

			if ( config.colors && config.colors.length > 0 ) {
				dChart.defaultColors = config.colors.map( function ( i ) {
					return new dimple.color( i );
				} );
			}

			dChart.setBounds( 60, 75, ( width - 95 ), 275 );

			x = dChart.addCategoryAxis( "x", "time" );
			x.addOrderRule( "time" );
			x.title = null;

			y = dChart.addMeasureAxis( "y", "value" );

			if ( options.title ) {
				y.title = options.title;
			}

			if ( options.tickFormat ) {
				y.tickFormat = options.tickFormat;
			}

			s = dChart.addSeries( "name", dimple.plot.line );
			s.interpolation = "cardinal";

			if ( options.id ) {
				dChart.id = options.id;
			}

			dChart.addLegend( 10, 10, ( width - 10 ), 60, "left" );
			dChart.draw();

			defer.resolve( dChart );
		}
		catch ( e ) {
			defer.reject ( e );
		}
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
 * Cycles the nav 'pills'
 *
 * @method cycle
 * @param  {Number} secs Number of seconds to pause while cycling
 * @return {Undefined}   undefined
 */
function cycle ( secs ) {
	repeat( function () {
		var current = $( "ul.pills .active")[0],
		    next    = current.nextElementSibling || current.parentNode.childNodes[0];

		if ( !element.hasClass( next, "active") ) {
			element.dispatch( next.childNodes[0], "click" );
		}
	}, secs * 1000, "navCycle", false );
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
	    copy     = [],
	    expires  = config.expire && !isNaN( config.expire );

	array.each(sections, function ( i ) {
		pills.push( "<li><a href=\"#" + i.slug + "\">" + i.name + "</a></li>" );
		copy.push( "<div id=\"" + i.slug + "\" class=\"hidden\"></div>" );
	} );

	render( function () {
		var deferreds = [];

		// DOM injection
		element.html( PILLS, pills.join( "" ) );
		element.html( COPY, copy.join( "" ) );

		log( "Rendered Elements" );

		// Psuedo constants
		OPTIONS = $( "ul.pills li a" ).map( function ( i ) { return i.href.replace( NOTHASH, "" ); } );
		DEFAULT = config["default"] || OPTIONS[0];

		// Generating stores
		array.each( sections, function ( i ) {
			var lstore;

			if ( i.uri ) {
				lstore = store( null, {id: i.slug, headers: headers, key: "id", source: i.source} );
				deferreds.push( lstore.setUri( i.uri ) );

				if ( expires ) {
					lstore.setExpires( config.expire * 1000 );
				}

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
		if ( !arg.api ) {
			error( new Error( "API key not found" ) );
		}
		else {
			log( "Retrieved configuration" );

			util.merge( config, arg );
			headers["X-Api-Key"] = config.api;

			generate().then(function () {
				// Wiring DOM events
				events();

				// Cycling pills
				if ( config.cycle && !isNaN( config.pause ) && config.pause > 0 ) {
					cycle( config.pause );
				}

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
 * Retrieves metrics
 *
 * @method metrics
 * @return {Undefined} undefined
 */
function metrics () {
	var lhash     = hash,
	    defer     = util.defer(),
	    deferreds = [],
	    host      = /\:host/,
	    metric    = config.pills.filter( function ( i ) { return i.slug === lhash; } )[0].metrics,
	    filter;

	if ( metric !== undefined ) {
		if ( metric.instances.length === 0 ) {
			defer.resolve( {} );
		}
		else {
			// Creating an anonymous function without lexical scope because it's probably going to a Worker
			filter = new Function( "arg", "return /^" + metric.instances.map( function ( i ) { return string.escape( i ); } ).join( "|" ) + "$/i.test( arg );" );

			stores[lhash].select( {name: filter} ).then( function ( recs ) {
				array.each( recs, function ( i ) {
					var url = metric.uri.replace( ":id", i.key ) + "?names[]=" + metric.names.join( "&names[]=" ),
					    key = string.singular( lhash ) + "_hosts";

					if ( host.test( url ) ) {
						if ( i.data.links !== undefined && i.data.links[key] !== undefined && i.data.links[key].length > 0 ) {
							url = url.replace( host, i.data.links[key][0] || 0 );
							deferreds.push( request( url, "GET", null, null, null, headers ) );
						}
					}
					else {
						deferreds.push( request( url, "GET", null, null, null, headers ) );
					}
				} );

				if ( deferreds.length > 0 ) {
					when( deferreds ).then( function ( args ) {
						var data = {},
						    zone = new Date().getTimezoneOffset();

						if ( !( args instanceof Array ) ) {
							args = [args];
						}

						if ( lhash === hash ) {
							array.each( array.mingle( recs, args.map( function ( i ) { return i === null ? i : i.metric_data.metrics; } ) ), function ( i ) {
								array.each( i[1], function ( d ) {
									var split = d.name.split( "/" ),
									    name;

									name = split[1] === "Function" ? split[2] : split[1];

									if ( data[name] === undefined ) {
										data[name] = [];
									}

									array.each( d.timeslices, function ( s ) {
										data[name].push( {name: i[0].data.name, time: moment.utc( s.from ).zone( zone ).format( config.xformat ), value: s.values.per_second || s.values.average_value || s.values.value || s.values.score } );
									} );
								} );
							} );

							defer.resolve( data );
						}
						else {
							defer.reject( new Error( "Hash has changed, data is stale" ) );
						}
					}, function ( e ) {
						defer.reject( e );
					} );
				}
				else {
					defer.resolve( {} );
				}
			}, function ( e ) {
				defer.reject( e );
			} );
		}
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
	var lhash  = hash,
	    store  = stores[lhash],
	    target = $( "#" + lhash )[0],
	    si     = new RegExp( config.si ),
	    pill   = config.pills.filter( function ( i ) { return i.slug === lhash; } )[0],
	    fields = pill.fields,
	    order  = pill.order,
	    callback, ctarget;

	if ( target.childNodes.length === 0 ) {
		log( "Rendering '" + lhash + "'" );

		if ( pill.metrics !== undefined ) {
			metrics().then( function ( data ) {
				var deferreds = [];

				if ( lhash == hash ) {
					array.each( array.keys( data ), function ( i ) {
						var options = {title: i, id: i};

						if ( ctarget === undefined ) {
							ctarget = element.create( "section", {"class": "charts"}, target );
						}

						if ( si.test( i ) ) {
							options.tickFormat = "s";
						}

						deferreds.push( chart( ctarget, data[i], options ) );
					} );

					render( function () {
						grid( target, store, fields, fields, {order: order, pageSize: config.pageSize}, true );

						if ( ctarget !== undefined ) {
							element.klass( element.find( target, "> .grid")[0], "hasCharts" );
						}

						log( "Rendered view of '" + lhash + "'" );
					} );

					when( deferreds ).then( function ( charts ) {
						if ( lhash == hash ) {
							if ( charts !== null && charts.length > 0 ) {
								log( "Rendered charts for '" + lhash + "'" );
							}

							if ( charts !== null && charts.length > 0 ) {
								store.on( "afterSync", function () {
									if ( store.id === lhash ) {
										metrics().then( function ( data ) {
											array.each( charts, function ( i ) {
												try {
													i.data = data[i.id];
													render( function () {
														i.draw( config.transition * 1000 );
													} );
												}
												catch ( e ) {}
											} );
										} );
									}
								} );
							}

							log( "Bound charts and DataStore for '" + lhash + "'" );
						}
					}, function () {
						log( "Failed to render charts for '" + lhash + "'" );
					} );
				}
			}, function ( e ) {
				error( e );

				render( function () {
					grid( target, store, fields, fields, {order: order, pageSize: config.pageSize}, true );
					log( "Rendered view of '" + lhash + "'" );
				} );
			} );
		}
		else {
			// Exists solely for transactions, generalized for anything...
			callback = function ( el ) {
				var target = element.find( el, "span." + string.singular( lhash ) + "_name" )[0],
				    text   = target ? element.text( target ) : "";

				if ( target !== undefined ) {
					element.html( target, "<a title=\"" + text + "\" class=\"tooltip\">" + text + "</a>" );
				}
			};

			render( function () {
				grid( target, store, fields, fields, {callback: callback, order: order, pageSize: config.pageSize}, true );
			} );
		}
	}
	else {
		log( "Viewing '" + lhash + "'" );
	}
}

// Public interface
window.nrDash = {
	stores  : stores,
	version : "1.0.3"
};

// Initializing
init().then( function () {
	log( "nr-dash is running" );
}, function () {
	error( "nr-dash failed to start" );
} );
} )( document, window, keigai, moment, dimple );
