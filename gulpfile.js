/* global __dirname, process */

'use strict';


var gulp = require( 'gulp' ),
  path = require( 'path' ),
  projectFiles = require( './project-files' ),
  connect = require( 'gulp-connect' ),
  sourcemaps = require( 'gulp-sourcemaps' ),

  sass = require( 'gulp-sass' ),
  prefix = require( 'gulp-autoprefixer' ),

  insert = require( 'gulp-insert' ),
  filesize = require( 'gulp-filesize' ),
  changed = require( 'gulp-changed' ),
  rename = require( 'gulp-rename' ),
  concat = require( 'gulp-concat' ),
  replace = require( 'gulp-replace' ),
  extend = require( 'util' )._extend,
  foreach = require( 'gulp-foreach' ),

  htmlmin = require( 'gulp-htmlmin' ),
  cdnizer = require( 'gulp-cdnizer' ),
  googleData = require( 'google-cdn-data' ),
  cdnjsData = require( 'cdnjs-cdn-data' ),
  inject = require( 'gulp-inject' ),

  util = require( 'util' ),
  ngAnnotate = require( 'gulp-ng-annotate' ),
  to5 = require( 'gulp-6to5' ),
  uglify = require( 'gulp-uglify' ),
  del = require( 'del' ),
  openUrl = require( 'gulp-open' ),
  karmaServer = require( 'karma' ).server,
  pkg = require( './package.json' );






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

// Tests
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

function build( files, dir, modules ) {
  var options = {
    modules: 'ignore',
    experimental: true
  };
  if ( modules ) {
    options.modules = 'system';
    options.moduleIds = true;
  }
  return gulp.src( files )
    .pipe( changed( dir ) )

    // Replace for-of with for(;;) loop
    .pipe( replace( /for\s*?\((var\s+?)?(.+?)\s+?of\s+?(.+?)\)\s*?\{/g, function( match, hasVar, item, iterable ) {
      var i = '_' + Math.random().toString( 36 ).substring( 7 );

      return ( hasVar ? ( 'var ' + item + ';' ) : '' ) + 'for(var ' + i + ' = 0; ' + i + ' < ' + iterable + '.length; ' + i + '++) { ' + item + ' = ' + iterable + '[' + i + ']';
    }).on( 'error', errorHandler ) )

    .pipe( sourcemaps.init() )
      .pipe( to5( options ).on( 'error', errorHandler ) )
    .pipe( sourcemaps.write( 'sourcemaps' ) )
    .pipe( gulp.dest( dir ) )
    .on( 'error', errorHandler );
}

var tasks = {
  'test:watch': test.bind( null, true, [].concat(
    projectFiles.components.main,
    projectFiles.polyfills,
    projectFiles.build.modules,
    projectFiles.build.scripts,
    projectFiles.build.tests
  ) ),
  'test:once': test.bind( null, false, [].concat(
    projectFiles.components.main,
    projectFiles.polyfills,
    projectFiles.build.modules,
    projectFiles.build.scripts,
    projectFiles.build.tests
  ) ),
  'test:dist': test.bind( null, false, [].concat(
    projectFiles.components.main,
    projectFiles.polyfills,
    projectFiles.build.modules,
    projectFiles.dist.scripts,
    projectFiles.build.tests
  ) ),
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
      .pipe( gulp.dest( 'build/styles' ) );
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
    return gulp.src([].concat(
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
        .pipe( replace( /for\s*?\((var\s+?)?(.+?)\s+?of\s+?(.+?)\)\s*?\{/g, function( match, hasVar, item, iterable ) {
          var i = '_' + Math.random().toString( 36 ).substring( 7 );

          return ( hasVar ? ( 'var ' + item + ';' ) : '' ) + 'for(var ' + i + ' = 0; ' + i + ' < ' + iterable + '.length; ' + i + '++) { ' + item + ' = ' + iterable + '[' + i + ']';
        }) )
        .pipe( to5() )
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


// Test tasks
gulp.task( 'test', [ 'build:test', 'build:js' ], tasks[ 'test:watch' ] );
gulp.task( 'test:once', [ 'build:test', 'build:js' ], tasks[ 'test:once' ] );
gulp.task( 'test:dist', [ 'build:test', 'dist:js' ], tasks[ 'test:dist' ] );

// Build tasks
gulp.task( 'build', [ 'build:html', 'build:test' ] );
gulp.task( 'build:modules', tasks[ 'build:modules' ] );
gulp.task( 'build:js', tasks[ 'build:js' ] );
gulp.task( 'build:test', tasks[ 'build:test' ] );
gulp.task( 'build:css', tasks[ 'build:css' ] );
gulp.task( 'build:html', [ 'build:modules', 'build:js', 'build:css' ], tasks[ 'build:html' ] );
// Clean tasks
gulp.task( 'clean', tasks[ 'clean:all' ] );
gulp.task( 'clean:css', tasks[ 'clean:css' ] );
gulp.task( 'clean:js', tasks[ 'clean:js' ] );
gulp.task( 'clean:test', tasks[ 'clean:test' ] );

// Distribution tasks
gulp.task( 'dist', [ 'build', 'dist:html', 'test:dist' ] );
gulp.task( 'dist:html', [ 'build:html', 'dist:css', 'dist:js' ], tasks[ 'dist:html' ] );
gulp.task( 'dist:css', [ 'build:css' ], tasks[ 'dist:css' ] );
gulp.task( 'dist:js', tasks[ 'dist:js' ] );

// Server
gulp.task( 'server', [ 'build:html' ], function() {
  connect.server({
    root: [ __dirname ],
    livereload: true
  });

  gulp.src( 'build/views/main.html' )
    .pipe( openUrl( '', {
      url: 'http://localhost:8080/build/views/main.html',
      app: 'Google Chrome Canary'
    }) );
});
gulp.task( 'server:dist', [ 'dist:html' ], function() {
  connect.server({
    root: [ __dirname ],
    livereload: true
  });

  gulp.src( 'index.html' )
    .pipe( openUrl( '', {
      url: 'http://localhost:8080/',
      app: 'Google Chrome'
    }) );
});

// Default
gulp.task( 'default', [ 'build', 'server' ], function() {
  gulp.watch( projectFiles.src.modules, [ 'build:modules' ] );
  gulp.watch( projectFiles.src.scripts, [ 'build:js' ] );
  gulp.watch( projectFiles.src.tests, [ 'build:test' ] );
  gulp.watch( projectFiles.src.styles, [ 'build:css' ] );
  gulp.watch( projectFiles.src.views, [ 'build:html' ] );

  gulp.watch( 'build/**' ).on( 'change', function( file ) {
    gulp.src( file.path )
      .pipe( connect.reload() );
  });

  test( true, [].concat(
    projectFiles.components.main,
    projectFiles.polyfills,
    projectFiles.build.modules,
    projectFiles.build.scripts,
    projectFiles.build.tests
  ) );
});
