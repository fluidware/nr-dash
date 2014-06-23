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
			log( "Retrieved configuration" );

			util.merge( config, arg );
			headers["X-Api-Key"] = config.keys.api;

			generate().then(function () {
				events();
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
