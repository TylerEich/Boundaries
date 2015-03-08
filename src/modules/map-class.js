import assert from  './assert';
import { emit } from './pubsub';




let addListener = google.maps.event.addListener,
  clearListeners = google.maps.event.clearListeners;




class MapCanvas extends google.maps.Map {
  constructor( ...args ) {
    super( ...args );

    this._markers = [];
    this._polys = [];

    addListener( this, 'click',
      ( event ) => emit( MapCanvas.event.PRESSED, {
        event,
        context: this
      })
    );
  }


  // get center() {
  //   return super.getCenter();
  // }
  // set center( latLng ) {
  //   assert( latLng instanceof LatLng,
  //     'Center must be a LatLng' );
  //   super.setCenter( latLng );
  // }


  // get zoom() {
  //   return super.getZoom();
  // }
  // set zoom( value ) {
  //   assert( typeof value === 'number',
  //     'Zoom must be a number' );
  //   super.setZoom( value );
  // }


  addMarker({ atIndex, marker }) {
    assert( Number.isInteger( atIndex ) );
    assert( atIndex >= 0 && atIndex <= this._markers.length );
    assert( marker instanceof Marker );

    marker.setMap( this );
    
    this._markers.splice( atIndex, 0, marker );
  }


  removeMarker( marker ) {
    assert( marker instanceof Marker );

    let index = this._markers.indexOf( marker );
    assert( index > -1,
      'Poly not found' );

    return removePolyAtIndex( index );
  }


  removeMarkerAtIndex( index ) {
    assert( Number.isInteger( index ) );
    assert( index >= 0 && index < this._markers.length );

    let marker = this._markers.splice( index, 1 )[ 0 ];
    assert( marker instanceof Marker );

    marker.destroy();
  }


  addPoly({ atIndex, poly }) {
    assert( Number.isInteger( atIndex ) );
    assert( atIndex >= 0 && atIndex <= this._polys.length );
    assert( poly instanceof Poly );

    poly.setMap( this );

    this._polys.splice( atIndex, 0, poly );
  }


  removePoly( poly ) {
    assert( poly instanceof Poly );

    let index = this._polys.indexOf( poly );
    assert( index > -1,
      'Poly not found' );

    return removePolyAtIndex( index );
  }


  removePolyAtIndex( index ) {
    assert( Number.isInteger( index ) );
    assert( index >= 0 && index < this._polys.length );

    let poly = this._polys.splice( index, 1 )[ 0 ];
    assert( poly instanceof Poly );

    poly.destroy();
  }
}

MapCanvas.event = {
  PRESSED: 'MapCanvas.pressed'
}




class Marker extends google.maps.Marker {
  constructor( ...args ) {
    super( ...args );

    addListener( this, 'click',
      ( event ) => emit( Marker.event.PRESSED, {
        event,
        context: this
      })
    );
    addListener( this, 'dragstart',
      ( event ) => emit( Marker.event.DRAGSTARTED, {
        event,
        context: this
      })
    );
    addListener( this, 'drag',
      ( event ) => emit( Marker.event.DRAGGED, {
        event,
        context: this
      })
    );
    addListener( this, 'dragend',
      ( event ) => emit( Marker.event.DRAGENDED, {
        event,
        context: this
      })
    );
  }


  setOptions( options ) {
    assert( typeof options === 'object' );

    if ( options.color ) {
      // Generate new icon
    }
  }


  destroy() {
    clearListeners( this );
    this.setMap( null );
  }
}

Marker.event = {
  PRESSED: 'Marker.pressed',
  DRAGSTARTED: 'Marker.dragstarted',
  DRAGGED: 'Marker.dragged',
  DRAGENDED: 'Marker.dragended'
}




class Poly {
  constructor( options ) {
    assert( typeof options === 'object' );

    if ( options.fillColor || options.fillOpacity !== undefined ) {
      this._poly = new google.maps.Polygon( options );
    } else {
      this._poly = new google.maps.Polyline( options );
    }

    addListener( this._poly, 'click',
      ( event ) => emit( Poly.event.PRESSED, {
        event,
        context: this
      })
    );
  }


  get length() {
    return this._poly.getPath().getLength();
  }


  setMap( map ) {
    this._poly.setMap( map );
  }


  addLatLngs({ atIndex, latLngs }) {
    let path = this._poly.getPath();

    assert( Number.isInteger( atIndex ) );
    assert( atIndex >= 0 && atIndex <= path.getLength() );
    assert( Array.isArray( latLngs ) );

    latLngs.forEach(( latLng, i ) => {
      path.insertAt( atIndex + i, latLng );
    });
  }


  removeLatLngs({ start, end }) {
    let path = this._poly.getPath();

    assert( Number.isInteger( start ) );
    assert( Number.isInteger( end ) );
    assert( start >= 0 && start <= end );
    assert( end <= path.getLength() );

    let removeLength = end - start;

    for ( let i = end - 1; i >= start; i-- ) {
      path.removeAt( i );
    }
  }


  destroy() {
    clearListeners( this._poly );
    this._poly.setMap( null );
  }
}

Poly.event = {
  PRESSED: 'Poly.pressed'
};




class DirectionsService extends google.maps.DirectionsService {
  constructor( ...args ) {
    super( ...args );
  }


  route({ origin, destination }) {
    assert( origin instanceof LatLng );
    assert( destination instanceof LatLng );

    return new Promise(( resolve, reject ) => {
      super.route({
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING
      }, ( result, status ) => {
        if ( status === google.maps.DirectionsStatus.OK ) {
          resolve( result.routes[ 0 ].overview_path );
        } else {
          reject( status );
        }
      });
    });
  }
}




class AutocompleteService extends google.maps.places.AutocompleteService {

};




let LatLng = google.maps.LatLng;




export { MapCanvas, Marker, Poly, LatLng, DirectionsService };
