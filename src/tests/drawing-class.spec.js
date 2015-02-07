jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;




describe( 'DrawingModule', () => {
  var emit, on, off;
  var Point, Node, Drawing;




  beforeEach(done => {
    Promise.all([
      System.import( 'drawing' ),
      System.import( 'pubsub' )
    ])
      .then(([ DrawingModule, PubSubModule ]) => {
        ({
          Point,
          Node,
          Drawing
        }) = DrawingModule;

        emit = spyOn( PubSubModule, 'emit' ).and.callThrough();
        on = spyOn( PubSubModule, 'on' ).and.callThrough();
        off = spyOn( PubSubModule, 'off' ).and.callThrough();
        // ({
        //   emit,
        //   on,
        //   off
        // }) = PubSubModule;
      })
      .then( done )
      .catch( err => console.error( 'ERROR:', err ) );
  });




  describe("Point", function() {
    it("Point coordinates match input", function() {
      let point = new Point( 0, 1 );

      expect( point.x ).toEqual( 0 );
      expect( point.y ).toEqual( 1 );
    });


    it("Compares coordinates of two points", function() {
      let point1 = new Point( 0, 1 ),
        point2 = new Point( 0, 1 ),
        point3 = new Point( 1, 0 );

      expect( point1.equals( point2 ) ).toEqual( true );
      expect( point2.equals( point1 ) ).toEqual( true );

      expect( point1.equals( point3 ) ).toEqual( false );
      expect( point3.equals( point1 ) ).toEqual( false );
    });


    it("Changes coordinates properly", function() {
      let point = new Point( 1, 0 );
      point.moveTo( 2, 1 );

      expect( point.x ).toEqual( 2 );
      expect( point.y ).toEqual( 1 );
    });


    it("Rejects incorrect input", function() {
      expect( Point.bind( {}, '1', '0' ) ).toThrow();

      let point = new Point( 1, 0 );
      expect( point.moveTo.bind( point, '1', '0' ) ).toThrow();
    });
  });




  describe("Node", function() {
    it("Is instance of Point", function() {
      let node = new Node( 1, 0 );

      expect( node instanceof Point ).toEqual( true );
    });


    it("Emits event when moved", function( done ) {
      on( Node.event.MOVED, ( msg, data ) => {
        expect( data.x ).toEqual( 0 );
        expect( data.y ).toEqual( 1 );
        expect( data.context ).toBe( node );

        done();
      });

      let node = new Node( 1, 0 );
      node.moveTo( 0, 1 );
    });
  });




  describe("Drawing", function() {
    let points, color, fill, rigid, drawing;


    function generatePoints( length ) {
      let points = [];
      
      for ( let i = 0; i < length; i++ ) {
        let x = Math.random() * 360 - 180,
          y = Math.random() * 360 - 180,
          point;

        if ( i === 0 || i === length - 1 ) {
          point = new Node( x, y );
        } else {
          point = new Point( x, y );
        }

        points.push( point );
      }

      return points;
    }


    beforeEach(() => {
      points = generatePoints( 10 );
      color = '#ff0000';
      fill = false;
      rigid = false;

      drawing = new Drawing({
        points,
        color,
        fill,
        rigid
      });
    });


    it("Properties match parameters", function() {
      expect( drawing.color ).toEqual( color );
      expect( drawing.fill ).toEqual( fill );
      expect( drawing.rigid ).toEqual( rigid );

      let newColor = drawing.color = '#ffffff',
        newFill = drawing.fill = true,
        newRigid = drawing.rigid = true;

      expect( drawing.color ).toEqual( newColor );
      expect( drawing.fill ).toEqual( newFill );
      expect( drawing.rigid ).toEqual( newRigid );
    });


    it("Emits events on property change", function( done ) {
      let resolveColor, resolveFill, resolveRigid;

      on( Drawing.event.COLOR_CHANGED, ( msg, data ) => {
        expect( data.color ).toEqual( newColor );
        resolveColor();
      });

      on( Drawing.event.FILL_CHANGED, ( msg, data ) => {
        expect( data.fill ).toEqual( newFill );
        resolveFill();
      });

      on( Drawing.event.RIGID_CHANGED, ( msg, data ) => {
        expect( data.rigid ).toEqual( newRigid );
        resolveRigid();
      });

      Promise.all([
        new Promise(( resolve ) => resolveColor = resolve ),
        new Promise(( resolve ) => resolveFill = resolve ),
        new Promise(( resolve ) => resolveRigid = resolve )
      ]).then( done );

      let newColor = drawing.color = '#ffffff',
        newFill = drawing.fill = true,
        newRigid = drawing.rigid = false;
    });


    it("Gets index of Point", function() {
      let point = points[ 2 ];

      expect( drawing.indexOf( point ) ).toEqual( 2 );
    });


    it("Gets point at index", function() {
      expect( drawing.pointAtIndex( 2 ) ).toEqual( points[ 2 ] );
    });


    it("Adds points in a valid manner", function() {
      let morePoints = generatePoints( 5 );

      expect( drawing.addPoints.bind( drawing, {
        atIndex: 5,
        points: morePoints
      }) ).not.toThrow();
      expect( drawing.indexOf( morePoints[ 0 ] ) ).toEqual( 5 );

      expect( drawing.addPoints.bind( drawing, {
        atIndex: -1,
        points: morePoints
      }) ).toThrow();
    });


    it("Gets node positions", function() {
      expect( drawing.nodePositions() ).toEqual([ 0, 9 ]);
    });


    it("Removes points in a valid manner", function() {
      // Remove all points between bounding nodes. Still valid.
      expect( drawing.removePoints.bind( drawing, {
        start: 1,
        end: 9
      }) ).not.toThrow();

      // Bounding node at index 0. Removal invalidates path.
      expect( drawing.removePoints.bind( drawing, {
        start: 0,
        end: 4
      }) ).toThrow();
    });


    it("Removes nodes by reference", function() {
      let node = points[ 0 ],
        removedPoints = drawing.removeNode( node );

      expect( drawing.nodePositions() ).toEqual([ 0 ]);
      expect( removedPoints.length ).toEqual( 9 );
    });


    it("Removes points around Node", function() {
      let morePoints = generatePoints( 7 ),
        removedPoints;
      
      drawing.addPoints({
        atIndex: 5,
        points: morePoints
      });

      removedPoints = drawing.removeNodeAtIndex( 1 );

      expect( drawing.nodePositions() ).toEqual([ 0, 1, 6 ]);
      expect( removedPoints.length ).toEqual( 10 );

      drawing.addPoints({
        atIndex: 1,
        points: removedPoints
      });

      removedPoints = drawing.removeNodeAtIndex( 0 );

      expect( drawing.nodePositions() ).toEqual([ 0, 6, 11 ]);
      expect( removedPoints.length ).toEqual( 5 );

      drawing.addPoints({
        atIndex: 0,
        points: removedPoints
      });

      removedPoints = drawing.removeNodeAtIndex( 3 );

      expect( drawing.nodePositions() ).toEqual([ 0, 5, 11 ]);
      expect( removedPoints.length ).toEqual( 5 );

      expect( drawing.removeNodeAtIndex.bind( drawing, 3 ) ).toThrow();
    });


    it("Removes first point of polygon properly", function() {
      let morePoints = generatePoints( 7 );
      drawing.fill = true;

      drawing.addPoints({
        atIndex: drawing.length - 1,
        points: morePoints.slice( 1, -1 )
      });

      drawing.removeNodeAtIndex( 0 );

      expect( drawing.length ).toEqual( 2 );
    });


    it("Removes single point", function() {
      drawing.removePoints({
        start: 0,
        end: 10
      });

      drawing.addPoints({
        atIndex: 0,
        points: generatePoints( 1 )
      });

      let removedPoints = drawing.removeNodeAtIndex( 0 );

      expect( drawing.nodePositions() ).toEqual([]);
      expect( removedPoints.length ).toEqual( 1 );
    });
  });
});
