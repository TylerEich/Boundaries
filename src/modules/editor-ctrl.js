/*
  Bindings for editing DrawingCollections
*/

import assert from './assert';
import { on } from './pubsub';
import Queue from './queue';
import { DrawingCollection, Drawing, Node, Point } from './drawing-class';
import { DirectionsService, LatLng } from './map-class';
import { MapView } from './map-view';



export default function() {
  on( Drawing.event.COLOR_CHANGED, ( eventName, { color, context }) => {
    changeDrawing( context, { color });
  });


  on( Drawing.event.FILL_CHANGED, ( eventName, { fill, context }) => {
    changeDrawing( context, { fill });
  });


  on( Drawing.event.RIGID_CHANGED, ( eventName, { rigid, context }) =>  {

  });




  const CREATE_MODE = 'Mode.create',
    EDIT_MODE = 'Mode.edit';

  const queue = new Queue();

  const drawingCollection = new DrawingCollection(),
    directionsService = new DirectionsService(),
    route = directionsService.route.bind( directionsService );

  const drawings = new WeakMap(),
    nodes = new WeakMap();





  // let drawingMode = CREATE_MODE,
  //   createNewDrawing = true,
  //   rigid = false,
  //   color = '#ff0000',
  //   fill = true;




  /*
    ********** DEBUG ONLY **********
    ********** DEBUG ONLY **********
    ********** DEBUG ONLY **********
    */
  window.drawingMode = CREATE_MODE,
    window.createNewDrawing = true,
    window.rigid = false,
    window.color = '#ff0000',
    window.fill = true;




  function latLngFromPoint( point ) {
    assert( point instanceof Point );

    return new LatLng( point.y, point.x );
  }


  function pointFromLatLng( latLng ) {
    assert( typeof latLng.lat === 'function' &&
      typeof latLng.lng === 'function' );

    return new Point( latLng.lng(), latLng.lat() );
  }


  function createNodeFromLatLng( latLng ) {
    return new Node( latLng.lng(), latLng.lat() );
  }


  function createPointFromLatLng( latLng ) {
    return new Point( latLng.lng(), latLng.lat() );
  }




  async function fillPathAroundNode({ drawing, node }) {
    assert( drawing instanceof Drawing );
    assert( node instanceof Node );

    let { start, end } = drawing.nodesAroundNode( node );

    if ( !drawing.rigid ) {
      if ( start === node && end === node ) {
        // Single node
        let latLngs;
        try {
          latLngs = await route({
            origin: latLngFromPoint( node ),
            destination: latLngFromPoint( node )
          });
        } catch ( e ) {
          alert( e );
        }

        points = latLngs.map( pointFromLatLng );

        assert( points.length > 0 );

        let { x, y } = points[ 0 ];
        queue.add( node.moveTo.bind( node, x, y ) );
      }

      let latLngs, points;
      if ( start !== node ) {
        // Push to previous node
        try {
          latLngs = await route({
            origin: latLngFromPoint( start ),
            destination: latLngFromPoint( node )
          });
        } catch ( e ) {
          alert( e );
        }

        points = latLngs.map( pointFromLatLng );

        let x, y;
        ({ x, y }) = points.shift();
        start.moveTo( x, y );
        ({ x, y }) = points.pop();
        node.moveTo( x, y );

        queue.add( drawing.removePointsBetweenNodes.bind( drawing, start, node ) );
        queue.add( drawing.addPointsAfterNode.bind( drawing, start, points ) );
      }

      if ( end !== node ) {
        // Push to next node
        try {
          latLngs = await route({
            origin: latLngFromPoint( node ),
            destination: latLngFromPoint( end )
          });
        } catch ( e ) {
          alert( e );
        }

        points = latLngs.map( pointFromLatLng );

        let x, y;
        ({ x, y }) = points.shift();
        node.moveTo( x, y );
        ({ x, y }) = points.pop();
        end.moveTo( x, y );

        queue.add( drawing.removePointsBetweenNodes.bind( drawing, node, end ) );
        queue.add( drawing.addPointsAfterNode.bind( drawing, node, points ) );
      }
    }
  }




  function pressed( eventName, { latLng, node }) {
    if ( drawingMode === EDIT_MODE ) {
      // Identify clicked segment
      // Highlight segment on map
    } else {
      drawingMode = EDIT_MODE;
    }
  }


  on( MapView.event.MARKER_PRESSED, pressed );
  on( MapView.event.POLY_PRESSED, pressed );




  on( MapView.event.MARKER_DRAGSTARTED, ( eventName, { latLng, node }) => {
    assert( node instanceof Node );

    let drawing = drawingCollection.find(( drawing ) => drawing.indexOf( node ) > -1 );

    assert( drawing instanceof Drawing );

    // queue.add( drawing.removeNode.bind( drawing, node ) );
  });


  on( MapView.event.MARKER_DRAGGED, ( eventName, { latLng, node }) => {
    assert( node instanceof Node );

    let point = createPointFromLatLng( latLng );

    node.moveTo( point.x, point.y );
  });


  on( MapView.event.MARKER_DRAGENDED, ( eventName, { latLng, node }) => {
    assert( node instanceof Node );

    let drawing = drawingCollection.find(( drawing ) => drawing.indexOf( node ) > -1 ),
      newPoint = createPointFromLatLng( latLng );

    assert( drawing instanceof Drawing );

    queue.add( node.moveTo.bind( node, newPoint.x, newPoint.y ) )
      .add( fillPathAroundNode.bind( null, { drawing, node }) );
  });




  on( MapView.event.MAP_PRESSED, ( eventName, { latLng }) => {
    if ( drawingMode === EDIT_MODE ) {
      // Exit edit mode when map is pressed
      drawingMode = CREATE_MODE;
    } else if ( drawingMode === CREATE_MODE ) {
      let node = createNodeFromLatLng( latLng );

      if ( createNewDrawing ) {
        // Add drawing to end of array
        let drawing = new Drawing({
          fill,
          rigid,
          color
        });

        queue.add( drawingCollection.addDrawing.bind( drawingCollection, {
          atIndex: drawingCollection.length,
          drawing
        }) )
          .add( drawing.addNode.bind( drawing, node, undefined ) )
          .add(() => drawingCollection.activeDrawingIndex = drawingCollection.length - 1 )
          .add( fillPathAroundNode.bind( null, {
            drawing,
            node
          }) );

        createNewDrawing = false;
      } else {
        // Add point to end of current drawing
        let drawing = drawingCollection.activeDrawing;

        queue.add( drawing.addNode.bind( drawing, node, undefined ) )
          .add( fillPathAroundNode.bind( null, {
            drawing,
            node
          }) );
      }
    }
  });
}