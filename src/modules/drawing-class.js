import { emit } from 'src/modules/pubsub';
import assert from 'src/modules/assert';




/**
  Path should `extend Array`, but browsers don't support that yet
**/
class Path {
  constructor( ...points ) {
    this._points = points;
  }


  push( ...args ) {
    return this._points.push( ...args );
  }


  splice( ...args ) {
    return this._points.splice( ...args );
  }


  filter( cb ) {
    return this._points.filter( cb );
  }


  find( cb ) {
    return this._points.find( cb );
  }


  every( cb ) {
    return this._points.every( cb );
  }


  some( cb ) {
    return this._points.some( cb );
  }

  atIndex( i ) {
    assert( i < this._points.length,
      'Out of bounds' );
    return this._points[ i ];
  }


  get length() {
    return this._points.length;
  }


  indexOf( point, fromIndex ) {
    assert( point instanceof Point );

    return this._points.indexOf( point, fromIndex );
  }


  isValid() {
    let points = this._points;

    return (
      // Path can be empty
      points.length === 0 ||

      // Non-empty Path must start and end with a Node
      points[ points.length - 1 ] instanceof Node &&
      points[ 0 ] instanceof Node
    );
  }
}




class Point {
  constructor( x, y ) {
    assert( typeof x === 'number' );
    assert( typeof y === 'number' );

    this._x = x;
    this._y = y;
  }


  get x() {
    return this._x;
  }
  get y() {
    return this._y;
  }


  get lat() {
    return this._y;
  }
  get lng() {
    return this._x;
  }


  equals( point ) {
    return ( this.x === point.x && this.y === point.y )
  }
}




class Node extends Point {
  constructor( x, y ) {
    super( x, y );
  }


  moveTo( x, y ) {
    assert( typeof x === 'number',
      'X must be a number' );
    assert( typeof y === 'number',
      'Y must be a number' );

    this._x = x;
    this._y = y;

    emit( Node.event.MOVED, {
      x,
      y,
      context: this
    });
  }
}

Node.event = {
  MOVED: 'Node.moved'
};




class Drawing extends Path {
  constructor({ color, fill, rigid }) {
    super();

    assert( typeof color === 'string' );
    assert( typeof fill === 'boolean' );
    assert( typeof rigid === 'boolean' );
    this._color = color;
    this._fill = fill;
    this._rigid = rigid;

    assert( this.isValid() );
  }


  isValid() {
    let valid = super.isValid(),
      rigid = this.rigid ? this.every(( point ) => point instanceof Node ) : true,
      fill = this.fill ? this.length === 0 || this.atIndex( 0 ) === this.atIndex( this.length - 1 ) : true;
      return ( valid && rigid && fill );
  }


  get color() {
    return this._color;
  }
  set color( value ) {
    assert( typeof value === 'string' );
    this._color = value;

    emit( Drawing.event.COLOR_CHANGED, {
      color: value,
      context: this
    });
  }


  get fill() {
    return this._fill;
  }
  set fill( value ) {
    assert( typeof value === 'boolean' );

    let oldValue = this.fill;

    this._fill = value;

    if ( value !== oldValue ) {
      if ( value && this.length > 0 ) {
        this._addPoints({
          atIndex: this.length,
          points: [ this.atIndex( 0 ) ]
        });
      } else if ( !value ) {
        this.removeNode(
          this.atIndex( this.length - 1 )
        );
      }
    }

    emit( Drawing.event.FILL_CHANGED, {
      fill: value,
      context: this
    });
  }


  get rigid() {
    return this._rigid;
  }
  set rigid( value ) {
    assert( typeof value === 'boolean' );

    let oldValue = this.rigid;

    this._rigid = value;

    if ( value && value !== oldValue ) {
      for ( let i = 0; i < this.length; i++ ) {
        if ( !( this.atIndex( i ) instanceof Node ) ) {
          this.splice( i, 1 );
        }
      }
    }

    emit( Drawing.event.RIGID_CHANGED, {
      rigid: value,
      context: this
    });
  }


  nodesAroundNode( node ) {
    let nodes = this.nodes(),
      index = nodes.indexOf( node );

    let { start, end, hasFirst, hasLast } = this._nodeIndicesAroundNodeIndex( index );

    return {
      start: this.atIndex( start ),
      end: this.atIndex( end ),
      hasFirst,
      hasLast
    };
  }


  _nodeIndicesAroundNodeIndex( index ) {
    let start,
      end,
      hasFirst = false,
      hasLast = false,
      positions = this.nodePositions();

    assert( index >= 0 && index < positions.length );

    if ( index === 0 && !this.fill ) { // First node
      start = positions[ index ]; // Include Node at index in splice
      hasFirst = true;
    } else if ( index === 0 && this.fill ) {
      // Nodes at front and end are identical. Ignore last node
      assert( positions.length >= 2 );
      start = positions[ positions.length - 2 ]; // Wrap to exclude Node at -2
    } else {
      start = positions[ index - 1 ]; // Exclude previous Node from splice
    }

    if ( index === positions.length - 1 && !this.fill ) { // Last node
      end = positions[ index ]; // Include Node at index in splice
      hasLast = true;
    } else {
      end = positions[ index + 1 ]; // Exclude next Node from splice
    }

    return { start, end, hasFirst, hasLast };
  }


  removePointsBetweenNodes( node1, node2 ) {
    assert( node1 instanceof Node );
    assert( node2 instanceof Node );

    let start = this.indexOf( node1 ),
      end = this.indexOf( node2, start );

    assert( start > -1,
      'Node not found' );
    assert( end > -1,
      'Node not found' );
    assert( start <= end );

    start++; // Exclude node itself from operation

    return this._removePoints({ start, end });
  }


  addPointsAfterNode( node, points ) {
    assert( node instanceof Node );
    assert( Array.isArray( points ) );
    assert( this.indexOf( node ) > -1,
      'Node not found' );

    let atIndex = this.indexOf( node ) + 1;

    return this._addPoints({ atIndex, points });
  }


  addNode( node, nodeIndex ) {
    let nodePositions = this.nodePositions(),
      atIndex = this.length;

    assert( node instanceof Node );

    assert( Number.isInteger( nodeIndex ) );
    assert( nodeIndex > -1 );

    if ( nodePositions.length > 0 && nodeIndex >= 0 && nodeIndex < nodePositions.length ) {
      atIndex = nodePositions[ nodeIndex ] + 1;
    }

    let points = [ node ];
    if ( this.length === 0 && this.fill ) {
      points.push( node );
    } else if ( this.fill && atIndex === this.length ) {
      atIndex--;
    }

    this._addPoints({
      atIndex,
      points
    });
  }


  removeNode( node ) {
    assert( node instanceof Node );

    let indexOnPath = this.indexOf( node ),
      index = this.nodePositions().indexOf( indexOnPath );

    return this.removeNodeAtIndex( index );
  }


  removeNodeAtIndex( index ) {
    let { start, end, hasFirst, hasLast } = this._nodeIndicesAroundNodeIndex( index );

    if ( !hasFirst && ( !this.fill || this.length > 2 ) ) {
      start++;
    }

    if ( hasLast || ( this.fill && this.length <= 2 ) ) {
      end++;
    }

    let removedPoints = this._removePoints({ start, end });

    return removedPoints;
  }


  _removePoints({ start, end }) {
    assert( start >= 0 );
    assert( end <= this.length );
    assert( start <= end || this.fill );

    let removeLength = 0,
      removedPoints = [];

    if ( this.fill && start > end ) {
      // assert( start < this.length - 1 );

      // removeLength = this.length - start - 1;
      removeLength = this.length - start;

      assert( removeLength >= 0 );

      removedPoints.push(
        ...this.splice( start, removeLength )
      );

      // Remove last point
      // @Why: This point is also the first point of
      //       the next operation. Removing the last point now
      //       prevents duplicates.
      removedPoints.pop();

      this.push( this.atIndex( end ) );

      start = 0;
    }

    removeLength = end - start;
    removedPoints.push(
      ...this.splice( start, removeLength )
    );

    assert( this.isValid(),
      'Invalid path operation' );

    if ( removedPoints.length === 2 && removedPoints[ 0 ] === removedPoints[ 1 ] ) {
      removedPoints.pop();
    }

    emit( Drawing.event.POINTS_REMOVED, {
      start,
      end,
      removedPoints: removedPoints,
      context: this
    });

    return removedPoints;
  }


  _addPoints({ atIndex, points }) {
    assert( atIndex >= 0 && atIndex <= this.length,
      'Out of bounds' );
    assert( Array.isArray( points ),
      'points must be an Array' );

    this.splice( atIndex, 0, ...points );

    // if ( this.fill && atIndex === 0 ) {
    //   if ( this.length === 1 && this.atIndex( 0 ) instanceof Node ) {
    //     this.push( this.atIndex( 0 ) );
    //   } else if ( this.length > 1 ) {
    //     this.removePoints({
    //       start: this.length - 1,
    //       end: this.length
    //     });
    //     this.push( this.atIndex( 0 ) );
    //   }
    // }

    assert( this.isValid(),
      'Invalid path operation' );

    emit( Drawing.event.POINTS_ADDED, {
      atIndex,
      addedPoints: points,
      context: this
    });
  }


  pointAtIndex( index ) {
    return this.atIndex( index );
  }


  nodePositions() {
    let points = this,
      positions = [];

    for ( let i = 0; i < points.length; i++ ) {
      let point = points.atIndex( i );

      if ( point instanceof Node ) {
        positions.push( i );
      }
    }

    return positions;
  }


  points() {
    return this.filter(() => true );
  }


  nodes() {
    let nodes = this.filter(( point ) => point instanceof Node );
    if ( this.fill ) {
      nodes.pop();
    }

    return nodes;
  }
}

Drawing.event = {
  COLOR_CHANGED: 'Drawing.colorChanged',
  FILL_CHANGED: 'Drawing.fillChanged',
  RIGID_CHANGED: 'Drawing.rigidChanged',
  POINTS_ADDED: 'Drawing.pointsAdded',
  POINTS_REMOVED: 'Drawing.pointsRemoved'
};




class Territory {
  constructor() {
    this._drawings = [];
    this._activeDrawingIndex = -1;
  }


  get length() {
    return this._drawings.length;
  }


  find( cb ) {
    return this._drawings.find( cb );
  }


  atIndex( index ) {
    assert( Number.isInteger( index ) );
    assert( index >= 0 && index < this._drawings.length );

    return this._drawings[ index ];
  }


  addDrawing({ atIndex, drawing }) {
    assert( Number.isInteger( atIndex ) );
    assert( drawing instanceof Drawing );

    emit( Territory.event.DRAWING_ADDED, {
      atIndex,
      drawing,
      context: this
    });

    return this._drawings.splice( atIndex, 0, drawing );
  };


  removeDrawing( drawing ) {
    assert( drawing instanceof Drawing );

    let index = this._drawings.indexOf( drawing );
    assert( index > -1,
      'Drawing not found' );

    return this.removeDrawingAtIndex( index );
  }


  removeDrawingAtIndex( index ) {
    assert( index >= 0 && index < this._drawings.length,
      'Out of bounds' );

    let removedDrawing = this._drawings.splice( index, 1 )[ 0 ],
      nodes = removedDrawing.nodes();

    for ( let node of nodes ) {
      removedDrawing.removeNode( node );
    }

    emit( Territory.event.DRAWING_REMOVED, {
      atIndex: index,
      drawing: removedDrawing,
      context: this
    });

    return removedDrawing;
  }


  toGeoJson() {
    let geoJson = {
      type: 'FeatureCollection'
    };

    geoJson.features = this._drawings.map(
      ( drawing ) => {
        let feature = {
          type: 'Feature'
        };

        let coordinates = drawing._points.map(
          ( point ) => {
            let { x, y } = point;
            return [ x, y ];
          }
        );

        feature.geometry = {
          type: drawing.fill ? 'Polygon' : 'LineString',
          coordinates: drawing.fill ? [ coordinates ] : coordinates
        };

        let { color, rigid, fill } = drawing;
        feature.properties = { color, rigid, fill };
        feature.properties.nodePositions = drawing.nodePositions();

        return feature;
      }
    );

    return geoJson;
  }


  static fromGeoJson( geoJson ) {
    assert( typeof geoJson === 'object' );
    let drawings = new Territory();

    assert( Array.isArray( geoJson.features ) );
    geoJson.features.forEach(
      ( feature, i ) => {
        assert( typeof feature.properties === 'object' );
        assert( typeof feature.geometry === 'object' )

        let { color, rigid, fill, nodePositions } = feature.properties;
        assert( typeof color === 'string' );
        assert( typeof rigid === 'boolean' );
        assert( typeof fill === 'boolean' );
        assert( Array.isArray( nodePositions ) );

        let drawing = new Drawing({ color, rigid, fill });

        drawings.addDrawings({
          atIndex: -1,
          drawing
        });

        let coordinates;
        if ( fill ) {
          coordinates = feature.geometry.coordinates[ 0 ];
        } else {
          coordinates = feature.geometry.coordinates;
        }
        assert( Array.isArray( coordinates ) );

        let points = coordinates.map(
          ( coordinate, i ) => {
            let [ x, y ] = coordinate;

            if ( nodePositions.indexOf( i ) === -1 ) {
              return new Point( x, y );
            } else {
              return new Node( x, y );
            }
          }
        );

        drawing.addPoints({
          atIndex: 0,
          points
        });

        return drawing;
      }
    );

    return drawings;
  }
}

Territory.event = {
  DRAWING_ADDED: 'Territory.drawingAdded',
  DRAWING_REMOVED: 'Territory.drawingRemoved'
};




export { Point, Node, Drawing, Territory };
