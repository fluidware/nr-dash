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
	    si     = new RegExp( config.si ),
	    pill   = config.pills.filter( function ( i ) { return i.slug === lhash; } )[0],
	    fields = pill.fields,
	    order  = pill.order,
	    callback, ctarget;

	if ( target.childNodes.length === 0 ) {
		log( "Rendering '" + lhash + "'" );

		if ( pill.metrics !== undefined ) {
			metrics().then( function ( data ) {
				var deferreds = [],
				    keys      = array.keys( data ).sort( array.sort );

				if ( lhash == hash ) {
					if ( ctarget === undefined && ( keys.length > 0 || pill.chartGrid === true ) ) {
						ctarget = element.create( "section", {"class": "charts"}, target );
					}

					array.each( keys, function ( i ) {
						var options = {title: i, id: i};

						if ( si.test( i ) ) {
							options.tickFormat = "s";
						}

						deferreds.push( chart( ctarget, data[i], options ) );
					} );

					render( function () {
						var lgrid = grid( target, store, fields, fields, {order: order, pageSize: config.pageSize}, true );

						if ( ctarget !== undefined ) {
							element.klass( lgrid.element, "hasCharts" );
						}

						if ( pill.chartGrid === true ) {
							chartGrid( lgrid, si, ctarget, lhash );
						}

						log( "Rendered view of '" + lhash + "'" );
					} );

					when( deferreds ).then( function ( charts ) {
						if ( lhash == hash ) {
							if ( charts !== null && charts.length > 0 ) {
								log( "Rendered charts for '" + lhash + "'" );
							}

							if ( charts !== null && charts.length > 0 ) {
								store.on( "afterSync", function () {
									if ( store.id === lhash ) {
										metrics().then( function ( data ) {
											array.each( charts, function ( i ) {
												try {
													i.data = data[i.id];
													render( function () {
														i.draw( config.transition * 1000 );
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
		else {
			// Exists solely for transactions, generalized for anything...
			callback = function ( el ) {
				var target = element.find( el, "span." + string.singular( lhash ) + "_name" )[0],
				    text   = target ? element.text( target ) : "";

				if ( target !== undefined ) {
					element.html( target, "<a title=\"" + text + "\" class=\"tooltip\">" + text + "</a>" );
				}
			};

			render( function () {
				var lgrid;

				if ( ctarget === undefined && pill.chartGrid === true ) {
					ctarget = element.create( "section", {"class": "charts"}, target );
				}

				lgrid = grid( target, store, fields, fields, {callback: callback, order: order, pageSize: config.pageSize}, true );

				if ( ctarget !== undefined ) {
					element.klass( lgrid.element, "hasCharts" );
					chartGrid( lgrid, si, ctarget, lhash );
				}
			} );
		}
	}
	else {
		log( "Viewing '" + lhash + "'" );
	}
}
