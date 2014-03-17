'use strict';

/* Controllers */

/* global angular */
/* global moment */
/* jshint strict : true */
/* jshint undef : true */
/* jshint unused : true */
/* jshint globalstrict : true */

var myApp = angular.module('myApp.controllers', [])

	.controller('MonthlyCtrl', [
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

		var error = false;

		$routeParams.path = 'monthly';
		
		$scope.options = setOptionsIfBasetemp ( $routeParams.view );

		$scope.update = function () {
			
			$routeParams = setRouteParamsIfBasetemp ( $routeParams );

			dataProvider.getData( $routeParams ).then(function( data ) {
	
				switch ( $routeParams.view ) {
					
					case 'summary' : showSummary ( data ); break;
					
					case 'generation' : showGeneration ( data ); break;
					
					case 'usage' : showUsage ( data ); break;
					
					case 'hdd' : showHdd ( data ); break;
					
					case 'water' : showWater ( data ); break;
					
					case 'basetemp' : showBasetemp ( data );
				}
				
				$scope.year = metadataService.current.year;
				
				if (( $routeParams.view == 'usage' ) && (data.circuit.name != 'summary')) { 
					
					$routeParams.view = 'circuit';		
				}
				// send data to chartService
				chartService.setData ( $routeParams.view, data );
				
				// show warnings if no data returned
				if (error)
				{
					$scope.warning = true;
					$scope.message = "I'm sorry, you've asked for a house or year that I can't find.";				
				}
			}, function(reason) {
				$scope.warning = true;
				$scope.message = reason;
			});

		};
		$scope.update();
		
		function showSummary ( data ) {
			
			$scope.data = dataService.insertADU (data, ['used'], ['adu']);
			
			if ( data.months.length === 0 ) error = true;
		}
		
		function showGeneration ( data ) {
			
			data.max_solar_hour.date = moment( data.max_solar_hour.date ).toDate();
			
			$scope.data = dataService.insertADG(data);
			
			$scope.data = dataService.insertDiff(data, 'actual', 'estimated');
			
			if ( data.months.length === 0 ) error = true;
		}
		
		function showUsage ( data ) {

			switch ( data.circuit.name ) {
				
				case 'summary' :
				 
					$scope.data = dataService.insertPercent ( data, 'circuits', 'actual' );
				
					if ( data.circuits[0].actual === null ) error = true;
					
					break;
					
				case 'all' :
				
					$scope.data = dataService.insertDiff ( data, 'budget', 'actual' );
					
					if ( data.months.length === 0 ) error = true;

					break;
					
				case 'ashp' :
				
					$scope.data = dataService.insertProjected ( data );
					
					$scope.data = dataService.insertDiff ( data, 'projected', 'actual' );
					
					if ( data.months.length === 0 ) error = true;
					
					break;

				default : 
				
					$scope.data = data;
					
					if ( data.months.length === 0 ) error = true;										
			}

		}
		
		function showHdd ( data ) {
			// fix max_solar_hour time by parsing text into a date
			data.coldest_hour.date = moment ( data.coldest_hour.date ).toDate();
			
			$scope.data = dataService.insertHeatEfficiency ( data );
			
			$scope.data = dataService.insertDiff ( data, 'actual', 'estimated' );
			
			if ( data.months.length === 0 ) error = true;
		}
		
		function showWater ( data ) {
			
			$scope.data = dataService.insertEfficiency ( data );
			
			$scope.data = dataService.insertADU (data, ['cold', 'hot', 'main'], ['cold_avg', 'hot_avg', 'main_avg']);
			
			if ( data.months.length === 0 ) error = true;
		}
		
		function showBasetemp ( data ) {
			
			$scope.data = dataService.insertLinearRegression ( data );
			
			if (data.points.length === 0) error = true;
		}
		
		function setOptionsIfBasetemp ( view ) {
		
			var options = {};
		
			if ( view == 'basetemp' ) {
		
				options = { period : 'months', base : 65 };
			}
			
			return options;
		}
		
		function setRouteParamsIfBasetemp ( params ) {

			if ( params.view == 'basetemp' ) {

				$routeParams.period = $scope.options.period;
			
				$routeParams.base = $scope.options.base;
			}
			
			return $routeParams;
		}

		
	}])

	.controller('NavigationCtrl', ['$scope', '$window', 'metadataService', function ($scope, $window, metadataService) {

		$scope.data = metadataService.data;
		
		$scope.yearFilter = metadataService.current; 

		$scope.viewSelection = metadataService.current;
		
		$scope.changeYear = function() {
			metadataService.setParamYear($scope.yearFilter.year);
			$scope.changeView();
		};
		
		$scope.changeView = function() {
			// need to take into account usage screen with drilldown
			if ($scope.viewSelection.view == 'usage') {
				$window.location = "#/" + $scope.viewSelection.view + '/' + metadataService.data.circuit + '?date=' + metadataService.data.chartDate;
			}
			else {
				$window.location = "#/" + $scope.viewSelection.view + '?date=' + metadataService.data.chartDate;
			}
			
		};

	}]);