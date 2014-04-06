'use strict';

/* global angular */
/* jshint strict : true */
/* jshint undef : true */
/* jshint unused : true */
/* jshint globalstrict : true */

// Declare app level module which depends on filters, and services
angular.module('myApp', [
	'ngRoute',
	'myApp.filters',
	'myApp.services',
	'myApp.directives',
	'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
	$routeProvider.
		when ( '/monthly/:view', { 
			templateUrl: function ( params ) { 
				return 'partials/monthly/' + params.view + '.html'; 
			}, 
			controller: 'MonthlyCtrl'
		}).
		when ( '/monthly/:view/:circuit', { 
			templateUrl: function ( params ) { 
				return 'partials/monthly/' + params.view + '.html'; 
			}, 
			controller: 'MonthlyCtrl'
		}).
		when ( '/daily/:view', { 
			templateUrl: function () { 
				return 'partials/daily.html'; 
			}, 
			controller: 'DailyCtrl'
		}).
		when ( '/daily/:view/:circuit', { 
			templateUrl: function () { 
				return 'partials/daily.html'; 
			}, 
			controller: 'DailyCtrl'
		}).
		otherwise( { redirectTo: '/monthly/summary' } );
}]);