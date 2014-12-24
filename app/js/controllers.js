'use strict';

/* Controllers */

/* global angular */
/* global moment */
/* global chroma */
/* jshint strict : true */
/* jshint undef : true */
/* jshint unused : true */
/* jshint globalstrict : true */

var myApp = angular.module('myApp.controllers', []).

	controller( 'YearlyCtrl', [
		'$scope', 
		'$routeParams', 
		'dataProvider', 
		'dataService',
		'chartService', 
		function (
			$scope, 
			$routeParams,
			dataProvider, 
			dataService,
			chartService
		) {
		
		var showSummary = function ( data ) {
			
			if ( typeof data.years === 'undefined' ) { 

				$scope.warning = true;
			}
			else {

				$scope.data = dataService.insertADU (data, ['used'], ['adu']);
			}
		};

		$scope.warning = false;

		$routeParams.path = 'yearly';
		
		$scope.update = function () {
			
			dataProvider.getYearlyData( $routeParams ).then( function( data ) {

				showSummary ( data );
				
				// show warnings if no data returned
				if ( $scope.warning ) {
					
					$scope.message = "Oops, you've asked for a house or year that I can't find.";				
				}
				else {
					// send data to chartService
					chartService.setData ( $routeParams.view, data );
				}
			}, function ( reason ) {
				
				$scope.warning = true;
				
				$scope.message = reason;
			});

		}; $scope.update();
		
	}]).

	controller( 'MonthlyCtrl', [
		'$scope', 
		'$routeParams', 
		'dataProvider', 
		'metadataService',
		'dataService',
		'chartService', 
		function (
			$scope, 
			$routeParams,
			dataProvider, 
			metadataService,
			dataService,
			chartService
		) {
		
		var showSummary = function ( data ) {
			
			if ( typeof data.months === 'undefined' ) { 

				$scope.warning = true;
			}
			else {

				$scope.data = dataService.insertADU (data, ['used'], ['adu']);
			}
		},
		
		showGeneration = function ( data ) {

			if ( typeof data.months === 'undefined' ) { 
				
				$scope.warning = true;
			}
			else {
				
				data.max_solar_hour.date = moment( data.max_solar_hour.date ).toDate();
				
				$scope.data = dataService.insertADG(data);
				
				$scope.data = dataService.insertDiff(data, 'actual', 'estimated');
			}			
		},
		
		showUsage = function ( data ) {

			switch ( data.circuit.name ) {
				
				case 'summary' :
				 
					if ( data.circuits[0].actual === null ) { 
						
						$scope.warning = true;
					}
					else {
						
						$scope.data = dataService.insertPercent ( data, 'circuits', 'actual' );
					}
					
					break;
					
				case 'all' :
				
					if ( typeof data.months === 'undefined' ) { 
						
						$scope.warning = true;
					}
					else {
						
						$scope.data = dataService.insertDiff ( data, 'budget', 'actual' );
						
						$routeParams.view = 'circuit';
					}

					break;
					
				case 'ashp' :
				
					if ( typeof data.months === 'undefined' ) { 
						
						$scope.warning = true;
					}
					else {
						
						$scope.data = dataService.insertProjected ( data );
					
						$scope.data = dataService.insertDiff ( data, 'projected', 'actual' );
						
						$routeParams.view = 'circuit';
					}
					
					break;

				default : 
				
					if ( typeof data.months === 'undefined' ) { 
						
						$scope.warning = true;
					}
					else {

						$scope.data = data;
						
						$routeParams.view = 'circuit';
					}										
			}

		},
		
		showHdd = function ( data ) {
			// fix max_solar_hour time by parsing text into a date
			if ( typeof data.months === 'undefined' ) { 
				
				$scope.warning = true;
			}
			else {
		
				data.coldest_hour.date = moment ( data.coldest_hour.date ).toDate();
			
				$scope.data = dataService.insertHeatEfficiency ( data );
			
				$scope.data = dataService.insertDiff ( data, 'actual', 'estimated' );
			}
		},
		
		showWater = function ( data ) {
			
			if ( typeof data.months === 'undefined' ) { 
				
				$scope.warning = true;
			}
			else {
				
				$scope.data = dataService.insertEfficiency ( data );
			
				$scope.data = dataService.insertADU (data, ['cold', 'hot', 'main'], ['cold_avg', 'hot_avg', 'main_avg']);
			}
		},
		
		showBasetemp = function ( data ) {
			
			if ( typeof data.points === 'undefined' ) { 
			
				$scope.warning = true;
			}
			else {
				
				$scope.data = dataService.insertLinearRegression ( data );
			}	
		},

		setOptionsIfBasetemp = function ( params ) {
		
			var options = {};
		
			if ( params.view == 'basetemp' ) {
					
				if ( params.period !== undefined ) {
					
					options.period = params.period;
				}
				else { 
	
					options.period = 'months';
				}
				if ( params.base !== undefined ) {
					
					options.base = params.base;
				}
				else { 
	
					options.base = 65;
				}
			}			
			return options;
		},

		setRouteParamsIfBasetemp = function ( params ) {

			if ( params.view == 'basetemp' ) {

				$routeParams.period = $scope.options.period;
			
				$routeParams.base = $scope.options.base;
			}
			
			return $routeParams;
		};

		$scope.warning = false;

		$routeParams.path = 'monthly';
		
		$scope.options = setOptionsIfBasetemp ( $routeParams );

		$scope.update = function () {
			
			$routeParams = setRouteParamsIfBasetemp ( $routeParams );

			dataProvider.getMonthlyData( $routeParams ).then( function( data ) {

				switch ( $routeParams.view ) {
					
					case 'summary' : showSummary ( data ); break;
					
					case 'generation' : showGeneration ( data ); break;
					
					case 'usage' : showUsage ( data ); break;
					
					case 'hdd' : showHdd ( data ); break;
					
					case 'water' : showWater ( data ); break;
					
					case 'basetemp' : showBasetemp ( data );
				}
				// show warnings if no data returned
				if ( $scope.warning ) {
					
					$scope.message = "Oops, you've asked for a house or year that I can't find.";				
				}
				else {
					// this is the only place metadataService is used in this controller, can get this from data?
					$scope.year = metadataService.current.year;	
					$scope.house = metadataService.data.houseId;
					$scope.date = metadataService.data.chartDate; // used for usage screens only
					// send data to chartService
					chartService.setData ( $routeParams.view, data );
				}
			}, function ( reason ) {
				
				$scope.warning = true;
				
				$scope.message = reason;
			});

		}; $scope.update();
		
	}]).

	controller( 'DailyCtrl', [
		'$scope',
		'$route',
		'$routeParams', 
		'$location',
		'dataProvider', 
		'metadataService',
		'dataService',
		'chartService', 
		function (
			$scope,
			$route, 
			$routeParams,
			$location,
			dataProvider, 
			metadataService,
			dataService,
			chartService
		) {

		var lastRoute = $route.current,
		lastDate = moment( $routeParams.date, 'YYYY-MM-DD' ),
		
		// where should this code live? Controller doesn't seem like the right place
		blueGreen = { start : chroma ( '#669933' ), end : chroma ( '#336699' ) }, // green 73, 142, 0  -- blue 0, 20, 126
		red = { start : chroma ( 252, 235, 235 ), end : chroma ( 149, 0, 0 ) },
		green = { start : chroma ( 73, 142, 0 ), end : chroma ( 232, 255, 209 ) },
		blue = { start : chroma ( 242, 244, 255 ), end : chroma ( 0, 20, 126 ) },

		colors = {
			'netusage' : blueGreen,
			'generation' : green,
			'usage' : blue,
			'templow' : blue,
			'temphigh' : red,
			'hdd' : blue,
			'water_heater' : blue,
			'ashp' : blue,
			'water_pump' : blue,
			'dryer' : blue,
			'washer' : blue,
			'dishwasher' : blue,
			'range' : blue,
			'all_other' : blue 
		},
		
		getLocationParams = function ( location ) {
			
			var path = location.path().split('/'),
			
			route = {
				path : path[1],
				view : path[2],
				date : location.search().date,
				house : location.search().house
			};

			if ( path.length > 3 ) {
				
				route.circuit = path[3];
			}
			return route;
		};

		$scope.warning = false;

		$routeParams.path = 'daily';

		$scope.view = $routeParams.circuit || $routeParams.view;

		$scope.updateMonth = function ( params ) { // get data for selected month

			dataProvider.getDailyData ( params ).then ( function ( data ) {
				// check to make sure data came back first, then do these things

				if ( typeof data.days === 'undefined' ) {  
	
					$scope.warning = true;
				}
				else {
					
					$scope.chartDate = metadataService.data.chartDate;

					data.range = metadataService.limits.range;
					
					$scope.data = dataService.insertColor ( data, colors );
					
					// insert measure, this should come from the db...?
					$scope.data = dataService.insertMeasure ( data, [
						[ 'netusage', 'kWh' ], 
						[ 'generation', 'kWh' ], 
						[ 'usage', 'kWh' ], 
						[ 'templow', '&deg;F' ], 
						[ 'temphigh', '&deg;F' ], 
						[ 'hdd', 'HDD' ],
						[ 'water_heater', 'kWh' ],
						[ 'ashp', 'kWh' ],
						[ 'water_pump', 'kWh' ],
						[ 'dryer', 'kWh' ],
						[ 'washer', 'kWh' ],
						[ 'dishwasher', 'kWh' ],
						[ 'range', 'kWh' ],
						[ 'all_other', 'kWh' ]					
					]);
				}		
				// show warnings if no data returned
				if ( $scope.warning ) {
										
					$scope.message = "Oops, you've asked for a house or year that I can't find.";				
				}
				else {
					
					$scope.updateChartDate( params ); // get chart data
					
					$scope.year = metadataService.current.year;
				}
			}, function ( reason ) {

				$scope.warning = true;

				$scope.message = reason;
			});

		}; $scope.updateMonth ( $routeParams ); // do once onload
		
		$scope.updateChartDate = function ( params ) { // get hourly data for selected date
			
			dataProvider.getHourlyData ( params ).then ( function ( data ) {
				// transform data if needed
				if ( typeof data.hours === 'undefined' ) {
					
					$scope.warning = true;
				}
				else if ( typeof params.time !== 'undefined' ) {
					
					data.time = params.time;
				}

				// show warnings if no data returned
				if ( $scope.warning ) {
					
					$scope.message = "Oops, you've asked for a house or year that I can't find.";				
				}
				else {

					chartService.setData ( 'daily', data );
				}
			}, function ( reason ) {

				$scope.warning = true;

				$scope.message = reason;
			});			
		};
		
		$scope.changeMonth = function ( date ) {
			// update URL
			$location.search ( 'date', date );

			//var params = getLocationParams ( $location );
		};
		
		$scope.selectChartDate = function ( date ) {
			// update URL
			$location.search ( 'date', date );
			
			//var params = getLocationParams ( $location );
		};

		$scope.$on ( '$locationChangeSuccess', function ( ) { // event
			// "/path/view/circuit"
			$scope.warning = false;
			var params = getLocationParams( $location ),
			newDate = moment( params.date, 'YYYY-MM-DD' ),
			// if nav to another daily view and year has not changed, then just update $scope.view			
			yearHasChanged = newDate.year() != lastDate.year();
			
			if (( $route.current.$$route.controller === 'DailyCtrl' ) && !yearHasChanged ) { 

				$route.current = lastRoute;

				if ( typeof params.circuit !== 'undefined' ) {
					// circuit
					$scope.view = params.circuit;
				}
				else {
					
					$scope.view = params.view;
				}
				metadataService.current.view = $location.path().substr(1);
				$scope.chartDate = params.date;
				
				// if month has not changed, and chartDate has changed, then call $scope.updateChartDate
				if (( lastDate.month() == newDate.month() ) && 
					( lastDate.date()  != newDate.date() )) {
					$scope.updateChartDate ( params );
				}
				// if year has not changed (eg got this far), and month has changed, then call $scope.updateMonth
				if ( lastDate.month() != newDate.month() ) {
					$scope.updateMonth ( params );
				}
				
			}
			lastDate = newDate.clone();
		});

	}]).

	controller('NavigationCtrl', ['$scope', '$window', 'metadataService', function ( $scope, $window, metadataService ) {
		
		$scope.data = metadataService.data;
		
		$scope.yearFilter = metadataService.current; 

		$scope.viewSelection = metadataService.current;
		
		$scope.changeYear = function() {
			
			metadataService.setParamYear($scope.yearFilter.year);
			
			$scope.changeView();
		};
		
		$scope.changeView = function() {
			
			var location = '#/' + $scope.viewSelection.view;
			
			if ( $scope.viewSelection.view == 'monthly/usage' ) {
				// need to take into account usage screen with drilldown
				location = location + '/' + metadataService.data.circuit;
			}
			location = location + '?house=' + metadataService.data.houseId + '&date=' + metadataService.data.chartDate;
			
			$window.location = location;
		};

	}]);