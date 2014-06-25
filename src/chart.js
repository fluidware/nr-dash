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
	options    = options || {};
	var defer  = util.defer(),
	    width  = options.width  || 600,
	    height = options.height || 400;

	render( function () {
		var el, dSvg, dChart;

		try {
			el     = element.create( "div", {"class": "chart"}, target );
			dSvg   = dimple.newSvg( "#" + el.id, width, height );
			dChart = new dimple.chart( dSvg, data || [] );

			if ( hash === "applications" ) {

			}
			else if ( hash === "servers" ) {
				
			}

			log( "Generated chart" );

			defer.resolve( dChart );
		}
		catch ( e ) {
			defer.reject ( e );
		}
	} );

	return defer;
}
