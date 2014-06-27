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
	    filter, metric;

	metric = config.pills.filter(function( i ) {
		return i.slug === hash;
	} )[0].links.filter( function ( i ) {
		return i.slug === "metrics";
	} );

	if ( metric !== undefined && metric[0] !== undefined ) {
		if ( metric[0].instances.length === 0 ) {
			defer.resolve( {} );
		}
		else {
			filter = new Function ( "i", "return /^" + metric[0].instances.join( "|" ) + "$/i.test( i );" );

			stores[hash].select( {name: filter } ).then( function ( recs ) {
				array.each( recs, function ( i ) {
					var url = metric[0].uri.replace( ":id", i.key ) + "?names[]=" + metric[0].names.join( "&names[]=" );

					deferreds.push( request( url, "GET", null, null, null, headers ) );
				} );

				when( deferreds ).then( function ( args ) {
					var data = {},
					    zone = new Date().getTimezoneOffset();
					
					if ( hash === lhash ) {
						array.each( array.mingle( recs, args.map( function ( i ) { return i.metric_data.metrics; } ) ), function ( i ) {
							array.each( i[1], function ( d ) {
								var name = d.name.split( "/" )[1];

								if ( data[name] === undefined ) {
									data[name] = [];
								}

								array.each( d.timeslices, function ( s ) {
									data[name].push( {name: i[0].data.name, time: moment.utc( s.from ).zone( zone ).format( "h:mm" ), value: s.values.per_second || s.values.average_value } );
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
			}, function ( e ) {
				defer.reject( e );
			} );
		}
	}

	return defer;
}
