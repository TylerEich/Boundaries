/*
  Bindings for editing DrawingCollections
*/

import { Drawing, Node } from 'drawing';
import { MapCanvas, Marker, Poly, router } from 'map';




const CREATE_MODE = 'Mode.create',
  EDIT_MODE = 'Mode.edit';

const queue = new Queue();




async function fillPathAroundNode({ drawing, node }) {
  assert( drawing instanceof Drawing );
  assert( node instanceof Node );

  let { start, end, hasFirst, hasLast } = drawing.nodesAroundNode( node );


  if ( !drawing.rigid ) {
    // Drawing needs flexible lines

    if ( !hasFirst && !hasLast ) {
      // First portion of path
      drawing.removePoints({
        start: drawing.indexOf( start ) + 1,
        end: drawing.indexOf( node )
      });

      let points = await route({
        start,
        end: node
      });

      start.moveTo( points.shift() );
      node.moveTo( points.pop() );
      drawing.addPoints({
        atIndex: drawing.indexOf( start ) + 1,
        points
      });

      // Next portion of path
      drawing.removePoints({
        start: drawing.indexOf( node ) + 1,
        end: drawing.indexOf( end )
      });

      points = await route({
        start: node,
        end
      });

      node.moveTo( point.shift() );
      end.moveTo( points.pop() );
      drawing.addPoints({
        atIndex: drawing.indexOf( node ) + 1,
        points
      });
    } else {
      // Only one portion to manage
      let points = await route({
        start,
        end
      });

      start.moveTo( points.shift() );
      if ( points.length !== 0 ) {
        end.moveTo( start );
      } else {
        end.moveTo( points.pop() );
      }
      drawing.addPoints({
        atIndex: drawing.indexOf( start ) + 1,
        points
      });
    }
  }
}




on([ Poly.event.PRESSED, Marker.event.PRESSED ], () => {
  if ( drawingMode === EDIT_MODE ) {
    // Identify clicked segment
    // Highlight segment on map
  } else {
    drawingMode = EDIT_MODE;
  }
});


on([ Poly.event.LONG_PRESSED, Marker.event.LONG_PRESSED ], ( pointPressed ) => {
  if ( drawingMode === CREATE_MODE ) {
    let drawing = drawings.activeDrawing(),
      node = new Node( pointPressed );

    drawing.addPoints({
      atIndex: -1,
      points: [ node ]
    });

    queue.add( fillPathAroundNode.bind( null, { drawing, node }) );
  } else {
    drawingMode = CREATE_MODE;
  }
});




on( Marker.event.DRAG_STARTED, ({ polyIndex, markerIndex }) => {
  assert( drawings.length > polyIndex,
    'Out of bounds' );
  let drawing = drawings[ polyIndex ];

  pointAtIndex = drawing.pointAtIndex( markerIndex );
  drawing.removeNode( pointAtIndex );
});


on( Marker.event.DRAG_ENDED, async function({ polyIndex, markerIndex, position }) {
  let drawing = drawings[ polyIndex ],
    node = drawing.pointAtIndex( markerIndex );

  assert( drawing instanceof Drawing );
  assert( node instanceof Node );

  node.moveTo( position );

  queue.add( fillPathAroundNode.bind( null, { drawing, node }) );
});




on( MapCanvas.event.PRESSED, async function( pointPressed ) {
  if ( drawingMode === EDIT_MODE ) {
    // Exit edit mode when map is pressed
    drawingMode = CREATE_MODE;
  } else if ( drawingMode === CREATE_MODE ) {
    if ( autoCreateNewDrawing() || forceCreateNewDrawing ) {
      // Add drawing to end of array
      let drawing = new Drawing({
        fill,
        rigid,
        color
      });

      drawings.addDrawing({
        atIndex: -1,
        drawing
      });
    } else {
      // Add point to end of current drawing
      let drawing = drawings.getCurrentDrawing(),
        node = new Node( pointPressed );

      drawing.addPoints({
        atIndex: -1,
        points: [ node ]
      });

      queue.add( fillPathAroundNode.bind( null, { drawing, node }) );
    }
  }
});
