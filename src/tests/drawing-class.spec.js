jasmine.DEFAULT_TIMEOUT_INTERVAL = 500;




import { Point, Node, Drawing } from '../modules/drawing-class';
import * as PubSubModule from '../modules/pubsub';




describe( 'DrawingModule', () => {
  let emit, on, off;


  beforeEach(() => {
    emit = spyOn( PubSubModule, 'emit' ).and.callThrough();
    on = spyOn( PubSubModule, 'on' ).and.callThrough();
    off = spyOn( PubSubModule, 'off' ).and.callThrough();
  });
  // beforeEach(() => {
  //   emit = spyOn
  // } done => {
  //   Promise.all([
  //     System.import( 'drawing-class' ),
  //     System.import( 'pubsub' )
  //   ])
  //     .then(([ DrawingModule, PubSubModule ]) => {
  //       ({ Point, Node, Drawing } = DrawingModule );

  //       emit = spyOn( PubSubModule, 'emit' ).and.callThrough();
  //       on = spyOn( PubSubModule, 'on' ).and.callThrough();
  //       off = spyOn( PubSubModule, 'off' ).and.callThrough();
  //       // ({
  //       //   emit,
  //       //   on,
  //       //   off
  //       // }) = PubSubModule;
  //     })
  //     .then( done )
  //     .catch( err => console.error( 'ERROR:', err ) );
  // });




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


    it("Rejects incorrect input", function() {
      expect( Point.bind( {}, '1', '0' ) ).toThrow();
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
        color,
        fill,
        rigid
      });

      drawing._addPoints({ atIndex: 0, points });
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
        expect( data.color ).toEqual( '#ffffff' );
        resolveColor();
      });

      on( Drawing.event.FILL_CHANGED, ( msg, data ) => {
        expect( data.fill ).toEqual( true );
        resolveFill();
      });

      on( Drawing.event.RIGID_CHANGED, ( msg, data ) => {
        expect( data.rigid ).toEqual( false );
        resolveRigid();
      });

      Promise.all([
        new Promise(( resolve ) => resolveColor = resolve ),
        new Promise(( resolve ) => resolveFill = resolve ),
        new Promise(( resolve ) => resolveRigid = resolve )
      ]).then( done );

      drawing.color = '#ffffff';
      drawing.fill = true;
      drawing.rigid = false;
    });


    it("Gets index of Point", function() {
      let point = points[ 2 ];

      expect( drawing.indexOf( point ) ).toEqual( 2 );
    });


    it("Gets point at index", function() {
      expect( drawing.pointAtIndex( 2 ) ).toEqual( points[ 2 ] );
    });


    it("Gets node positions", function() {
      expect( drawing.nodePositions() ).toEqual([ 0, 9 ]);
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
      
      drawing._addPoints({
        atIndex: 5,
        points: morePoints
      });

      removedPoints = drawing.removeNodeAtIndex( 1 );

      expect( drawing.nodePositions() ).toEqual([ 0, 1, 6 ]);
      expect( removedPoints.length ).toEqual( 10 );

      drawing._addPoints({
        atIndex: 1,
        points: removedPoints
      });

      removedPoints = drawing.removeNodeAtIndex( 0 );

      expect( drawing.nodePositions() ).toEqual([ 0, 6, 11 ]);
      expect( removedPoints.length ).toEqual( 5 );

      drawing._addPoints({
        atIndex: 0,
        points: removedPoints
      });

      removedPoints = drawing.removeNodeAtIndex( 3 );

      expect( drawing.nodePositions() ).toEqual([ 0, 5, 11 ]);
      expect( removedPoints.length ).toEqual( 5 );

      expect( drawing.removeNodeAtIndex.bind( drawing, 3 ) ).toThrow();
    });


    it("Provides nodesAroundNode", function() {
      let morePoints = generatePoints( 7 );

      drawing._addPoints({
        atIndex: 5,
        points: morePoints
      });

      let nodes = drawing.nodes(),
        nodesAroundNode = drawing.nodesAroundNode( nodes[ 1 ] );

      expect( nodesAroundNode.start ).toBe( nodes[ 0 ] );
      expect( nodesAroundNode.end ).toBe( nodes[ 2 ] );
    });


    it("Removes first point of polygon properly", function() {
      let morePoints = generatePoints( 7 );
      drawing.fill = true;

      drawing._addPoints({
        atIndex: drawing.length - 1,
        points: morePoints.slice( 1, -1 )
      });

      drawing.removeNodeAtIndex( 0 );

      expect( drawing.length ).toEqual( 2 );
    });


    it("Removes single point from polygon properly", function() {
      drawing = new Drawing({
        color,
        rigid,
        fill: true
      });

      let point = generatePoints( 1 )[ 0 ];
      drawing._addPoints({
        atIndex: 0,
        points: [ point, point ]
      });
      drawing.removeNodeAtIndex( 0 );

      expect( drawing.length ).toEqual( 0 );
    });


    it("Removes single point", function() {
      drawing._removePoints({
        start: 0,
        end: 10
      });

      drawing._addPoints({
        atIndex: 0,
        points: generatePoints( 1 )
      });

      let removedPoints = drawing.removeNodeAtIndex( 0 );

      expect( drawing.nodePositions() ).toEqual([]);
      expect( removedPoints.length ).toEqual( 1 );
    });
  });
});
