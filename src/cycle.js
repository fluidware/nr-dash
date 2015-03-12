/**
 * Cycles the nav 'pills'
 *
 * @method cycle
 * @param  {Number} secs Number of seconds to pause while cycling
 * @return {Undefined}   undefined
 */
function cycle ( secs ) {
	repeat( function () {
		var current = $( "ul.pills .active" )[0],
		    next    = current.nextElementSibling || current.parentNode.childNodes[0];

		if ( !element.hasClass( next, "active" ) ) {
			element.dispatch( next.childNodes[0], "click" );
		}
	}, secs * 1000, "navCycle", false );
}
