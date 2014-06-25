/**
 * Renders the view
 *
 * @method view
 * @return {Undefined} undefined
 */
function view () {
	var store  = stores[hash],
	    target = $( "#" + hash )[0],
	    callback;

	if ( target.childNodes.length === 0 ) {
		log( "Rendering '" + hash + "'" );

		if ( hash === "applications" ) {
			callback = function ( el ) {
				var rec = store.get( element.data( el, "key" ).toString() );

				if ( rec.data.application_summary === undefined || rec.data.application_summary.apdex_score === null ) {
					render( function () {
						array.each( element.find( el, ".metric" ), function ( i ) {
							element.klass( i, "hidden" );
						} );
					} );
				}
			};

			list( target, store, templates.list_applications, {callback: callback, order: "application_summary.response_time desc, name asc"} );
		}
		else if ( hash === "servers" ) {
			list( target, store, templates.list_servers, {order: "summary.memory desc, name asc"} );
		}
		else if ( hash === "transactions" ) {
			list( target, store, templates.list_transactions, {order: "application_summary.response_time desc, name asc"} );
		}
	}
	else {
		log( "Viewing '" + hash + "'" );
	}
}
