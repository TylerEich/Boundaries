import EventEmitter from 'src/modules/event-emitter';




export default class Shape extends EventEmitter {
  constructor( color, fill, rigid ) {
    super();

    this.path = [];

    this.color = String( color );

    this.fill = fill;
    this.rigid = rigid;
  }


  get fill() {
    return this._fill;
  }
  set fill( value ) {
    this._fill = Boolean( value );
    this._sanitizePath();
  }


  get rigid() {
    return this._rigid;
  }
  set rigid( value ) {
    this._rigid = Boolean( value );
    this._sanitizeRigidChange();
  }


  _sanitizeRigidChange() {
    if ( this.rigid ) {
      this.path = this.path.filter( point => point.node );
    }
  }


  _sanitizePath() {
    if ( !this.path.length ) {
      return;
    }

    const firstNode = this.path[ 0 ];
    const lastNode = this.path[ this.path.length - 1 ];

    firstNode.node = true;
    lastNode.node = true;

    if ( this.fill && firstNode !== lastNode ) {
      this.path.push( firstNode );
    } else if ( !this.fill && firstNode === lastNode && this.path.length > 1 ) {
      this.path.pop();
    }
  }


  addPath( path = [], index = this.path.length ) {
    let spliceStart = index;
    if ( this.fill && index === this.path.length && this.path.length > 1 ) {
      spliceStart--;
    }

    let firstNode = this.path[ 0 ];

    this.path.splice( spliceStart, 0, ...path );

    this._sanitizePath();

    this.emit( 'add', {
      path,
      index: spliceStart,
      target: this
    });
  }


  deleteNode( node ) {
    const changes = [];
    const index = this.path.indexOf( node );
    let removed;

    if ( index === -1 ) {
      throw 'node not found';
    }
    let startIndex = index;
    let deleteCount = 0;

    if ( this.fill && index === 0 ) {
      // firstNode === lastNode
      // Look from end of path for nodes before firstNode
      for ( let i = this.path.length - 2; i >= 0; i-- ) {
        if ( this.path[ i ].node ) {
          removed = this.path.splice( i + 1, this.path.length - i );

          changes.push({
            object: this,
            type: 'splice',
            index: i + 1,
            addedCount: 0,
            removed
          });

          break;
        }
      }
    } else {
      // Look backwards for nearest node
      for ( let i = index - 1; i >= 0; i-- ) {
        if ( this.path[ i ].node ) {
          // Start immediately after this node
          startIndex = i + 1;
          deleteCount += index - startIndex;
          break;
        }
      }
    }

    // Delete node itself
    deleteCount++;

    // Look ahead for nearest node
    for ( let i = index + 1; i < this.path.length; i++ ) {
      if ( this.path[ i ].node ) {
        // End immediately before this node
        deleteCount += i - index - 1;
        break;
      }
    }

    removed = this.path.splice( startIndex, deleteCount );

    changes.push({
      object: this,
      type: 'splice',
      index: startIndex,
      addedCount: 0,
      removed
    });

    this._sanitizePath();

    this.emit( 'change', changes );
    this.emit( 'delete', {
      path: removed,
      index: startIndex,
      target: this
    });
  }


  toFeature() {
    const { fill, color, rigid } = this;

    const coordinates = [];
    const nodePositions = [];

    this.path.forEach(
      ( point, i ) => {
        const { x, y } = point;
        coordinates.push([ x, y ]);

        if ( point.node ) {
          nodePositions.push( i );
        }
      }
    );

    return {
      type: 'Feature',
      geometry: {
        type: fill ? 'Polygon' : 'LineString',
        coordinates: fill ? [ coordinates ] : coordinates
      },
      properties: {
        color,
        fill,
        rigid,
        nodePositions
      }
    };
  }


  toMultiPointFeature( { geometry, properties } = this.toFeature() ) {
    let path;
    if ( properties.fill ) {
      path = geometry.coordinates[ 0 ];
    } else {
      path = geometry.coordinates;
    }

    let points = properties.nodePositions.map( position => path[ position ] );

    if ( properties.fill ) {
      // Last point will be duplucate of first
      points.pop();
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'MultiPoint',
        coordinates: points
      },
      properties
    };
  }


  static fromFeature( feature = {} ) {
    try {
      const { color, rigid, fill, nodePositions } = feature.properties;

      let coordinates;
      if ( fill ) {
        coordinates = feature.geometry.coordinates[ 0 ];
      } else {
        coordinates = feature.geometry.coordinates;
      }

      const path = coordinates.map(
        ( coordinate, i ) => {
          const [ x, y ] = coordinate;
          const point = { x, y };

          if ( nodePositions.indexOf( i ) > -1 ) {
            point.node = true;
          }

          return point;
        }
      );

      const shape = new Shape( color, fill, rigid );
      shape.addPath( path );

      return shape;
    } catch ( e ) {
      console.warn( 'Feature is invalid' );
      return new Shape();
    }
  }
}
