/* jshint bitwise: false */

function hueToRgb( p, q, t ) {
  if ( t < 0 ) {
    t += 1;
  }
  if ( t > 1 ) {
    t -= 1;
  }
  if ( t < 1 / 6 ) {
    return p + ( q - p ) * 6 * t;
  }
  if ( t < 1 / 2 ) {
    return q;
  }
  if ( t < 2 / 3 ) {
    return p + ( q - p ) * ( 2 / 3 - t ) * 6;
  }
  return p;
}




function rgba( r, g, b, a = 1 ) {
  return [ r, g, b, a ];
}

function hsla( h, s, l, a = 1 ) {
  let r, g, b;

  if ( s === 0 ) {
    r = g = b = l; // achromatic
  } else {
    let q = l < 0.5 ? l * ( 1 + s ) : l + s - l * s;
    let p = 2 * l - q;
    r = hueToRgb( p, q, h + 1 / 3 );
    g = hueToRgb( p, q, h );
    b = hueToRgb( p, q, h - 1 / 3 );
  }

  return [ r, g, b, a ];
}

function hex( hexString ) {
  if ( hexString.length === 6 ) {
    hexString += 'FF';
  }

  const rgbaInt = parseInt( hexString, 16 ) >>> 0;
  const r = ( rgbaInt >> 24 & 0xFF ) / 0xFF,
      g = ( rgbaInt >> 16 & 0xFF ) / 0xFF,
      b = ( rgbaInt >> 8 & 0xFF ) / 0xFF,
      a = ( rgbaInt & 0xFF ) / 0xFF;

  return [ r, g, b, a ];
}



export default class Color {
  constructor( color ) {
    if ( typeof color === 'object' ) {
      const { r, g, b, h, s, l, a } = color;

      if ( r !== undefined && g !== undefined && b !== undefined ) {
        this.rgbaArray = rgba( r, g, b, a );
      } else if ( h !== undefined && s !== undefined && l !== undefined ) {
        this.rgbaArray = hsla( h, s, l, a );
      } else {
        throw 'Malformed argument object';
      }
    } else if ( typeof color === 'string' ) {
      this.rgbaArray = hex( color );
    } else {
      throw 'Malformed argument';
    }
  }



  get rgba() {
    const [ r, g, b, a ] = this.rgbaArray;

    return { r, g, b, a };
  }

  get rgbaString() {
    const [ r, g, b, a ] = this.rgbaArray;
    const [ r100, g100, b100 ] =
      [ r, g, b ].map( value => ( value * 100 ).toFixed( 1 ) );
    const aFixed = a.toFixed( 2 );

    return `rgba(${ r100 }%, ${ g100 }%, ${ b100 }%, ${ aFixed })`;
  }

  get rgb() {
    const [ r, g, b ] = this.rgbaArray;

    return { r, g, b };
  }

  get rgbString() {
    const [ r, g, b ] = this.rgbaArray;
    const [ r100, g100, b100 ] =
      [ r, g, b ].map( value => ( value * 100 ).toFixed( 1 ) );

    return `rgb(${ r100 }%, ${ g100 }%, ${ b100 }%)`;
  }



  get hsla() {
    const [ r, g, b, a ] = this.rgbaArray;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if ( max === min ) {
      h = s = 0; // achromatic
    } else {
      var d = max - min;
      s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
      switch ( max ) {
        case r:
          h = ( g - b ) / d + ( g < b ? 6 : 0 );
          break;
        case g:
          h = ( b - r ) / d + 2;
          break;
        case b:
          h = ( r - g ) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h, s, l, a };
  }

  get hslaString() {
    const { h, s, l, a } = this.hsla;

    const h360 = ( h * 360 ).toFixed( 1 );
    const [ s100, l100 ] =
      [ s, l ].map( value => ( value * 100 ).toFixed( 1 ) );
    const aFixed = a.toFixed( 2 );

    return `hsla(${ h360 }, ${ s100 }%, ${ l100 }%, ${ aFixed })`;
  }

  get hsl() {
    const { h, s, l } = this.hsla;

    return { h, s, l };
  }

  get hslString() {
    const { h, s, l } = this.hsl;

    const h360 = ( h * 360 ).toFixed( 1 );
    const [ s100, l100 ] =
      [ s, l ].map( value => ( value * 100 ).toFixed( 1 ) );

    return `hsl(${ h360 }, ${ s100 }%, ${ l100 }%)`;
  }



  get hex32() {
    const hexArray = this.rgbaArray.map(( val ) => {
      let hexString = '00' + Math.round( val * 0xFF ).toString( 16 );
      return hexString.slice( -2 ); // Pad with leading zero
    });

    return hexArray.join( '' );
  }

  get hex24() {
    return this.hex32.substring( 0, 6 );
  }
}
