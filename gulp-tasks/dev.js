'use strict';

const path = require( 'path' );
const express = require( 'express' );
const app = express();
const gulp = require( 'gulp' );


const babelMiddleware = require( 'babel-connect' );
const injectMiddleware = require( 'connect-inject' );
// const browserSync = require( 'browser-sync' );
const sassMiddleware = require( 'node-sass-middleware' );
// const reload = browserSync.reload;




const karma = require( 'karma' );


const inject = injectMiddleware({

});
const babel = babelMiddleware({
  options: {
    modules: 'system',
    moduleIds: true,
    moduleRoot: '',
    sourceRoot: process.cwd(),
    optional: [ 'es7.asyncFunctions' ]
  },
  src: path.resolve( './src/modules' ),
  dest: path.resolve( './temp/modules' )
});

const sass = sassMiddleware({
  src: path.resolve( './src/styles' ),
  dest: path.resolve( './temp/styles' ),
  outputStyle: 'compressed'
  // prefix: '/styles'
});




module.exports = function() {

app.use( '/styles', sass );
app.use( '/modules', babel );

app.use( express.static( path.resolve( './src' ) ) );
app.use( express.static( path.resolve( './temp' ) ) );

app.listen( 3000 );

console.log( 'Listening on port 3000' );



  // let files = [
  //   'src/scripts/**/*.js',
  //   'src/styles/**/*.scss',
  //   'src/views/**/*.html'
  // ];
  // // gulp.watch( files );

  // browserSync({
  //   files: files,
  //   routes: {

  //   },
  //   server: {
  //     baseDir: './src',
  //     middleware: [
  //       babel,
  //       sass,
  //       function( req, res, next ) {
  //         console.log( req, res, next );
  //         next();
  //       }]
  //   },
  //   index: 'views/dev.html',
  //   open: true,
  //   browser: 'google chrome'
  // });
};
