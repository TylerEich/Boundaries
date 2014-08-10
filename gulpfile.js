'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect');

// Test files
var unitTestFiles = [
  'app/scripts/**/*Spec.js'
],

  // App files
  jsAppFiles = [
    'app/scripts/*/**.js',
    '!app/scripts/*/**Spec.js',
    'app/scripts/app.js'
  ],
  htmlAppFiles = [
    '!app/bower_components/**',
    'app/**/*.html'
  ],
  htmlViewFiles = [
    'app/views/*.html'
  ],
  styleAppFiles = [
    'app/styles/**/*.scss'
  ],

  // Build files
  traceurRuntime = 'app/bower_components/traceur-runtime/traceur-runtime.min.js',
  jsBuildFiles = [
    'build/scripts/*/**.js',
    '!build/scripts/*/**Spec.js',
    'build/scripts/app.js'
  ],
  unitTestBuildFiles = [
    'build/scripts/*/**/*Spec.js'
  ],
  // htmlBuildFiles = [
  //   'build/*.html',
  //   'build/views/*.min.html'
  // ],
  // viewBuildFiles = [
  // 'build/views/*.min.html'
  // ],
  styleBuildFiles = [
    'build/styles/**/*.min.css'
  ];

var karmaConfFiles = [
  'app/bower_components/angular/angular.js',
  'app/bower_components/angular-mocks/angular-mocks.js',
  'app/bower_components/angular-resource/angular-resource.js',
  'app/bower_components/angular-sanitize/angular-sanitize.js',
  'app/bower_components/angular-route/angular-route.js',
  'app/bower_components/ngstorage/ngStorage.js'
];

var karmaConf = {
  browsers: ['Firefox', 'Chrome'],
  frameworks: ['jasmine'],
  reporters: ['osx', 'dots'],
  logLevel: 'INFO',
  files: karmaConfFiles
};


// Tests

function test(watch, files, done) {
  watch = Boolean(watch);

  var karmaServer = require('karma').server;

  karmaConf.files = files;
  // karmaConf.autoWatch = watch;
  karmaConf.singleRun = !watch;

  karmaServer.start(karmaConf, done);
}

function clean(glob) {
  var gulpClean = require('gulp-clean');

  gulp.src(glob, {
    read: false
  })
    .pipe(gulpClean());
}
var tasks = {
  'test': test.bind(null, false, karmaConfFiles.concat(traceurRuntime, jsBuildFiles, unitTestBuildFiles)),
  'test:dist': test.bind(null, false, karmaConfFiles.concat('dist/script.min.js', unitTestBuildFiles)),
  'build:js': function() {
    var changed = require('gulp-changed'),
      gulpPrint = require('gulp-print'),
      traceur = require('gulp-traceur');

    return gulp.src(jsAppFiles, unitTestFiles)
      .pipe(gulpPrint())
      .pipe(changed('build/scripts'))
      .pipe(traceur({
        sourceMap: true
      }))
      .pipe(gulp.dest('build/scripts'));
  },
  'build:css': function() {
    var changed = require('gulp-changed'),
      sass = require('gulp-sass'),
      prefix = require('gulp-autoprefixer'),
      rename = require('gulp-rename');

    return gulp.src(styleAppFiles)
      .pipe(changed('build/styles', {
        extension: '.min.css'
      }))
      .pipe(sass({
        outputStyle: 'compressed',
        errLogToConsole: true
      }))
      .pipe(prefix('last 2 versions'))
      .pipe(rename({
        suffix: '.min'
      }))
      .pipe(gulp.dest('build/styles'));
  },
  'build:html': function() {
    var changed = require('gulp-changed'),
      htmlmin = require('gulp-htmlmin'),
      filesize = require('gulp-filesize'),
      replace = require('gulp-replace'),
      inject = require('gulp-inject');

    return gulp.src('app/index.html')
      .pipe(replace('app/', '/app/'))
      .pipe(inject(gulp.src(traceurRuntime, {
        read: false
      }), {
        addRootSlash: true
      }))
      .pipe(inject(gulp.src(jsBuildFiles, {
        read: false
      }), {
        addRootSlash: true
      }))
      .pipe(inject(gulp.src(styleBuildFiles, {
        read: false,
      }), {
        addRootSlash: true
      }))
      .pipe(gulp.dest('build'));
  },
  'clean:css': clean.bind(null, 'build/styles/*'),
  'clean:js': clean.bind(null, 'build/scripts/**/*'),
  'dist:css': function() {
    var concat = require('gulp-concat');

    return gulp.src(styleBuildFiles)
      .pipe(concat('style.min.css'))
      .pipe(gulp.dest('dist'));
  },
  'dist:js': function() {
    var util = require('util'),
      ngAnnotate = require('gulp-ng-annotate'),
      uglify = require('gulp-uglify'),
      filesize = require('gulp-filesize'),
      concat = require('gulp-concat'),
      insert = require('gulp-insert');

    var pkg = require('./package.json'),
      copyright = util.format('/*\n %s v%s\n (c) 2013-%s %s %s\n License: %s\n*/\n',
        pkg.name,
        pkg.version,
        new Date().getFullYear(),
        pkg.author,
        pkg.homepage,
        pkg.license);

    return gulp.src(jsBuildFiles)
      .pipe(concat('script.min.js'))
      .pipe(ngAnnotate())
      .pipe(uglify())
      .pipe(insert.prepend(copyright))
      .pipe(gulp.dest('dist'))
      .pipe(filesize());
  },
  'dist:html': function() {
    var googleCdn = require('gulp-google-cdn'),
      extend = require('util')._extend,
      changed = require('gulp-changed'),
      htmlmin = require('gulp-htmlmin'),
      filesize = require('gulp-filesize'),
      replace = require('gulp-replace'),
      inject = require('gulp-inject');

    return gulp.src('app/index.html')
      .pipe(inject(gulp.src(traceurRuntime, {
        read: false
      }), {
        addRootSlash: false
      }))
      .pipe(inject(gulp.src('dist/script.min.js', {
        read: false
      }), {
        addRootSlash: false
      }))
      .pipe(inject(gulp.src('dist/style.min.css', {
        read: false,
      }), {
        addRootSlash: false
      }))
      // .pipe(googleCdn(require('./bower.json'), {
      //   componentsPath: 'app/bower_components',
      //   cdn: extend(require('cdnjs-cdn-data'), require('google-cdn-data'))
      // }))
      .pipe(gulp.dest('.'));
  }
};

gulp.task('test', tasks['test']);
gulp.task('test:dist', ['dist:js'], tasks['test:dist']);

// Build tasks
gulp.task('build', ['build:html', 'test']);
gulp.task('build:js', tasks['build:js']);
gulp.task('build:css', tasks['build:css']);
gulp.task('build:html', ['build:js', 'build:css'], tasks['build:html']);

// Clean tasks
gulp.task('clean', ['clean:css', 'clean:js']);
gulp.task('clean:css', tasks['clean:css']);
gulp.task('clean:js', tasks['clean:js']);

// Distribution tasks
gulp.task('dist', ['dist:html']);
gulp.task('dist:html', ['build:html', 'dist:css', 'dist:js'], tasks['dist:html']);
gulp.task('dist:css', ['clean:css', 'build:css'], tasks['dist:css']);
gulp.task('dist:js', ['clean:js', 'build:js'], tasks['dist:js']);

// Server
gulp.task('server', ['build:html'], function() {
  var openUrl = require('gulp-open');

  connect.server({
    root: [__dirname],
    livereload: true
  });

  gulp.src('build/index.html')
    .pipe(openUrl('', {
      url: 'http://localhost:8080/build/',
      app: 'Google Chrome'
    }))
    .pipe(openUrl('', {
      url: 'http://localhost:8080/build/',
      app: 'Firefox'
    }));
});
gulp.task('server:dist', ['dist:html'], function() {
  var openUrl = require('gulp-open');

  connect.server({
    root: [__dirname],
    livereload: true
  });

  gulp.src('index.html')
    .pipe(openUrl('', {
      url: 'http://localhost:8080/',
      app: 'Google Chrome'
    }))
    .pipe(openUrl('', {
      url: 'http://localhost:8080/',
      app: 'Firefox'
    }));
});

// Default
gulp.task('default', ['server'], function() {
  gulp.watch('app/**/*', ['build:html']);

  gulp.watch('app/**').on('change', function(file) {
    gulp.src(file.path)
      .pipe(connect.reload());
  });
  gulp.watch('build/**').on('change', function(file) {
    gulp.src(file.path)
      .pipe(connect.reload());
  });
});
