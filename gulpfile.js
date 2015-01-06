'use strict';



var gulp = require( 'gulp' ),
  projectFiles = require( './project-files' ),
  connect = require( 'gulp-connect' );




function deferScript(filepath) {
  return '<script defer src="' + filepath + '"></script>';
}
function fileContents(filePath, file) {
  return file.contents.toString('utf8');
}
function errorHandler(e) {

  this.emit('end');
}

// Tests
function test( watch, files, done, error ) {

  var karmaServer = require( 'karma' ).server;

  karmaServer.start({
    configFile: __dirname + '/karma.conf.js',
    autoWatch: watch,
    singleRun: !watch
  }, done );
}

function clean(glob) {
  var gulpClean = require('gulp-clean');

  return gulp.src(glob, {
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
    .pipe(sourcemaps.write('sourcemaps'))
    .pipe(gulp.dest(dir))
    .on('error', errorHandler);
}

var tasks = {
  'test': test.bind( null, true ),
  'test:once': test.bind( null, false ),
  'test:dist': test.bind( null, false, [].concat(
    projectFiles.components.main,
    projectFiles.dist.scripts,
    projectFiles.src.tests
  ) ),
  'build:js': build.bind(null, projectFiles.src.scripts, 'build/scripts'),
	'build:test': build.bind(null, projectFiles.src.tests, 'build/tests'),
  'build:css': function() {
    var changed = require('gulp-changed'),
      sass = require('gulp-sass'),
      prefix = require('gulp-autoprefixer'),
      rename = require('gulp-rename');

    return gulp.src( projectFiles.src.styles )
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


    var scriptFiles = [].concat(
      projectFiles.components.main,
      projectFiles.build.scripts
    );


    return gulp.src( projectFiles.src.views )
      .pipe(
        inject(
          gulp.src( scriptFiles, {
            read: false
          }), {
            addRootSlash: true,
            transform: deferScript
          }
        )
      )
      .pipe(
        inject(
          gulp.src( projectFiles.build.styles, {
            read: false,
          }), {
            addRootSlash: true
          }
        )
      )
      .pipe(gulp.dest('build/views'));
  },
  'clean:css': clean.bind(null, 'build/styles/*'),
  'clean:js': clean.bind(null, 'build/scripts/**/*'),
	'clean:test': clean.bind(null, 'build/tests/**/*'),
  'dist:css': function() {
    var concat = require('gulp-concat');

    gulp.src('build/styles/critical.min.css').pipe(gulp.dest('dist'));
    
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

				var version = require('./app/bower_components/' + p1 + '/bower.json').version;


				
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
gulp.task('test', ['build:test', 'build:js'], tasks['test']);
gulp.task('test:once', ['build:test', 'build:js'], tasks['test:once']);
gulp.task('test:dist', ['build:test', 'dist:js'], tasks['test:dist']);

// Build tasks
gulp.task('build', ['build:html', 'build:test']);
gulp.task('build:js', tasks['build:js']);
gulp.task('build:test', tasks['build:test']);
gulp.task('build:css', tasks['build:css']);
gulp.task('build:html', ['build:js', 'build:css'], tasks['build:html']);

// Clean tasks
gulp.task('clean', ['clean:css', 'clean:js', 'clean:test']);
gulp.task('clean:css', tasks['clean:css']);
gulp.task('clean:js', tasks['clean:js']);
gulp.task('clean:test', tasks['clean:test']);

// Distribution tasks
gulp.task('dist', ['build', 'dist:html', 'test:dist']);
gulp.task('dist:html', ['build:html', 'dist:css', 'dist:js'], tasks['dist:html']);
gulp.task('dist:css', ['build:css'], tasks['dist:css']);
gulp.task('dist:js', ['build:js'], tasks['dist:js']);

// Server
gulp.task('server', ['build:html'], function() {
  var openUrl = require('gulp-open');

  connect.server({
    root: [__dirname],
    livereload: true
  });

  gulp.src('build/views/main.html')
    .pipe(openUrl('', {
      url: 'http://localhost:8080/build/views/main.html',
      app: 'Google Chrome Canary'
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
});

// Default
gulp.task('default', ['build', 'server'], function(done) {
  gulp.watch( projectFiles.src.scripts, [ 'build:js' ] );
	gulp.watch( projectFiles.src.tests, [ 'build:test' ] );
	gulp.watch( projectFiles.src.styles, [ 'build:css' ] );
	gulp.watch( projectFiles.src.views, [ 'build:html' ] );

  gulp.watch('build/**').on('change', function(file) {
    gulp.src(file.path)
      .pipe(connect.reload());
  });
	
  tasks[ 'test' ](function( exitCode ) {

    if (exitCode === 0) {
      done();
    }
  });	
});
