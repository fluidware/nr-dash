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

	// Setting state
	if ( hash !== "" && array.contains( OPTIONS, hash ) ) {
		element.klass( $( "#" + hash )[0], "hidden", false );
		element.klass( $( "a[href='#" + hash + "']" )[0].parentNode, "active" );
	}
	else {
		document.location.hash = DEFAULT;
	}
}
