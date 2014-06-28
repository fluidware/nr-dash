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
		element.html( PILLS, pills.join( "\n" ) );
		element.html( COPY, copy.join( "\n" ) );

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
