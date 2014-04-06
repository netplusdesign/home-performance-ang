'use strict';

/* jasmine specs for directives go here */

describe('directives', function() {
	
	beforeEach(module('myApp.directives'));

	describe('netCalendar', function() {
		// decided most tests can be run as e2e tests
		xdescribe('x', function() {
			
			it('x should do something', function() {
				// sample seed directive test
				module(function($provide) {
					$provide.value('version', 'TEST_VER');
				});
				
				inject(function($compile, $rootScope) {
					var element = $compile('<span app-version></span>')($rootScope);
					expect(element.text()).toEqual('TEST_VER');
				});
				
			});
		});
		
	});
	
});
