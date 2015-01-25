var fs = require( 'fs' );




var files = {};




files.src = {
  scripts: [
    'src/scripts/**/*.js',
    'src/scripts/main.js'
  ],


  modules: [
    'src/modules/**/*.js'
  ],


  tests: [
    'src/tests/**/*.spec.js'
  ],


  styles: [
    'src/styles/**/*.scss'
  ],


  views: [
    'src/views/**/*.html'
  ]
};




files.build = {
  scripts: [
    'build/scripts/**/*.js',
    'build/scripts/main.js'
  ],


  modules: [
    'build/modules/**/*.js'
  ],


  tests: [
    'build/tests/**/*.spec.js'
  ],


  styles: [
    'build/styles/**/*.css'
  ],


  views: [
    'build/views/**/*.html'
  ]
};




files.dist = {
  scripts: [
    'dist/scripts/*.min.js'
  ],


  styles: [
    'dist/styles/**/*.min.css'
  ],


  views: [
    'dist/views/**/*.html'
  ]
}




files.polyfills = [ 'polyfills/**/*.js' ];




files.components = {
  main: [],
  min: []
}

var components = fs.readdirSync( './bower_components' );

components.filter(function( folderName ) {
  return !( folderName[0] === '.' );
}).forEach(function( folderName ) {
  var folderPath = './bower_components/' + folderName;

  // Get fileName minus leading './'
  var fileName = require( folderPath + '/bower.json' ).main;
  if ( fileName.indexOf( './' ) === 0 ) {
    fileName = fileName.substring( 2 );
  }

  var mainFile = folderPath + '/' + fileName;
  var minFile = mainFile.replace( '.js', '.min.js' );

  files.components.main.push( mainFile );
  files.components.min.push( minFile );
});




module.exports = files;
