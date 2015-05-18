'use strict';

const path = require( 'path' );
const express = require( 'express' );
const app = express();
const gulp = require( 'gulp' );


const babelMiddleware = require( 'babel-connect' );
// const browserSync = require( 'browser-sync' );
const sassMiddleware = require( 'node-sass-middleware' );
// const reload = browserSync.reload;




// const babel = babelMiddleware({
//   options: {
//     optional: [ 'es7.asyncFunctions' ]
//   },
//   src: 'src/scripts',
//   dest: 'temp/scripts'
// });

const sass = sassMiddleware({
  src: path.join( __dirname, 'src', 'styles' ),
  dest: path.join( __dirname, 'temp', 'styles' )
});


const babel = babelMiddleware({
  src: 'src/scripts',
  dest: 'temp/scripts'
});




module.exports = function() {

app.use( sass, function(req, res, next) {
  console.log( 'Next' );
  next();
});
// app.use( '/styles', function(req, res, next) {
//   console.log( 'Ping' );
//   next();
// });
app.use( '/scripts', babel );
app.use( express[ 'static' ]( path.join( __dirname, 'temp' ) ) );

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
