/* global process */
// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

'use strict';

var path = require( 'path' );

module.exports = function( config ) {
  var projectFiles = require( './project-files' );




  // var configFiles = [].concat(
  //   projectFiles.components.main,
  //   projectFiles.build.scripts,
  //   projectFiles.build.tests
  // );

  var configFiles = [].concat(
    'node_modules/karma-babel-preprocessor/node_modules/babel-core/browser-polyfill.js',
    projectFiles.polyfills,
    projectFiles.components.main,
    'src/modules/**/*.js',
    'src/tests/**/*.js'
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
      'jasmine'
      // 'phantomjs-shim'
    ],

    reporters: [
      'mocha',
      'growl',
      'coverage'
    ],

    customPreprocessors: {
      babel_with_modules: {
        base: 'babel',
        options: {
          modules: 'system',
          moduleIds: true,
          moduleRoot: ''
        }
      },
      babel_no_modules: {
        base: 'babel',
        options: {
          modules: 'ignore'
        }
      }
    },

    preprocessors: {
      'src/modules/**/*': [ 'babel_with_modules' ],
      'src/tests/**/*': [ 'babel_no_modules' ]
    },

   babelPreprocessor: {
     options: {
       optional: [ 'es7.asyncFunctions' ],
       sourceRoot: process.cwd()
     }
   },

    mochaReporter: {
      output: 'autowatch'
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
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: [
      // 'Chrome_hidden'
      // 'Firefox'
      'PhantomJS2'
    ],

    customLaunchers: {
      Chrome_travis_ci: {
        base: 'Chrome',
        flags: [ '--no-sandbox' ]
      },
      Chrome_hidden: {
        base: 'ChromeCanary',
        flags: [ '--window-position=99999,99999', '--window-size=200,200' ]
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
