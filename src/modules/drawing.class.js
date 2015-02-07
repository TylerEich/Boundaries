import { emit } from 'pubsub';
import assert from 'assert';




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


  indexOf( point ) {
    assert( point instanceof Point );

    return this._points.indexOf( point );
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


  moveTo( x, y ) {
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


  equals( point ) {
    return ( this.x === point.x && this.y === point.y )
  }
}




class Node extends Point {
  constructor( x, y ) {
    super( x, y );
  }


  moveTo( x, y ) {
    super.moveTo( x, y );

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
  constructor({ color, fill, rigid, points = [] }) {
    assert( Array.isArray( points ) );
    super( ...points );

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
      fill = this.fill ? this.atIndex( 0 ) === this.atIndex( this.length - 1 ) : true;
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
      if ( value && this.atIndex( 0 ) ) {
        this.addPoints({
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

    let { start, end, hasFirst, hasLast } = this.nodeIndicesAroundNodeIndex( index );

    return {
      start: this.atIndex( start ),
      end: this.atIndex( end ),
      hasFirst,
      hasLast
    };
  }


  nodeIndicesAroundNodeIndex( index ) {
    let start,
      end,
      hasFirst = false,
      hasLast = false,
      positions = this.nodePositions();

    assert( index >= 0 && index < positions.length );

    /*
      Include logic for closed polygons
      Allow seamless wrapping
      Splice both ends of array if first or last
        node is removed
    */

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


  removeNode( node ) {
    assert( node instanceof Node );

    let indexOnPath = this.indexOf( node ),
      index = this.nodePositions().indexOf( indexOnPath );

    return this.removeNodeAtIndex( index );
  }


  removeNodeAtIndex( index ) {
    let { start, end, hasFirst, hasLast } = this.nodeIndicesAroundNodeIndex( index );
    if ( !hasFirst ) {
      start++;
    }
    if ( hasLast ) {
      end++;
    }

    let removedPoints = this.removePoints({ start, end });
    return removedPoints;
  }


  removePoints({ start, end }) {
    assert( start >= 0 );
    assert( end <= this.length );
    assert( start <= end || this.fill );

    let removeLength = 0,
      removedPoints = [];

    if ( this.fill && start >= end ) {
      removeLength = this.length - start;
      
      assert( removeLength >= 0 );

      removedPoints.push(
        ...this.splice( start, removeLength )
      );
      this.push( this.atIndex( end ) );

      start = 0;
    }

    removeLength = end - start;
    removedPoints.push(
      ...this.splice( start, removeLength )
    );

    assert( this.isValid(),
      'Invalid path operation' );

    emit( Drawing.event.POINTS_REMOVED, {
      start,
      end,
      removedPoints: removedPoints,
      context: this
    });

    return removedPoints;
  }


  addPoints({ atIndex, points }) {
    assert( atIndex >= 0 && atIndex <= this.length,
      'Out of bounds' );
    assert( Array.isArray( points ),
      'points must be an Array' );

    this.splice( atIndex, 0, ...points );

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


  nodes() {
    return this.filter(( point ) => point instanceof Node );
  }
}

Drawing.event = {
  COLOR_CHANGED: 'Drawing.colorChanged',
  FILL_CHANGED: 'Drawing.fillChanged',
  RIGID_CHANGED: 'Drawing.rigidChanged',
  POINTS_ADDED: 'Drawing.pointsAdded',
  POINTS_REMOVED: 'Drawing.pointsRemoved'
};




// class DrawingCollection extends Array {

// }




export { Point, Node, Drawing };
