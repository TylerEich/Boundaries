'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect');

// Test files
var unitTestFiles = [
  'app/test/**.js'
],

  // App files
  jsAppFiles = [
    'app/scripts/*/**.js',
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
  bowerBuildFiles = [
		'app/bower_components/angular/angular.js',
    'app/bower_components/*/*.js',
    '!app/bower_components/*/*.min.js',
    '!app/bower_components/*/Gruntfile.js',
    '!app/bower_components/angular-ui-utils/*ieshiv*',
    '!app/bower_components/angular-mocks/*',
    '!app/bower_components/angular-resource/*',
    '!app/bower_components/angular-scenario/*'
  ],
  bowerDistFiles = bowerBuildFiles.slice(2),
  jsBuildFiles = [
    'build/scripts/**/*.js',
    'build/scripts/app.js'
  ],
  unitTestBuildFiles = [
    'build/test/**/*.js'
  ],
  // htmlBuildFiles = [
  //   'build/*.html',
  //   'build/views/*.min.html'
  // ],
  // viewBuildFiles = [
  // 'build/views/*.min.html'
  // ],
  styleBuildFiles = [
    'build/styles/**/*.min.css',
    'build/styles/critical.min.css'
  ];

bowerDistFiles[0] = 'app/bower_components/*/*.min.js';

var karmaConfFiles = [
  'app/bower_components/angular/angular.js',
  'app/bower_components/angular-mocks/angular-mocks.js',
  'app/bower_components/angular-resource/angular-resource.js',
  'app/bower_components/angular-sanitize/angular-sanitize.js',
  'app/bower_components/angular-route/angular-route.js',
  'app/bower_components/ngstorage/ngStorage.js'
];

var karmaConf = {
  browsers: ['ChromeCanary'],
  frameworks: ['jasmine'],
  reporters: ['osx', 'mocha', 'coverage'],
	preprocessors: {
		'./build/scripts/*/**.js': ['coverage']
	},
	coverageReporter: {
		reporters: [
			{
				type: 'text-summary'
			},
			{
				type: 'text'
			},
			{
				type: 'html',
				dir: 'coverage/'
			}
		]
	},
  logLevel: 'WARN',
  files: karmaConfFiles,
  exclude: ['app/bower_components/angular-scenario/angular-scenario.js']
};

function deferScript(filepath) {
  return '<script defer src="' + filepath + '"></script>';
}
function fileContents(filePath, file) {
  return file.contents.toString('utf8');
}
function errorHandler(e) {
  console.log(e.toString());
  this.emit('end');
}

// Tests
function test(watch, files, done) {
  watch = Boolean(watch);

  var karmaServer = require('karma').server;

  karmaConf.files = files;
	karmaConf.autoWatch = watch;
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

function build(files, dir) {
  var changed = require('gulp-changed'),
    sourcemaps = require('gulp-sourcemaps'),
		replace = require('gulp-replace'),
	  to5 = require('gulp-6to5');
  
  return gulp.src(files)
    .pipe(changed(dir))
		
		// Replace for-of with for(;;) loop
		.pipe(replace(/for\s*?\((var\s+?)?(.+?)\s+?of\s+?(.+?)\)\s*?\{/g, function(match, hasVar, item, iterable) {				
			var i = '_' + Math.random().toString(36).substring(7);
			
			return (hasVar ? ('var ' + item + ';') : '') + 'for(var ' + i + ' = 0; ' + i + ' < ' + iterable + '.length; ' + i + '++) { ' + item + ' = ' + iterable + '[' + i + ']';
		}))
		
    .pipe(sourcemaps.init())
		  .pipe(to5())
    .pipe(sourcemaps.write('../sourcemaps'))
    .pipe(gulp.dest(dir))
    .on('error', errorHandler);
}

var tasks = {
  'test': test.bind(null, true, karmaConfFiles.concat(jsBuildFiles, unitTestBuildFiles)),
  'test:once': test.bind(null, false, karmaConfFiles.concat(jsBuildFiles, unitTestBuildFiles)),
  'test:dist': test.bind(null, false, karmaConfFiles.concat('dist/script.min.js', unitTestBuildFiles)),
  'build:js': build.bind(null, jsAppFiles, 'build/scripts'),
	'build:test': build.bind(null, unitTestFiles, 'build/test'),
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
      .pipe(inject(gulp.src(bowerBuildFiles.concat(jsBuildFiles), {
        read: false
      }), {
        addRootSlash: true,
        transform: deferScript
      }))
      .pipe(inject(gulp.src(styleBuildFiles, {
        read: false,
      }), {
        addRootSlash: true
      }))
      .pipe(replace('app/', '../app/'))
      .pipe(gulp.dest('build'));
  },
  'clean:css': clean.bind(null, 'build/styles/*'),
  'clean:js': clean.bind(null, 'build/scripts/**/*'),
	'clean:test': clean.bind(null, 'build/tests/**/*'),
  'dist:css': function() {
    var concat = require('gulp-concat');

    gulp.src(styleBuildFiles.pop()).pipe(gulp.dest('dist'));
    
    return gulp.src(styleBuildFiles)
      .pipe(concat('style.min.css'))
      .pipe(gulp.dest('dist'));
  },
  'dist:js': function() {
    var util = require('util'),
      sourcemaps = require('gulp-sourcemaps'),
      ngAnnotate = require('gulp-ng-annotate'),
		  to5 = require('gulp-6to5'),
      uglify = require('gulp-uglify'),
      // filesize = require('gulp-filesize'),
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
      .pipe(sourcemaps.init())
      	.pipe(concat('script.min.js'))
				// .pipe(to5())
		    .pipe(ngAnnotate())
		
        // .pipe(traceur({
        //   sourceMap: true
        // }))
        .pipe(uglify())
      .pipe(sourcemaps.write('sourcemaps'))
      .pipe(insert.prepend(copyright))
      .pipe(gulp.dest('dist'));
      // .pipe(filesize());
  },
  'dist:html': function() {
    var cdnizer = require('gulp-cdnizer'),
			googleData = require('google-cdn-data'),
			cdnjsData = require('cdnjs-cdn-data'),
      extend = require('util')._extend,
			foreach = require('gulp-foreach'),
      changed = require('gulp-changed'),
      htmlmin = require('gulp-htmlmin'),
      filesize = require('gulp-filesize'),
      replace = require('gulp-replace'),
      inject = require('gulp-inject');

		var data = extend(googleData, cdnjsData);
		
    return gulp.src('app/index.html')
      .pipe(inject(gulp.src(bowerDistFiles.concat('dist/script.min.js'), {
        read: false
      }), {
        addRootSlash: false,
        transform: deferScript
      }))
      .pipe(inject(gulp.src('dist/critical.min.css'), {
        transform: function(filename, file) {
          return '<style>' + fileContents.apply(null, arguments) + '</style>';
        },
        starttag: '<!-- inject:critical:{{ext}} -->'
      }))
      .pipe(inject(gulp.src('dist/style.min.css', {
        read: false,
      }), {
        addRootSlash: false
      }))
			.pipe(replace(/app\/bower_components\/(.+?)\/.+?.js/g, function(match, p1) {
				console.log(match, p1);
				var version = require('./app/bower_components/' + p1 + '/bower.json').version;
				console.log('Version:', version);
				console.log('Is in data?:', p1 in data);
				
				if (p1 in data) {
					var item = data[p1];
					return item.url(version);
				} else {
					return match;
				}
			}))
			.pipe(htmlmin({
				removeComments: true,
				removeCommentsFromCDATA: true,
				removeCDATASectionsFromCDATA: true,
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				removeAttributeQuotes: true,
				removeRedundantAttributes: true,
				useShortDoctype: true,
				removeEmptyAttributes: true,
				removeScriptTypeAttributes: true,
				removeStyleLinkTypeAttributes: true,
				removeOptionalTags: true,
				removeIgnored: true,
				keepClosingSlash: true,
				caseSensitive: true,
				minifyCSS: true
				// minifyURLs: true
			}))
      // .pipe(googleCdn(require('./bower.json'), {
      //   componentsPath: 'app/bower_components',
      //   cdn: extend(require('cdnjs-cdn-data'), require('google-cdn-data'))
      // }))
      .pipe(gulp.dest('.'));
  }
};


// Test tasks
gulp.task('test', ['build:js'], tasks['test']);
gulp.task('test:once', ['build:js'], tasks['test:once']);
gulp.task('test:dist', ['dist:js'], tasks['test:dist']);

// Build tasks
gulp.task('build', ['clean', 'build:html', 'build:test']);
gulp.task('build:js', tasks['build:js']);
gulp.task('build:test', ['build:js'], tasks['build:test']);
gulp.task('build:css', tasks['build:css']);
gulp.task('build:html', ['build:js', 'build:css'], tasks['build:html']);

// Clean tasks
gulp.task('clean', ['clean:css', 'clean:js']);
gulp.task('clean:css', tasks['clean:css']);
gulp.task('clean:js', tasks['clean:js']);

// Distribution tasks
gulp.task('dist', ['clean', 'build', 'dist:html', 'test:dist']);
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
      app: 'Google Chrome Canary'
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
      app: 'Google Chrome Canary'
    }))
    .pipe(openUrl('', {
      url: 'http://localhost:8080/',
      app: 'Firefox'
    }));
});

// Default
gulp.task('default', ['clean', 'build', 'server'], function(done) {
  tasks['test'](function(exitCode) {
    console.log('Karma exited with code ' + exitCode);
    if (exitCode === 0) {
      done();
    }
  });
  
  gulp.watch('app/scripts/**/*', ['build:js']);
	gulp.watch('app/tests/**/*', ['build:test']);
	gulp.watch('app/styles/**/*', ['build:css']);
	gulp.watch('app/index.html', ['build:html']);

  gulp.watch('build/**').on('change', function(file) {
    gulp.src(file.path)
      .pipe(connect.reload());
  });
});
