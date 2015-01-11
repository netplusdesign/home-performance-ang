# charting-performance-ang

This project is a ground up rewrite of [home-performance-charting](https://github.com/netplusdesign/home-performance-charting) 
using [AngularJS](http://angularjs.org). 

See working prototype at [netplusdesign](http://netplusdesign.com/app)

## Requires

* AngularJS
* Momentjs
* Highcharts
* Chroma

First get Node, Grunt and Bower.

Then clone this repo and run:

* npm install
* bower install

Edit grunt file (devDest) path, then run:

* grunt dev

Database setup scripts can be found in the [home-performance-charting](https://github.com/netplusdesign/home-performance-charting) repo.

## What's next

* A version using Twitter Bootstrap is almost done.
* Also currently working on a rewrite of the entire backend using Flask and SQLAlchemy to create a RESTful API.