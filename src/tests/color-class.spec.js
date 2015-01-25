describe( 'Color', () => {
  let Color;

  beforeEach(done => {
    System.import( 'color' )
      .then( $Color => Color = $Color.default )
      .then( done )
      .catch( err => console.error( err ) );
  });


  const DATA = [
    {
      name: 'Black',
      rgba: {
        r: 0,
        g: 0,
        b: 0,
        a: 1
      },
      hsla: {
        h: 0,
        s: 0.0,
        l: 0,
        a: 1
      },
      hex24: '000000',
      hex32: '000000ff'
    },
    {
      name: 'Red',
      rgba: {
        r: 1,
        g: 0,
        b: 0,
        a: 1
      },
      hsla: {
        h: 0,
        s: 1.0,
        l: 0.5,
        a: 1
      },
      hex24: 'ff0000',
      hex32: 'ff0000ff'
    },
    {
      name: 'Green',
      rgba: {
        r: 0,
        g: 1,
        b: 0,
        a: 1
      },
      hsla: {
        h: 1/3,
        s: 1.0,
        l: 0.5,
        a: 1
      },
      hex24: '00ff00',
      hex32: '00ff00ff'
    },
    {
      name: 'Blue',
      rgba: {
        r: 0,
        g: 0,
        b: 1,
        a: 1
      },
      hsla: {
        h: 2/3,
        s: 1.0,
        l: 0.5,
        a: 1
      },
      hex24: '0000ff',
      hex32: '0000ffff'
    },
    {
      name: 'Fuscia',
      rgba: {
        r: 1,
        g: 0,
        b: 1,
        a: 1
      },
      hsla: {
        h: 5/6,
        s: 1.0,
        l: 0.5,
        a: 1
      },
      hex24: 'ff00ff',
      hex32: 'ff00ffff'
    },
    {
      name: 'Light Blue',
      rgba: {
        r: 0,
        g: 0.5,
        b: 1,
        a: 1
      },
      hsla: {
        h: 7/12,
        s: 1.0,
        l: 0.5,
        a: 1
      },
      hex24: '0080ff',
      hex32: '0080ffff'
    },
    {
      name: 'Pale Blue',
      rgba: {
        r: 0.5,
        g: 0.5,
        b: 1,
        a: 1
      },
      hsla: {
        h: 2/3,
        s: 1.0,
        l: 0.75,
        a: 1
      },
      hex24: '8080ff',
      hex32: '8080ffff'
    },
    {
      name: 'Dark Blue',
      rgba: {
        r: 0,
        g: 0,
        b: 0.5,
        a: 1
      },
      hsla: {
        h: 2/3,
        s: 1.0,
        l: 0.25,
        a: 1
      },
      hex24: '000080',
      hex32: '000080ff'
    },
    {
      name: 'Orange',
      rgba: {
        r: 1,
        g: 0.5,
        b: 0,
        a: 1
      },
      hsla: {
        h: 1/12,
        s: 1.0,
        l: 0.5,
        a: 1
      },
      hex24: 'ff8000',
      hex32: 'ff8000ff'
    }
  ];


  for ( let datum of DATA ) {
    it( 'Converts ' + datum.name, () => {
      for ( let key in datum ) {
        if ( key === 'name' ) continue;
        
        let entry = datum[ key ];
        let color = new Color( datum[ key ] );

        expect( color[ key ] ).toEqual( entry );
      }
    });
  }
});
