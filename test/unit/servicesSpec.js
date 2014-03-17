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
		
		describe('before setMetaData()', function(){
			var metadataService;

			beforeEach(inject(function(_metadataService_) {
				metadataService = _metadataService_;
				//metadataService.setMetaData({"years":["2012","2013"],"asof":"2013-12-31","house":"Up Hill House"});
			}));
			
			it('data.chartDate should be false', function() {
				expect( metadataService.data.chartDate ).toBe( false );
			});

		});

		describe('setMetaData()', function(){
			var metadataService;

			beforeEach(inject(function(_metadataService_) {
				metadataService = _metadataService_;
				metadataService.setMetaData({"years":["2012","2013"],"asof":"2013-12-31","house":"Up Hill House"});
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
				metadataService.setMetaData({"years":["2012","2013"],"asof":"2013-12-31","house":"Up Hill House"});
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
			},
			setParams : function() {}
		};
				
		var mockDataSumBefore = {"totals":{"used":"7206.154","solar":"-8574.577","net":"-1368.423","hdd":"6810.250"},"months":[{"date":"2013-01-01","used":"880.949","solar":"-478.374","net":"402.575","hdd":"1188.596"},{"date":"2013-02-01","used":"811.571","solar":"-449.081","net":"362.490","hdd":"1066.626"},{"date":"2013-03-01","used":"806.205","solar":"-618.374","net":"187.831","hdd":"982.966"},{"date":"2013-04-01","used":"527.707","solar":"-919.527","net":"-391.820","hdd":"571.167"},{"date":"2013-05-01","used":"529.269","solar":"-903.916","net":"-374.647","hdd":"232.213"},{"date":"2013-06-01","used":"411.362","solar":"-802.487","net":"-391.125","hdd":"103.059"},{"date":"2013-07-01","used":"383.589","solar":"-929.168","net":"-545.579","hdd":"18.478"},{"date":"2013-08-01","used":"446.655","solar":"-960.804","net":"-514.149","hdd":"58.028"},{"date":"2013-09-01","used":"452.088","solar":"-936.330","net":"-484.242","hdd":"218.072"},{"date":"2013-10-01","used":"482.340","solar":"-674.075","net":"-191.735","hdd":"404.790"},{"date":"2013-11-01","used":"558.689","solar":"-639.284","net":"-80.595","hdd":"837.642"},{"date":"2013-12-01","used":"915.730","solar":"-263.157","net":"652.573","hdd":"1128.613"}]};
		var mockDataSumAfter  = {"totals":{"used":"7206.154","solar":"-8574.577","net":"-1368.423","hdd":"6810.250","adu":19.74288767123288},"months":[{"date":"2013-01-01","used":"880.949","solar":"-478.374","net":"402.575","hdd":"1188.596","adu":28.417709677419353},{"date":"2013-02-01","used":"811.571","solar":"-449.081","net":"362.490","hdd":"1066.626","adu":28.98467857142857},{"date":"2013-03-01","used":"806.205","solar":"-618.374","net":"187.831","hdd":"982.966","adu":26.006612903225808},{"date":"2013-04-01","used":"527.707","solar":"-919.527","net":"-391.820","hdd":"571.167","adu":17.590233333333334},{"date":"2013-05-01","used":"529.269","solar":"-903.916","net":"-374.647","hdd":"232.213","adu":17.073193548387096},{"date":"2013-06-01","used":"411.362","solar":"-802.487","net":"-391.125","hdd":"103.059","adu":13.712066666666667},{"date":"2013-07-01","used":"383.589","solar":"-929.168","net":"-545.579","hdd":"18.478","adu":12.37383870967742},{"date":"2013-08-01","used":"446.655","solar":"-960.804","net":"-514.149","hdd":"58.028","adu":14.408225806451613},{"date":"2013-09-01","used":"452.088","solar":"-936.330","net":"-484.242","hdd":"218.072","adu":15.069600000000001},{"date":"2013-10-01","used":"482.340","solar":"-674.075","net":"-191.735","hdd":"404.790","adu":15.559354838709677},{"date":"2013-11-01","used":"558.689","solar":"-639.284","net":"-80.595","hdd":"837.642","adu":18.622966666666667},{"date":"2013-12-01","used":"915.730","solar":"-263.157","net":"652.573","hdd":"1128.613","adu":29.539677419354838}]};

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
			},
			setParams : function() {}
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
	
	// need to test promise, like with SummaryCtrl
  	xdescribe('dataProvider', function(){

			var metadataService, dataProvider, $httpBackend;
			var promiseResult;

			beforeEach(inject(function(_metadataService_, _$httpBackend_, _dataProvider_) {
				metadataService = _metadataService_;
				metadataService.setParams('0','2013-02-28','summary');
				$httpBackend = _$httpBackend_;
				//$httpBackend.expectGET('phones/xyz.json').respond(xyzPhoneData());
				
				dataProvider = _dataProvider_;
				dataProvider.getData("summary").then(function (result) {
					promiseResult = result;
				});
			}));

			it('should equal test data', function() { 
				$httpBackend.flush();
				expect( promiseResult ).toBe( 'loaded' );
			});

	});
  
});
