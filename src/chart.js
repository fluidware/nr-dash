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
	    width  = options.width  || 500,
	    height = options.height || 400;

	render( function () {
		var el, dSvg, dChart, x, y, s;

		try {
			el     = element.create( "div", {"class": "chart"}, target );
			dSvg   = dimple.newSvg( "#" + el.id, width, height );
			dChart = new dimple.chart( dSvg, data || [] );

			if ( config.colors && config.colors.length > 0 ) {
				dChart.defaultColors = config.colors.map( function ( i ) {
					return new dimple.color( i );
				} );
			}

			dChart.setBounds( 60, 30, ( width - 95 ), 305 );

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

			dChart.addLegend( 60, 10, ( width - 100 ), 20, "right" );
			dChart.draw();

			defer.resolve( dChart );
		}
		catch ( e ) {
			defer.reject ( e );
		}
	} );

	return defer;
}
