'use strict';

/* Directives */

/* global angular */
/* global moment */
/* global chroma */
/* jshint globalstrict : true */

angular.module('myApp.directives', []).

	directive( 'netCalendar', [ 'dataService', function ( dataService ) {
		return {
			restrict : 'A',
			template : 
				"<div class='table-responsive''>" +
				"<table class='table'>" +
				"<caption>" +
					'<a id="back" href="" ng-class="{ calnav : true, nogo : backstop }" ng-click="onMonthChange( { direction : changeMonth( -1 ) } )">&#9664;</a> ' + 
					'{{ calendar.days[0].date | date:"MMMM" }} {{ calendar.days[0].date | date:"yyyy" }} ' +
					'<a id="next" href="" ng-class="{ calnav : true, nogo : nextstop }" ng-click="onMonthChange( { direction : changeMonth( 1 ) } )">&#9654;</a>' +
				'</caption>' +
				'<tr ng-repeat="week in month" >' + 
					'<td ng-repeat="day in week" ng-click="onSelectDate( { date : selectDate( day.index ) } )" class="{{day.class}}" ng-style="{{day.style}}" title={{day.title}}>' +
						'<span class="day">{{day.date}}</span>' +
					'</td>' +
				'</tr>' +
				'</table>' +
				'</div>' +
				'<table id="legend">' + 
					'<tr>' +
						'<td class="heat" ng-repeat="color in colors" ng-style="{{color}}" title={{color.title}}>' +
					'</td>' +
				'</table>' +
				'<p id="range">' +
					'<span id="low-range">{{rangeLow}}</span><span id="high-range">{{rangeHigh}}</span>' + 
				'</p>',
			scope : {
				calendar : '=',
				view : '=',
				selectedDate : '=chartDate',
				onMonthChange : '&',
				onSelectDate : '&'
			},
			transclude : false,
			link : function ( scope, elem, attrs ) {
				
				scope.chartDate = moment( scope.selectedDate, 'YYYY-MM-DD' );
				scope.nextstop = false;
				scope.backstop = false;
				
				scope.selectDate = function ( index ) {
					// reset last selection
					scope.month[ scope.selected[0] ][ scope.selected[1] ].class = "calday";
					// set new selection
					scope.month[ index[0] ][ index[1] ].class = "calday selected";

					scope.selected = [ index[0], index[1] ];
					// get date
					scope.chartDate = scope.chartDate.date( scope.month[ index[0] ][ index[1] ].date );
					// not sure why I have to return this to be called from template, ugh.
					return scope.chartDate.format( 'YYYY-MM-DD' );
				};
				
				scope.changeMonth = function ( direction ) {
					
					var month, check;
					
					if ( direction > 0 ) {

						month = scope.chartDate.add( 1, 'M' );
					}
					else {

						month = scope.chartDate.subtract( 1, 'M' );
					}						
					return month.format( 'YYYY-MM-DD' );
				};

				scope.$watch ( '[view, calendar, selectedDate]', function ( oldVal, newVal ) {
					
					if ( newVal ) {
						
						scope.chartDate = moment( scope.selectedDate, 'YYYY-MM-DD' );
						
						updateDates();
					}
				}, true);
				
				var updateDates = function () {

					var w, d, obj, classy, title, textColor,
					count = 0,
					dayCount = 1,
					colors = [],
					dim = moment( scope.calendar.days[0].date ).daysInMonth(),
					startDay = moment( scope.calendar.days[0].date ).day(); // 0 based index
					
					scope.month = [];
					
					for ( w = 0; w < 6; w++ ) {
						
						scope.month[ w ] = [];
						
						for ( d = 0; d < 7; d++ ) {
							
							if (( count >= startDay ) && ( dayCount <= dim )) {
								// add object with date, color, and hover value
								obj = scope.calendar.days[ dayCount - 1 ][ scope.view ];
								title = obj.value + ' ' + obj.measure;
								classy = 'calday';
								
								if ( dayCount == scope.chartDate.date() ) {
									scope.selected = [ w , d ];
									classy = classy + ' selected';
								}
								// change color of text if contrast is bad
								textColor = '#000000';
								if ( chroma.contrast( obj.color, textColor ) < 4.5 ) textColor = '#FFFFFF';
								
								scope.month[ w ][ d ] = { 
									date : dayCount, 
									class : classy, 
									style : { 'background' : obj.color, color : textColor },
									title : obj.value + ' ' + obj.measure,
									index : [ w, d ]
								};
								
								colors.push({ 
									background : obj.color, 
									value : obj.value, 
									title : title 
								});
								
								dayCount++;
							}
							else {
								// no-data
								scope.month[ w ][ d ] = { date : null, class : 'calday' };
							}
							count++;
						}
					}
					// for legend
					scope.colors = dataService.sortChildObjectsByProp ( 'value', colors ); 
					scope.rangeLow = scope.colors[0].title;
					scope.rangeHigh = scope.colors[ scope.colors.length - 1 ].title;
					
					activateMonthNav (); // enable/disable next back for month nav
				},

				activateMonthNav = function () {
					
					var check = scope.chartDate.clone(),
					endDate = moment( scope.calendar.range.endDate, 'YYYY-MM-DD' ),
					startDate = moment( scope.calendar.range.startDate, 'YYYY-MM-DD' );

					check.add( 1, 'M' );

					if ( check.isAfter( endDate ) ) {
						// hide next month button
						scope.nextstop = true;
					}
					else {
						
						scope.nextstop = false;
					}

					check.subtract( 2, 'M' );

					if ( check.isBefore( startDate ) ) {
						// hide previous month button
						scope.backstop = true;
					}
					else {
						scope.backstop = false;
					}
				};		
			}
		};
	}]);