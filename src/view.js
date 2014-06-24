/**
 * Renders the view
 *
 * @method view
 * @return {Undefined} undefined
 */
function view () {
	var store  = stores[hash],
	    target = $( "#" + hash )[0];

	if ( target.childNodes.length === 0 ) {
		log( "Rendering '" + hash + "'" );

		if ( hash === "applications" ) {
			list( target, store, templates.list_applications, {order: "last_reported_at desc"});
		}
		else if ( hash === "servers" ) {
			list( target, store, templates.list_servers, {order: "name asc"});
		}
		else if ( hash === "transactions" ) {
			list( target, store, templates.list_transactions, {order: "application_summary.response_time desc, name asc"});
		}
	}
	else {
		log( "Viewing '" + hash + "'" );
	}
}
