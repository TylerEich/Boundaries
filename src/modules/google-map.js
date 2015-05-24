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
let renderedNodes = new Map();

map.data.setStyle( ( feature ) => {
  const color = feature.getProperty( 'color' );
  const fill = feature.getProperty( 'fill' );

  const options = {
    icon: {
      path: 'M 0 0 m -16, 0a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0',
      strokeWeight: 2,
      strokeColor: color
    }
  };
  if ( fill ) {
    options.fillColor = color;
    options.fillOpacity = 0.25;
    options.strokeWeight = 0;
  } else {
    options.strokeColor = color;
    options.strokeOpacity = 0.5;
    options.strokeWeight = 10;
  }

  return options;
});


function removeFromMap( shape ) {

}


function unrenderOnMap({ target: shape }) {
  if ( renderedShapes.has( shape ) ) {
    let poly = renderedShapes.get( shape );
    poly.setMap( null );
    renderedShapes.delete( shape );
  }
  if ( renderedNodes.has( shape ) ) {
    let markers = renderedNodes.get( shape );
    markers.forEach( marker => marker.setMap( null ) );
    renderedNodes.delete( shape );
  }
}

function renderOnMap({ path = [], index = 0, target: shape }) {
  console.time( 'render path' );
  let poly = renderedShapes.get( shape );

  let pathToAdd = path;
  const latLngs = [];
  const nodes = [];

  // `getPaths` only exists on Polygons
  if ( !poly || 'getPaths' in poly !== shape.fill ) {
    pathToAdd = shape.path;

    if ( shape.fill ) {
      poly = new google.maps.Polygon({
        map,
        fillOpacity: 0.25,
        strokeWeight: 0
      });
    } else {
      poly = new google.maps.Polyline({
        map,
        strokeOpacity: 0.5,
        strokeWeight: 7
      });
    }

    renderedShapes.set( shape, poly );
  }

  pathToAdd.forEach( ({ x, y, node }) => {
    let latLng = new google.maps.LatLng( y, x );
    latLngs.push( latLng );
    if ( node ) {
      nodes.push( latLng );
    }
  });

  const polyPath = poly.getPath();

  latLngs.forEach(
    ( latLng, i ) => polyPath.insertAt( index + i, latLng )
  );

  const color = shape.color;
  poly.setOptions({
    strokeColor: color,
    fillColor: color
  });

  console.timeEnd( 'render path' );

  console.time( 'render nodes' );
  const markers = renderedNodes.get( shape ) || [];

  let newMarkers = nodes.map( latLng => {
    return new google.maps.Marker({
      map,
      position: latLng,
      icon: {
        path: 'M 0 0 m -16, 0a 16,16 0 1,0 32,0 a 16,16 0 1,0 -32,0',
        strokeWeight: 2.5,
        strokeColor: color,
        fillColor: color,
        fillOpacity: 0.25
      }
    });
  });

  renderedNodes.set( shape, markers.concat( newMarkers ) );
  console.timeEnd( 'render nodes' );
}

let shapeStore = new ShapeStore();

shapeStore.on( 'add', ({ shape }) => {
  shape.addListeners({
    'add': renderOnMap,
    'delete': unrenderOnMap
  });

  renderOnMap({ target: shape });
});

shapeStore.on( 'delete', ({ shape }) => {
  shape.removeListeners({
    'add': renderOnMap,
    'delete': unrenderOnMap
  });

  unrenderOnMap({ target: shape });
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
};

window.toggleFill = function() {
  const fill = !newShape.fill;

  window.changeShape( 'fill', fill );
}
