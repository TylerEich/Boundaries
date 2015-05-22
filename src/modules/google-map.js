/* global google */

import { ShapeStore, Shape } from 'src/modules/shape-class';




function randomInterpolate( pointA, pointB ) {
  let length = Math.round( Math.random() * 10 + 5 );
  const randomPath = [];
  const xInterval = ( pointB.x - pointA.x ) / length;
  const yInterval = ( pointB.y - pointA.y ) / length;
  let { x, y } = pointA;

  for ( ; length > 0; length-- ) {
    randomPath.push({
      x: x + xInterval * Math.random(),
      y: y + yInterval * Math.random()
    });

    x += xInterval;
    y += yInterval;
  }

  return Promise.resolve( randomPath );
}




let map = new google.maps.Map( document.querySelector( '#map_canvas' ), {
  center: { lat: 43, lng: -85 },
  zoom: 15
});

let renderedShapes = new Map();

map.data.setStyle( ( feature ) => {
  const color = feature.getProperty( 'color' );
  const fill = feature.getProperty( 'fill' );

  if ( fill ) {
    return {
      fillColor: color,
      fillOpacity: 0.25,
      strokeWeight: 0
    };
  } else {
    return {
      strokeColor: color,
      strokeOpacity: 0.5,
      strokeWeight: 5
    };
  }
});


function renderOnMap( path, shape ) {
  let features = map.data.addGeoJson( shape.toFeature() );

  if ( renderedShapes.has( shape ) ) {
    let oldFeatures = renderedShapes.get( shape );
    oldFeatures.forEach( feature => map.data.remove( feature ) );
  }

  renderedShapes.set( shape, features );
}

function unrenderOnMap( shape ) {
  if ( renderedShapes.has( shape ) ) {
    let oldFeatures = renderedShapes.get( shape );
    oldFeatures.forEach( feature => map.data.remove( feature ) );
  }
}

let shapeStore = new ShapeStore();

shapeStore.on( 'add', ( shape ) => {
  console.log( 'Shape added' );
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

  unrenderOnMap( shape );
});


let newShape = new Shape( '#ff0000', false, true );

shapeStore.addShape( newShape );


map.addListener( 'click', async function( mouseEvent ) {
  let [ x, y ] = [ mouseEvent.latLng.lng(), mouseEvent.latLng.lat() ];
  let lastPoint = newShape.path[ newShape.path.length - 1 ];

  if ( !newShape.path.length ) {
    newShape.addPath([ { x, y } ]);
  } else {
    let randomPath = await randomInterpolate( lastPoint, { x, y } );
    newShape.addPath( randomPath );
  }
});


window.changeShape = function( prop, value ) {
  shapeStore.deleteShape( newShape );

  let { color, fill, rigid, path } = newShape;

  switch ( prop ) {
    case 'color':
      color = value;
      break;
    case 'fill':
      fill = value;
      break;
    case 'rigid':
      rigid = value;
      break;
  }

  newShape = new Shape( color, fill, rigid );
  newShape.addPath( path );

  shapeStore.addShape( newShape );
  renderOnMap( null, newShape );
};

window.toggleFill = function() {
  const fill = !newShape.fill;

  window.changeShape( 'fill', fill );
}
