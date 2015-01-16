/**
 * Chart factory
 *
 * @method chart
 * @param  {String} target   Target Element
 * @param  {Object} data     Data for the chart
 * @param  {Object} options  [Optional] Chart options / descriptor
 * @param  {Number} boundary Chart boundary for the 'top' to give space for the legend
 * @return {Object}          keigai Deferred
 */
function chart ( target, data, options, boundary ) {
	options    = options || {};
	var defer  = util.defer(),
	    width  = options.width  || 500,
	    height = options.height || 420;

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

			dChart.setBounds( 60, boundary, ( width - 95 ), ( height - boundary - 60 ) );

			x = dChart.addCategoryAxis( "x", "time" );
			x.addOrderRule( "time" );
			x.title = null;

			y = dChart.addMeasureAxis( "y", "value" );

			if ( options.title ) {
				if ( /time/i.test( options.title ) ) {
					options.title += " (ms)";
				}

				y.title = options.title;
			}

			if ( options.tickFormat ) {
				y.tickFormat = options.tickFormat;
			}

			s = dChart.addSeries( "name", dimple.plot.line );
			s.interpolation = "cardinal";

			if ( options.id ) {
				dChart.id = options.id;
			}

			dChart.addLegend( 10, 10, ( width - 10 ), boundary, "left" );
			dChart.draw();
			dChart.element = el;

			defer.resolve( dChart );
		}
		catch ( e ) {
			defer.reject ( e );
		}
	} );

	return defer;
}
