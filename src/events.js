/**
 * Wires events & listeners
 *
 * @method events
 * @return {Undefined}
 */
function events () {
	// Setting listeners
	window.addEventListener( "hashchange", hashchange, false );
	$( "nav" )[0].addEventListener( "click", click, false );
	COPY.addEventListener( "render", view, false );

	log( "Set event listeners" );

	// Setting state
	if ( hash !== "" && array.contains( OPTIONS, hash ) ) {
		log( "Loading hash" );
		element.klass( $( "#" + hash )[0], "hidden", false );
		element.klass( $( "a[href='#" + hash + "']" )[0].parentNode, "active" );
		element.dispatch( COPY, "render" );
	}
	else {
		log( "Loading default" );
		document.location.hash = DEFAULT;
	}
}
