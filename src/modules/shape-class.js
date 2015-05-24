import EventEmitter from 'src/modules/event-emitter';




export class Shape extends EventEmitter {
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


  addPath( path = [], index = Number.MAX_VALUE ) {
    this.path.splice( index, 0, ...path );

    this._sanitizePath();

    this.emit( 'add', {
      path,
      index,
      target: this
    });
  }


  deleteNode( node ) {
    const index = this.path.indexOf( node );
    if ( index === -1 ) {
      throw 'node not found';
    }
    let startIndex = index;
    let deleteCount = 0;

    // Look backwards for nearest node
    for ( let i = index - 1; i >= 0; i-- ) {
      if ( this.path[ i ].node ) {
        // Start immediately after discovered node
        startIndex = i + 1;
        deleteCount += index - startIndex;
        break;
      }
    }

    // Delete node itself
    deleteCount++;

    // Look ahead for nearest node
    for ( let i = index + 1; i < this.path.length; i++ ) {
      if ( this.path[ i ].node ) {
        deleteCount += i - index - 1;
        break;
      }
    }

    const deletedPath = this.path.splice( startIndex, deleteCount );

    this._sanitizePath();

    this.emit( 'delete', {
      path: deletedPath,
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


export class ShapeStore extends EventEmitter {
  constructor() {
    super();

    this._shapes = [];
  }


  getShapes() {
    return this._shapes;
  }


  addShape( shape ) {
    this._shapes.push( shape );

    this.emit( 'add', {
      shape,
      target: this
    });
  }


  deleteShape( shape ) {
    const shapeIndex = this._shapes.indexOf( shape );

    if ( shapeIndex > -1 ) {
      this._shapes.splice( shapeIndex, 1 );
      this.emit( 'delete', {
        shape,
        target: this
      });
    }
  }


  toFeatureCollection() {
    const features = this._shapes.map(
      ( shape ) => shape.toFeature()
    );

    return {
      type: 'FeatureCollection',
      features
    };
  }


  static fromFeatureCollection( featureCollection = {} ) {
    let shapeStore = new ShapeStore();

    try {
      featureCollection.features.forEach(
        ( feature ) => {
          const shape = Shape.fromFeature( feature );

          shapeStore.addShape( shape );
        }
      );
    } catch ( error ) {
      console.warn( 'geoJson is invalid', error );
      return new ShapeStore();
    }

    return shapeStore;
  }
}
