// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

'use strict';

module.exports = function( config ) {
  var projectFiles = require( './project-files' );




  var configFiles = [].concat(
    projectFiles.components.main,
    projectFiles.build.scripts,
    projectFiles.build.tests
  );




  var configuration = {
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // plugins: [
    //   'karma-chrome-launcher',
    //   'karma-jasmine',
    //   'karma-mocha-reporter'
    // ],

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: [
      'jasmine',
      'browserify'
    ],

    reporters: [
      'mocha',
      'growl',
      'coverage'
    ],

    preprocessors: {
      // 'build/scripts/**/*.js': [ 'coverage', 'browserify' ],
      // 'build/modules/**/*.js': [ 'coverage', 'browserify' ],
      'build/tests/**/*': [ 'browserify' ]
    },

    // browserify: {
    //   transform: [[ 'babelify', { optional: [ 'es7.asyncFunctions' ]} ]]
    // },

    mochaReporter: {
      output: 'minimal'
    },

    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
      subdir: '.'
    },

    // list of files / patterns to load in the browser
    files: configFiles,

    // web server port
    port: 8000,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_WARN,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      'Chrome'//,
      // 'PhantomJS'
    ],

    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: [ '--no-sandbox' ]
      }
    },

    // Timeout after 10 seconds
    captureTimeout: 10000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  };

  if ( process.env.TRAVIS ) {
    configuration.browsers = [
      'Chrome_travis_ci',
      'Firefox'
    ];

    configuration.reporters = [
      'mocha'
    ];
  }

  config.set( configuration );
};
