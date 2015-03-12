/**
 * Hash listen
 *
 * @method hashchange
 * @param  {Object} ev
 * @return {Undefined} undefined
 */
function hashchange ( ev ) {
	var oldHash  = hash ? hash : null,
	    newHash  = document.location.hash ? document.location.hash.replace( "#", "" ) : null,
	    $oldDiv  = oldHash ? $( "#" + oldHash )[0] : null,
	    $newDiv  = newHash ? $( "#" + newHash )[0] : null,
	    $oldItem = oldHash ? $( "a[href='#" + oldHash + "']" )[0] : null,
	    $newItem = newHash ? $( "a[href='#" + newHash + "']" )[0] : null;

	prevent( ev );
	stop( ev );

	render( function () {
		if ( $oldItem && $oldDiv ) {
			element.removeClass( $oldItem.parentNode, "active" );
			element.addClass( $oldDiv, "hidden" );
		}

		if ( $newItem && $newDiv ) {
			hash = newHash;
			element.addClass( $newItem.parentNode, "active" );
			element.removeClass( $newDiv, "hidden" );
		}
		else {
			hash = DEFAULT;
			document.location.hash = DEFAULT;
		}

		element.dispatch( COPY, "render" );
	} );
}
