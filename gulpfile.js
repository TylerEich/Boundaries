'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect');

// Test files
var unitTestFiles = [
  'app/scripts/**/*Spec.js'
],

  // App files
  jsAppFiles = [
    '!app/scripts/*/**/*Spec.js',
    'app/scripts/*/**/*.js',
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
  jsBuildFiles = [
    'build/scripts/**/*.min.js'
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



// Tests
gulp.task('test', function() {
  var karma = require('gulp-karma');

  return gulp.src(jsAppFiles.concat(unitTestFiles))
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'watch'
    }))
    .on('error', function(err) {
      throw err;
    });
});

gulp.task('test:once', function() {
  var karma = require('gulp-karma');

  return gulp.src(jsAppFiles.concat(unitTestFiles))
    .pipe(karma({
      configFile: 'karma.conf.js',
      action: 'run'
    }))
    .on('error', function(err) {
      throw err;
    });
});

// Build tasks
gulp.task('build', ['clean', 'test:once', 'build:css']);

gulp.task('build:css', function() {
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
});

gulp.task('build:html', ['build:css'], function() {
  var changed = require('gulp-changed'),
    htmlmin = require('gulp-htmlmin'),
    filesize = require('gulp-filesize'),
    replace = require('gulp-replace');

  var inject = require('gulp-inject');

  return gulp.src('./app/index.html')
    .pipe(inject(gulp.src(jsAppFiles, {
      read: false
    }), {
      addRootSlash: false,
      ignorePath: 'app/'
    }))
    .pipe(inject(gulp.src(styleBuildFiles, {
      read: false,
    }), {
      addRootSlash: false,
      addPrefix: '..'
    }))
    .pipe(gulp.dest('./app'));
});

// Clean tasks
gulp.task('clean', ['clean:css', 'clean:js']);

gulp.task('clean:css', function() {
  var clean = require('gulp-clean');

  gulp.src('build/styles/*', {
    read: false
  })
    .pipe(clean());
});

gulp.task('clean:js', function() {
  var clean = require('gulp-clean');

  gulp.src('build/scripts/*', {
    read: false
  })
    .pipe(clean());
});

// Distribution tasks
gulp.task('dist', ['dist:css', 'dist:js']);

gulp.task('dist:css', ['clean:css', 'build:css'], function() {
  var concat = require('gulp-concat');

  return gulp.src(styleBuildFiles)
    .pipe(concat('style.min.css'))
    .pipe(gulp.dest('dist'));
});

gulp.task('dist:js', ['clean:js', 'build:js'], function() {
  var util = require('util'),
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
    .pipe(insert.prepend(copyright))
    .pipe(filesize())
    .pipe(gulp.dest('dist'));
});

// Watch task
// gulp.task('server', function(next) {
//   var connect = require('connect'),
//     server = connect(),
//     http = require('http');
// 
//   server.use(connect.static('build'));
//   http.createServer(server).listen(process.env.PORT || 80, next);
// });


gulp.task('server', ['build:html'], function() {
  var openUrl = require('gulp-open');

  connect.server({
    root: [__dirname],
    livereload: true
  });
  
  gulp.src('app/index.html')
    .pipe(openUrl('', {
      url: 'http://localhost:8080/app',
      app: 'Google Chrome'
    }));
});

gulp.task('default', ['server'], function() {
  gulp.watch('app/**/*.scss', ['build:css']);

  gulp.watch('app/**').on('change', function(file) {
    // console.log(file.path + ' Reloaded');
    gulp.src(file.path)
      .pipe(connect.reload());
  });
  gulp.watch('build/**').on('change', function(file) {
    gulp.src(file.path)
      .pipe(connect.reload());
  });
});
