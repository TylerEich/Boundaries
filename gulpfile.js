/* global __dirname, process */

var gulp = require( 'gulp' );
var path = require( 'path' );
var projectFiles = require( './project-files' );
// var connect = require( 'gulp-connect' );
var sourcemaps = require( 'gulp-sourcemaps' );
var source = require( 'vinyl-source-stream' );
var buffer = require( 'vinyl-buffer' );
var browserSync = require( 'browser-sync' );
var reload = browserSync.reload;

var sass = require( 'gulp-sass' );
var prefix = require( 'gulp-autoprefixer' );

var insert = require( 'gulp-insert' );
var filesize = require( 'gulp-filesize' );
var changed = require( 'gulp-changed' );
var rename = require( 'gulp-rename' );
var concat = require( 'gulp-concat' );
var replace = require( 'gulp-replace' );
var extend = require( 'util' )._extend;
var filter = require( 'gulp-filter' );

var htmlmin = require( 'gulp-htmlmin' );
// var cdnizer = require( 'gulp-cdnizer' );
var googleData = require( 'google-cdn-data' );
var cdnjsData = require( 'cdnjs-cdn-data' );
var inject = require( 'gulp-inject' );

var util = require( 'util' );
var ngAnnotate = require( 'gulp-ng-annotate' );
var babel = require( 'gulp-babel' );
var uglify = require( 'gulp-uglify' );
var del = require( 'del' );
var openUrl = require( 'gulp-open' );
var karmaServer = require( 'karma' ).server;
var browserify = require( 'browserify' );
var watchify = require( 'watchify' );
var babelify = require( 'babelify' );
var pkg = require( './package.json' );



function deferScript( filepath ) {
  return '<script defer src="' + filepath + '"></script>';
}


function fileContents( filePath, file ) {
  return file.contents.toString( 'utf8' );
}


function errorHandler( e ) {
  console.error( e );
  this.emit( 'end' );
}


function buildHtml( files, dir ) {
  return gulp.src( files )
    .pipe( changed( dir ) )
    .pipe( gulp.dest( 'build/templates' ) );
}


function test( watch, files ) {
  var config = {
      configFile: path.resolve( 'karma.conf.js' ),
      autoWatch: watch,
      singleRun: !watch
    };

  if ( files ) {
    config.files = files;
  }

  karmaServer.start( config, function( exitCode ) {
    process.exit( exitCode );
  });
}

function clean( glob, done ) {
  del( glob, done );
}


function bundle( watch ) {
  function rebundle() {
    return bundler.bundle()
      .pipe( source( 'bundle.js' ) )
      .pipe( buffer() )
      .pipe( sourcemaps.init({ loadMaps: true }) )
        // Add transformation tasks to the pipeline here.
        // .pipe( uglify() )
      .pipe( sourcemaps.write( './sourcemaps' ) )
      .pipe( gulp.dest( './build/scripts/' ) );
  }

  var bundler;
  if ( watch ) {
    bundler = watchify( browserify( './build/modules/main.js', watchify.args ) );
    bundler.on( 'update', rebundle.bind( null, bundler ) );
  } else {
    bundler = browserify( './build/modules/main.js' );
  }

  rebundle( bundler );
}




function build( files, dir ) {
  return gulp.src( files )
    .pipe( changed( dir ) )
    .pipe( sourcemaps.init() )
      .pipe( babel({
        optional: 'es7.asyncFunctions'
      }) )
    .pipe( sourcemaps.write( 'sourcemaps' ) )
    .pipe( gulp.dest( dir ) )
    .on( 'error', errorHandler );
}




var buildModules = build.bind( null, projectFiles.src.modules, 'build/modules' );
var watchBundle = bundle.bind( null, true );


var tasks = {
  'test:watch': test.bind( null, true, [].concat(
    projectFiles.components.main,
    projectFiles.polyfills,
    // projectFiles.build.modules,
    // projectFiles.build.scripts,
    projectFiles.build.tests
  ) ),
  'test:once': test.bind( null, false, [].concat(
    projectFiles.components.main,
    projectFiles.polyfills,
    // projectFiles.build.modules,
    // projectFiles.build.scripts,
    projectFiles.build.tests
  ) ),
  // 'test:dist': test.bind( null, false, [].concat(
  //   projectFiles.components.main,
  //   projectFiles.polyfills,
  //   projectFiles.source.modules,
  //   projectFiles.dist.scripts,
  //   projectFiles.source.tests
  // ) ),

  'build:js': build.bind( null, projectFiles.src.scripts, 'build/scripts', false ),
  'build:modules': build.bind( null, projectFiles.src.modules, 'build/modules', true ),
  'build:test': build.bind( null, projectFiles.src.tests, 'build/tests', false ),
  'build:css': function() {
    return gulp.src( projectFiles.src.styles )
      .pipe( changed( 'build/styles', {
        extension: '.min.css'
      }) )
      .pipe( sass({
        outputStyle: 'compressed',
        errLogToConsole: true
      }) )
      .pipe( prefix( 'last 2 versions' ) )
      .pipe( rename({
        suffix: '.min'
      }) )
      .pipe( gulp.dest( 'build/styles' ) )
      .pipe( reload({ stream: true }) );
  },
  'build:html': function() {
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
            read: false
          }), {
            addRootSlash: true
          }
        )
      )
      .pipe( gulp.dest( 'build/views' ) );
  },

  'clean:all': clean.bind( null, 'build/**/*' ),
  'clean:css': clean.bind( null, 'build/styles/*' ),
  'clean:js': clean.bind( null, 'build/scripts/**/*' ),
  'clean:test': clean.bind( null, 'build/tests/**/*' ),

  'dist:css': function() {
    return gulp.src( [].concat(
      projectFiles.src.styles,
      '!critical.min.css'
    ) )
      .pipe( sass({
        outputStyle: 'compressed',
        errLogToConsole: true
      }) )
      .pipe( prefix( 'last 2 versions' ) )
      .pipe( concat( 'style.min.css' ) )
      .pipe( gulp.dest( 'dist/styles' ) );
  },
  'dist:js': function() {
    var copyright = util.format( '/*\n %s v%s\n (c) 2013-%s %s %s\n License: %s\n*/\n',
      pkg.name,
      pkg.version,
      new Date().getFullYear(),
      pkg.author,
      pkg.homepage,
      pkg.license );

    return gulp.src( projectFiles.src.scripts )
      .pipe( sourcemaps.init() )
        .pipe( concat( 'script.min.js' ) )
        // .pipe( replace( /for\s*?\((var\s+?)?(.+?)\s+?of\s+?(.+?)\)\s*?\{/g, function( match, hasVar, item, iterable ) {
        //   var i = '_' + Math.random().toString( 36 ).substring( 7 );

        //   return ( hasVar ? ( 'var ' + item + ';' ) : '' ) + 'for(var ' + i + ' = 0; ' + i + ' < ' + iterable + '.length; ' + i + '++) { ' + item + ' = ' + iterable + '[' + i + ']';
        // }) )
        .pipe( babel() )
        .pipe( ngAnnotate() )
        .pipe( uglify() )
      .pipe( sourcemaps.write( 'sourcemaps' ) )
      .pipe( insert.prepend( copyright ) )
      .pipe( gulp.dest( 'dist/scripts' ) );
      // .pipe(filesize());
  },
  'dist:html': function() {

    var data = extend( googleData, cdnjsData );

    return gulp.src( 'app/index.html' )
      .pipe(
        inject(
          gulp.src(
            [].concat(
              projectFiles.components.min,
              'dist/script.min.js'
            ), {
              read: false
            }
          ), {
            addRootSlash: false,
            transform: deferScript
          }
        )
      )
      .pipe(
        inject(
          gulp.src( 'dist/critical.min.css' ), {
            transform: function( filePath, file ) {
              return '<style>' + fileContents( filePath, file ) + '</style>';
            },
            starttag: '<!-- inject:critical:{{ext}} -->'
          }
        )
      )
      .pipe(
        inject(
          gulp.src( 'dist/style.min.css', {
            read: false
          }), {
            addRootSlash: false
          }
        )
      )
      .pipe(
        replace( /bower_components\/(.+?)\/.+?.js/g,
          function( match, p1 ) {
            var version = require( 'bower_components/' + p1 + '/bower.json' ).version;

            if ( data.hasOwnProperty( p1 ) ) {
              var item = data[ p1 ];
              return item.url( version );
            } else {
              return match;
            }
          }
        )
      )
      .pipe(
        htmlmin({
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
        })
      )
      .pipe( gulp.dest( 'dist/views' ) );
  }
};


gulp.task( 'test', [ 'build:test', 'build:modules' ], tasks[ 'test:watch' ] );
gulp.task( 'test:once', [ 'build:test', 'build:modules' ], tasks[ 'test:once' ] );
// gulp.task( 'test:dist', [ 'build:test', 'dist:js' ], tasks[ 'test:dist' ] );


gulp.task( 'bundle', bundle );
gulp.task( 'watch:bundle', bundle );


gulp.task( 'build', [ 'build:html', 'build:test' ] );
gulp.task( 'build:modules', tasks[ 'build:modules' ] );
gulp.task( 'build:js', tasks[ 'build:js' ] );
gulp.task( 'build:test', tasks[ 'build:test' ] );
gulp.task( 'build:css', tasks[ 'build:css' ] );
gulp.task( 'build:html', [ 'build:modules', 'build:js', 'build:css' ], tasks[ 'build:html' ] );


gulp.task( 'clean', tasks[ 'clean:all' ] );
gulp.task( 'clean:css', tasks[ 'clean:css' ] );
gulp.task( 'clean:js', tasks[ 'clean:js' ] );
gulp.task( 'clean:test', tasks[ 'clean:test' ] );


gulp.task( 'dist', [ 'build', 'dist:html', 'test:dist' ] );
gulp.task( 'dist:html', [ 'build:html', 'dist:css', 'dist:js' ], tasks[ 'dist:html' ] );
gulp.task( 'dist:css', [ 'build:css' ], tasks[ 'dist:css' ] );
gulp.task( 'dist:js', tasks[ 'dist:js' ] );


gulp.task( 'server', [ 'build:html' ], function() {
  browserSync({
    files: [].concat(
      'build/scripts/bundle.js'
      // projectFiles.build.styles,
      // projectFiles.build.views
    ),
    server: {
      baseDir: '.'
    },
    index: 'build/views/dev.html',
    https: false,
    open: true,
    browser: 'google chrome'
  });

  // openUrl( 'https://localhost:8080/build/views/main.html', {
  //   app: 'Google Chrome'
  // });
});


gulp.task( 'server:dist', [ 'dist:html' ], function() {
});


gulp.task( 'dev',
  [
    'build',
    // 'dist',
    'server',
    'test'
  ],
  function() {
    bundle( true );
    gulp.watch( projectFiles.src.modules ).on( 'change', buildModules );
    gulp.watch( projectFiles.src.styles ).on( 'change', tasks[ 'build:css' ]);
    gulp.watch( projectFiles.src.views ).on( 'change', reload );
    gulp.watch( 'src/templates/**/*.html' )
      .on( 'change', buildHtml.bind( null, 'src/templates/**/*.html', 'build/templates' ) );
    // gulp.watch( 'build/scripts/**' ).on( 'change', reload );
  });


gulp.task( 'default', [ 'build', 'server' ], function() {
  gulp.watch( projectFiles.src.modules, [ 'build:modules' ] );
  gulp.watch( projectFiles.src.scripts, [ 'build:js' ] );
  gulp.watch( projectFiles.src.tests, [ 'build:test' ] );
  gulp.watch( projectFiles.src.styles, [ 'build:css' ] );
  gulp.watch( projectFiles.src.views, [ 'build:html' ] );

  // gulp.watch( 'build/**' ).on( 'change', function( file ) {
  //   gulp.src( file.path )
  //     .pipe( connect.reload() );
  // });

  // watchify( browserify( './src/modules/main.js', watchify.args ) );

  test( true, [].concat(
    projectFiles.components.main,
    projectFiles.polyfills,
    projectFiles.build.modules,
    projectFiles.build.scripts,
    projectFiles.build.tests
  ) );
});
