const gulp = require( 'gulp' );

const inject = require( 'gulp-inject' );
const projectFiles = require( './project-files' );

module.exports = function() {
  gulp.src( 'src/index.html' )
    // Transforms
    .pipe( gulp.dest( '.' ) );
};
