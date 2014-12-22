/**
 * @author Larry Burks
 */

module.exports = function(grunt) {
  
	grunt.initConfig({
		devDest: '../../../Sites/charting-performance-ang/',
		gitDest: '../../home-performance-ang/',
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			my_target: {
				files: {
					'app/js/<%= pkg.name %>.min.js': ['app/js/app.js', 'app/js/controllers.js', 'app/js/services.js', 'app/js/filters.js', 'app/js/directives.js', 'bower_components/moment/moment.js', 'bower_components/chroma-js/chroma.js']
				}
			}
		},
		clean: { 
			dist: ['dist/'],
			dev: ['<%= devDest %>'],
			min: ['app/js/<%= pkg.name %>.min.js']
		},
		copy: {
			dist: {
				src: ['app/js/<%= pkg.name %>.min.js', 'app/data/*', 'app/partials/**', 'app/css/*'],
				dest: 'dist/'
			},
			test: {
				files : [
				{
					src: ['app/js/<%= pkg.name %>.min.js', 'app/js/standalone-framework.js', 'app/js/highcharts.js', 'app/data/*', 'app/partials/**', 'app/css/*', 'app/daily.html'],
					dest: '<%= devDest %>'
				},
				{
					src: 'test/**',
					dest: '<%= devDest %>'
				},
				{
					src: 'bower_components/angular/angular.js',
					dest: '<%= devDest %>app/lib/angular/angular.js' 
				},
				{
					src: 'bower_components/angular-route/angular-route.js',
					dest: '<%= devDest %>app/lib/angular/angular-route.js' 
				},
				{
					src: 'bower_components/angular-resource/angular-resource.js',
					dest: '<%= devDest %>app/lib/angular/angular-resource.js' 
				},
				{
					src: 'bower_components/highcharts/index.js',
					dest: '<%= devDest %>app/js/highcharts.js' 
				},
				{
					src: 'bower_components/highcharts-standalone-framework/index.js',
					dest: '<%= devDest %>app/js/standalone-framework.js' },
				{
					src: 'bower_components/moment/moment.js',
					dest: '<%= devDest %>app/js/moment.js' 
				} 
				]
			},
			dev: {
				files : [
				{
					src: ['app/js/*', 'app/data/*', 'app/partials/**', 'app/css/*', 'app/daily.html'],
					dest: '<%= devDest %>' 
				},
				{
					src: 'test/**',
					dest: '<%= devDest %>app/' 
				},
				{
					src: 'bower_components/angular/angular.js',
					dest: '<%= devDest %>app/lib/angular/angular.js' 
				},
				{
					src: 'bower_components/angular-route/angular-route.js',
					dest: '<%= devDest %>app/lib/angular/angular-route.js' 
				},
				{
					src: 'bower_components/angular-resource/angular-resource.js',
					dest: '<%= devDest %>app/lib/angular/angular-resource.js' 
				},
				{
					src: 'bower_components/highcharts/index.js',
					dest: '<%= devDest %>app/js/highcharts.js' 
				},
				{
					src: 'bower_components/highcharts-standalone-framework/index.js',
					dest: '<%= devDest %>app/js/standalone-framework.js' 
				},
				{
					src: 'bower_components/moment/moment.js',
					dest: '<%= devDest %>app/js/moment.js' 
				},
				{
					src: 'bower_components/chroma-js/chroma.js',
					dest: '<%= devDest %>app/js/chroma.js' 
				} 
				]
			},
			git: {
				src: [
					'README.md', 
					'LICENSE', 
					'package.json', 
					'bower.json', 
					'Gruntfile.js', 
					'test/**',
					'dist/**',
					'config/**',
					'scripts/**', 
					'app/js/app.js',
					'app/js/controllers.js',
					'app/js/services.js',
					'app/js/filters.js',
					'app/js/directives.js',
					'app/data/*', 
					'app/partials/**', 
					'app/css/*',
					'app/index.html'
				],
				dest: '../../home-performance-ang/'
			}
		},
		preprocess: {
			dist : {
				files: {
					'dist/app/index.html' : 'app/index.html',
					'dist/app/data/login.php' : 'app/data/login.php'
				},
				options: {
					context: {
						PROD: true
					}
				}
			},
			test : {
				files: {
					'<%= devDest %>app/index.html' : 'app/index.html',
					'<%= devDest %>app/data/login.php' : 'app/data/login.php'
				},
				options: {
					context: {
						TEST: true
					}
				}
			},
			dev : {
				files: {
					'<%= devDest %>app/index.html' : 'app/index.html',
					'<%= devDest %>app/data/login.php' : 'app/data/login.php'
				},
				options: {
					context: {
						DEV: true
					}
				}
			},
			git : {
				files: {
					//'<%= gitDest %>app/index.html' : 'app/index.html',
					'<%= gitDest %>app/data/login.php' : 'app/data/login.php',
					'<%= gitDest %>dist/app/index.html' : 'app/index.html',
					'<%= gitDest %>dist/app/data/login.php' : 'app/data/login.php'
				},
				options: {
					context: {
						GIT: true
					}
				}
			}
		}
	});

	// Load the plugins
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-preprocess');

	// Default task(s).
	grunt.registerTask('default', ['uglify']);

	// Defined tasks
	grunt.registerTask('dist', 
	[   'clean:dist',
		'uglify', 
		'copy:dist',
		'preprocess:dist',
		'clean:min'
	]);

	grunt.registerTask('test', 
	[   'clean:dev',
		'uglify',    
		'copy:test',
		'preprocess:test',
		'clean:min'
	]);

	grunt.registerTask('dev', 
	[   'clean:dev', 
		'copy:dev',
		'preprocess:dev',
		'clean:min'
	]);

	grunt.registerTask('git', 
	[   'clean:dist',
		'uglify', 
		'copy:dist',
		'preprocess:dist',
		'clean:min',
		'copy:git',
		'preprocess:git'
	]);

};