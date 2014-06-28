/**
 * Renders the view
 *
 * @method view
 * @return {Undefined} undefined
 */
function view () {
	var lhash  = hash,
	    store  = stores[lhash],
	    target = $( "#" + lhash )[0],
	    si     = /Disk|Memory|Network/,
	    callback, fields, order;

	if ( target.childNodes.length === 0 ) {
		log( "Rendering '" + lhash + "'" );

		if ( /applications|servers/.test( lhash ) ) {
			if ( lhash === "applications" ) {
				fields = ["name", "application_summary.response_time", "application_summary.apdex_score", "application_summary.throughput"];
				order  = "application_summary.response_time desc, name asc";
			}
			else {
				fields = ["name", "summary.cpu", "summary.memory"];
				order  = "summary.memory desc, name asc";
			}

			metrics().then( function ( data ) {
				var deferreds = [];

				if ( lhash == hash ) {
					array.each( array.keys( data ), function ( i ) {
						var options = {title: i, id: i};

						if ( si.test( i ) ) {
							options.tickFormat = "s";
						}

						deferreds.push( chart( target, data[i], options ) );
					} );

					when( deferreds ).then( function ( charts ) {
						if ( lhash == hash ) {
							if ( charts !== null && charts.length > 0 ) {
								log( "Rendered charts for '" + lhash + "'" );
							}

							render( function () {
								grid( target, store, fields, fields, {order: order, pageSize: config.pageSize}, true );
								log( "Rendered view of '" + lhash + "'" );
							} );

							if ( charts !== null && charts.length > 0 ) {
								store.on( "afterSync", function () {
									if ( store.id === lhash ) {
										metrics().then( function ( data ) {
											array.each( charts, function ( i ) {
												try {
													i.data = data[i.id];
													render( function () {
														i.draw( 2000 );
													} );
												}
												catch ( e ) {}
											} );
										} );
									}
								} );
							}

							log( "Bound charts and DataStore for '" + lhash + "'" );
						}
					}, function () {
						log( "Failed to render charts for '" + lhash + "'" );
					} );
				}
			}, function ( e ) {
				error( e );

				render( function () {
					grid( target, store, fields, fields, {order: order, pageSize: config.pageSize}, true );
					log( "Rendered view of '" + lhash + "'" );
				} );
			} );
		}
		else if ( lhash === "transactions" ) {
			fields = ["name", "transaction_name", "application_summary.response_time", "application_summary.apdex_score", "application_summary.throughput"];
			order  = "application_summary.response_time desc, name asc";

			callback = function ( el ) {
				var target = element.find( el, "span.transaction_name" )[0],
				    text   = element.text( target );

				element.html( target, "<a title=\"" + text + "\" class=\"tooltip\">" + text + "</a>" );
			};

			render( function () {
				grid( target, store, fields, fields, {callback: callback, order: order, pageSize: config.pageSize}, true );
			} );
		}
	}
	else {
		log( "Viewing '" + lhash + "'" );
	}
}
