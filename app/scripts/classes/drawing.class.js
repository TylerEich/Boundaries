// import { Marker, Polygon, Polyline } from './map';

import { emit } from '../hub.js';




class Path extends Array {
  constructor( ...points ) {
    super( ...points );
  }

  isValid() {
    return (
      // Path can be empty
      this.length === 0 ||

      // Non-empty Path must start and end with a Node
      this[ this.length - 1 ] instanceof Node &&
      this[ 0 ] instanceof Node
    );
  }
}




class Point {
  constructor( x, y ) {
    this._x = x;
    this._y = y;
  }


  moveTo( x, y ) {
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


  moveTo({ x, y }) {
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
    this._path = new Path( points );

    this._color = color;
    this._fill = fill;
    this._rigid = rigid;
  }


  get color() {
    return this._color;
  }
  set color( value ) {
    console.assert( typeof value === 'string' );

    this._color = value;

    emit( Drawing.event.COLOR_CHANGED, {
      color: value,
      context: this
    } );
  }


  get fill() {
    return this._fill;
  }
  set fill( value ) {
    console.assert( typeof value === 'boolean' );

    this._fill = value;

    emit( Drawing.event.FILL_CHANGED, {
      fill: value,
      context: this
    } );
  }


  get rigid() {
    return this._rigid;
  }
  set rigid( value ) {
    console.assert( typeof value === 'boolean' );

    this._rigid = value;

    emit( Drawing.event.RIGID_CHANGED, {
      rigid: value,
      context: this
    } );
  }


  indexOf( point ) {
    console.assert( point instanceof Point );

    return this._path.indexOf( point );
  }

  removeNodeAtIndex( index ) {
    let start,
      end,
      positions = this.nodePositions();

    console.assert( index >= 0 && index < positions.length );

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
    console.assert( start >= 0 );
    console.assert( end < this._path.length );

    let removedPoints = this._path.splice( start, end );

    console.assert( this._path.isValid() );

    emit( Drawing.event.POINTS_REMOVED, {
      start,
      end,
      removedPoints: removedPoints,
      context: this
    });

    return removedPoints;
  }


  addPoints({ atIndex, points }) {
    console.assert( atIndex >= 0 && atIndex <= this._path.length );
    console.assert( Array.isArray( points ) );

    this._path.splice( atIndex, 0, ...path );

    console.assert( this._path.isValid() );

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
