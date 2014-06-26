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
		var el, dSvg, dChart, x, y, s;

		try {
			el     = element.create( "div", {"class": "chart"}, target );
			dSvg   = dimple.newSvg( "#" + el.id, width, height );
			dChart = new dimple.chart( dSvg, data || [] );

			dChart.setBounds( 60, 30, 505, 305 );
			x = dChart.addCategoryAxis("x", "time" );

			/*x = dChart.timeField( "x", "time" );
			x.dateParseFormat = "%I:%M%p";
			x.addOrderRule( "timeUnix" );*/

			dChart.addMeasureAxis( "y", "value" );
			s = dChart.addSeries( "name", dimple.plot.line );
			s.interpolation = "cardinal";
			dChart.addLegend(60, 10, 500, 20, "right" );
			dChart.draw();

			defer.resolve( dChart );
		}
		catch ( e ) {
			defer.reject ( e );
		}
	} );

	return defer;
}
