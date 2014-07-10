/**
 * Returns the last 30 minutes of data
 *
 * @method chartGridTransform
 * @param  {Array}  keys    Chart keys
 * @param  {Object} fields  Record fields by `key`
 * @param  {Object} data    Chart data
 * @param  {Array}  records DataStore records
 * @return {Array}          Chart data constrained to 30 minutes
 */
function chartGridTransform ( keys, fields, data, records ) {
	var result = {},
	    mmnt   = moment();

	// Removing stale data
	array.each( keys, function ( key ) {
		result[key] = data[key].filter( function ( i ) {
			return mmnt.diff( moment.unix( i.unix ), "minutes" ) <= 30;
		} );
	} );

	// Adding fresh data
	array.each( records, function ( i ) {
		var ldata = i.data;

		array.each( keys, function ( key ) {
			var lvalue = walk( ldata, fields[key] ),
			    ldate  = ldata.last_reported_at,
			    ltime  = moment.utc( ldate ).zone( ZONE ).format( config.xformat ),
			    lunix  = moment.utc( ldate ).unix(),
			    found  = false;

			if ( lvalue === null || lvalue === undefined ) {
				return;
			}

			array.each( result[key], function ( i ) {
				if ( i.name === ldata.name && i.time === ltime ) {
					i.value = lvalue;
					i.unix  = lunix;
					found   = true;
					return false;
				}
			} );

			if ( !found ) {
				result[key].push( {name: ldata.name, time: ltime, unix: lunix, value: lvalue } );
			}
		} );
	} );

	return result;
}
