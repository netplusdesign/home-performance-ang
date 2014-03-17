'use strict';


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
				return 'partials/' + params.view + '.html'; 
			}, 
			controller: 'MonthlyCtrl'
		}).
		when ( '/monthly/:view/:circuit', { 
			templateUrl: function ( params ) { 
				return 'partials/' + params.view + '.html'; 
			}, 
			controller: 'MonthlyCtrl'
		}).
		otherwise( { redirectTo: '/monthly/summary' } );
}]);
