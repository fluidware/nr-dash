/**
 * Creates a reactive chart for the DataGrid
 *
 * @method chartGrid
 * @param  {Object} grid    DataGrid
 * @param  {Object} si      RegExp to enable "SI" format
 * @param  {Object} ctarget Element
 * @param  {String} lhash   "local" hash
 * @return {Object}         DataGrid
 */
function chartGrid ( grid, si, ctarget, lhash ) {
	var fields  = {},
	    circles = [],
	    seen    = [],
	    nth     = 0,
	    total   = 0,
	    cleared = false,
	    lcharts, rname, keys, obj;

	if ( charts[grid.id] === undefined ) {
		lcharts = [];
		fields  = {};
		rname   = /(.*\.)?/;

		array.each( grid.fields, function ( i ) {
			var name = string.capitalize( string.unCamelCase( string.unhyphenate( i.replace( rname, "" ), true ) ).replace( /_|-/g, " " ), true );

			fields[name] = i;
		} );

		keys = array.keys( fields ).filter( function ( i ) { return i !== "Name"; } ).sort( array.sort );
		obj  = {};

		array.each( keys, function ( i ) {
			obj[i] = [];
		} );

		obj = charts[grid.store.id] = chartGridTransform( keys, fields, obj, grid.store.records );

		array.each( keys, function ( i ) {
			var options = {title: i, id: i};

			if ( si.test( i ) ) {
				options.tickFormat = "s";
			}

			chart( ctarget, obj[i], options ).then( function ( chart ) {
				lcharts.push( chart );

				circles = circles.concat( element.find( chart.element, "circle" ) );
				total   = circles.length;
			} );
		} );

		grid.store.on( "afterSync", function () {
			obj = charts[grid.store.id] = chartGridTransform( keys, fields, obj, grid.store.records );

			if ( lhash === hash ) {
				render( function () {
					if ( !cleared ) {
						array.each( circles, function ( i, idx ) {
							var name  = i.id.replace( /_.*/, "" ),
							    found = {},
							    key;
							
							if ( string.isEmpty( i.ownerSVGElement.id ) ) {
								i.ownerSVGElement.id = "k" + util.uuid().replace( /-/g, "" );
							}

							array.each( keys, function ( i ) {
								found[i] = obj[i].filter( function ( i ) { return i.name === name; } ).length;
							} );

							if ( !array.contains( seen, idx ) ) {
								key = $( "#" + i.ownerSVGElement.id + " .dimple-title" )[0].innerHTML;

								if ( found[key] > 1 ) {
									++nth;
									seen.push( idx );
									d3.select( i ).attr( "opacity", 0 ).on( "mouseout", function () { d3.select( this ).attr( "opacity", 0 ).style( "opacity", 0 ); } );
								}
							}
						} );

						// Cleaning potential previous 'hover' states
						array.each( seen, function ( i ) {
							d3.select( circles[i] ).attr( "opacity", 0 ).style( "opacity", 0 );
						} );

						if ( nth === total ) {
							cleared = true;
						}
					}

					array.each( lcharts, function ( i ) {
						i.data = obj[i.id];
						i.draw( config.transition * 1000 );
					} );
				} );
			}
		}, "chartGrid" );
	}

	return charts[grid.id];
}
