'use strict';

/* Services */

/* global angular */
/* global moment */
/* global Highcharts */
/* jshint strict : true */
/* jshint undef : true */
/* jshint unused : true */
/* jshint globalstrict : true */

angular.module( 'myApp.services', [] ).
	factory( 'metadataService', [ function() {
		
		var data = {}, current = {};
		data.houseId = false;
		data.chartDate = false; // stored as string
		data.asofDate = false;
		data.years = false;
		data.circuit = 'summary'; // default view for usage screen

		return {
			data : data,					// 
			current : current,				// used by navCtrl to set state of nav options
			validate : validate,			// used by dataProvider
			setParamYear : setParamYear,	// called from navCtrl when user selects a year
			setMetaData : setMetaData,		// used by navCtrl, phase this out?
			getDaysYTD : getDaysYTD			// utility method
		};
	
		function validate ( routeParams ) {
			
			var options = { params : {} };
			options.view = routeParams.view;
			current.view = routeParams.path + '/' + routeParams.view;
			
			// 2 params used in all data calls
			options.params.house = setHouse( routeParams.house );
			options.params.date = setDate( routeParams.date );
			
			// view dependent params
			if ( options.view == 'usage' ) { 
			
				options.params.circuit = setCircuit( routeParams.circuit ); 
			}
			if ( options.view == 'basetemp' ) { 
			
				options.params.period = setPeriod( routeParams.period ); 
			
				options.params.base = setBase( routeParams.base ); 
			}
			return options;
		}
		function setHouse ( house ) {
			
			if ( house && ( typeof house != 'undefined' ) ) { 
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
		}
		function setDate ( dt ) {
			
			if (dt && ( typeof dt != 'undefined' )) { 
			
				data.chartDate = moment( dt ).format( 'YYYY-MM-DD' );
			
				current.year = moment( data.chartDate ).format( 'YYYY' ); 
			} 
			return data.chartDate;
		}
		function setCircuit ( circuit ) {
			
			if ( circuit !== undefined ) {
			
				data.circuit = circuit;
			}
			return data.circuit;
		}
		function setPeriod ( period ) {
			// do more validation here in future
			// and maybe store value if return
			if ( period == 'undefined' ) {
			
				period = 'months';
			}
			return period;
		}
		function setBase ( base ) {
			// do more validation here in future
			// and maybe store value if return
			if ( base == 'undefined' ) {
			
				base = 65;
			}
			return base;		
		}
		
		// 2 methods used by navCtrl
		function setParamYear( yr ) {
			
			data.chartDate = moment( data.chartDate ).year( parseInt(yr) ).format('YYYY-MM-DD');  // update date
			
			current.year = yr;
		}
		function setMetaData( d ) {
			// gets called after validate
			data.asofDate = moment(d.asof).format('YYYY-MM-DD');
			
			data.years = d.years; 
			
			data.houseName = d.house;
			
			if ( !data.chartDate ) {
			
				data.chartDate = data.asofDate;
			
				current.year = moment( data.chartDate ).format('YYYY'); // set default year selector
			} 
		}
		// need days year to date to calculate avarage per day values
		// if chart year > asof year then return false (can't show data that does not exist)
		// if chart year (2013) == asof year (2013) then use asof date (else assume it is a prior year)
		// else if leap year use chart year and divide by 366 
		// else use chart year and divide by 365
		function getDaysYTD () {
			
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
		}

	}])
	.factory( 'dataProvider', [ '$http', 'metadataService', function ( $http, metadataService ) {
		return {
			getData : function( routeParams ) {
				
				var params = metadataService.validate ( routeParams );
				// if no metadata, then get it first
				if ( metadataService.data.asofDate ) {
				
					return getDetails( params );
				}
				else {
				
					return getMetadata ( params );
				}
			}
		};
		function getDetails ( params ) {
			
			return $http.get( 'data/get_' + params.view + '.php', params ).then( function ( result ) {
			
				return result.data; 
			});
		}
		function getMetadata ( params ) {
			
			return $http.get( 'data/get_monthly_metadata.php', params ).then( function ( result ) {
			
				metadataService.setMetaData ( result.data );
			
				params.params.date = metadataService.data.chartDate; 
			
				return; 
			
			}).then( function () {
			
				return getDetails ( params );
			});
		}
	}])
	.factory('chartService', [ '$window', function ( $window ) {
		
		var charts = [];
		

		
		function setData( view, data ) {
			
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
			}			
		}
		
		var chartTemplate = {
			
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
			},
			//series : []
		};
		
		Highcharts.setOptions({
			colors: ['#336699', '#669933', '#CC9933', '#CC3333', '#663366', '#999999', '#336699', '#669966']
		});
		
		function showUsageVsGen ( data ) {	
			
			var options = angular.copy ( chartTemplate ); 
			options.title.text = 'Usage vs. Generation';
			options.legend.enabled = false;
			options.plotOptions.column.dataLabels.enabled = true;
			options.series = [ { type: 'column', data : [] } ];
			var colors = { 'Used' : '#336699', 'Solar' : '#669933', 'danger' : '#DF0101' };
			options.xAxis.categories = [ 'Used', 'Solar' ];
		
			for ( var cat in options.xAxis.categories ) {
				
				options.series[0].data.push({
					y : Math.round( Math.abs ( data.totals[ options.xAxis.categories[cat].toLowerCase() ] ) ), 
					color : ( ( Math.abs ( data.totals.used ) > Math.abs ( data.totals.solar ) ) ) ? colors.danger : colors[options.xAxis.categories[cat]]
				}); // if usage is > solar then danger, danger! (change color of usage to red)
			}
			
			return new Highcharts.Chart ( options );
		} 

		function showSummaryYTD ( data ) {
			
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
		}

		function showGenerationYTD ( data ) {
			
			var options = angular.copy ( chartTemplate ); 
			options.series = [ 
				{ name : 'Actual', type: 'column', data : [] }, 
				{ name : 'Estimated', type: 'column', data : [] }, 
				{ name : 'Net', type: 'column', data : [] }
			];

			return new Highcharts.Chart ( putSeriesData( options, data ) );	
		}

		function showUsageCircuits ( data ) {

			var options = angular.copy ( chartTemplate ); 
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

			for (var i = 1; i < data.circuits.length; i++)
			{
				options.series[0].data.push( { name : data.circuits[i].title, y : parseFloat( data.circuits[i].actual ) } );
			}

			return new Highcharts.Chart (options);
		} 

		function showUsageYTD ( data ) {
			
			var options =angular.copy ( chartTemplate ); 
			options.title.text = data.circuit.title;
			options.series = [ 
				{ name : 'Actual', type: 'column', data : [] }, 
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
		}

		function showHddYTD ( data ) {

			var options = angular.copy ( chartTemplate ); 
			options.yAxis[0].title.text = 'HDD';
			options.series = [ 
				{ name : 'Actual', type: 'column', data : [] }, 
				{ name : 'Estimated', type: 'column', data : [] }, 
				{ name : 'Net', type: 'column', data : [] }
			];

			return new Highcharts.Chart ( putSeriesData( options, data ) );
		}
		
		function showWaterYTD ( data ) {

			var options = angular.copy ( chartTemplate ); 
			options.title.text = 'Monthly Breakdown';
			options.yAxis.push( angular.copy( options.yAxis[0] ) );
			options.yAxis[0].title.text = 'Gallons';
			options.yAxis[0].labels = { format : '{value:,.0f}' };
			options.yAxis[0].max = 3000;
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
		}
		
		function showWaterMainYTD ( data ) {

			var options = angular.copy ( chartTemplate ); 
			options.chart.renderTo = 'view2';
			options.title.text = 'Monthly Total Usage';
			options.yAxis[0].title.text = 'Gallons';
			options.yAxis[0].labels = { format : '{value:,.0f}' };
			options.yAxis[0].max = 3000;
			options.series = [ 
				{ name : 'Main', type: 'area', data : [] }
			];

			return new Highcharts.Chart ( putSeriesData( options, data ) );
		}

		function showBaseTemp( data ) {

			var options = angular.copy ( chartTemplate ); 
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
									var dt = moment( this.date );
									var tm = (data.period == 'hours') ? '&time=' + dt.format('HH') : ''; 
									$window.location = 'daily.html?option=8&date=' + dt.format('YYYY-MM-DD') + tm;
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
					},
				},
			};
			options.series = [ 
				{ name : 'Data point', type : 'scatter', color : 'rgba(223, 83, 83, .5)', data : [] },
				{ name : 'Regression Line', type : 'line', color : '#336699', data : [] }
			];
			
			for( var i = 0; i < data.points.length; i++ ) {
				 
				var d = moment( data.points[i].date ), dt;
				if ( data.period == 'hours' ) dt = d.format( 'MMM d, YYYY h a' );
				if ( data.period == 'days' ) dt = d.format( 'MMM d, YYYY' );
				if ( data.period == 'months' ) dt = d.format( 'MMM, YYYY' );
				
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
		}

		function putSeriesData ( options, data ) {
			
			for ( var i = 0; i < data.months.length ; i++ ) {

				options.xAxis.categories.push( moment( data.months[ i ].date ).format( 'MMM' ) );

				for ( var j = 0; j < options.series.length; j++ ) {
					options.series[ j ].data.push( Math.round( data.months[ i ][ options.series[ j ].name.toLowerCase() ] ) );	
				}
			}
			return options;
		}
		
		return {
			setData : setData
		};

	}])
	.factory('dataService', [ 'metadataService', function(metadataService) {
		
		return {
			insertADU : insertADU,
			insertADG : insertADG,
			insertDiff : insertDiff,
			insertProjected : insertProjected,
			insertPercent : insertPercent,
			insertHeatEfficiency : insertHeatEfficiency,
			insertEfficiency : insertEfficiency,
			insertLinearRegression : insertLinearRegression
		};

		function insertADU (data, props, avg_props) {
			
			var adu, daysInMonth, daysInYear = metadataService.getDaysYTD();
			
			for ( var i = 0; i < props.length; i++ ) { 
			
				adu = data.totals[ props[i] ] / daysInYear;
				data.totals[ avg_props[i] ] = adu;
			}

			for (var j = 0; j < data.months.length; j++) {
			
				for (i = 0; i < props.length; i++ ) {
			
					daysInMonth = moment( data.months[j].date ).daysInMonth(); 
					adu = data.months[j][ props[i] ] / daysInMonth;
					data.months[j][ avg_props[i] ] = adu;
				}
			}
			return data;
		}

		function insertADG (data) {
			// gen per day
			var daysInYear = metadataService.getDaysYTD(); 
			var adg = data.totals.actual / daysInYear; 
			data.avg_daily_gen = adg.toFixed(1);

			return data;
		}

		function insertDiff ( data, col1, col2 ) {				
			// diff for total line
			var net = data.totals[col1] - data.totals[col2];
			var diff = (net / data.totals[col2]) * 100.0;
			data.totals.net = net.toFixed(0);
			data.totals.diff = diff.toFixed(1);
			
			// diff for each month
			for (var i = 0; i < data.months.length; i++) {
				
				net = data.months[i][col1] - data.months[i][col2];
				diff = (net / data.months[i][col2]) * 100.0;
				data.months[i].net = net.toFixed(0);
				data.months[i].diff = diff.toFixed(1);
			}
			return data;
		}

		function insertProjected ( data ) {
			// for total line
			var projected = getProjectedHeatEnergy( data.totals.hdd );
			data.totals.projected = projected;
			
			// for each month
			for (var i = 0; i < data.months.length; i++) {
				
				projected = getProjectedHeatEnergy( data.months[i].hdd );
				data.months[i].projected = projected;
			}
			return data;
		}
		function getProjectedHeatEnergy( hdd )
		{
			// returns kWh
			// return hdd * 0.4120 + 1.356; // HDD 65F base 
			return hdd * 0.2261 + 0.7565; // HDD 50F base
			// return hdd * 1.2714 + 25.279; // HDD 33F base
		}

		function insertPercent ( data, arr, name, neg ) {
			// percService.insertPercent( data, 'circuits', 'actual' );
			// search 'name' in 'arr' for bigest value
			var value, perc, max = 0;
			
			for (var i = 0; i < data[arr].length; i++) {
				
				value = parseFloat( data[arr][i][name] );
				
				if (neg) {
					if (value < max) max = value;
				}
				else {
					if (value > max) max = value;
				}
			}		
			// calc perc for each item in 'arr'
			for (i = 0; i < data[arr].length; i++) {
				
				value = parseFloat( data[arr][i][name] );
				perc = (value / max) * 100.0;
				data[arr][i].perc = perc;
			}
			return data;
		}

		function insertHeatEfficiency ( data ) {
			// calculate Wh/SF/HDD, convert kWh to Wh first.
			data.wh_sf_hdd = (parseFloat(data.totals.ashp_heating_season) * 1000 ) / parseFloat(data.iga) / parseFloat(data.totals.hdd_heating_season);
			// convert kWh to BTU
			data.btu_sf_hdd = (parseFloat(data.totals.ashp_heating_season) * 3412.14163) / parseFloat(data.iga) / parseFloat(data.totals.hdd_heating_season);
			
			return data;
		}

		function insertEfficiency ( data ) {
			// for total line
			data.totals.water_heater_efficiency = data.totals.water_heater * 1000 / data.totals.hot;
			data.totals.water_pump_efficiency =   data.totals.water_pump * 1000 / data.totals.main;
			
			// for each month
			for (var i = 0; i < data.months.length; i++) {
				data.months[i].water_heater_efficiency = data.months[i].water_heater * 1000 / data.months[i].hot;
				data.months[i].water_pump_efficiency =   data.months[i].water_pump * 1000 / data.months[i].main;
			}
			return data;
		}
		
		function insertLinearRegression (data) {
			
			var i, xr = [], yr = [];
			
			for(i = 0; i < data.points.length; i++) { 
				// hdd, ashp - used for linear regression
				xr[i] = parseFloat(data.points[i].hdd);
				yr[i] = parseFloat(data.points[i].ashp);
			}
			
			data.lr = linearRegression(yr,xr);
			
			return data;
		}
		function linearRegression (y,x) {
			
			var lr = {};
			var n = y.length;
			var sum_x = 0;
			var sum_y = 0;
			var sum_xy = 0;
			var sum_xx = 0;
			var sum_yy = 0;
			
			for (var i = 0; i < y.length; i++) 
			{     
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
		}
		
	}]);
	