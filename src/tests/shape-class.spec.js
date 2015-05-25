/* eslint-env jasmine */

jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;




describe( 'Shape & ShapeStore', () => {
  let ShapeStore;
  let shapeStore;
  let Shape;
  let shape;

  let color;
  let fill;
  let rigid;

  let path;
  let longPath;


  let feature;
  let featureCollection;


  beforeAll( done => {
    Promise.all(
      [
        'src/modules/shape-class',
      ].map( path => System.import( path ) )
    )
      .then( ([ $shapeModule ]) => {
        ({ Shape, ShapeStore } = $shapeModule );
      })
      .then( done )
      .catch( err => console.error( err ) );
  });


  beforeEach( () => {
    color = '#ff0000';
    fill = false;
    rigid = true;

    path = [ 0, 1, 2, 3, 4 ].map( n => ({ x: n, y: n }) );
    path[ 0 ].node = true;
    path[ 4 ].node = true;

    longPath = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ].map( n => ({ x: n, y: n }) );
    longPath[ 0 ].node = true;
    longPath[ 4 ].node = true;
    longPath[ 9 ].node = true;


    feature = {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: [
          [ 0, 0 ],
          [ 1, 1 ],
          [ 2, 2 ],
          [ 3, 3 ],
          [ 4, 4 ]
        ]
      },
      properties: {
        color,
        fill,
        rigid,
        nodePositions: [ 0, 4 ]
      }
    };
    featureCollection = {
      type: 'FeatureCollection',
      features: [ feature ]
    };

    shapeStore = new ShapeStore();
    shape = new Shape( color, fill, rigid );
    shape.addPath( path );
  });




  it( 'Shape.addPath(): emits "add" event', done => {
    shape = new Shape( color, fill, rigid );

    shape.once( 'add', ({ path: addedPath }) => {
      expect( addedPath ).toEqual( path );
      done();
    });

    shape.addPath( path );
  });


  it( 'Shape.addPath(): sanitized input', () => {
    shape = new Shape( color, fill, rigid );

    shape.addPath( path );

    expect( shape.path.length ).toEqual( 5 );
    expect( shape.path ).toEqual( path );
  });


  it( 'Shape.addPath(): fill = true, unsanitized input', () => {
    shape = new Shape( color, true, rigid );

    shape.addPath( longPath.slice( 1 ) );

    expect( shape.path.length ).toEqual( 10 );
    expect( shape.path[ 0 ] ).toBe( shape.path[ shape.path.length - 1 ] );
    expect( shape.path[ 0 ].node ).toEqual( true );
  });


  it( 'Shape.deleteNode(): emits "delete" event', done => {
    shape = new Shape( color, fill, rigid );

    shape.once( 'delete', ({ path: deletedPath }) => {
      expect( deletedPath ).toEqual( longPath.slice( 1, 9 ) );
      done();
    });

    shape.addPath( longPath );
    const node = shape.path[ 4 ];

    shape.deleteNode( node );
  });

  describe( 'shape.fill = false', () => {
    beforeEach( () => {
      shape = new Shape( color, false, rigid );
    });
    it( 'Shape.deleteNode(): node 1 of 3', () => {
      shape.addPath( longPath );
      const node = shape.path[ 0 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 6 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'Shape.deleteNode(): node 2 of 3', () => {
      shape.addPath( longPath );
      const node = shape.path[ 4 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 2 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'Shape.deleteNode(): node 3 of 3', () => {
      shape.addPath( longPath );
      const node = shape.path[ 9 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 5 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'Shape.deleteNode(): node 1 of 2', () => {
      shape.addPath( path );
      const node = shape.path[ 0 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 1 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'Shape.deleteNode(): node 2 of 2', () => {
      shape.addPath( path );
      const node = shape.path[ 4 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 1 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'Shape.deleteNode(): node 1 of 1', () => {
      shape.addPath( path.slice( 0, 1 ) );
      const node = shape.path[ 0 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 0 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });
  });


  describe( 'shape.fill = true', () => {
    beforeEach( () => {
      shape = new Shape( color, true, rigid );
    });


    it( 'deleteNode(): node 1 of 3', () => {
      shape.addPath( longPath );
      const node = shape.path[ 0 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 7 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'deleteNode(): node 2 of 3', () => {
      shape.addPath( longPath );
      const node = shape.path[ 4 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 3 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'deleteNode(): node 3 of 3', () => {
      shape.addPath( longPath );
      const node = shape.path[ 9 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 6 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'deleteNode(): node 1 of 2', () => {
      shape.addPath( path );
      const node = shape.path[ 0 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 1 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'deleteNode(): node 2 of 2', () => {
      shape.addPath( path );
      const node = shape.path[ 4 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 2 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });


    it( 'deleteNode(): node 1 of 1', () => {
      shape.addPath( path.slice( 0, 1 ) );
      const node = shape.path[ 0 ];

      shape.deleteNode( node );

      expect( shape.path.length ).toEqual( 0 );
      expect( shape.path.indexOf( node ) ).toEqual( -1 );
    });
  });


  it( 'Shape.toFeature()', () => {
    expect( shape.toFeature() ).toEqual( feature );
  });


  it( 'Shape.fromFeature()', () => {
    shape = Shape.fromFeature( feature );

    expect( shape.toFeature() ).toEqual( feature );
  });




  it( 'ShapeStore.addShape(): emits "add" event', done => {
    shapeStore.once( 'add', ({ shape: addedShape }) => {
      expect( addedShape ).toBe( shape );
      done();
    });

    shapeStore.addShape( shape );
  });


  it( 'ShapeStore.addShape()', () => {
    shapeStore.addShape( shape );

    let shapes = shapeStore.getShapes();

    expect( shapes.length ).toEqual( 1 );
    expect( shapes[ 0 ] ).toBe( shape );
  });


  it( 'ShapeStore.deleteShape(): emits "delete" event', done => {
    shapeStore.once( 'delete', ({ shape: deletedShape }) => {
      expect( deletedShape ).toBe( shape );
      done();
    });

    shapeStore.addShape( shape );

    shapeStore.deleteShape( shape );
  });


  it( 'ShapeStore.deleteShape()', () => {
    shapeStore.addShape( shape );

    shapeStore.deleteShape( shape );

    let shapes = shapeStore.getShapes();

    expect( shapes.length ).toEqual( 0 );
    expect( shapes.indexOf( shape ) ).toEqual( -1 );
  });


  it( 'ShapeStore.toFeatureCollection()', () => {
    shapeStore.addShape( shape );

    expect( shapeStore.toFeatureCollection() ).toEqual( featureCollection );
  });


  it( 'ShapeStore.fromFeatureCollection()', () => {
    shapeStore = ShapeStore.fromFeatureCollection( featureCollection );

    expect( shapeStore.toFeatureCollection() ).toEqual( featureCollection );
  });


  // describe( 'addShape', function() {
  //   let shapes;
  //
  //
  //   function generatePoints( length ) {
  //     let points = [];
  //
  //     for ( let i = 0; i < length; i++ ) {
  //       let x = Math.random() * 360 - 180,
  //         y = Math.random() * 360 - 180,
  //         point;
  //
  //       if ( i === 0 || i === length - 1 ) {
  //         point = new Node( x, y );
  //       } else {
  //         point = new Point( x, y );
  //       }
  //
  //       points.push( point );
  //     }
  //
  //     return points;
  //   }
  //
  //
  //   beforeEach( () => {
  //     shapes = new ShapeStore();
  //
  //     points = generatePoints( 10 );
  //     color = '#ff0000';
  //     fill = false;
  //     rigid = false;
  //
  //     shapes = new ShapeStore( color, fill, rigid );
  //
  //     drawing._addPoints({ atIndex: 0, points });
  //   });
  //
  //
  //   it( 'addShape', () => {
  //
  //   });
  //
  //
  //   it('Removes nodes by reference', function() {
  //     let node = points[ 0 ],
  //       removedPoints = drawing.removeNode( node );
  //
  //     expect( drawing.nodePositions() ).toEqual([ 0 ]);
  //     expect( removedPoints.length ).toEqual( 9 );
  //   });
  //
  //
  //   it('Removes first point of polygon properly', function() {
  //     let morePoints = generatePoints( 7 );
  //     drawing.fill = true;
  //
  //     drawing._addPoints({
  //       atIndex: drawing.length - 1,
  //       points: morePoints.slice( 1, -1 )
  //     });
  //
  //     drawing.removeNodeAtIndex( 0 );
  //
  //     expect( drawing.length ).toEqual( 2 );
  //   });
  //
  //
  //   it('Removes single point from polygon properly', function() {
  //     drawing = new Drawing({
  //       color,
  //       rigid,
  //       fill: true
  //     });
  //
  //     let point = generatePoints( 1 )[ 0 ];
  //     drawing._addPoints({
  //       atIndex: 0,
  //       points: [ point, point ]
  //     });
  //     drawing.removeNodeAtIndex( 0 );
  //
  //     expect( drawing.length ).toEqual( 0 );
  //   });
  //
  //
  //   it('Removes single point', function() {
  //     drawing._removePoints({
  //       start: 0,
  //       end: 10
  //     });
  //
  //     drawing._addPoints({
  //       atIndex: 0,
  //       points: generatePoints( 1 )
  //     });
  //
  //     let removedPoints = drawing.removeNodeAtIndex( 0 );
  //
  //     expect( drawing.nodePositions() ).toEqual([]);
  //     expect( removedPoints.length ).toEqual( 1 );
  //   });
  // });
});
