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
							deferreds.push( request( url, "GET", null, headers ) );
						}
					}
					else {
						deferreds.push( request( url, "GET", null, headers ) );
					}
				} );

				if ( deferreds.length > 0 ) {
					when( deferreds ).then( function ( args ) {
						var data = {};

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
										data[name].push( {name: i[0].data.name, time: moment.utc( s.from ).zone( ZONE ).format( config.xformat ), value: s.values.per_second || s.values.average_value || s.values.value || s.values.score } );
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
