'use strict';

/* jasmine specs for services go here */

describe('service', function() {
	
	beforeEach(module('myApp.services'));
  
  	describe('metadataService', function(){

		describe('at start', function(){
			var metadataService;

			beforeEach(inject(function(_metadataService_) {
				metadataService = _metadataService_;
			}));

			it('.houseId should be false', function(){ 
				expect( metadataService.data.houseId ).toBe(false);
			});
			it('.chartDate should be false', function(){ 
				expect( metadataService.data.chartDate ).toBe(false);
			});
			it('.asofDate should be false', function(){ 
				expect( metadataService.data.asofDate ).toBe(false);
			});

			it('.view should be undefined', function(){ 
				expect( metadataService.current.view ).toBe( undefined );
			});
			it('.year should be undefined', function(){ 
				expect( metadataService.current.year ).toBe( undefined );
			});

		});

		describe('validate() for summary', function(){
			var metadataService;

			beforeEach ( inject ( function ( _metadataService_) {
				metadataService = _metadataService_;
				var params = { house: '0', date: '2013-12-30', view: 'summary', path: 'monthly' };
				metadataService.validate( params );
			}));
			
			it('data.houseId should be 0', function() {
				expect( metadataService.data.houseId ).toEqual('0');
			});
			it('data.chartDate should be 2013-12-30', function() {
				expect( metadataService.data.chartDate ).toEqual('2013-12-30');
			});
			it('current.view should be summary', function() {
				expect( metadataService.current.view ).toEqual('monthly/summary');
			});
			it('current.year should be 2013', function() {
				expect( metadataService.current.year ).toEqual('2013');
			});
			it('data.asofDate should still be false', function() {
				expect( metadataService.data.asofDate ).toBe( false );
			});

		});

		describe('validate() missing house and date', function(){
			var metadataService;

			beforeEach(inject(function(_metadataService_) {
				metadataService = _metadataService_;
				var params = { view: 'summary', path: 'monthly' };
				metadataService.validate( params );
			}));
			
			it('data.houseId should be 0', function() {
				expect( metadataService.data.houseId ).toEqual('0');
			});
			// need a mockdate object in Jasmine to do this. Or try the Angular mockdate object...
			xit('data.chartDate should be 2013-12-31', function() {
				expect( metadataService.data.chartDate ).toEqual('2013-12-31');
			});
			// need a mockdate object in Jasmine to do this. Or try the Angular mockdate object...
			xit('current.year should be 2013', function() {
				expect( metadataService.current.year ).toEqual('2013');
			});
			it('current.view should be summary', function() {
				expect( metadataService.current.view ).toEqual('monthly/summary');
			});
			it('data.asofDate should still be false', function() {
				expect( metadataService.data.asofDate ).toBe( false );
			});

		});

		describe('setParamYear()', function(){
			var metadataService;

			beforeEach(inject(function(_metadataService_) {
				metadataService = _metadataService_;
				var params = { house: '0', date: '2013-12-30', view: 'summary', path: 'monthly' };
				metadataService.validate( params );
				metadataService.setParamYear('2012');
			}));
			
			it('current.year should be 2013', function() {
				expect( metadataService.current.year ).toEqual('2012');
			});
			it('data.chartDate should be 2012-12-30', function() {
				expect( metadataService.data.chartDate ).toEqual('2012-12-30');
			});
			it('current.view should remain summary', function() {
				expect( metadataService.current.view ).toEqual('monthly/summary');
			});
			it('data.asofDate should still be false', function() {
				expect( metadataService.data.asofDate ).toBe( false );
			});

		});
		
		describe('before setMetadata()', function(){
			var metadataService;

			beforeEach(inject(function(_metadataService_) {
				metadataService = _metadataService_;
				//metadataService.setMetadata({"years":["2012","2013"],"asof":"2013-12-31","house":"Up Hill House"});
			}));
			
			it('data.chartDate should be false', function() {
				expect( metadataService.data.chartDate ).toBe( false );
			});

		});

		describe('setMetadata()', function(){
			var metadataService;

			beforeEach(inject(function(_metadataService_) {
				metadataService = _metadataService_;
				metadataService.setMetadata({"years":["2012","2013"],"asof":"2013-12-31","house":"Up Hill House"});
			}));
			
			it('data.asofDate should be 2013-12-31', function() {
				expect( metadataService.data.asofDate ).toEqual('2013-12-31');
			});
			it('data.years.length should be 2', function() {
				expect( metadataService.data.years.length ).toBe(2);
			});
			it('data.houseName should be Up Hill House', function() {
				expect( metadataService.data.houseName ).toEqual('Up Hill House');
			});
			it('data.chartDate should = data.asofDate if chartDate is not set yet', function() {
				expect( metadataService.data.chartDate ).toEqual('2013-12-31');
			});

		});

		describe('getDaysYTD()', function(){
			var metadataService;

			beforeEach(inject(function(_metadataService_) {
				metadataService = _metadataService_;
				metadataService.setMetadata({"years":["2012","2013"],"asof":"2013-12-31","house":"Up Hill House"});
				var params = { house: '0', date: '2013-12-30' };
				metadataService.validate( 'summary', params );
			}));

			it('chart year 2014 > asof year 2013, should return false', function() {
				metadataService.setParamYear('2014');
				metadataService.data.asofDate = '2013-02-28';
				expect( metadataService.getDaysYTD() ).toBe( false ); // don't have data past asof year
			});
			it('chart year 2013 = asof year 2013. 02-28 should return 59', function() {
				metadataService.data.asofDate = '2013-02-28';
				expect( metadataService.getDaysYTD() ).toEqual(59); // 31 + 28
			});
			it('chart year 2013, asof 2013-12-30 should return 365', function() {
				expect( metadataService.getDaysYTD() ).toEqual(365);
			});
			it('chart year 2012, asof 2013-12-30 should return 366', function() {
				metadataService.setParamYear('2012');
				expect( metadataService.getDaysYTD() ).toEqual(366);
			});

			it('chart year 2011 < asof 2013-12-30, should be false', function() {
				metadataService.setParamYear('2011');
				expect( metadataService.getDaysYTD() ).toBe( false );
			});
			
		});
		
	});
	
	// doesn't work yet. says Highcharts is undefined
	//   also have to add showDangerIfUsingMoreThanProducing to return
	xdescribe('chartService showDangerIfUsingMoreThanProducing', function(){
		var mockHighcharts = { 
			setOptions : function () {}
		}, 
		chartService,
		mockService = {
			data : { houseID : 0,
					 chartDate : '2013-11-01',
					 asofDate : '2013-12-31' },
			current : { year : '2013', 
					    view : 'summary' },
			getDaysYTD : function () {
				return 365;
			},
			setParams : function() {}
		},
		color, colors = { 'Used' : '#336699', 'Solar' : '#669933', 'danger' : '#DF0101' };
		
		beforeEach(function() {
			module(function ($provide) {
				$provide.value('metadataService', mockService);
			});								
		});
		
		beforeEach(inject(function(_chartService_, _$window_) {
			chartService = _chartService_;
			window = _$window_;
			//Highcharts = mockHighcharts;
		}));
		
		it('should return red if categoriy is solar and used > solar', function() {
			color = chartService.showDangerIfUsingMoreThanProducing( 'Solar', colors, '12', '-6' ); 
			expect( color ).toBe( '#DF0101' );
		});

		it('should return green if categoriy is solar and solar > used', function() {
			color = chartService.showDangerIfUsingMoreThanProducing( 'Solar', colors, '6', '-12' ); 
			expect( color ).toBe( '#669933' );
		});

		it('should return blue if categoriy is used', function() {
			color = chartService.showDangerIfUsingMoreThanProducing( 'Used', colors, '12', '-6' ); 
			expect( color ).toBe( '#336699' );
		});
		
	});

	describe('dataService insertADU', function(){
		
		var dataService,			
		mockService = {
			data : { houseID : 0,
					 chartDate : '2013-11-01',
					 asofDate : '2013-12-31' },
			current : { year : '2013', 
					    view : 'summary' },
			getDaysYTD : function () {
				return 365;
			}
		},
		mockDataSumBefore = {"totals":{"used":"7206.154","solar":"-8574.577","net":"-1368.423","hdd":"6810.250"},"months":[{"date":"2013-01-01","used":"880.949","solar":"-478.374","net":"402.575","hdd":"1188.596"},{"date":"2013-02-01","used":"811.571","solar":"-449.081","net":"362.490","hdd":"1066.626"},{"date":"2013-03-01","used":"806.205","solar":"-618.374","net":"187.831","hdd":"982.966"},{"date":"2013-04-01","used":"527.707","solar":"-919.527","net":"-391.820","hdd":"571.167"},{"date":"2013-05-01","used":"529.269","solar":"-903.916","net":"-374.647","hdd":"232.213"},{"date":"2013-06-01","used":"411.362","solar":"-802.487","net":"-391.125","hdd":"103.059"},{"date":"2013-07-01","used":"383.589","solar":"-929.168","net":"-545.579","hdd":"18.478"},{"date":"2013-08-01","used":"446.655","solar":"-960.804","net":"-514.149","hdd":"58.028"},{"date":"2013-09-01","used":"452.088","solar":"-936.330","net":"-484.242","hdd":"218.072"},{"date":"2013-10-01","used":"482.340","solar":"-674.075","net":"-191.735","hdd":"404.790"},{"date":"2013-11-01","used":"558.689","solar":"-639.284","net":"-80.595","hdd":"837.642"},{"date":"2013-12-01","used":"915.730","solar":"-263.157","net":"652.573","hdd":"1128.613"}]},
		mockDataSumAfter  = {"totals":{"used":"7206.154","solar":"-8574.577","net":"-1368.423","hdd":"6810.250","adu":19.74288767123288},"months":[{"date":"2013-01-01","used":"880.949","solar":"-478.374","net":"402.575","hdd":"1188.596","adu":28.417709677419353},{"date":"2013-02-01","used":"811.571","solar":"-449.081","net":"362.490","hdd":"1066.626","adu":28.98467857142857},{"date":"2013-03-01","used":"806.205","solar":"-618.374","net":"187.831","hdd":"982.966","adu":26.006612903225808},{"date":"2013-04-01","used":"527.707","solar":"-919.527","net":"-391.820","hdd":"571.167","adu":17.590233333333334},{"date":"2013-05-01","used":"529.269","solar":"-903.916","net":"-374.647","hdd":"232.213","adu":17.073193548387096},{"date":"2013-06-01","used":"411.362","solar":"-802.487","net":"-391.125","hdd":"103.059","adu":13.712066666666667},{"date":"2013-07-01","used":"383.589","solar":"-929.168","net":"-545.579","hdd":"18.478","adu":12.37383870967742},{"date":"2013-08-01","used":"446.655","solar":"-960.804","net":"-514.149","hdd":"58.028","adu":14.408225806451613},{"date":"2013-09-01","used":"452.088","solar":"-936.330","net":"-484.242","hdd":"218.072","adu":15.069600000000001},{"date":"2013-10-01","used":"482.340","solar":"-674.075","net":"-191.735","hdd":"404.790","adu":15.559354838709677},{"date":"2013-11-01","used":"558.689","solar":"-639.284","net":"-80.595","hdd":"837.642","adu":18.622966666666667},{"date":"2013-12-01","used":"915.730","solar":"-263.157","net":"652.573","hdd":"1128.613","adu":29.539677419354838}]};

		beforeEach(function() {
			module(function ($provide) {
				$provide.value('metadataService', mockService);
			});								
		});

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
		}));

		it('should insert adu values for data.totals and data.months[]', function() { 
			expect( dataService.insertADU( mockDataSumBefore, ['used'], ['adu'] ) ).toEqual( mockDataSumAfter );
		});

	});

	describe('dataService insertADG', function(){
		
		var dataService, mockDataGenAfter,
		mockService = {
			data : { houseID : 0,
					 chartDate : '2013-11-01',
					 asofDate : '2013-12-31' },
			current : { year : '2013', 
					    view : 'summary' },
			getDaysYTD : function () {
				return 365;
			}
		},
		mockDataGenBefore = {"totals":{"actual":"-8574.577","estimated":"-7961"},"months":[{"date":"2013-01-01","actual":"-478.374","estimated":"-554"},{"date":"2013-02-01","actual":"-449.081","estimated":"-649"},{"date":"2013-03-01","actual":"-618.374","estimated":"-711"},{"date":"2013-04-01","actual":"-919.527","estimated":"-764"},{"date":"2013-05-01","actual":"-903.916","estimated":"-817"},{"date":"2013-06-01","actual":"-802.487","estimated":"-740"},{"date":"2013-07-01","actual":"-929.168","estimated":"-806"},{"date":"2013-08-01","actual":"-960.804","estimated":"-793"},{"date":"2013-09-01","actual":"-936.330","estimated":"-723"},{"date":"2013-10-01","actual":"-674.075","estimated":"-627"},{"date":"2013-11-01","actual":"-639.284","estimated":"-378"},{"date":"2013-12-01","actual":"-263.157","estimated":"-399"}],"max_solar_hour":{"kWh":"-6993","date":"2013-02-18 12:00:00"},"max_solar_day":{"kWh":"-50.164","date":"2013-04-06"}};

		beforeEach(function() {
			module(function ($provide) {
				$provide.value('metadataService', mockService);
			});				
		});

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataGenAfter = dataService.insertADG( mockDataGenBefore );
		}));
		
		describe('average daily gen (adg)', function(){
			
			it('should be -23.5', function() {	 
				expect( mockDataGenAfter.avg_daily_gen ).toEqual( "-23.5" );
			});

		});

	});

	describe('dataService insertDiff', function(){
		
		var dataService, mockDataGenAfter,		
		mockDataGenBefore = {"totals":{"actual":"-8574.577","estimated":"-7961"},"months":[{"date":"2013-01-01","actual":"-478.374","estimated":"-554"},{"date":"2013-02-01","actual":"-449.081","estimated":"-649"},{"date":"2013-03-01","actual":"-618.374","estimated":"-711"},{"date":"2013-04-01","actual":"-919.527","estimated":"-764"},{"date":"2013-05-01","actual":"-903.916","estimated":"-817"},{"date":"2013-06-01","actual":"-802.487","estimated":"-740"},{"date":"2013-07-01","actual":"-929.168","estimated":"-806"},{"date":"2013-08-01","actual":"-960.804","estimated":"-793"},{"date":"2013-09-01","actual":"-936.330","estimated":"-723"},{"date":"2013-10-01","actual":"-674.075","estimated":"-627"},{"date":"2013-11-01","actual":"-639.284","estimated":"-378"},{"date":"2013-12-01","actual":"-263.157","estimated":"-399"}],"max_solar_hour":{"kWh":"-6993","date":"2013-02-18 12:00:00"},"max_solar_day":{"kWh":"-50.164","date":"2013-04-06"}};

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataGenAfter = dataService.insertDiff( mockDataGenBefore, 'actual', 'estimated' );
		}));

		describe('diff percentages', function(){
			
			it('total diff should be 7.7', function() {	 
				expect( mockDataGenAfter.totals.diff ).toEqual( "7.7" );
			});
			it('Jan diff should be -13.7', function() {	 
				expect( mockDataGenAfter.months[0].diff ).toEqual( "-13.7" );
			});
			it('Apr diff should be 20.4', function() {	 
				expect( mockDataGenAfter.months[3].diff ).toEqual( "20.4" );
			});				
		});
		describe('net values', function(){
			
			it('net should be -614', function() {	 
				expect( mockDataGenAfter.totals.net ).toEqual( "-614" );
			});
			it('Jan diff should be 76', function() {	 
				expect( mockDataGenAfter.months[0].net ).toEqual( "76" );
			});
			it('Apr diff should be -156', function() {	 
				expect( mockDataGenAfter.months[3].net ).toEqual( "-156" );
			});				
		});
	});

	describe('dataService insertProjected', function(){
		
		var dataService, mockDataGenAfter,		
		mockDataGenBefore = {"totals":{"actual":"1195.782","hdd":"3366.5438261"},"months":[{"date":"2013-01-01","actual":"282.305","hdd":"730.2413741"},{"date":"2013-02-01","actual":"270.432","hdd":"646.6441654"},{"date":"2013-03-01","actual":"194.029","hdd":"522.7246223"},{"date":"2013-04-01","actual":"7.483","hdd":"208.6868742"},{"date":"2013-05-01","actual":"0.008","hdd":"43.1578333"},{"date":"2013-06-01","actual":"0.001","hdd":"2.0217499"},{"date":"2013-07-01","actual":"0.003","hdd":"0.0697916"},{"date":"2013-08-01","actual":"0.000","hdd":"0.0476250"},{"date":"2013-09-01","actual":"3.681","hdd":"27.4052081"},{"date":"2013-10-01","actual":"18.870","hdd":"96.8208333"},{"date":"2013-11-01","actual":"88.672","hdd":"419.7415819"},{"date":"2013-12-01","actual":"330.298","hdd":"668.9821670"}],"year":"2013","circuit":{"name":"ashp","title":"ASHP"}};

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataGenAfter = dataService.insertProjected( mockDataGenBefore );
		}));

		describe('projected values', function(){
			
			it('projected should be -761.9', function() {	 
				expect( mockDataGenAfter.totals.projected.toFixed(1) ).toEqual( "761.9" );
			});
			it('Jan projected should be 165.9', function() {	 
				expect( mockDataGenAfter.months[0].projected.toFixed(1) ).toEqual( "165.9" );
			});
			it('Apr projected should be 47.9', function() {	 
				expect( mockDataGenAfter.months[3].projected.toFixed(1) ).toEqual( "47.9" );
			});				
		});
	});

	describe('dataService insertPercent', function(){
		
		var dataService, mockDataGenAfter,		
		mockDataGenBefore = {"totals":null,"months":[],"year":"2013","circuit":{"name":"summary","title":null},"circuits":[{"name":"all","title":"Total","actual":"7206.154"},{"name":"water_heater","title":"Water heater","actual":"2078.042"},{"name":"ashp","title":"ASHP","actual":"1195.782"},{"name":"water_pump","title":"Water pump","actual":"63.780"}]};

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataGenAfter = dataService.insertPercent( mockDataGenBefore, 'circuits', 'actual' );
		}));

		describe('percentage values', function(){
			
			it('Total percent should be 100', function() {	 
				expect( mockDataGenAfter.circuits[0].perc.toFixed(0) ).toEqual( "100" );
			});
			it('Water heater percent should be 29', function() {	 
				expect( mockDataGenAfter.circuits[1].perc.toFixed(0) ).toEqual( "29" );
			});
			it('ASHP percent should be 17', function() {	 
				expect( mockDataGenAfter.circuits[2].perc.toFixed(0) ).toEqual( "17" );
			});
			it('Water pump percent should be 1', function() {	 
				expect( mockDataGenAfter.circuits[3].perc.toFixed(0) ).toEqual( "1" );
			});
		});
	});

	describe('dataService insertPercent neg', function(){
		
		var dataService, mockDataGenAfter,		
		mockDataGenBefore = {"totals":null,"months":[],"year":"2013","circuit":{"name":"summary","title":null},"circuits":[{"name":"all","title":"Total","actual":"-7206.154"},{"name":"water_heater","title":"Water heater","actual":"-2078.042"},{"name":"ashp","title":"ASHP","actual":"-1195.782"},{"name":"water_pump","title":"Water pump","actual":"-63.780"}]};

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataGenAfter = dataService.insertPercent( mockDataGenBefore, 'circuits', 'actual', true );
		}));

		describe('percentage values', function(){
			
			it('Total percent should be 100', function() {	 
				expect( mockDataGenAfter.circuits[0].perc.toFixed(0) ).toEqual( "100" );
			});
			it('Water heater percent should be 29', function() {	 
				expect( mockDataGenAfter.circuits[1].perc.toFixed(0) ).toEqual( "29" );
			});
			it('ASHP percent should be 17', function() {	 
				expect( mockDataGenAfter.circuits[2].perc.toFixed(0) ).toEqual( "17" );
			});
			it('Water pump percent should be 1', function() {	 
				expect( mockDataGenAfter.circuits[3].perc.toFixed(0) ).toEqual( "1" );
			});
		});
	});

	describe('dataService insertHeatEfficiency 2012', function(){
		
		var dataService, mockDataHddAfter,
		mockDataHddBefore = {"totals":{"ashp_heating_season":"272.538","hdd_heating_season":"2951.611","actual":"5884.847","estimated":"6438"},"months":[{"date":"2012-01-01","actual":"1125.000","estimated":"1257"},{"date":"2012-02-01","actual":"956.511","estimated":"1070"},{"date":"2012-03-01","actual":"619.450","estimated":"889"},{"date":"2012-04-01","actual":"534.889","estimated":"528"},{"date":"2012-05-01","actual":"169.707","estimated":"220"},{"date":"2012-06-01","actual":"97.194","estimated":"42"},{"date":"2012-07-01","actual":"16.842","estimated":"6"},{"date":"2012-08-01","actual":"31.466","estimated":"13"},{"date":"2012-09-01","actual":"167.980","estimated":"124"},{"date":"2012-10-01","actual":"356.948","estimated":"463"},{"date":"2012-11-01","actual":"830.269","estimated":"741"},{"date":"2012-12-01","actual":"978.591","estimated":"1085"}],"iga":"1727.25","coldest_hour":{"temperature":"6.235","date":"2012-02-12 07:00:00"},"coldest_day":{"temperature":"51.986","date":"2012-02-12"}};

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataHddAfter = dataService.insertHeatEfficiency( mockDataHddBefore );
		}));

		describe('Wh and btu/sf/hdd values', function(){
			
			it('Wh/sf/hdd should be 0.053', function() {	 
				expect( mockDataHddAfter.wh_sf_hdd.toFixed(3) ).toBe( '0.053' );
			});
			it('btu/sf/hdd should be 0.182', function() {	 
				expect( mockDataHddAfter.btu_sf_hdd.toFixed(3) ).toBe( '0.182' );
			});
		});
	});

	describe('dataService insertHeatEfficiency 2013', function(){
		
		var dataService, mockDataHddAfter,
		mockDataHddBefore = {"totals":{"ashp_heating_season":"1192.089","hdd_heating_season":"6180.400","actual":"6810.250","estimated":"6438"},"months":[{"date":"2013-01-01","actual":"1188.596","estimated":"1257"},{"date":"2013-02-01","actual":"1066.626","estimated":"1070"},{"date":"2013-03-01","actual":"982.966","estimated":"889"},{"date":"2013-04-01","actual":"571.167","estimated":"528"},{"date":"2013-05-01","actual":"232.213","estimated":"220"},{"date":"2013-06-01","actual":"103.059","estimated":"42"},{"date":"2013-07-01","actual":"18.478","estimated":"6"},{"date":"2013-08-01","actual":"58.028","estimated":"13"},{"date":"2013-09-01","actual":"218.072","estimated":"124"},{"date":"2013-10-01","actual":"404.790","estimated":"463"},{"date":"2013-11-01","actual":"837.642","estimated":"741"},{"date":"2013-12-01","actual":"1128.613","estimated":"1085"}],"iga":"1727.25","coldest_hour":{"temperature":"-7.089","date":"2013-01-03 07:00:00"},"coldest_day":{"temperature":"60.769","date":"2013-01-24"}};

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataHddAfter = dataService.insertHeatEfficiency( mockDataHddBefore );
		}));

		describe('Wh and btu/sf/hdd values', function(){
			
			it('Wh/sf/hdd should be 0.112', function() {	 
				expect( mockDataHddAfter.wh_sf_hdd.toFixed(3) ).toBe( '0.112' );
			});
			it('btu/sf/hdd should be 0.381', function() {	 
				expect( mockDataHddAfter.btu_sf_hdd.toFixed(3) ).toBe( '0.381' );
			});
		});
	});

	describe('dataService insertEfficiency 2013', function(){
		
		var dataService, mockDataWaterAfter,
		mockDataWaterBefore = {"totals":{"cold":"16253.4","hot":"7868.9","main":"24122.3","water_heater":"2078.042","water_pump":"63.780"},"months":[{"date":"2013-01-01","cold":"1355.6","hot":"949.4","main":"2305.0","water_heater":"255.815","water_pump":"5.916"},{"date":"2013-02-01","cold":"1298.8","hot":"904.9","main":"2203.7","water_heater":"247.124","water_pump":"5.595"},{"date":"2013-03-01","cold":"1311.0","hot":"911.9","main":"2222.9","water_heater":"259.970","water_pump":"5.978"},{"date":"2013-04-01","cold":"1055.5","hot":"565.3","main":"1620.8","water_heater":"156.124","water_pump":"4.302"},{"date":"2013-05-01","cold":"1589.2","hot":"682.1","main":"2271.3","water_heater":"170.651","water_pump":"5.940"},{"date":"2013-06-01","cold":"1371.3","hot":"489.3","main":"1860.6","water_heater":"123.939","water_pump":"4.829"},{"date":"2013-07-01","cold":"1511.6","hot":"434.9","main":"1946.5","water_heater":"106.686","water_pump":"5.263"},{"date":"2013-08-01","cold":"1768.7","hot":"511.6","main":"2280.3","water_heater":"127.786","water_pump":"5.940"},{"date":"2013-09-01","cold":"1328.8","hot":"472.5","main":"1801.3","water_heater":"120.055","water_pump":"5.313"},{"date":"2013-10-01","cold":"1267.4","hot":"558.0","main":"1825.4","water_heater":"138.081","water_pump":"4.774"},{"date":"2013-11-01","cold":"1180.0","hot":"610.0","main":"1790.0","water_heater":"160.230","water_pump":"4.721"},{"date":"2013-12-01","cold":"1215.5","hot":"779.0","main":"1994.5","water_heater":"211.581","water_pump":"5.209"}]};

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataWaterAfter = dataService.insertEfficiency( mockDataWaterBefore );
		}));

		describe('total efficiency', function(){
			
			it('water_heater should be 264.08290866576016', function() {	 
				expect( mockDataWaterAfter.totals.water_heater_efficiency ).toBe( 264.08290866576016 );
			});
			it('water_pump should be 2.644026481720234', function() {	 
				expect( mockDataWaterAfter.totals.water_pump_efficiency ).toBe( 2.644026481720234 );
			});
		});
	});

	describe('dataService insertLinearRegression', function(){
		
		var dataService, mockDataAfter,
		mockDataBefore = {"totals":null,"months":[],"period":"months","points":[{"date":"2013-01-01 15:00:00","hdd":"639.5339162","ashp":"237.8200","temperature":"23.5167189","solar":"-10.3790"},{"date":"2013-02-01 00:00:00","hdd":"542.3670001","ashp":"235.9530","temperature":"25.0711411","solar":"-9.8180"},{"date":"2013-03-01 00:00:00","hdd":"330.5867900","ashp":"147.9090","temperature":"28.4374055","solar":"-10.2140"},{"date":"2013-04-02 18:00:00","hdd":"14.1358749","ashp":"5.6010","temperature":"34.1580909","solar":"-1.6520"},{"date":"2013-05-07 03:00:00","hdd":"0.4331667","ashp":"0.0040","temperature":"54.6040000","solar":"0.0000"},{"date":"2013-09-05 21:00:00","hdd":"0.5679167","ashp":"0.0020","temperature":"51.3700000","solar":"0.0000"},{"date":"2013-10-27 22:00:00","hdd":"47.4445003","ashp":"18.4750","temperature":"35.8033846","solar":"-0.0480"},{"date":"2013-11-01 00:00:00","hdd":"154.5449579","ashp":"65.4920","temperature":"30.9717523","solar":"-4.2660"},{"date":"2013-12-01 06:00:00","hdd":"646.7596669","ashp":"280.0020","temperature":"26.7679015","solar":"-20.4180"}]};

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataAfter = dataService.insertLinearRegression( mockDataBefore );
		}));

		describe('regression line', function(){
			
			it('slope should be 0.4120', function() {	 
				expect( Math.round(mockDataAfter.lr.slope * 10000)/10000 ).toBe( 0.4120 );
			});
			it('intercept should be 1.356', function() {	 
				expect( Math.round(mockDataAfter.lr.intercept * 1000)/1000 ).toBe( 1.356 );
			});
			it('r2 should be 0.9896', function() {	 
				expect( Math.round(mockDataAfter.lr.r2 * 10000)/10000 ).toBe( 0.9896 );
			});
		});
	});

	describe('dataService insertMeasure', function(){
		
		var dataService, mockDataBefore, mockDataAfter, mockDataAfterMeasure;
		
		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataBefore = {"days":[
				{"date":"2013-12-01","adjusted_load":"11.676","solar":"-10.626","used":"22.302","outdoor_deg_min":"29.611","outdoor_deg_max":"41.601","hdd":"30.146","water_heater":"3.220","ashp":"6.843","water_pump":"0.162","dryer":"2.379","washer":"0.382","dishwasher":"0.000","stove":"0.153","all_other":"9.163"},
				{"date":"2013-12-02","adjusted_load":"21.797","solar":"-2.959","used":"24.756","outdoor_deg_min":"32.092","outdoor_deg_max":"38.131","hdd":"30.371","water_heater":"6.766","ashp":"7.286","water_pump":"0.131","dryer":"0.011","washer":"0.000","dishwasher":"0.981","stove":"0.151","all_other":"9.430"},
				{"date":"2013-12-03","adjusted_load":"14.604","solar":"-7.887","used":"22.491","outdoor_deg_min":"30.123","outdoor_deg_max":"41.043","hdd":"30.620","water_heater":"5.501","ashp":"6.889","water_pump":"0.133","dryer":"0.010","washer":"0.085","dishwasher":"0.000","stove":"0.542","all_other":"9.331"},
				{"date":"2013-12-04","adjusted_load":"-2.614","solar":"-17.842","used":"15.228","outdoor_deg_min":"26.006","outdoor_deg_max":"40.951","hdd":"32.874","water_heater":"4.650","ashp":"3.953","water_pump":"0.113","dryer":"0.000","washer":"0.068","dishwasher":"0.000","stove":"0.147","all_other":"6.297"},
				{"date":"2013-12-05","adjusted_load":"19.531","solar":"-2.838","used":"22.369","outdoor_deg_min":"30.884","outdoor_deg_max":"55.168","hdd":"16.427","water_heater":"6.394","ashp":"1.972","water_pump":"0.161","dryer":"0.022","washer":"0.000","dishwasher":"0.000","stove":"1.075","all_other":"12.745"},
				{"date":"2013-12-06","adjusted_load":"12.767","solar":"-3.934","used":"16.701","outdoor_deg_min":"31.390","outdoor_deg_max":"53.472","hdd":"24.946","water_heater":"6.070","ashp":"3.260","water_pump":"0.178","dryer":"0.000","washer":"0.006","dishwasher":"0.918","stove":"0.722","all_other":"5.547"},
				{"date":"2013-12-07","adjusted_load":"13.604","solar":"-16.744","used":"30.348","outdoor_deg_min":"25.898","outdoor_deg_max":"35.395","hdd":"34.534","water_heater":"9.563","ashp":"3.821","water_pump":"0.250","dryer":"0.024","washer":"0.000","dishwasher":"0.000","stove":"3.658","all_other":"13.032"},
				{"date":"2013-12-08","adjusted_load":"27.197","solar":"-6.883","used":"34.080","outdoor_deg_min":"21.632","outdoor_deg_max":"28.684","hdd":"39.080","water_heater":"8.295","ashp":"8.922","water_pump":"0.274","dryer":"3.814","washer":"0.365","dishwasher":"0.948","stove":"2.067","all_other":"9.395"},
				{"date":"2013-12-09","adjusted_load":"30.522","solar":"-2.506","used":"33.028","outdoor_deg_min":"25.471","outdoor_deg_max":"37.702","hdd":"32.679","water_heater":"7.644","ashp":"12.834","water_pump":"0.184","dryer":"0.966","washer":"0.156","dishwasher":"0.000","stove":"0.163","all_other":"11.081"},
				{"date":"2013-12-10","adjusted_load":"31.481","solar":"-1.155","used":"32.636","outdoor_deg_min":"20.728","outdoor_deg_max":"33.732","hdd":"36.332","water_heater":"5.878","ashp":"16.647","water_pump":"0.143","dryer":"0.000","washer":"0.075","dishwasher":"0.000","stove":"2.256","all_other":"7.637"},
				{"date":"2013-12-11","adjusted_load":"20.555","solar":"-14.672","used":"35.227","outdoor_deg_min":"19.468","outdoor_deg_max":"27.538","hdd":"41.765","water_heater":"8.473","ashp":"17.983","water_pump":"0.170","dryer":"0.000","washer":"0.078","dishwasher":"0.000","stove":"0.408","all_other":"8.115"},
				{"date":"2013-12-12","adjusted_load":"-9.861","solar":"-32.217","used":"22.356","outdoor_deg_min":"13.584","outdoor_deg_max":"21.799","hdd":"46.924","water_heater":"5.086","ashp":"3.471","water_pump":"0.113","dryer":"0.012","washer":"0.086","dishwasher":"0.000","stove":"2.541","all_other":"11.047"},
				{"date":"2013-12-13","adjusted_load":"26.153","solar":"-2.644","used":"28.797","outdoor_deg_min":"8.780","outdoor_deg_max":"22.746","hdd":"47.492","water_heater":"6.741","ashp":"12.754","water_pump":"0.130","dryer":"0.000","washer":"0.190","dishwasher":"0.985","stove":"0.191","all_other":"7.806"},
				{"date":"2013-12-14","adjusted_load":"35.474","solar":"-4.964","used":"40.438","outdoor_deg_min":"4.161","outdoor_deg_max":"11.935","hdd":"56.506","water_heater":"7.793","ashp":"18.891","water_pump":"0.146","dryer":"0.010","washer":"0.027","dishwasher":"0.000","stove":"2.577","all_other":"10.994"},
				{"date":"2013-12-15","adjusted_load":"31.845","solar":"0.000","used":"31.845","outdoor_deg_min":"13.521","outdoor_deg_max":"27.012","hdd":"42.349","water_heater":"6.208","ashp":"16.126","water_pump":"0.120","dryer":"0.000","washer":"0.146","dishwasher":"0.000","stove":"3.228","all_other":"6.017"},
				{"date":"2013-12-16","adjusted_load":"14.802","solar":"-20.285","used":"35.087","outdoor_deg_min":"8.033","outdoor_deg_max":"23.628","hdd":"47.081","water_heater":"7.362","ashp":"14.797","water_pump":"0.163","dryer":"0.012","washer":"0.039","dishwasher":"0.985","stove":"0.549","all_other":"11.180"},
				{"date":"2013-12-17","adjusted_load":"39.507","solar":"-1.600","used":"41.107","outdoor_deg_min":"-0.854","outdoor_deg_max":"16.165","hdd":"57.023","water_heater":"5.373","ashp":"24.651","water_pump":"0.138","dryer":"0.000","washer":"0.000","dishwasher":"0.000","stove":"0.819","all_other":"10.126"},
				{"date":"2013-12-18","adjusted_load":"34.586","solar":"-0.237","used":"34.823","outdoor_deg_min":"13.206","outdoor_deg_max":"28.216","hdd":"44.121","water_heater":"5.393","ashp":"21.415","water_pump":"0.107","dryer":"0.000","washer":"0.114","dishwasher":"0.000","stove":"0.198","all_other":"7.596"},
				{"date":"2013-12-19","adjusted_load":"11.325","solar":"-16.809","used":"28.134","outdoor_deg_min":"26.537","outdoor_deg_max":"42.341","hdd":"32.093","water_heater":"5.795","ashp":"10.924","water_pump":"0.108","dryer":"0.012","washer":"0.058","dishwasher":"0.000","stove":"0.497","all_other":"10.740"},
				{"date":"2013-12-20","adjusted_load":"17.078","solar":"-2.783","used":"19.861","outdoor_deg_min":"34.858","outdoor_deg_max":"46.166","hdd":"24.420","water_heater":"6.511","ashp":"6.522","water_pump":"0.129","dryer":"0.000","washer":"0.006","dishwasher":"0.000","stove":"0.515","all_other":"6.178"},
				{"date":"2013-12-21","adjusted_load":"21.077","solar":"-3.034","used":"24.111","outdoor_deg_min":"41.554","outdoor_deg_max":"53.341","hdd":"17.126","water_heater":"6.679","ashp":"5.199","water_pump":"0.151","dryer":"0.000","washer":"0.525","dishwasher":"0.950","stove":"3.511","all_other":"7.096"},
				{"date":"2013-12-22","adjusted_load":"21.461","solar":"-1.441","used":"22.902","outdoor_deg_min":"31.037","outdoor_deg_max":"58.411","hdd":"21.285","water_heater":"4.716","ashp":"2.938","water_pump":"0.205","dryer":"2.536","washer":"0.130","dishwasher":"0.000","stove":"2.042","all_other":"10.335"},
				{"date":"2013-12-23","adjusted_load":"26.236","solar":"-0.544","used":"26.780","outdoor_deg_min":"31.892","outdoor_deg_max":"49.561","hdd":"23.653","water_heater":"11.493","ashp":"0.000","water_pump":"0.253","dryer":"0.010","washer":"0.102","dishwasher":"0.881","stove":"3.677","all_other":"10.364"},
				{"date":"2013-12-24","adjusted_load":"14.845","solar":"-21.305","used":"36.150","outdoor_deg_min":"16.885","outdoor_deg_max":"31.491","hdd":"39.601","water_heater":"11.052","ashp":"3.816","water_pump":"0.384","dryer":"2.592","washer":"0.185","dishwasher":"0.816","stove":"8.394","all_other":"8.911"},
				{"date":"2013-12-25","adjusted_load":"3.233","solar":"-28.533","used":"31.766","outdoor_deg_min":"7.347","outdoor_deg_max":"19.238","hdd":"51.007","water_heater":"7.373","ashp":"13.399","water_pump":"0.200","dryer":"0.000","washer":"0.201","dishwasher":"0.686","stove":"2.087","all_other":"7.820"},
				{"date":"2013-12-26","adjusted_load":"38.799","solar":"-0.594","used":"39.393","outdoor_deg_min":"19.929","outdoor_deg_max":"29.764","hdd":"39.230","water_heater":"7.662","ashp":"17.725","water_pump":"0.162","dryer":"2.345","washer":"0.255","dishwasher":"0.000","stove":"1.655","all_other":"9.589"},
				{"date":"2013-12-27","adjusted_load":"40.778","solar":"-1.918","used":"42.696","outdoor_deg_min":"23.023","outdoor_deg_max":"31.993","hdd":"37.634","water_heater":"6.870","ashp":"16.975","water_pump":"0.128","dryer":"0.012","washer":"0.000","dishwasher":"0.000","stove":"8.395","all_other":"10.316"},
				{"date":"2013-12-28","adjusted_load":"30.893","solar":"-4.457","used":"35.350","outdoor_deg_min":"25.846","outdoor_deg_max":"39.078","hdd":"32.093","water_heater":"10.675","ashp":"13.380","water_pump":"0.267","dryer":"2.413","washer":"0.503","dishwasher":"0.797","stove":"0.349","all_other":"6.966"},
				{"date":"2013-12-29","adjusted_load":"25.773","solar":"-2.269","used":"28.042","outdoor_deg_min":"31.942","outdoor_deg_max":"40.204","hdd":"29.507","water_heater":"5.273","ashp":"7.631","water_pump":"0.165","dryer":"6.070","washer":"0.331","dishwasher":"0.000","stove":"0.604","all_other":"7.968"},
				{"date":"2013-12-30","adjusted_load":"3.925","solar":"-17.802","used":"21.727","outdoor_deg_min":"10.771","outdoor_deg_max":"34.810","hdd":"39.412","water_heater":"4.953","ashp":"9.769","water_pump":"0.112","dryer":"0.000","washer":"0.148","dishwasher":"0.000","stove":"0.182","all_other":"6.563"},
				{"date":"2013-12-31","adjusted_load":"23.524","solar":"-11.675","used":"35.199","outdoor_deg_min":"8.238","outdoor_deg_max":"20.671","hdd":"50.282","water_heater":"6.119","ashp":"19.505","water_pump":"0.129","dryer":"0.000","washer":"0.103","dishwasher":"0.000","stove":"0.152","all_other":"9.191"}
			]};
			
			// how can I gain access ro this in the controller so it's not dulpicated?'
			var orange = { start : chroma ( 255, 248, 232 ), end : chroma ( 162, 117, 0 ) },
			blueGreen = { start : chroma ( 0, 20, 126 ), end : chroma ( 73, 142, 0 ) },
			red = { start : chroma ( 252, 235, 235 ), end : chroma ( 149, 0, 0 ) },
			green = { start : chroma ( 232, 255, 209 ), end : chroma ( 73, 142, 0 ) },
			blue = { start : chroma ( 242, 244, 255 ), end : chroma ( 0, 20, 126 ) }; 
	
			var colors = {
				adjusted_load : blueGreen,
				solar : green,
				used : blue,
				outdoor_deg_min : blue,
				outdoor_deg_max : red,
				hdd : blue,
				water_heater : blue,
				ashp : blue,
				water_pump : blue,
				dryer : blue,
				washer : blue,
				dishwasher : blue,
				stove : blue,
				all_other : blue 
			};
			mockDataAfter = dataService.insertColor( mockDataBefore, colors, ['adjusted_load'] );
			mockDataAfterMeasure = dataService.insertMeasure( mockDataAfter, [ [ 'adjusted_load', 'kWh' ] ] );
		}));
			
		it('[0].adjusted_load should have expected values', function() {	 
			expect( mockDataAfter.days[0].adjusted_load.value ).toBe( 11.676 );
			expect( mockDataAfter.days[0].adjusted_load.perc ).toBe( .4253046071209938 );
			expect( mockDataAfter.days[0].adjusted_load.color ).toBe( '#1f4748' );
			expect( mockDataAfterMeasure.days[0].adjusted_load.measure ).toBe( 'kWh' );
		});

	});

	describe('dataService sortChildObjectsByProp', function(){
		
		var dataService, mockDataAfter,
		mockDataBefore = [
			{"background":"#3e7181","value":14.389,"title":"14.389 kWh"},
			{"background":"#3c6f86","value":16.154,"title":"16.154 kWh"},
			{"background":"#5e9141","value":-12.589,"title":"-12.589 kWh"},
			{"background":"#4a7d69","value":4.136,"title":"4.136 kWh"},
			{"background":"#588b4e","value":-7.095,"title":"-7.095 kWh"},
			{"background":"#5e9141","value":-12.78,"title":"-12.78 kWh"},
			{"background":"#386b8e","value":19.792,"title":"19.792 kWh"},
			{"background":"#50835e","value":-0.555,"title":"-0.555 kWh"},
			{"background":"#649736","value":-17.163,"title":"-17.163 kWh"},
			{"background":"#598c4b","value":-8.44,"title":"-8.44 kWh"},
			{"background":"#5a8d4a","value":-8.795,"title":"-8.795 kWh"},
			{"background":"#538657","value":-3.543,"title":"-3.543 kWh"},
			{"background":"#3c6f85","value":16.032,"title":"16.032 kWh"},
			{"background":"#437677","value":9.9,"title":"9.9 kWh"},
			{"background":"#3d7083","value":15.051,"title":"15.051 kWh"},
			{"background":"#356894","value":22.397,"title":"22.397 kWh"},
			{"background":"#477a70","value":7.253,"title":"7.253 kWh"},
			{"background":"#4e8162","value":1.31,"title":"1.31 kWh"},
			{"background":"#558853","value":-5.114,"title":"-5.114 kWh"},
			{"background":"#659834","value":-18.034,"title":"-18.034 kWh"},
			{"background":"#558854","value":-4.861,"title":"-4.861 kWh"},
			{"background":"#5c8f46","value":-10.535,"title":"-10.535 kWh"},
			{"background":"#477a6f","value":6.811,"title":"6.811 kWh"},
			{"background":"#386b8e","value":19.498,"title":"19.498 kWh"},
			{"background":"#346795","value":22.699,"title":"22.699 kWh"},
			{"background":"#669933","value":-18.723,"title":"-18.723 kWh"},
			{"background":"#497c6b","value":5.111,"title":"5.111 kWh"},
			{"background":"#598c4c","value":-7.823,"title":"-7.823 kWh"},
			{"background":"#336699","value":24.09,"title":"24.09 kWh"}];

		beforeEach(inject(function(_dataService_) {
			dataService = _dataService_;
			mockDataAfter = dataService.sortChildObjectsByProp( 'value', mockDataBefore );
		}));

		describe('first value in array', function(){
			
			it('after sort should be -18.723', function() {	 
				expect( mockDataAfter[0].value ).toBe( -18.723 );
			});
		});
		describe('last value in array', function(){
			
			it('after sort should be 24.09', function() {	 
				expect( mockDataAfter[ mockDataAfter.length-1 ].value ).toBe( 24.09 );
			});
		});

	});

	// need to test promise of a promise, not sure how...
  	xdescribe('dataProvider', function(){

			var metadataService, dataProvider, $httpBackend, routeParams;
			var promiseResult;

			beforeEach(inject(function(_$httpBackend_, _dataProvider_, _metadataService_) {
				
				$httpBackend = _$httpBackend_;
				metadataService = _metadataService_;
				//$httpBackend.expectGET('phones/xyz.json').respond(xyzPhoneData());
				routeParams = { view : 'summary' };
				
				dataProvider = _dataProvider_;
				dataProvider.getMonthlyData( routeParams ).then(function (result) {
					promiseResult = result;
				});
			}));

			it('should getMetadata when asofDate is false', function() { 
				$httpBackend.flush();
				expect( promiseResult ).toBe( 'loaded' );
			});

	});
  
});
