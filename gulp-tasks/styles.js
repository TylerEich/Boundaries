const gulp = require( 'gulp' );

const concat = require( 'gulp-concat' );
const prefix = require( 'gulp-autoprefixer' );
const sass = require( 'gulp-sass' );
const sourcemaps = require( 'gulp-sourcemaps' );




module.exports = function() {
  gulp.src( 'src/styles/**/*.scss' )
    .pipe( sourcemaps.init() )
      .pipe( sass() )
      .pipe( prefix() )
      .pipe( concat( 'style.min.css' ) )
    .pipe( sourcemaps.write( './sourcemaps' ) )
    .pipe( gulp.dest( 'dist' ) );
};
