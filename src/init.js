/**
 * Initializes nr-dash
 *
 * @method init
 * @return {Object} Deferred
 */
function init () {
	var defer = util.defer();

	util.request( "config" ).then( function ( arg ) {
		if ( !arg.keys.api ) {
			error( new Error( "API key not found" ) );
		}
		else {
			util.merge( config, arg );
			headers["X-Api-Key"] = config.keys.api;

			generate().then(function () {
				events();
				defer.resolve( true );
			} );
		}
	}, function ( e ) {
		error( e );
		defer.reject( e );
	} );

	return defer;
}
