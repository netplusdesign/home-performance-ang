'use strict';

/* Services */

/* global angular */
/* global moment */
/* global chroma */
/* global Highcharts */
/* jshint strict : true */
/* jshint undef : true */
/* jshint unused : true */
/* jshint globalstrict : true */

angular.module( 'myApp.services', [] ).
	factory( 'metadataService', [ function() {
		
		var data = {};
		data.houseId = false;
		data.chartDate = false; // stored as string
		data.asofDate = false;
		data.years = false;
		data.circuit = 'summary'; // default view for usage screen

		var current = {},
		limits = { range : {} }, // for hourly chart
	
		setHouse = function ( house ) {
			
			if ( house && ( typeof house !== 'undefined' ) ) { 
				// check if switching houses
				if (( data.houseId > -1 ) && ( house != data.houseId )) {
					
					data.asofDate = false; // will force metadata reload
				}
				data.houseId = house; 
			} 
			else if ( !data.houseId ) {
				
				data.houseId = '0'; // default if house param is not passed in URL
			}
			return data.houseId;
		},
		setDate = function ( dt ) {

			if (dt && ( typeof dt !== 'undefined' )) { 
			
				data.chartDate = moment( dt, 'YYYY-MM-DD' ).format( 'YYYY-MM-DD' ); // defaults date of month to 01 if missing
			
				current.year = moment( data.chartDate ).format( 'YYYY' ); 
			} 
			return data.chartDate;
		},
		setCircuit = function ( path, circuit ) {
			
			if ( typeof circuit !== 'undefined' ) {
			
				data.circuit = circuit;
				
				if ( path == 'daily' ) {
					
					current.view = current.view + '/' + circuit;
				}
			}
			return data.circuit;
		},
		setPeriod = function ( period ) {
			// do more validation here in future
			// and maybe store value if return
			if ( typeof period === 'undefined' ) {
			
				period = 'months';
			}
			return period;
		},
		setBase = function ( base ) {
			// do more validation here in future
			// and maybe store value if return
			if ( typeof base === 'undefined' ) {
			
				base = 65;
			}
			return base;		
		},
		validate = function ( routeParams ) {
			
			var options = { params : {} };
			options.view = routeParams.view;
			// used for navigation
			current.view = routeParams.path + '/' + routeParams.view;
			
			// 2 params used in all data calls
			options.params.house = setHouse( routeParams.house );
			options.params.date = setDate( routeParams.date );
			
			// view dependent params
			if ( options.view == 'usage' ) { 
			
				options.params.circuit = setCircuit( routeParams.path, routeParams.circuit ); 
			}
			if ( options.view == 'basetemp' ) { 
			
				options.params.period = setPeriod( routeParams.period ); 
			
				options.params.base = setBase( routeParams.base ); 
			}
			return options;
		},
		
		// 2 methods used by navCtrl
		setParamYear = function ( yr ) {
			
			data.chartDate = moment( data.chartDate ).year( parseInt(yr) ).format('YYYY-MM-DD');  // update date
			
			current.year = yr;
		},
		setMetadata = function ( d ) {
			// gets called after validate
			data.asofDate = moment(d.asof).format('YYYY-MM-DD');
			
			data.years = d.years; 
			
			data.houseName = d.house;
			
			if ( !data.chartDate ) {
			
				data.chartDate = data.asofDate;
			
				current.year = moment( data.chartDate ).format('YYYY'); // set default year selector
			} 
		},
		setDailyMetadata = function ( d ) {
			// gets called after validate
			// used for chart to set min and max of y axes
			limits.kwh_max = d.limits.used_max;
			limits.kwh_min = d.limits.solar_min;
			limits.deg_max = d.limits.outdoor_deg_max;
			limits.deg_min = d.limits.outdoor_deg_min;
			limits.hdd_max = d.limits.hdd_max;
			limits.hdd_min = 0;
			// used for calendar month limits
			limits.range = { startDate : d.daily_date_range.start, endDate : d.daily_date_range.end };
		},
		// need days year to date to calculate avarage per day values
		// if chart year > asof year then return false (can't show data that does not exist)
		// if chart year (2013) == asof year (2013) then use asof date (else assume it is a prior year)
		// else if leap year use chart year and divide by 366 
		// else use chart year and divide by 365
		getDaysYTD = function () {
		
			var daysInYear,
			asof = moment(data.asofDate),
			chart = moment(data.chartDate);
			
			if (( chart.year() > asof.year() ) || ( chart.year() < data.years[0] )) { 
				
				return false;
			}
			if ( asof.year() == chart.year() ) {
				
				daysInYear = asof.dayOfYear();
			}
			else if ( chart.isLeapYear() ) { // date in a past year
				
				daysInYear = 366;
			}
			else {
				
				daysInYear = 365;
			}
			return daysInYear;
		};
		
		return {
			data : data,					// 
			current : current,				// used by navCtrl to set state of nav options
			limits : limits,				// used by dataProvider and chartService - daily
			validate : validate,			// used by dataProvider
			setParamYear : setParamYear,	// called from navCtrl when user selects a year
			setMetadata : setMetadata,		// used by navCtrl, phase this out?
			setDailyMetadata : setDailyMetadata,	// used by calendar and hourly chart
			getDaysYTD : getDaysYTD			// utility method
		};

	}])
	.factory( 'dataProvider', [ '$http', 'metadataService', function ( $http, metadataService ) {
		
		var getMonthlyMetadataDetails = function ( params ) {

			return $http.get( 'data/get_monthly_metadata.php', params ).then( function ( result ) {

				metadataService.setMetadata ( result.data );
			
				params.params.date = metadataService.data.chartDate;
			}); 
		},
		getMonthlyDetails = function ( params ) {
			
			return $http.get( 'data/get_' + params.view + '.php', params ).then( function ( result ) {
			
				return result.data; 
			});
		},
		getMonthlyMetadata = function ( params ) {
			
			return getMonthlyMetadataDetails ( params ).

			then( function () {
			
				return getMonthlyDetails ( params );
			});
		},
		getMonthlyData = function ( routeParams ) {
				
			var params = metadataService.validate ( routeParams );
			// if no metadata, then get it first
			if ( metadataService.data.asofDate ) {
			
				return getMonthlyDetails( params );
			}
			else {
			
				return getMonthlyMetadata ( params );
			}
		},

		getDailyMetadata = function ( params ) {

			return $http.get( 'data/get_daily_metadata.php', params ).
			
			then( function ( result ) {

				metadataService.setDailyMetadata ( result.data );
							
			});
		},
		getDailyDetails = function ( params ) {
			
			if ( typeof metadataService.limits.kwh_max === 'undefined') {
				
				return getDailyMetadata ( params ).
				
				then( function() {
					
					return $http.get( 'data/get_daily_data.php', params ).
					
					then( function ( result ) {
					
						return result.data;	
					});
				});
			}
			else {
				
				return $http.get( 'data/get_daily_data.php', params ).
				
				then( function ( result ) {
				
					return result.data;	
				});
			}
		},
		getDailyData = function ( routeParams ) {

			var params = metadataService.validate ( routeParams ); 
			// if no asofDate or name, then get it first -- needed for navCtrl
			if ( !metadataService.data.asofDate ) {
				
				return getMonthlyMetadataDetails ( params ).
				
				then( function () {
					
					return getDailyMetadata ( params );
				}).
				
				then( function () {
					
					return getDailyDetails( params );
				});
			}
			else {
				
				return getDailyDetails( params );
			}

		},
		
		getHourlyData = function ( routeParams ) {

			var params = metadataService.validate ( routeParams );
			
			return $http.get( 'data/get_hourly_data.php', params ).then( function ( result ) {
			
				return result.data; 
			});
		};
		
		return {
			getMonthlyData : getMonthlyData,
			getDailyData : getDailyData,
			getHourlyData : getHourlyData
		};	
		
	}])
	.factory('chartService', [ '$window', 'metadataService', function ( $window, metadataService ) {
		
		Highcharts.setOptions({
			colors: ['#336699', '#669933', '#CC9933', '#CC3333', '#663366', '#999999', '#336699', '#669966']
		});
		
		var charts = [],
		
		chartTemplate = {
			
			chart : {
				renderTo : 'view1'
			},
			credits: {
				enabled: false
			},
			legend: {
				enabled: true,
				borderWidth: 0
			},
			title : {
				text : 'Monthly',
				style : { 
					fontSize: '13px' 
				}
			},
			xAxis : {
				categories : [],
				title : {
					text : '',
					style: {
						color: '#000000',
						fontWeight: 'normal',
						fontSize: '10px'	
					}
				}
			},
			yAxis : [{
				title : {
					text : 'kWh',
					style: {
						color: '#000000',
						fontWeight: 'normal',
						fontSize: '10px'	
					},
					rotation: -90
				}
			}],
			plotOptions: {  
				column: {
					dataLabels: {
						enabled: false,
						align: 'center',
						color: '#FFFFFF',
						y: 16
					}
				},
				series: {
					enableMouseTracking: true,
					pointPadding: 0,
					groupPadding: 0.05,
					borderWidth: 0,
					shadow: false
				}
			}
			//series : []
		},
		
		putSeriesData = function ( options, data ) {
			
			var i, j;
			
			for ( i = 0; i < data.months.length; i++ ) {

				options.xAxis.categories.push( moment( data.months[ i ].date ).format( 'MMM' ) );

				for ( j = 0; j < options.series.length; j++ ) {
					
					options.series[ j ].data.push( Math.round( data.months[ i ][ options.series[ j ].name.toLowerCase() ] ) );	
				}
			}
			return options;
		},
		
		showDangerIfUsingMoreThanProducing = function ( category, colors, used, solar ) {
			
			if (( category == 'Solar' ) && ( Math.abs( used ) > Math.abs( solar ) )) {
				return colors.danger;
			}
			else {
				return colors[ category ];
			}
		},
		showUsageVsGen = function ( data ) {	
			
			var i, colors = { 'Used' : '#336699', 'Solar' : '#669933', 'danger' : '#DF0101' },
			options = angular.copy ( chartTemplate ); 
			options.title.text = 'Usage vs. Generation';
			options.legend.enabled = false;
			options.plotOptions.column.dataLabels.enabled = true;
			options.series = [ { type: 'column', data : [] } ];
			options.xAxis.categories = [ 'Used', 'Solar' ];
		
			for ( i = 0; i < options.xAxis.categories.length; i++ ) {
				
				options.series[0].data.push({
					y : Math.round( Math.abs ( data.totals[ options.xAxis.categories[ i ].toLowerCase() ] ) ), 
					color : showDangerIfUsingMoreThanProducing( options.xAxis.categories[ i ], colors, data.totals.used, data.totals.solar )
				}); // if usage > solar then danger, danger! (change color of solar to red)
			}
			
			return new Highcharts.Chart ( options );
		},

		showSummaryYTD = function ( data ) {
			
			var options = angular.copy( chartTemplate ); 
			options.chart.renderTo = 'view2';
			options.yAxis.push( angular.copy( options.yAxis[0] ) );
			options.yAxis[1].title.text = 'HDD';
			options.yAxis[1].title.rotation = 90;
			options.yAxis[1].opposite = true;
			options.yAxis[1].min = 0;
			options.series = [ 
				{ name : 'Used', type: 'column', data : [] }, 
				{ name : 'Solar', type: 'column', data : [] }, 
				{ name : 'Net', type: 'column', data : [] },
				{ name : 'HDD', type: 'line', data : [], yAxis : 1 }
			];

			return new Highcharts.Chart ( putSeriesData( options, data ) );
		},

		showGenerationYTD = function ( data ) {
			
			var options = angular.copy ( chartTemplate ); 
			options.series = [ 
				{ name : 'Actual', type: 'column', data : [] }, 
				{ name : 'Estimated', type: 'column', data : [] }, 
				{ name : 'Net', type: 'column', data : [] }
			];

			return new Highcharts.Chart ( putSeriesData( options, data ) );	
		},

		showUsageCircuits = function ( data ) {

			var i, options = angular.copy ( chartTemplate ); 
			options.title.text = 'Usage by circuit';
			options.tooltip = {
				pointFormat: '{series.name}: <b>{point.y} kWh</b>',
				percentageDecimals: 1
			};
			options.plotOptions = { 
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						color: '#000000',
						connectorColor: '#000000',
						formatter: function() {
							return '<b>'+ this.point.name +'</b>: '+ Math.round(this.percentage) +' %';
						}
					}
				}
			};
			options.series = [ { type: 'pie', data : [] } ];

			for ( i = 1; i < data.circuits.length; i++ )
			{
				options.series[0].data.push( { name : data.circuits[i].title, y : parseFloat( data.circuits[i].actual ) } );
			}

			return new Highcharts.Chart (options);
		},

		showUsageYTD = function ( data ) {
			
			var options =angular.copy ( chartTemplate ); 
			options.title.text = data.circuit.title;
			options.series = [ 
				{ name : 'Actual', type: 'column', data : [] } 
			];

			switch ( data.circuit.name ) {
				case 'ashp' :
					options.series.push( { name : 'Projected', type: 'column', data : [] } );
					options.series.push( { name : 'Net', type: 'column', data : [] } );
					break;
				case 'all' :
					options.series.push( { name : 'Budget', type: 'column', data : [] } );
					options.series.push( { name : 'Net', type: 'column', data : [] } );
			}

			return new Highcharts.Chart ( putSeriesData( options, data ) );
		},

		showHddYTD = function ( data ) {

			var options = angular.copy ( chartTemplate ); 
			options.yAxis[0].title.text = 'HDD';
			options.series = [ 
				{ name : 'Actual', type: 'column', data : [] }, 
				{ name : 'Estimated', type: 'column', data : [] }, 
				{ name : 'Net', type: 'column', data : [] }
			];

			return new Highcharts.Chart ( putSeriesData( options, data ) );
		},
		
		showWaterYTD = function ( data ) {

			var options = angular.copy ( chartTemplate ); 
			options.title.text = 'Monthly Breakdown';
			options.yAxis.push( angular.copy( options.yAxis[0] ) );
			options.yAxis[0].title.text = 'Gallons';
			options.yAxis[0].labels = { format : '{value:,.0f}' };
			options.yAxis[0].max = 4000;
			options.yAxis[1].title.text = 'Wh/gal';
			options.yAxis[1].title.rotation = 90;
			options.yAxis[1].opposite = true;
			options.yAxis[1].min = 0;
			options.series = [ 
				{ name : 'Cold', type: 'column', data : [] }, 
				{ name : 'Hot', type: 'column', color : '#CC3333', data : [] }, 
				{ name : 'Water_heater', type : 'line', color : '#CC3333', data : [], yAxis : 1 }
			];

			return new Highcharts.Chart ( putSeriesData( options, data ) );
		},
		
		showWaterMainYTD = function ( data ) {

			var options = angular.copy ( chartTemplate ); 
			options.chart.renderTo = 'view2';
			options.title.text = 'Monthly Total Usage';
			options.yAxis[0].title.text = 'Gallons';
			options.yAxis[0].labels = { format : '{value:,.0f}' };
			options.yAxis[0].max = 4000;
			options.series = [ 
				{ name : 'Main', type: 'area', data : [] }
			];

			return new Highcharts.Chart ( putSeriesData( options, data ) );
		},

		showBaseTemp = function ( data ) {

			var i, d, dt, tm,
			options = angular.copy ( chartTemplate ); 
			options.chart.renderTo = 'view1';
			options.chart.height = 400;
			options.zoomType = 'x';
			options.title.text = 'Correlating HDD with Heating energy';
			delete options.xAxis.categories;
			options.xAxis.title.text = 'HDD';
			options.plotOptions = { 
				series: {
					turboThreshold : 0,
					point: {
						events: {
							click: function() {
								if (this.date) {
									dt = moment( this.date, ['MMM, YYYY', 'MMM d, YYYY', 'MMM d, YYYY h a'] );
									tm = (data.period === 'hours') ? '&time=' + dt.format('HH') : ''; 
									$window.location = '#/daily/usage/ashp?date=' + dt.format('YYYY-MM-DD') + tm;
								}
							}
						}
					}
				},
				scatter: {
					marker: {
						radius: 5 
					},
					states: {
						hover: {
							lineWidth: 0,
							marker: {
								enabled: false
							}
						}
					},
					tooltip: {
						pointFormat: '<b>Date: {point.date}</b><br/>HDD: {point.x}<br/>ASHP: {point.y} kWh<br/>Solar: {point.solar} kWh'
					}
				}
			};
			options.series = [ 
				{ name : 'Data point', type : 'scatter', color : 'rgba(223, 83, 83, .5)', data : [] },
				{ name : 'Regression Line', type : 'line', color : '#336699', data : [] }
			];
			
			for( i = 0; i < data.points.length; i++ ) {
				 
				d = moment( data.points[i].date, ['YYYY-MM-DD', 'YYYY-MM-DD hh:mm:ss'] );
				if ( data.period === 'hours' ) { dt = d.format( 'MMM D, YYYY h a' ); }
				if ( data.period === 'days' ) { dt = d.format( 'MMM D, YYYY' ); }
				if ( data.period === 'months' ) { dt = d.format( 'MMM, YYYY' ); }
				
				options.series[0].data.push({ 
					date  : dt,
					ashp  : data.points[ i ].ashp,
					solar : data.points[ i ].solar, 
					x : parseFloat( data.points[ i ].hdd ), 
					y : parseFloat( data.points[ i ].ashp ) 
				});
			}
			
			var start_x = Math.min.apply( Math, data.lr.xr );
			var start_y = data.lr.slope * start_x + data.lr.intercept;
			var end_x = Math.max.apply( Math, data.lr.xr );
			var end_y = data.lr.slope * end_x + data.lr.intercept;
			
			options.series[1].data.push( [ start_x, start_y ], [ end_x, end_y ] );

			return new Highcharts.Chart ( options );
		},

		showDaily = function ( data ) {
			
			var i, j, chart,
			options = angular.copy ( chartTemplate ); 
			options.chart.renderTo = 'view1';
			options.chart.height = 400;
			options.plotOptions.series.marker = { enabled : false };
			options.title.text = moment( data.hours[0].date ).format( 'MMMM D, YYYY' );
			options.xAxis.title.text = 'Hour of day';
			options.yAxis.push( angular.copy( options.yAxis[0] ) ); // 1
			options.yAxis.push( angular.copy( options.yAxis[0] ) ); // 2
			options.yAxis[0].title.text = 'kWh';
			options.yAxis[0].min = metadataService.limits.kwh_min;
			options.yAxis[0].max = metadataService.limits.kwh_max;
			//options.yAxis[0].labels = { format : '{value:,.0f}' };
			//options.yAxis[0].max = 4000; // set from metadataService.limits
			options.yAxis[1].title.text = 'Temperature F';
			options.yAxis[1].min = metadataService.limits.deg_min;
			options.yAxis[1].max = metadataService.limits.deg_max;
			
			options.yAxis[2].title.text = 'HDD';
			options.yAxis[2].min = metadataService.limits.hdd_min;
			options.yAxis[2].max = metadataService.limits.hdd_max;
			options.yAxis[2].title.rotation = 90;
			options.yAxis[2].opposite = true;

			options.series = [ 
				{ id : 'netusage', name : 'Net Usage', type: 'line', color : '#CC9933', data : [], yAxis : 0, zIndex : 3, lineWidth : 5 }, 
				{ id : 'generation', name : 'Generation', type: 'area', color : '#669933', data : [], yAxis : 0, lineWidth : 0 }, 
				{ id : 'usage', name : 'Usage', type : 'area', color : '#336699', data : [], yAxis : 0, lineWidth : 0 },
				{ id : 'first_floor_temp', name : 'First floor temp', type : 'line', data : [], yAxis : 1 },
				{ id : 'second_floor_temp', name : 'Second floor temp', type : 'line', data : [], yAxis : 1 },
				{ id : 'basement_temp', name : 'Basement temp', type : 'line', data : [], yAxis : 1 },
				{ id : 'outdoor_temp', name : 'Outdoor temp', type : 'line', data : [], yAxis : 1 },
				{ id : 'hdd', name : 'HDD', type : 'line', data : [], yAxis : 2 },
				{ id : 'water_heater', name : 'Water heater', type : 'line', data : [], yAxis : 0 },
				{ id : 'ashp', name : 'ASHP', type : 'line', data : [], yAxis : 0 },
				{ id : 'water_pump', name : 'Water pump', type : 'line', data : [], yAxis : 0 },
				{ id : 'dryer', name : 'Dryer', type : 'line', data : [], yAxis : 0 },
				{ id : 'washer', name : 'Washer', type : 'line', data : [], yAxis : 0 },
				{ id : 'dishwasher', name : 'Dishwasher', type : 'line', data : [], yAxis : 0 },
				{ id : 'range', name : 'Range', type : 'line', data : [], yAxis : 0 },
				{ id : 'all_other', name : 'All other', type : 'line', data : [], yAxis : 0 }
			];			
			// set additional options
			
			// parse data
			for ( i = 0; i < data.hours.length; i++ ) {

				options.xAxis.categories.push( moment( data.hours[ i ].date ).format( 'H' ) );

				for ( j = 0; j < options.series.length; j++ ) {
					options.series[ j ].data.push( parseFloat( data.hours[ i ][ options.series[ j ].id ] ) );	
				}
			}
			
			chart = new Highcharts.Chart ( options );
			
			// add/remove plotline as needed
			if (typeof data.time !== 'undefined') 
			{ 
				chart.xAxis[0].addPlotLine({ color : '#FF0000', width : 2, value : data.time, id : 'p1' });
			}
			// turn off temps and circuits
			for ( i = 3; i < options.series.length; i++ ) { chart.series[ i ].hide();}
			chart.series[ 7 ].show();
			
			return chart;
		},
		
		setData = function ( view, data ) {
			
			while ( charts.length > 0 ) {
				charts.pop().destroy();
			}
			
			switch( view ) {
				case "summary":
					charts.push( showUsageVsGen ( data ) );
					charts.push( showSummaryYTD ( data ) );
					break;
				case "generation":
					charts.push( showGenerationYTD ( data ) );
					break;
				case "usage":
					charts.push( showUsageCircuits ( data ) );
					break;
				case "circuit":
					charts.push( showUsageYTD ( data ) );
					break;
				case "hdd":
					charts.push( showHddYTD ( data ) );
					break;
				case "water":
					charts.push( showWaterYTD ( data ) );
					charts.push( showWaterMainYTD ( data ) );
					break;
				case "basetemp":
					charts.push( showBaseTemp ( data ) );
					break;
				case "daily":
					charts.push( showDaily ( data ) );
			}			
		};
		
		return {
			setData : setData
		};

	}])
	.factory('dataService', [ 'metadataService', function(metadataService) {
		
		var insertADU = function (data, props, avg_props) {
			
			var i, j,
			adu, 
			daysInMonth, 
			daysInYear = metadataService.getDaysYTD();
			
			for ( i = 0; i < props.length; i++ ) { 
			
				adu = data.totals[ props[i] ] / daysInYear;
				data.totals[ avg_props[i] ] = adu;
			}

			for ( j = 0; j < data.months.length; j++ ) {
			
				for (i = 0; i < props.length; i++ ) {
			
					daysInMonth = moment( data.months[j].date ).daysInMonth(); 
					adu = data.months[j][ props[i] ] / daysInMonth;
					data.months[j][ avg_props[i] ] = adu;
				}
			}
			return data;
		},

		insertADG = function (data) {
			// gen per day
			var daysInYear = metadataService.getDaysYTD(),
			adg = data.totals.actual / daysInYear; 
			data.avg_daily_gen = adg.toFixed(1);

			return data;
		},

		insertDiff = function ( data, col1, col2 ) {				
			// diff for total line
			var i, 
			net = data.totals[col1] - data.totals[col2],
			diff = (net / data.totals[col2]) * 100.0;
			data.totals.net = net.toFixed(0);
			data.totals.diff = diff.toFixed(1);
			
			// diff for each month
			for ( i = 0; i < data.months.length; i++ ) {
				
				net = data.months[i][col1] - data.months[i][col2];
				diff = (net / data.months[i][col2]) * 100.0;
				data.months[i].net = net.toFixed(0);
				data.months[i].diff = diff.toFixed(1);
			}
			return data;
		},

		getProjectedHeatEnergy = function ( hdd )
		{
			// returns kWh
			// return hdd * 0.4120 + 1.356; // HDD 65F base 
			return hdd * 0.2261 + 0.7565; // HDD 50F base
			// return hdd * 1.2714 + 25.279; // HDD 33F base
		},
		insertProjected = function ( data ) {
			// for total line
			var i, 
			projected = getProjectedHeatEnergy( data.totals.hdd );
			data.totals.projected = projected;
			
			// for each month
			for ( i = 0; i < data.months.length; i++ ) {
				
				projected = getProjectedHeatEnergy( data.months[i].hdd );
				data.months[i].projected = projected;
			}
			return data;
		},

		maxValueInArray = function ( arr, name, neg ) {
			
			var i, value, max = 0;

			for ( i = 0; i < arr.length; i++ ) {
				
				value = parseFloat( arr[i][name] );
				
				if (neg) {
					if (value < max) { max = value; }
				}
				else {
					if (value > max) { max = value; }
				}
			}
			return max;
		},
		insertPercent = function ( data, arr, name, neg ) {
			// percService.insertPercent( data, 'circuits', 'actual' );
			// search 'name' in 'arr' for bigest value
			var i, value, perc,
			max = maxValueInArray( data[arr], name, neg );
			// calc perc for each item in 'arr'
			for ( i = 0; i < data[arr].length; i++ ) {
				
				value = parseFloat( data[arr][i][name] );
				perc = (value / max) * 100.0;
				data[arr][i].perc = perc;
			}
			return data;
		},

		insertHeatEfficiency = function ( data ) {
			// calculate Wh/SF/HDD, convert kWh to Wh first.
			data.wh_sf_hdd = (parseFloat(data.totals.ashp_heating_season) * 1000 ) / parseFloat(data.iga) / parseFloat(data.totals.hdd_heating_season);
			// convert kWh to BTU
			data.btu_sf_hdd = (parseFloat(data.totals.ashp_heating_season) * 3412.14163) / parseFloat(data.iga) / parseFloat(data.totals.hdd_heating_season);
			
			return data;
		},

		insertEfficiency = function ( data ) {
			// for total line
			var i;
			data.totals.water_heater_efficiency = data.totals.water_heater * 1000 / data.totals.hot;
			data.totals.water_pump_efficiency =   data.totals.water_pump * 1000 / data.totals.main;
			
			// for each month
			for ( i = 0; i < data.months.length; i++ ) {
				data.months[i].water_heater_efficiency = data.months[i].water_heater * 1000 / data.months[i].hot;
				data.months[i].water_pump_efficiency =   data.months[i].water_pump * 1000 / data.months[i].main;
			}
			return data;
		},
		
		insertLinearRegression = function (data) {
			
			var i, xr = [], yr = [];
			
			for( i = 0; i < data.points.length; i++ ) { 
				// hdd, ashp - used for linear regression
				xr[i] = parseFloat(data.points[i].hdd);
				yr[i] = parseFloat(data.points[i].ashp);
			}
			
			data.lr = linearRegression(yr,xr);

			return data;
		},
		linearRegression = function (y,x) {
			
			var i, 
			lr = {},
			n = y.length,
			sum_x = 0,
			sum_y = 0,
			sum_xy = 0,
			sum_xx = 0,
			sum_yy = 0;
			
			for ( i = 0; i < y.length; i++ ) {     
				sum_x += x[i];
				sum_y += y[i];
				sum_xy += (x[i]*y[i]);
				sum_xx += (x[i]*x[i]);
				sum_yy += (y[i]*y[i]);
			} 
			
			lr.slope = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
			lr.intercept = (sum_y - lr.slope * sum_x)/n;
			lr.r2 = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
			lr.xr = x;

			return lr;
		},

		insertMeasure = function ( data, attrs ) {
			var i, j;
			for ( i = 0; i < attrs.length; i++ ) {
				for ( j = 0; j < data.days.length; j++ ) {
					data.days[j][ attrs[i][0] ].measure = attrs[i][1];
				}
			}
			return data;
		},
		
		insertColor = function ( data, colors ) {
			var name, j, max, min, range, value, perc, color, colorScale;
			
			data.views = {};
			
			for ( name in colors ) {
			
				max = maxValueInArray ( data.days, name );
				min = maxValueInArray ( data.days, name, true );
				range = max - min;
				colorScale = chroma.scale([ colors[ name ].start, colors[ name ].end ]);

				for ( j = 0; j < data.days.length; j++ ) {

					value = parseFloat( data.days[ j ][ name ] );
					perc = ((( value + range ) / range ) - (( min + range ) / range )); 
					color = colorScale( perc ).hex();
					// expand value into an object
					data.days[ j ][ name ] = {};
					data.days[ j ][ name ].value = value;
					data.days[ j ][ name ].perc = perc;
					data.days[ j ][ name ].color = color;
				}
				
				data.views[ name ] = { 
					maxValue : max, 
					minValue : min, 
					startColor : colors[ name ].start.hex(), 
					endColor : colors[ name ].end.hex() 
				};
			}
			return data;
		},
		
		sortChildObjectsByProp = function ( prop, arr ) {
			// used for heatmap legend
			// thanks to http://stackoverflow.com/questions/5073799/how-to-sort-a-javascript-array-of-objects-by-nested-object-property
			prop = prop.split ( '.' );
			
			var len = prop.length;

			arr.sort ( function ( a, b ) {
				
				var i = 0;
				
				while( i < len ) {
					
					a = a[ prop[ i ] ];
					
					b = b[ prop[ i ] ];
					
					i++;
				}
				if ( a < b ) {
					
					return -1;
				} 
				else if ( a > b ) {
					
					return 1;
				} 
				else {
					
					return 0;
				}
			});
			return arr;
		};
		
		return {
			insertADU : insertADU,
			insertADG : insertADG,
			insertDiff : insertDiff,
			insertProjected : insertProjected,
			insertPercent : insertPercent,
			insertHeatEfficiency : insertHeatEfficiency,
			insertEfficiency : insertEfficiency,
			insertLinearRegression : insertLinearRegression,
			insertMeasure : insertMeasure,
			insertColor : insertColor,
			sortChildObjectsByProp : sortChildObjectsByProp
		};
		
	}]);
	