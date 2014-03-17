'use strict';

/* jasmine specs for controllers go here */

describe('Controllers', function(){

	var scope, ctrl, $httpBackend,
	mockService = {
		data : { houseId : 0,
				 chartDate : '2013-11-01',
				 asofDate : '2013-12-31' },
		current : { year : '2013', 
				    view : 'summary' },
		getDaysYTD : function () {
			return 365;
		},
		validate : function() {}
	};

	/**
	 * @author pablojim 
	 */
	var jasmineNG = {};
	//set $q in your test
	jasmineNG.$q = null;
	//Could make similar to test a failing promise
	jasmineNG.createPromiseReturningSpy = function(retval) {
		return jasmine.createSpy().andCallFake(function() {
			var res = jasmineNG.$q.defer();
			res.resolve(retval);
			return res.promise;
		});
	};
	
	beforeEach(module('myApp.controllers'));

	describe('View Ctrls', function() {

		var mockDataProvider, mockChartService, q, deferred,
		routeParams = {
			house : '0',
			date : '2013-12-30',
			view : 'summary',
			path : 'monthly'
		};

		describe('MonthlyCtrl happy path', function(){
			
			var mockADU = {"totals":{"used":"7206.154","solar":"-8574.577","net":"-1368.423","hdd":"6810.250","adu":"19.7"},"months":[{"date":"2013-01-01","used":"880.949","solar":"-478.374","net":"402.575","hdd":"1188.596","adu":"28.4"},{"date":"2013-02-01","used":"811.571","solar":"-449.081","net":"362.490","hdd":"1066.626","adu":"29.0"},{"date":"2013-03-01","used":"806.205","solar":"-618.374","net":"187.831","hdd":"982.966","adu":"26.0"},{"date":"2013-04-01","used":"527.707","solar":"-919.527","net":"-391.820","hdd":"571.167","adu":"17.6"},{"date":"2013-05-01","used":"529.269","solar":"-903.916","net":"-374.647","hdd":"232.213","adu":"17.1"},{"date":"2013-06-01","used":"411.362","solar":"-802.487","net":"-391.125","hdd":"103.059","adu":"13.7"},{"date":"2013-07-01","used":"383.589","solar":"-929.168","net":"-545.579","hdd":"18.478","adu":"12.4"},{"date":"2013-08-01","used":"446.655","solar":"-960.804","net":"-514.149","hdd":"58.028","adu":"14.4"},{"date":"2013-09-01","used":"452.088","solar":"-936.330","net":"-484.242","hdd":"218.072","adu":"15.1"},{"date":"2013-10-01","used":"482.340","solar":"-674.075","net":"-191.735","hdd":"404.790","adu":"15.6"},{"date":"2013-11-01","used":"558.689","solar":"-639.284","net":"-80.595","hdd":"837.642","adu":"18.6"},{"date":"2013-12-01","used":"915.730","solar":"-263.157","net":"652.573","hdd":"1128.613","adu":"29.5"}]};
			
			var mockDataService = { insertADU : function () { return mockADU; },
				insertADG : function () { },
				insertDiff : function () { },
				insertPercent : function () { },
				insertHeatEfficiency : function () { },
				insertEfficiency : function () { },
				insertlr : function () { },
			},
			mockChartService = { setData : function () { } };
			
			beforeEach(module(function ($provide) {	
				mockDataProvider = { getData: jasmineNG.createPromiseReturningSpy(JSON.parse( JSON.stringify(mockADU)) ) }; 
				$provide.value('dataProvider', mockDataProvider);
			}));
			
			beforeEach(inject(function($rootScope, $controller, $q) {
				jasmineNG.$q = $q;
				scope = $rootScope.$new();
				ctrl = $controller('MonthlyCtrl', {
					$scope : scope,
					$routeParams : routeParams,
					//dataProvider : mockDataProvider,
					metadataService : mockService,
					dataService : mockDataService,
					chartService : mockChartService
				});
		    }));
	
			describe('dataProvider', function(){
			    
				it('should be called', function() {
					expect(scope.data).not.toBeDefined();
					expect(mockDataProvider.getData).toHaveBeenCalled();
					expect(mockDataProvider.getData).toHaveBeenCalledWith( routeParams );
			    });	
				it('should return expected data', function() {
					//Call apply to propogate changes
					scope.$apply();
					expect(scope.data).toEqual(mockADU);
					expect(scope.data.totals.adu).toEqual("19.7");
			    });	
	
			});
			
		});	
		
		describe('SummaryCtrl NOT so happy path', function(){
			
			var mockData = {"totals":{"used":null,"solar":null,"net":null,"hdd":null},"months":[]};
	
			var mockDataService = { 
				insertADU : function () { return mockData; },
				insertADG : function () { },
				insertDiff : function () { },
				insertPercent : function () { },
				insertHeatEfficiency : function () { },
				insertEfficiency : function () { },
				insertlr : function () { },
			},
			mockChartService = { setData : function () { } };
			
			beforeEach(module(function ($provide) {	 
				mockDataProvider = { getData: jasmineNG.createPromiseReturningSpy(JSON.parse( JSON.stringify(mockData)) ) }; 
				$provide.value('dataProvider', mockDataProvider);
			}));
			
			beforeEach(inject(function($rootScope, $controller, $q) {
				//spyOn(mockDataProvider, 'getData');
				routeParams = {
					view : 'summary',
					path : 'monthly'
				}; // simulate no house or date in URL
				jasmineNG.$q = $q;
				scope = $rootScope.$new();
				ctrl = $controller('MonthlyCtrl', {
					$scope : scope,
					$routeParams : routeParams,
					dataProvider : mockDataProvider,
					metadataService : mockService,
					dataService : mockDataService,
					chartService : mockChartService
				});
		    }));
			
			describe('dataProvider', function(){
			    
				it('should be called', function() {
					expect(scope.data).not.toBeDefined();
					expect(mockDataProvider.getData).toHaveBeenCalled();
					expect(mockDataProvider.getData).toHaveBeenCalledWith( routeParams );
			    });	
				it('should return expected data', function() {
					//Call apply to propogate changes
					scope.$apply();
					expect(scope.data).toEqual( mockData );
			    });	
				it('should show warning message', function() {
					//Call apply to propogate changes
					scope.$apply();
					expect(scope.warning).toBe( true );
					expect(scope.message).toEqual("I'm sorry, you've asked for a house or year that I can't find.");
			    });		
			});
			
		});	
		
		
	});	
	
});
