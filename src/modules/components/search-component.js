import { search, loadResult } from './services/search-service';

'use strict';

angular.module( 'bndry' )
.directive( 'mapCanvas', function(  ) {
  return {

  };
});





class SearchComponent {
  constructor({ search, mapCanvas }) {
    this.search = search;
    this.mapCanvas = mapCanvas;

    this.query = '';
    this.results = [];

    this._timestamp = Date.now();
  }


  assignResults( timestamp, results ) {
    if ( this._timestamp === timestamp ) {
      this.results = results;
    }
  }


  update() {
    let query = this.query,
      timestamp = this._timestamp = Date.now();

    search( query )
      .then( this.assignResults.bind( this, timestamp ) );
  }


  clearQuery() {
    this.query = '';
    this.update();
  }


  actionResult( result ) {
    if ( result.bounds ) {
      map.bounds = result.bounds;
    } else if ( result.location ) {
      map.center = result.location;
    }
  }
}
