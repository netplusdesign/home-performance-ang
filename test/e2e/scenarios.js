'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */
// cp scenarios.js ~/Sites/charting-performance-ang/test/e2e

describe('my app', function() {

	describe('monthly', function() {

		describe('monthly summary view', function() {
		
			beforeEach(function() {
				browser().navigateTo('../../index.html');
			});	
		
			it('should automatically redirect to /summary when location hash/fragment is empty', function() {
				expect(browser().location().url()).toBe("/monthly/summary");
			});
		});
	
		describe('monthly summary view', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/summary');
			});
	
			it('should render summary when user navigates to /summary', function() {
				expect(element('[ng-view] table#summary').count()).toEqual(1);
			});
	
			it('should select summary when user navigates to /summary', function() {
				expect(element('select#view').val()).toMatch(/summary/);
			});
		});
	
		describe('monthly summary year 2013', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/summary?date=2013-12-31');
			});
	
			it('should select 2013 when year option = 2013', function() {
				expect(element('select#year').val()).toMatch(/2013/);
			});
		});
	
		describe('monthly summary year 2012', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/summary?date=2012-12-31');
			});
	
			it('should select 2012 when year option = 2012', function() {
				expect(element('select#year').val()).toMatch(/2012/);
			});
		});
	
		describe('monthly summary date missing', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/summary');
			});
	
			xit('should display last available year = 2013', function() {
				// works in browser, but not in test... asynch problem?
				expect(element('select#year').val()).toMatch(/2013/);
			});
		});
	
		describe('monthly summary date in future', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/summary?date=2014-12-31');
			});
	
			it('should display ?', function() {
				expect(element('select#year').val()).toMatch(/\?/);
			});
	    
			it('should show expected warning message', function() {
				expect(element('[ng-view] p.warning').text()).toMatch(/Oops, you've asked for a house or year that I can't find./);
			});
		});
	
		describe('monthly generation view', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/generation');
			});

			it('should render generation when user navigates to /generation', function() {
				expect(element('[ng-view] table#generation').count()).toEqual(1);
			});
	    
			it('should select generation when user navigates to /generation', function() {
				expect(element('select#view').val()).toMatch(/generation/);
			});
		});
	  
		describe('monthly usage happy path', function() {

			beforeEach(function() {
				browser().navigateTo('#/monthly/usage?date=2012-12-31');
			});
	
			it('should render summary when user navigates to /summary', function() {
				expect(element('[ng-view] table#usage').count()).toBe(1);
			});

			it('should render 10 rows of data when viewing 2012 data', function() {
				expect(element('tr').count()).toBe(10);
			});
	    
			it('should not display note 2', function() {
				expect(element('p.notes').text()).not().toMatch(/2. Projected kWh = 0.2261 x HDD base 50°F + 0.7565/);
			}); 
		});
	
		describe('monthly usage date missing', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/usage');
			});
	
			it('should not render warning message when date not present', function() {
				expect(element('[ng-view] p.warning').count()).toEqual(0);
			});
			// should default to latest year test here...
		});
	
		describe('monthly usage/ashp date missing', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/usage/ashp');
			});
	
			it('should render usage when user navigates to /usage/ashp', function() {
				expect(element('[ng-view] table#ashp').count()).toEqual(1);
			});
	
			it('should not display warning message if date is missing', function() {
				expect(element('[ng-view] p.warning').count()).toEqual(0);
			});
		});
	
		describe('monthly usage/ashp circuit view 2013', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/usage/ashp?date=2013-12-31');
			});
	
			it('should render 14 rows of data when viewing 2013 data', function() {
				expect(element('tr').count()).toBe(14);
			});
	
			it('should NOT display note 1', function() {
				expect(element('p.notes').text()).not().toMatch(/1. Circuit level data starts March 16, 2012/);
			});    
		});
	
		describe('monthly usage/ashp circuit view 2012', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/usage/ashp?date=2012-12-31');
			});
	
			it('should render 12 rows of data when viewing 2012 data', function() {
				expect(element('tr').count()).toBe(12);
			});
	
			it('should display note 1', function() {
				expect(element('p.notes').text()).toMatch(/1. Circuit level data starts March 16, 2012/);
			});
	
			it('should display note 2', function() {
				expect(element('p.notes').text()).toMatch(/2. Projected kWh = 0.2261 x HDD base 50°F \+ 0.7565/);
			}); 
		});
	
		xdescribe('monthly usage circuit view', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/usage/ashp?date=2013-12-31');
				// select year 2012
				select("yearFilter.year").option('2012');
			});
	
			// these tests don't seem to be running, it pauses after changing the year.
			it('should stay on ashp circuit page when year selector changed to 2012', function() {
				expect( browser().location().path() ).toEqual("/usage/ashp");
				expect( browser().location().search() ).toEqual("2012-12-31");
			});
	
			it('should render 2012 data when year selector changed to 2012', function() {
				expect('tr').count().toEqual(12);
			});
	
			it('should display note 1', function() {
				expect(element('p.notes').text()).toMatch("1. Circuit level data starts March 16, 2012");
			});
		});
	
		describe('monthly HDD 2012', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/hdd?date=2012-12-31');
			});
	
			it('should render hdd when user navigates to /hdd', function() {
				expect(element('[ng-view] table#hdd').count()).toBe(1);
			});
	    
			it('should display <span> for note 2', function() {
				expect(element('p.notes').text()).toMatch(/Year 2012 also excludes Jan 1 - Mar 15 to match start of circuit data for ASHP./);
			}); 
		});
	
		describe('monthly HDD 2013', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/hdd?date=2013-12-31');
			});
	
			it('should render hdd when user navigates to /hdd', function() {
				expect(element('[ng-view] table#hdd').count()).toBe(1);
			});
	    
			it('should NOT display <span> for note 2', function() {
				expect(element('p.notes').text()).not().toMatch(/Year 2012 also excludes Jan 1 - Mar 15 to match start of circuit data for ASHP./);
			}); 	
		});
	
		describe('monthly Water 2012', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/water?date=2012-12-31');
			});
	
			it('should render water when user navigates to /water', function() {
				expect(element('[ng-view] table#water').count()).toBe(1);
			});
	    
			it('should display note 1', function() {
				expect(element('p.notes').text()).toMatch("1. Circuit level data starts March 16, 2012");
			}); 
		});
	
		describe('monthly Water 2013', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/water?date=2013-12-31');
			});
	
			it('should render water when user navigates to /water', function() {
				expect(element('[ng-view] table#water').count()).toBe(1);
			});
	    
			it('should NOT display note 1', function() {
				expect(element('p.notes')).not().toBeDefined();
			}); 
		});
	
		describe('monthly Basetemp 2013 no params', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/basetemp');
			});
	
			it('should render basetemp with default values when user navigates to monthly/basetemp', function() {
				expect(element('[ng-view] p').text()).toMatch(/Regression Line/);
			});
	    
			it('should show /months/ selected', function() {
				// expect(input('options.period').val()).toMatch(/days/); 
				expect(element('input[name="period"]:checked').val()).toBe('months');
			});
	
			it('should display /65/ in the base temp text field', function() {
				expect(input('options.base').val()).toBe('65');
			});
		});
	
		describe('monthly Basetemp 2013 with params', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/monthly/basetemp?date=2013-12-31&base=55&period=days');
			});
	
			it('should render basetemp with default values when user navigates to monthly/basetemp', function() {
				expect(element('[ng-view] p').text()).toMatch(/Regression Line/);
			});
	    
			it('should show /days/ selected', function() {
				// expect(input('options.period').val()).toMatch(/days/); 
				expect(element('input[name="period"]:checked').val()).toBe('days');
			});
	
			it('should display /55/ in the base temp text field', function() {
				expect(input('options.base').val()).toBe('55');
			});
		});
	});

	// daily views
	describe('daily', function() {
		
		describe('netusage at end of date range', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/daily/netusage?date=2013-12-26');
			});
	
			it('should render daily when user navigates to /daily/netusage', function() {
				expect(element('div#daily').count()).toBe(1);
				expect(element('caption').text()).toContain('December 2013');
			});
	
			it('should not display the next month nav arrow', function() {
				expect(element('a#back').css('display')).toBe('inline');
				expect(element('a#next').css('display')).toBe('none');
			});
			
			it('should display 40.778 kWh for the span#high-range', function() {
				expect(element('span#high-range').text()).toContain('40.778 kWh');
			});
		});
		
		describe('netusage at start of date range', function() {
	
			beforeEach(function() {
				browser().navigateTo('#/daily/netusage?date=2012-02-26');
			});

			it('should render daily when user navigates to /daily/netusage', function() {
				expect(element('caption').text()).toContain('February 2012');
			});
	
			it('should not display the next month nav arrow', function() {
				expect(element('a#back').css('display')).toBe('none');
				expect(element('a#next').css('display')).toBe('inline');
			});
			
			it('should display 24.09 kWh for the span#high-range', function() {
				expect(element('span#high-range').text()).toContain('24.09 kWh');
			});
		});
		
	});

});
