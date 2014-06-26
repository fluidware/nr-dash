/**
 * Chart factory
 *
 * @method chart
 * @param  {String} target  Target Element
 * @param  {Object} data    Data for the chart
 * @param  {Object} options [Optional] Chart options / descriptor
 * @return {Object}         keigai Deferred
 */
function chart ( target, data, options ) {
	options       = options || {};
	var defer     = util.defer(),
	    deferreds = [],
	    width     = options.width  || 600,
	    height    = options.height || 400;

	render( function () {
		var charts = [];

		if ( hash === "applications" ) {
			charts.push( {name: "Response time"} );
		}
		else if ( hash === "servers" ) {

		}

		array.each( charts, function ( i ) {
			var defer = util.defer(),
			    el, dSvg, dChart;

			deferreds.push( defer );

			try {
				el     = element.create( "div", {"class": "chart"}, target );
				dSvg   = dimple.newSvg( "#" + el.id, width, height );
				dChart = new dimple.chart( dSvg, data || [] );

				// do something based on 'i'

				defer.resolve( dChart );
			}
			catch ( e ) {
				defer.reject ( e );
			}
		} );

		when( deferreds ).then( function () {
			log( "Rendered chart(s)" );
			defer.resolve( true );
		}, function ( e ) {
			log( "Failed to rendered chart(s)" );
			defer.reject( e );
		} );
	} );

	return defer;
}
