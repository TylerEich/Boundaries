import assert from './assert';
import { emit, on } from './pubsub';
import { MapCanvas, Marker, Poly, LatLng } from './map-class';
import { Node, Drawing, DrawingCollection } from './drawing-class';




export const MapView = {
  event: {
    MAP_PRESSED: 'MapView.mapPressed',
    POLY_PRESSED: 'MapView.polyPressed',
    MARKER_PRESSED: 'MapView.markerPressed',
    MARKER_DRAGSTARTED: 'MapView.markerDragstart',
    MARKER_DRAGGED: 'MapView.markerDrag',
    MARKER_DRAGENDED: 'MapView.markerDragend'
  }
}




export default function( options ) {
  let mapView = new MapCanvas(
    document.querySelector( '#map_canvas' ),
    options
  ),
    polys = new Map(),
    markers = new Map(),
    markerIndices = new Map();


  function createLatLngFromPoint( point ) {
    return new LatLng( point.y, point.x );
  }


  function createLatLngsFromPoints( points ) {
    return points.map( createLatLngFromPoint );
  }




  function createPolyFromDrawing( drawing ) {
    let options = {
      clickable: true,
      draggable: false,
      editable: false,
      geodesic: false,
      visible: true
    };

    if ( drawing.fill ) {
      options.strokeOpacity = 0;
      options.fillColor = drawing.color;
      options.fillOpacity = 0.25;
    } else {
      options.strokeOpacity = 0.5;
      options.strokeColor = drawing.color;
      options.strokeWeight = 8;
    }

    return new Poly( options );
  }




  function createIconFromColor( color ) {
    return {
      fillColor: color,
      fillOpacity: 0,
      path: 'M-16,0 a 16,16 0 1,0 32,0a16,16 0 1,0 -32,0',
      scale: 1,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 4
    };
  }




  function createMarker({ point, color }) {
    let latLng = {
      lat: point.y,
      lng: point.x
    };

    return new Marker({
      clickable: true,
      crossOnDrag: false,
      cursor: 'pointer',
      draggable: true,
      icon: createIconFromColor( color ),
      opacity: 1,
      position: latLng,
      visible: true
    })
  }




  function findKeyByValue({ map, searchValue }) {
    let entries = map.entries(),
      entry;

    while ( entry = entries.next() ) {
      assert( !entry.done );

      let [ key, value ] = entry.value;
      if ( value === searchValue ) return key;
    }
  }




  function nodeForMarker( marker ) {
    return findKeyByValue({
      map: markers,
      searchValue: marker
    });
  }




  on( DrawingCollection.event.DRAWING_ADDED, ( eventName, { atIndex, drawing, context }) => {
    let poly = createPolyFromDrawing( drawing );

    mapView.addPoly({ atIndex, poly });
    polys.set( drawing, poly );
  });


  on( DrawingCollection.event.DRAWING_REMOVED, ( eventName, { drawing }) => {
    let poly = polys.get( drawing );
    assert( poly instanceof Poly );

    mapView.removePoly( poly );
    polys.delete( drawing );
  });




  on( Drawing.event.COLOR_CHANGED, ( eventName, { color, context }) => {
    assert( polys.has( context ) );

    let poly = polys.get( context );

    poly.setOptions({ color });

    let nodes = context.nodes();
    for ( let node of nodes ) {
      assert( markers.has( node ) );

      let marker = markers.get( node );
      marker.setOptions({ color });
    }
  });


  on( Drawing.event.FILL_CHANGED, ( eventName, { fill, context }) => {
    assert( polys.has( context ) );

    let poly = createPolyFromDrawing( context );

    polys.set( context, poly );
  });


  on( Drawing.event.POINTS_ADDED, ( eventName, { atIndex, addedPoints, context }) => {
    assert( polys.has( context ) );

    let poly = polys.get( context );

    let latLngs = createLatLngsFromPoints( addedPoints );
    poly.addLatLngs({ atIndex, latLngs });

    let color = context.color,
      nodes = context.nodes();

    addedPoints.forEach(( point, i ) => {
      if ( point instanceof Node ) {
        let markerIndex = nodes.indexOf( point );

        let marker = createMarker({ point, color });

        mapView.addMarker({ atIndex: markerIndex, marker });
        markers.set( point, marker );
        markerIndices.set( marker, atIndex + i );
      }
    });

    // for ( let point of addedPoints ) {
    //   if ( point instanceof Node ) {
    //     let atIndex = nodes.indexOf( point );

    //     let marker = createMarker({ point, color });
    //     mapView.addMarker({ atIndex, marker });
    //     markers.set( point, marker );
    //   }
    // }
  });


  on( Drawing.event.POINTS_REMOVED, ( eventName, { start, end, removedPoints, context }) => {
    assert( polys.has( context ) );

    let poly = polys.get( context );

    poly.removeLatLngs({ start, end });

    for ( let point of removedPoints ) {
      if ( point instanceof Node ) {
        assert( markers.has( point ) );

        let marker = markers.get( point );

        marker.destroy();
        markers.delete( point );
        markerIndices.delete( marker );
      }
    }
  });




  on( Node.event.MOVED, ( eventName, { x, y, context }) => {
    assert( context instanceof Node );
    assert( markers.has( context ) );

    let marker = markers.get( context ),
      index = markerIndices.get( marker );

    let entries = polys.entries(),
      entry;

    while ( entry = entries.next() ) {
      assert( !entries.done,
        'Poly not found' );

      let [ drawing, poly ] = entry.value,
        index = drawing.indexOf( context );
      if ( index > -1 ) {
        poly.removeLatLngs({
          start: index,
          end: index + 1
        });

        poly.addLatLngs({
          atIndex: index,
          latLngs: [ createLatLngFromPoint({ x, y }) ]
        });
        return;
      }
    }
  });




  on( MapCanvas.event.PRESSED,
    ( eventName, { event }) => emit( MapView.event.MAP_PRESSED, event )
  );




  on( Poly.event.PRESSED,
    ( eventName, { event, context }) => emit( MapView.event.POLY_PRESSED, {
      latLng: event.latLng,
      node: drawingForPoly( context )
    })
  );




  on( Marker.event.PRESSED,
    ( eventName, { event, context }) => emit( MapView.event.MARKER_PRESSED, {
      latLng: event.latLng,
      node: nodeForMarker( context )
    })
  );


  on( Marker.event.DRAGSTARTED,
    ( eventName, { event, context }) => emit( MapView.event.MARKER_DRAGSTARTED, {
      latLng: event.latLng,
      node: nodeForMarker( context )
    })
  );


  on( Marker.event.DRAGGED,
    ( eventName, { event, context }) => {
      let node = nodeForMarker( context ),
        entries = polys.entries(),
        entry;

      while ( entry = entries.next() ) {
        assert( !entries.done,
          'Poly not found' );

        let [ drawing, poly ] = entry.value,
          index = drawing.indexOf( node );
        if ( index > -1 ) {
          poly.removeLatLngs({
            start: index,
            end: index + 1
          });

          poly.addLatLngs({
            atIndex: index,
            latLngs: [ context.getPosition() ]
          });
          return;
        }
      }
    }
  );


  on( Marker.event.DRAGENDED,
    ( eventName, { event, context }) => emit( MapView.event.MARKER_DRAGENDED, {
      latLng: event.latLng,
      node: nodeForMarker( context )
    })
  );




  // function renderDrawing( drawing ) {
  //   drawing.forEach(( point ) => {

  //   })
  // }


  // function unmountDrawing( drawing ) {

  // }




  // function renderGeoJson() {
  //   mapView.data.
  // }
}
