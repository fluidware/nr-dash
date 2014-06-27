/**
 * Renders the view
 *
 * @method view
 * @return {Undefined} undefined
 */
function view () {
	var store  = stores[hash],
	    target = $( "#" + hash )[0],
	    callback, fields, order;

	if ( target.childNodes.length === 0 ) {
		log( "Rendering '" + hash + "'" );

		if ( /applications|servers/.test( hash ) ) {
			if ( hash === "applications" ) {
				fields = ["name", "application_summary.response_time", "application_summary.apdex_score", "application_summary.throughput"];
				order  = "application_summary.response_time desc, name asc";

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
			}
			else {
				fields = ["name", "summary.cpu", "summary.memory"];
				order  = "summary.memory desc, name asc";
			}

			metrics().then( function ( data ) {
				var deferreds = [];

				array.each( array.keys( data ), function ( i ) {
					deferreds.push( chart( target, data[i], {yTitle: i, id: i} ) );
				} );

				when( deferreds ).then( function ( charts ) {
					if ( charts !== null && charts.length > 0 ) {
						log( "Rendered charts for '" + hash + "'" );
					}

					render( function () {
						grid( target, store, fields, fields, {callback: callback, order: order}, true );
						log( "Rendered view of '" + hash + "'" );
					} );

					if ( charts !== null && charts.length > 0 ) {
						store.on( "afterSync", function () {
							metrics().then( function ( data ) {
								array.each( charts, function ( i ) {
									i.data = data[i.id];

									// Only draw if visible
									if ( store.id === hash ) {
										// 2 second transition
										i.draw( 2000 );
									}
								} );
							} );
						} );
					}

					log( "Bound charts and DataStore for '" + hash + "'" );
				}, function () {
					log( "Failed to render charts for '" + hash + "'" );
				} );
			}, function ( e ) {
				error( e );
			} );
		}
		else if ( hash === "transactions" ) {
			fields = ["name", "transaction_name", "application_summary.response_time", "application_summary.apdex_score", "application_summary.throughput"];
			order  = "application_summary.response_time desc, name asc";

			callback = function ( el ) {
				var target = element.find( el, "span.transaction_name" )[0],
				    text   = element.text( target );

				element.html( target, "<a title=\"" + text + "\" class=\"tooltip\">" + text + "</a>" );
			};

			render( function () {
				grid( target, store, fields, fields, {callback: callback, order: order}, true );
			} );
		}
	}
	else {
		log( "Viewing '" + hash + "'" );
	}
}
