import { emit } from 'pubsub';
import assert from 'assert';




class Path {
  constructor( ...points ) {
    this._points = points;
  }


  splice( ...args ) {
    return this._points.splice( ...args );
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




class Drawing {
  constructor({ color, fill, rigid, points = [] }) {
    assert( Array.isArray( points ) );
    this._path = new Path( ...points );
    assert( this._path.isValid() );

    assert( typeof color === 'string' );
    assert( typeof fill === 'boolean' );
    assert( typeof rigid === 'boolean' );
    this._color = color;
    this._fill = fill;
    this._rigid = rigid;
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

    this._fill = value;

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

    this._rigid = value;

    emit( Drawing.event.RIGID_CHANGED, {
      rigid: value,
      context: this
    });
  }


  indexOf( point ) {
    assert( point instanceof Point );

    return this._path.indexOf( point );
  }

  removeNodeAtIndex( index ) {
    let start,
      end,
      positions = this.nodePositions();

    assert( index >= 0 && index < positions.length );

    if ( index === 0 ) { // First node
      start = positions[ index ]; // Include Node at index in splice
    } else {
      start = positions[ index - 1 ] - 1; // Exclude previous Node from splice
    }

    if ( index === positions.length - 1 ) { // Last node
      end = positions[ index ] + 1; // Include Node at index in splice
    } else {
      end = positions[ index + 1 ]; // Exclude next Node from splice
    }

    let removedPoints = this.removePoints({ start, end });
    return removedPoints;
  }


  removePoints({ start, end }) {
    assert( start >= 0 );
    assert( end < this._path.length );

    let removedPoints = this._path.splice( start, end );

    assert( this._path.isValid() );

    emit( Drawing.event.POINTS_REMOVED, {
      start,
      end,
      removedPoints: removedPoints,
      context: this
    });

    return removedPoints;
  }


  addPoints({ atIndex, points }) {
    assert( atIndex >= 0 && atIndex <= this._path.length );
    assert( Array.isArray( points ) );

    this._path.splice( atIndex, 0, ...points );

    assert( this._path.isValid() );

    emit( Drawing.event.POINTS_ADDED, {
      atIndex,
      addedPoints: points,
      context: this
    });
  }


  nodePositions() {
    let points = this._path,
      positions = [];

    for ( let i = 0; i < points.length; i++ ) {
      let point = points[ i ];

      if ( point instanceof Node ) {
        positions.push( i );
      }
    }

    return positions;
  }


  get nodes() {
    return this._path.filter( point => point instanceof Node );
  }
}

Drawing.event = {
  COLOR_CHANGED: 'Drawing.colorChanged',
  FILL_CHANGED: 'Drawing.fillChanged',
  RIGID_CHANGED: 'Drawing.rigidChanged',
  POINTS_ADDED: 'Drawing.pointsAdded',
  POINTS_REMOVED: 'Drawing.pointsRemoved'
};




class DrawingCollection extends Array {

}




export { Point, Node, Drawing, DrawingCollection };
