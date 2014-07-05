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
		var cdata = i.data;

		array.each( keys, function ( key ) {
			var value = walk( cdata, fields[key] ),
			    ldate = cdata.last_reported_at,
			    unix  = moment.utc( ldate ).unix(),
			    nth;

			if ( value === null || value === undefined ) {
				return;
			}

			nth = result[key].filter( function ( i ) {
				return i.name === cdata.name && i.unix === unix;
			} ).length;

			if ( nth === 0 ) {
				result[key].push( {name: cdata.name, time: moment.utc( ldate ).zone( ZONE ).format( config.xformat ), unix: moment.utc( ldate ).unix(), value: value } );
			}
		} );
	} );

	return result;
}