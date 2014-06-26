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
