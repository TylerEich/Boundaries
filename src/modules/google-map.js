/* global google */

import { ShapeStore, Shape } from 'src/modules/shape-class';


let map = new google.maps.Map( document.querySelector( '#map_canvas' ), {
  center: { lat: 43, lng: -85 },
  zoom: 17
});

let renderedShapes = new Map();

map.data.setStyle( ( feature ) => {
  let color = feature.getProperty( 'color' );
  return {
    strokeColor: color,
    strokeOpacity: 0.5,
    strokeWeight: 5
  };
});


function renderOnMap( path, shape ) {
  let features = map.data.addGeoJson( shape.toFeature() );

  if ( renderedShapes.has( shape ) ) {
    let oldFeatures = renderedShapes.get( shape );
    oldFeatures.forEach( feature => map.data.remove( feature ) );
  }

  renderedShapes.set( shape, features );
}

let shapeStore = new ShapeStore();

shapeStore.on( 'add', ( shape ) => {
  shape.addListeners({
    'add': renderOnMap,
    'delete': renderOnMap
  });
});

shapeStore.on( 'delete', ( shape ) => {
  shape.removeListeners({
    'add': renderOnMap,
    'delete': renderOnMap
  });
});


let newShape = new Shape( '#ff0000', false, true );

shapeStore.addShape( newShape );


map.addListener( 'click', ( mouseEvent ) => {
  let [ x, y ] = [ mouseEvent.latLng.lng(), mouseEvent.latLng.lat() ];
  newShape.addPath([ { x, y } ]);
});
