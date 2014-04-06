# charting-performance-ang

This project is a ground up rewrite of [home-performance-charting](https://github.com/netplusdesign/home-performance-charting) 
using [AngularJS](http://angularjs.org). 

All future development on the home perforance app will take place here.

## Progress

v0.2 Added daily and hourly views.  
v0.1 Currently, only the monthly views and charts are working. 

See working prototype at [netplusdesign](http://netplusdesign.com/app)

Next up, hourly charts are a bit slow. Need to update series data rather then destroy and recreate chart each time.

## Requires

* AngularJS
* Momentjs
* Highcharts
* Chroma

First get Node, Grunt and Bower.

Then clone this repo and run:

* bower install

Edit grunt file (devDest) path, then run:

* grunt dev

Database setup scripts can be found in the [home-performance-charting](https://github.com/netplusdesign/home-performance-charting) repo.