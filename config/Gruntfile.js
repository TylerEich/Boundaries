module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      karma: {
          unit: {
              options: {
                  // base path that will be used to resolve all patterns (eg. files, exclude)
                  basePath: '',

                  // frameworks to use
                  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
                  frameworks: ['jasmine'],


                  // list of files / patterns to load in the browser
                  files: [
                      'bower_components/angular/angular.js',
                      'bower_components/**/*.js',
                      'app/components/**/*!(Spec).js',
                      'mocks/*.js',
                      'app/components/**/*Spec.js'
                  ],


                  // list of files to exclude
                  exclude: [
                      '**/Gruntfile.js',
                      '**/*.min.js'
                  ],


                  // preprocess matching files before serving them to the browser
                  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
                  preprocessors: {
    
                  },


                  // test results reporter to use
                  // possible values: 'dots', 'progress'
                  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
                  reporters: ['progress'],
    
                  // web server port
                  port: 9876,


                  // enable / disable colors in the output (reporters and logs)
                  colors: true,


                  // level of logging
                  // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
                  logLevel: config.LOG_INFO,


                  // enable / disable watching file and executing tests whenever any file changes
                  autoWatch: true,


                  // start these browsers
                  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
                  browsers: ['ChromeCanary', 'Firefox'],


                  // Continuous Integration mode
                  // if true, Karma captures browsers, runs the tests and exits
                  singleRun: false
                }
          }
      },
      dist: {
        src: ['src/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
      options: {
        // options here to override JSHint defaults
        globals: {
          jQuery: true,
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['jshint', 'qunit']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');

  grunt.registerTask('test', ['jshint', 'qunit']);

  grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
};