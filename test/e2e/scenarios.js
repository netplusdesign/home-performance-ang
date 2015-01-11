'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('my app', function() {

	describe('yearly', function() {
	
		describe('yearly summary view', function() {
	
			beforeEach(function() {
				browser.get('#/yearly/summary');
			});
	
			it('should render summary when user navigates to /yearly/summary', function() {
				expect(element(by.id('summary')).isPresent()).toBe(true);
			});
	
			it('should select summary when user navigates to /summary', function() {
				expect(element(by.model('viewSelection.view')).getAttribute('value')).toMatch(/summary/);
			});
		});
	});

	describe('monthly', function() {

		describe('monthly summary view', function() {
		
			beforeEach(function() {
				browser.get('');
			});	
		
			it('should automatically redirect to /yearly/summary when location hash/fragment is empty', function() {
				browser.getLocationAbsUrl().then(function(url) {
					expect(url.split('#')[1]).toBe('/yearly/summary');
				});
			});
		});
	
		describe('monthly summary view', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/summary');
			});
	
			it('should render summary when user navigates to /summary', function() {
				expect(element(by.id('summary')).isPresent()).toBe(true);
			});
	
			it('should select summary when user navigates to /summary', function() {
				expect(element(by.model('viewSelection.view')).getAttribute('value')).toMatch(/summary/);
			});
		});
	
		describe('monthly summary year 2013', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/summary?date=2013-12-31');
			});
	
			it('should select 2013 when year option = 2013', function() {
				expect(element(by.model('yearFilter.year')).getAttribute('value')).toMatch(/2013/);
			});
		});
	
		describe('monthly summary year 2012', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/summary?date=2012-12-31');
			});
	
			it('should select 2012 when year option = 2012', function() {
				expect(element(by.model('yearFilter.year')).getAttribute('value')).toMatch(/2012/);
			});
		});
	
		describe('monthly summary date missing', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/summary');
			});
	
			it('should display last available year = 2013', function() {
				// change to 2013 if using 2013 test dev db
				expect(element(by.model('yearFilter.year')).getAttribute('value')).toMatch(/2013/);
			});
		});
	
		describe('monthly summary date in future', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/summary?date=2015-01-01');
			});
	
			it('should display ?', function() {
				expect(element(by.model('yearFilter.year')).getAttribute('value')).toMatch(/\?/); 
			});
	    
			it('should show expected warning message', function() {
				expect(element(by.binding('message')).getText()).toBe("Oops, you've asked for a house or year that I can't find.");
			});
		});
	
		describe('monthly generation view', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/generation');
			});

			it('should render generation when user navigates to /generation', function() {
				expect(element(by.id('generation')).isPresent()).toBe(true);
			});
	    
			it('should select generation when user navigates to /generation', function() {
				expect(element(by.model('viewSelection.view')).getAttribute('value')).toMatch(/generation/);
			});
		});
	  
		describe('monthly usage happy path', function() {

			beforeEach(function() {
				browser.get('#/monthly/usage?date=2012-12-31');
			});
	
			it('should render summary when user navigates to /summary', function() {
				expect(element(by.id('usage')).isPresent()).toBe(true);
			});

			it('should render 8 circuits + 1 total row for 9 rows when viewing 2012 data', function() {
				expect(element.all(by.repeater('circuit in data.circuits')).count()).toBe(9);
			});
	    
			it('should not display note 2', function() {
				element.all(by.css('.list-unstyled')).then(function(notes) {
					expect(notes.length).toBe(1);
					expect(notes[0].getText()).toBe('1. Circuit level data starts March 16, 2012');
				});
			}); 
		});
	
		describe('monthly usage date missing', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/usage');
			});
	
			it('should not render warning message when date not present', function() {
				expect(element(by.binding('message')).getText()).toBe("");
			});
			// should default to latest year test here...
		});
	
		describe('monthly usage/ashp date missing', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/usage/ashp');
			});
	
			it('should render usage when user navigates to /usage/ashp', function() {
				expect(element(by.id('ashp')).isPresent()).toBe(true);
			});
	
			it('should not display warning message if date is missing', function() {
				expect(element(by.binding('message')).getText()).toBe("");
			});
		});
	
		describe('monthly usage/ashp circuit view 2013', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/usage/ashp?date=2013-12-31');
			});
	
			it('should render 12 months of data when viewing 2013 data', function() {
				expect(element.all(by.repeater('month in data.months')).count()).toBe(12);
			});
	
			it('should NOT display note 1', function() {
				element.all(by.css('.list-unstyled')).then(function(notes) {
					expect(notes.length).toBe(1);
					expect(notes[0].getText()).toBe('2. Projected kWh = 0.2261 x HDD base 50°F \+ 0.7565');
				});
			});    
		});
	
		describe('monthly usage/ashp circuit view 2012', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/usage/ashp?date=2012-12-31');
			});
	
			it('should render 10 months of data when viewing 2012 data', function() {
				expect(element.all(by.repeater('month in data.months')).count()).toBe(10);
			});
	
			it('should display note 1', function() {
				element.all(by.css('.list-unstyled li')).then(function(notes) {
					expect(notes.length).toBe(2);
					expect(notes[0].getText()).toBe('1. Circuit level data starts March 16, 2012');
					expect(notes[1].getText()).toBe('2. Projected kWh = 0.2261 x HDD base 50°F \+ 0.7565');
				});
			});
	
		});
	
		describe('monthly usage circuit view', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/usage/ashp?date=2013-12-31');
				// select year 2012
				element(by.cssContainingText('option', '2012')).click();
			});
	
			it('should stay on ashp circuit page when year selector changed to 2012', function() {
				browser.getLocationAbsUrl().then(function(url) {
					var path = url.split('#')[1].split('?');
					var search = path[1].split('date=')[1];
					expect(path[0]).toBe('/monthly/usage/ashp');
					expect(search).toBe('2012-12-31');
				});
			});
	
			it('should render 2012 data when year selector changed to 2012', function() {
				expect(element.all(by.repeater('month in data.months')).count()).toBe(10);
			});
	
			it('should display note 1', function() {
				element.all(by.css('.list-unstyled li')).then(function(notes) {
					expect(notes.length).toBe(2);
					expect(notes[0].getText()).toBe('1. Circuit level data starts March 16, 2012');
					expect(notes[1].getText()).toBe('2. Projected kWh = 0.2261 x HDD base 50°F \+ 0.7565');
				});
			});
		});
	
		describe('monthly HDD 2012', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/hdd?date=2012-12-31');
			});
	
			it('should render hdd when user navigates to /hdd', function() {
				expect(element(by.id('hdd')).isPresent()).toBe(true);
			});
	    
			it('should display <span> for note 2', function() {
				element.all(by.css('.small li')).then(function(notes) {
					expect(notes.length).toBe(3);
					expect(notes[0].getText()).toBe('Square footage = 1727.25, interior gross area (incl. basement)');
					expect(notes[1].getText()).toBe('Excludes May-Sept values. Year 2012 also excludes Jan 1 - Mar 15 to match start of circuit data for ASHP.');
					expect(notes[2].getText()).toBe('Conversion from kWh');
				});
			}); 
		});
	
		describe('monthly HDD 2013', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/hdd?date=2013-12-31');
			});
	
			it('should render hdd when user navigates to /hdd', function() {
				expect(element(by.id('hdd')).isPresent()).toBe(true);
			});
	    
			it('should NOT display <span> for note 2', function() {
				// expect(element('p.notes').text()).not().toMatch(/Year 2012 also excludes Jan 1 - Mar 15 to match start of circuit data for ASHP./);
				element.all(by.css('.small li')).then(function(notes) {
					expect(notes.length).toBe(3);
					expect(notes[0].getText()).toBe('Square footage = 1727.25, interior gross area (incl. basement)');
					expect(notes[1].getText()).toBe('Excludes May-Sept values');
					expect(notes[2].getText()).toBe('Conversion from kWh');
				});
			}); 	
		});
	
		describe('monthly Water 2012', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/water?date=2012-12-31');
			});
	
			it('should render water when user navigates to /water', function() {
				expect(element(by.id('water')).isPresent()).toBe(true);
			});
	    
			it('should display note 1', function() {
				element.all(by.css('.small')).then(function(notes) {
					expect(notes.length).toBe(1);
					expect(notes[0].getText()).toBe('Circuit level data starts March 16, 2012');
				});
			}); 
		});
	
		describe('monthly Water 2013', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/water?date=2013-12-31');
			});
	
			it('should render water when user navigates to /water', function() {
				expect(element(by.id('water')).isPresent()).toBe(true);
			});
	    
			it('should NOT display note 1', function() {
				element.all(by.css('.small')).then(function(notes) {
					expect(notes.length).toBe(0);
				});
			}); 
		});
	
		describe('monthly Basetemp 2013 no params', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/basetemp');
			});
	    
			it('should show /months/ selected', function() {
				expect(element(by.css('input[name="period"]:checked')).getAttribute('value')).toBe('months');
			});
	
			it('should display /65/ in the base temp text field', function() {
				expect(element(by.css('input[type="text"]')).getAttribute('value')).toBe('65');
			});
		});
	
		describe('monthly Basetemp 2013 with params', function() {
	
			beforeEach(function() {
				browser.get('#/monthly/basetemp?date=2013-12-31&base=55&period=days');
			});
	    
			it('should show /days/ selected', function() {
				expect(element(by.css('input[name="period"]:checked')).getAttribute('value')).toBe('days');
			});
	
			it('should display /55/ in the base temp text field', function() {
				expect(element(by.css('input[type="text"]')).getAttribute('value')).toBe('55');
			});
		});
	});

	// daily views
	describe('daily', function() {
		
		describe('netusage at end of date range', function() {
	
			beforeEach(function() {
				browser.get('#/daily/netusage?date=2013-12-26');
			});
	
			it('should render daily when user navigates to /daily/netusage', function() {
				expect(element(by.id('daily')).isPresent()).toBe(true);
				expect(element(by.css('caption')).getText()).toMatch(/December 2013/);
			});
	
			it('should not display the next month nav arrow', function() {
				expect(element(by.id('back')).isDisplayed()).toBe(true);
				//expect(element(by.id('next')).isDisplayed()).toBe(false);
			});
			
			it('should display 40.778 kWh for the span#high-range', function() {
				expect(element(by.id('high-range')).getText()).toBe('40.778 kWh');
			});
		});
		
		describe('netusage at start of date range', function() {
	
			beforeEach(function() {
				browser.get('#/daily/netusage?date=2012-02-26');
			});

			it('should render daily when user navigates to /daily/netusage', function() {
				expect(element(by.css('caption')).getText()).toMatch(/February 2012/);
			});
	
			it('should not display the prev month nav arrow', function() {
				expect(element(by.id('back')).isDisplayed()).toBe(false);
				expect(element(by.id('next')).isDisplayed()).toBe(true);
			});
			
			it('should display 24.09 kWh for the span#high-range', function() {
				expect(element(by.id('high-range')).getText()).toBe('24.09 kWh');
			});
		});
		
	});

});
