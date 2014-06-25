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
