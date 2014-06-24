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

			if ( config.pills[i].uri ) {
				lstore = store( null, {id: i, expires: config.expire * 1000, headers: headers} );
				deferreds.push( lstore.setUri( config.pills[i].uri ) );
				stores.push( lstore );
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
