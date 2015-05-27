/* eslint-env jasmine */


describe( 'ShapeCollection', () => {
  let ShapeCollection;
  let collection;
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
        'src/modules/shape-collection-class'
      ].map( path => System.import( path ) )
    )
      .then( ([ shapeModule, shapeCollectionModule ]) => {
        Shape = shapeModule.default;
        ShapeCollection = shapeCollectionModule.default;
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

    collection = new ShapeCollection();
    shape = new Shape( color, fill, rigid );
    shape.addPath( path );
  });


  it( 'addShape(): emits "add" event', done => {
    collection.once( 'add', ({ shape: addedShape }) => {
      expect( addedShape ).toBe( shape );
      done();
    });

    collection.addShape( shape );
  });


  it( 'addShape()', () => {
    collection.addShape( shape );

    let shapes = collection.getShapes();

    expect( shapes.length ).toEqual( 1 );
    expect( shapes[ 0 ] ).toBe( shape );
  });


  it( 'deleteShape(): emits "delete" event', done => {
    collection.once( 'delete', ({ shape: deletedShape }) => {
      expect( deletedShape ).toBe( shape );
      done();
    });

    collection.addShape( shape );

    collection.deleteShape( shape );
  });


  it( 'deleteShape()', () => {
    collection.addShape( shape );

    collection.deleteShape( shape );

    let shapes = collection.getShapes();

    expect( shapes.length ).toEqual( 0 );
    expect( shapes.indexOf( shape ) ).toEqual( -1 );
  });


  it( 'toFeatureCollection()', () => {
    collection.addShape( shape );

    expect( collection.toFeatureCollection() ).toEqual( featureCollection );
  });


  it( 'fromFeatureCollection()', () => {
    collection = ShapeCollection.fromFeatureCollection( featureCollection );

    expect( collection.toFeatureCollection() ).toEqual( featureCollection );
  });
});
