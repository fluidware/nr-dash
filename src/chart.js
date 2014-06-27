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
			dChart.defaultColors = [
				new dimple.color("#1269B0"),
				new dimple.color("#BD2B2B"),
				new dimple.color("#0F5699"),
				new dimple.color("#90C8E4"),
				new dimple.color("#2C0905"),
				new dimple.color("#272728")
			];

			dChart.setBounds( 60, 30, 505, 305 );

			x = dChart.addCategoryAxis( "x", "time" );
			x.addOrderRule( "time" );
			x.title = null;

			y = dChart.addMeasureAxis( "y", "value" );

			if ( options.yTitle ) {
				y.title = options.yTitle;
			}

			s = dChart.addSeries( "name", dimple.plot.line );
			s.interpolation = "cardinal";

			if ( options.id ) {
				dChart.id = options.id;
			}

			dChart.addLegend( 60, 10, 500, 20, "right" );
			dChart.draw();

			defer.resolve( dChart );
		}
		catch ( e ) {
			defer.reject ( e );
		}
	} );

	return defer;
}
