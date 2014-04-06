'use strict';

/* jasmine specs for controllers go here */

describe('MonthlyCtrl', function() {
	
	var scope, createController, 
	mockData,
	mockDataProviderService = {
		getMonthlyData : function () {
			return q.when( mockData );
		}
	}, q,
	mockMetadataService = {
		current : { year : '2013' },
		data : {}
	},
	mockDataService = {
		insertADU : function () { },
		insertADG : function () { },
		insertDiff : function () { },
		insertPercent : function () { },
		insertProjected : function () { },
		insertHeatEfficiency : function () { },
		insertEfficiency : function () { },
		insertLinearRegression : function () { }
	},
	mockChartService = { 
		setData : function () { } 
	},
	routeParams;

	beforeEach( module( 'myApp.controllers' ) );
	
	beforeEach( inject( function( $rootScope, $controller, $q ) {

		q = $q,	
		scope = $rootScope.$new(),
		createController = function() {
            return $controller('MonthlyCtrl', {
				$scope : scope,
				$routeParams : routeParams,
				dataProvider : mockDataProviderService,
				metadataService : mockMetadataService,
				dataService : mockDataService,
				chartService : mockChartService
			});
		};
    }));
	
	// it('', function() {});
	it('should insert avg. daily usage when view == summary', function() {
		routeParams = { view : 'summary' };
		mockData = {"totals":{"used":"7206.154","solar":"-8574.577","net":"-1368.423","hdd":"6810.250","adu":"19.7"},"months":[{"date":"2013-01-01","used":"880.949","solar":"-478.374","net":"402.575","hdd":"1188.596","adu":"28.4"},{"date":"2013-02-01","used":"811.571","solar":"-449.081","net":"362.490","hdd":"1066.626","adu":"29.0"},{"date":"2013-03-01","used":"806.205","solar":"-618.374","net":"187.831","hdd":"982.966","adu":"26.0"},{"date":"2013-04-01","used":"527.707","solar":"-919.527","net":"-391.820","hdd":"571.167","adu":"17.6"},{"date":"2013-05-01","used":"529.269","solar":"-903.916","net":"-374.647","hdd":"232.213","adu":"17.1"},{"date":"2013-06-01","used":"411.362","solar":"-802.487","net":"-391.125","hdd":"103.059","adu":"13.7"},{"date":"2013-07-01","used":"383.589","solar":"-929.168","net":"-545.579","hdd":"18.478","adu":"12.4"},{"date":"2013-08-01","used":"446.655","solar":"-960.804","net":"-514.149","hdd":"58.028","adu":"14.4"},{"date":"2013-09-01","used":"452.088","solar":"-936.330","net":"-484.242","hdd":"218.072","adu":"15.1"},{"date":"2013-10-01","used":"482.340","solar":"-674.075","net":"-191.735","hdd":"404.790","adu":"15.6"},{"date":"2013-11-01","used":"558.689","solar":"-639.284","net":"-80.595","hdd":"837.642","adu":"18.6"},{"date":"2013-12-01","used":"915.730","solar":"-263.157","net":"652.573","hdd":"1128.613","adu":"29.5"}]};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertADU').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBeUndefined();
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertADU).toHaveBeenCalled();
	});
	it('should show error when view == summary and returned month object == null', function() {
		mockData = {"totals":{"used":null,"solar":null,"net":null,"hdd":null}}; 
		var controller = createController();
		scope.$apply();
		expect(scope.warning).toBe(true);
	});
	it('should insert avg. daily gen and difference between actual and predicted when view == generation', function() {
		routeParams = { view : 'generation' };
		mockData = {"totals":{"actual":"-8574.577","estimated":"-7961"},"months":[{"date":"2013-01-01","actual":"-478.374","estimated":"-554"},{"date":"2013-02-01","actual":"-449.081","estimated":"-649"},{"date":"2013-03-01","actual":"-618.374","estimated":"-711"},{"date":"2013-04-01","actual":"-919.527","estimated":"-764"},{"date":"2013-05-01","actual":"-903.916","estimated":"-817"},{"date":"2013-06-01","actual":"-802.487","estimated":"-740"},{"date":"2013-07-01","actual":"-929.168","estimated":"-806"},{"date":"2013-08-01","actual":"-960.804","estimated":"-793"},{"date":"2013-09-01","actual":"-936.330","estimated":"-723"},{"date":"2013-10-01","actual":"-674.075","estimated":"-627"},{"date":"2013-11-01","actual":"-639.284","estimated":"-378"},{"date":"2013-12-01","actual":"-263.157","estimated":"-399"}],"max_solar_hour":{"kWh":"-6993","date":"2013-02-18 12:00:00"},"max_solar_day":{"kWh":"-50.164","date":"2013-04-06"}};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertADG').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBeUndefined();
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertADG).toHaveBeenCalled();
	});
	it('should include circuit when view == usage', function() {
		routeParams = { view : 'usage' };
		mockData = {"circuit":{"name":"summary","title":null},"circuits":[{"name":"all","title":"Total","actual":"7206.154"},{"name":"water_heater","title":"Water heater","actual":"2078.042"},{"name":"ashp","title":"ASHP","actual":"1195.782"},{"name":"water_pump","title":"Water pump","actual":"63.780"},{"name":"dryer","title":"Dryer","actual":"224.337"},{"name":"washer","title":"Washer","actual":"44.702"},{"name":"dishwasher","title":"Dishwasher","actual":"85.059"},{"name":"stove","title":"Range","actual":"415.816"},{"name":"all_other","title":"All other","actual":"3098.636"}]};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertPercent').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBeUndefined();
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertPercent).toHaveBeenCalled();		
	});
	it('should insert diff betwn actual and budget when view == usage && circuit == all', function() {
		routeParams = { view : 'usage' };
		mockData = {"totals":{"actual":"7206.154","budget":"5950"},"months":[{"date":"2013-01-01","actual":"880.949","budget":"800"},{"date":"2013-02-01","actual":"811.571","budget":"600"},{"date":"2013-03-01","actual":"806.205","budget":"500"},{"date":"2013-04-01","actual":"527.707","budget":"400"},{"date":"2013-05-01","actual":"529.269","budget":"350"},{"date":"2013-06-01","actual":"411.362","budget":"350"},{"date":"2013-07-01","actual":"383.589","budget":"350"},{"date":"2013-08-01","actual":"446.655","budget":"350"},{"date":"2013-09-01","actual":"452.088","budget":"350"},{"date":"2013-10-01","actual":"482.340","budget":"500"},{"date":"2013-11-01","actual":"558.689","budget":"600"},{"date":"2013-12-01","actual":"915.730","budget":"800"}],"circuit":{"name":"all","title":"Total"}};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertDiff').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBeUndefined();
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertDiff).toHaveBeenCalled();				
	});
	it('should insert projected values based on hdd and diff btwn projected and actual when view == usage && circuit == ashp', function() {
		routeParams = { view : 'usage' };
		mockData = {"totals":{"actual":"1195.782","hdd":"3366.5438261"},"months":[{"date":"2013-01-01","actual":"282.305","hdd":"730.2413741"},{"date":"2013-02-01","actual":"270.432","hdd":"646.6441654"},{"date":"2013-03-01","actual":"194.029","hdd":"522.7246223"},{"date":"2013-04-01","actual":"7.483","hdd":"208.6868742"},{"date":"2013-05-01","actual":"0.008","hdd":"43.1578333"},{"date":"2013-06-01","actual":"0.001","hdd":"2.0217499"},{"date":"2013-07-01","actual":"0.003","hdd":"0.0697916"},{"date":"2013-08-01","actual":"0.000","hdd":"0.0476250"},{"date":"2013-09-01","actual":"3.681","hdd":"27.4052081"},{"date":"2013-10-01","actual":"18.870","hdd":"96.8208333"},{"date":"2013-11-01","actual":"88.672","hdd":"419.7415819"},{"date":"2013-12-01","actual":"330.298","hdd":"668.9821670"}],"circuit":{"name":"ashp","title":"ASHP"}};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertProjected').andCallThrough();
		spyOn(mockDataService, 'insertDiff').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBeUndefined();
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertProjected).toHaveBeenCalled();
		expect(mockDataService.insertDiff).toHaveBeenCalled();					
	});
	it('should insert heat efficiency and diff btwn actual and estimated when view == hdd', function() {
		routeParams = { view : 'hdd' };
		mockData = {"months":[{"date":"2013-01-01","actual":"1188.596","estimated":"1257"},{"date":"2013-02-01","actual":"1066.626","estimated":"1070"},{"date":"2013-03-01","actual":"982.966","estimated":"889"},{"date":"2013-04-01","actual":"571.167","estimated":"528"},{"date":"2013-05-01","actual":"232.213","estimated":"220"},{"date":"2013-06-01","actual":"103.059","estimated":"42"},{"date":"2013-07-01","actual":"18.478","estimated":"6"},{"date":"2013-08-01","actual":"58.028","estimated":"13"},{"date":"2013-09-01","actual":"218.072","estimated":"124"},{"date":"2013-10-01","actual":"404.790","estimated":"463"},{"date":"2013-11-01","actual":"837.642","estimated":"741"},{"date":"2013-12-01","actual":"1128.613","estimated":"1085"}],"iga":"1727.25","totals":{"ashp_heating_season":"1192.089","hdd_heating_season":"6180.400","actual":"6810.250","estimated":"6438"},"coldest_hour":{"temperature":"-7.089","date":"2013-01-03 07:00:00"},"coldest_day":{"temperature":"60.769","date":"2013-01-24"}};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertHeatEfficiency').andCallThrough();
		spyOn(mockDataService, 'insertDiff').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBeUndefined();
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertHeatEfficiency).toHaveBeenCalled();
		expect(mockDataService.insertDiff).toHaveBeenCalled();				
	});
	it('should insert efficiency and avg. daily usage when view == water', function() { 
		routeParams = { view : 'water' };
		mockData = {"totals":{"cold":"16253.4","hot":"7868.9","main":"24122.3","water_heater":"2078.042","water_pump":"63.780"},"months":[{"date":"2013-01-01","cold":"1355.6","hot":"949.4","main":"2305.0","water_heater":"255.815","water_pump":"5.916"},{"date":"2013-02-01","cold":"1298.8","hot":"904.9","main":"2203.7","water_heater":"247.124","water_pump":"5.595"},{"date":"2013-03-01","cold":"1311.0","hot":"911.9","main":"2222.9","water_heater":"259.970","water_pump":"5.978"},{"date":"2013-04-01","cold":"1055.5","hot":"565.3","main":"1620.8","water_heater":"156.124","water_pump":"4.302"},{"date":"2013-05-01","cold":"1589.2","hot":"682.1","main":"2271.3","water_heater":"170.651","water_pump":"5.940"},{"date":"2013-06-01","cold":"1371.3","hot":"489.3","main":"1860.6","water_heater":"123.939","water_pump":"4.829"},{"date":"2013-07-01","cold":"1511.6","hot":"434.9","main":"1946.5","water_heater":"106.686","water_pump":"5.263"},{"date":"2013-08-01","cold":"1768.7","hot":"511.6","main":"2280.3","water_heater":"127.786","water_pump":"5.940"},{"date":"2013-09-01","cold":"1328.8","hot":"472.5","main":"1801.3","water_heater":"120.055","water_pump":"5.313"},{"date":"2013-10-01","cold":"1267.4","hot":"558.0","main":"1825.4","water_heater":"138.081","water_pump":"4.774"},{"date":"2013-11-01","cold":"1180.0","hot":"610.0","main":"1790.0","water_heater":"160.230","water_pump":"4.721"},{"date":"2013-12-01","cold":"1215.5","hot":"779.0","main":"1994.5","water_heater":"211.581","water_pump":"5.209"}]};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertEfficiency').andCallThrough();
		spyOn(mockDataService, 'insertADU').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBeUndefined();
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertEfficiency).toHaveBeenCalled();
		expect(mockDataService.insertADU).toHaveBeenCalled();
	});
	it('should insert default options for base and period when view == basetemp', function() {
		routeParams = { view : 'basetemp' };
		mockData = {"period":"months","points":[{"date":"2013-01-01 15:00:00","hdd":"639.5339162","ashp":"237.8200","temperature":"23.5167189","solar":"-10.3790"},{"date":"2013-02-01 00:00:00","hdd":"542.3670001","ashp":"235.9530","temperature":"25.0711411","solar":"-9.8180"},{"date":"2013-03-01 00:00:00","hdd":"330.5867900","ashp":"147.9090","temperature":"28.4374055","solar":"-10.2140"},{"date":"2013-04-02 18:00:00","hdd":"14.1358749","ashp":"5.6010","temperature":"34.1580909","solar":"-1.6520"},{"date":"2013-05-07 03:00:00","hdd":"0.4331667","ashp":"0.0040","temperature":"54.6040000","solar":"0.0000"},{"date":"2013-09-05 21:00:00","hdd":"0.5679167","ashp":"0.0020","temperature":"51.3700000","solar":"0.0000"},{"date":"2013-10-27 22:00:00","hdd":"47.4445003","ashp":"18.4750","temperature":"35.8033846","solar":"-0.0480"},{"date":"2013-11-01 00:00:00","hdd":"154.5449579","ashp":"65.4920","temperature":"30.9717523","solar":"-4.2660"},{"date":"2013-12-01 06:00:00","hdd":"646.7596669","ashp":"280.0020","temperature":"26.7679015","solar":"-20.4180"}]};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertLinearRegression').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBe(65);
		expect(scope.options.period).toBe('months');
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertLinearRegression).toHaveBeenCalled();
	});
	it('should include updated options for base and period when view == basetemp', function() {
		routeParams = { view : 'basetemp', base : 55, period : 'days' };
		mockData = {"period":"days","points":[{"date":"2013-01-01 15:00:00","hdd":"639.5339162","ashp":"237.8200","temperature":"23.5167189","solar":"-10.3790"},{"date":"2013-02-01 00:00:00","hdd":"542.3670001","ashp":"235.9530","temperature":"25.0711411","solar":"-9.8180"},{"date":"2013-03-01 00:00:00","hdd":"330.5867900","ashp":"147.9090","temperature":"28.4374055","solar":"-10.2140"},{"date":"2013-04-02 18:00:00","hdd":"14.1358749","ashp":"5.6010","temperature":"34.1580909","solar":"-1.6520"},{"date":"2013-05-07 03:00:00","hdd":"0.4331667","ashp":"0.0040","temperature":"54.6040000","solar":"0.0000"},{"date":"2013-09-05 21:00:00","hdd":"0.5679167","ashp":"0.0020","temperature":"51.3700000","solar":"0.0000"},{"date":"2013-10-27 22:00:00","hdd":"47.4445003","ashp":"18.4750","temperature":"35.8033846","solar":"-0.0480"},{"date":"2013-11-01 00:00:00","hdd":"154.5449579","ashp":"65.4920","temperature":"30.9717523","solar":"-4.2660"},{"date":"2013-12-01 06:00:00","hdd":"646.7596669","ashp":"280.0020","temperature":"26.7679015","solar":"-20.4180"}]};
		spyOn(mockDataProviderService, 'getMonthlyData').andCallThrough();
		spyOn(mockDataService, 'insertLinearRegression').andCallThrough();
		var controller = createController();
		expect(scope.options.base).toBe(55);
		expect(scope.options.period).toBe('days');
		expect(mockDataProviderService.getMonthlyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataService.insertLinearRegression).toHaveBeenCalled();
	});
	
});

describe('DailyCtrl', function() {

	var scope, createController, 
	mockDailyData, mockHourlyData,
	mockDataProviderService = {
		getDailyData : function () {
			return q.when( mockDailyData );
		},
		getHourlyData : function ( date ) {
			return q.when( mockHourlyData );
		}
	}, q,
	mockMetadataService = {
		current : { year : '2013', view : 'daily/netusage' },
		data : { chartDate : '2013-12-31' },
		limits : { range : {} }
	},
	mockDataService = {
		insertMeasure : function () { },
		insertColor : function () { }
	},
	mockChartService = { 
		setData : function () { } 
	},
	route, routeParams;

	beforeEach( module( 'myApp.controllers' ) );
	
	beforeEach( inject( function( $rootScope, $controller, $q ) {

		q = $q,	
		scope = $rootScope.$new(),
		createController = function() {
            return $controller('DailyCtrl', {
				$scope : scope,
				$route : route,
				$routeParams : routeParams,
				dataProvider : mockDataProviderService,
				metadataService : mockMetadataService,
				dataService : mockDataService,
				chartService : mockChartService
			});
		};
    }));

	it('should updateMonth and updateDate when view == netusage', function() {
		routeParams = { view : 'netusage' };
		route = { current : { $$route : { controller : 'DailyCtrl' } } };
		mockDailyData = {"days":[{"date":"2013-12-01","adjusted_load":"11.676","solar":"-10.626","used":"22.302","outdoor_deg_min":"29.611","outdoor_deg_max":"41.601","hdd":"30.146","water_heater":"3.220","ashp":"6.843","water_pump":"0.162","dryer":"2.379","washer":"0.382","dishwasher":"0.000","stove":"0.153","all_other":"9.163"},{"date":"2013-12-02","adjusted_load":"21.797","solar":"-2.959","used":"24.756","outdoor_deg_min":"32.092","outdoor_deg_max":"38.131","hdd":"30.371","water_heater":"6.766","ashp":"7.286","water_pump":"0.131","dryer":"0.011","washer":"0.000","dishwasher":"0.981","stove":"0.151","all_other":"9.430"} ]};
		mockHourlyData = {"hours":[{"date":"2013-12-31 00:00:00","adjusted_load":"540","solar":"0","used":"540","first_floor_temp":"66.193","second_floor_temp":"67.221","basement_temp":"63.455","outdoor_temp":"10.771","hdd":"2.260","water_heater":"0","ashp":"170","water_pump":"0","dryer":"0","washer":"0","dishwasher":"0","stove":"8","all_other":"362"},{"date":"2013-12-31 01:00:00","adjusted_load":"820","solar":"0","used":"820","first_floor_temp":"65.680","second_floor_temp":"67.050","basement_temp":"63.282","outdoor_temp":"9.849","hdd":"2.298","water_heater":"0","ashp":"442","water_pump":"0","dryer":"0","washer":"0","dishwasher":"0","stove":"8","all_other":"370"} ]};
		spyOn(mockDataProviderService, 'getDailyData').andCallThrough();
		spyOn(mockDataProviderService, 'getHourlyData').andCallThrough();
		var controller = createController();
		expect(mockDataProviderService.getDailyData).toHaveBeenCalled();
		scope.$apply();
		expect(mockDataProviderService.getHourlyData).toHaveBeenCalled();
	});
	it('should not reload controller when switch between daily views', function() {
		// how to test this?
	});
	
});



