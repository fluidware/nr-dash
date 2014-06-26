// Initializing
init().then( function () {
	log( "nr-dash is running" );
}, function () {
	error( "nr-dash failed to start" );
} );
} )( document, window, keigai, moment, dimple );
