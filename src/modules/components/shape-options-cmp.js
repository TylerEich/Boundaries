export default class ShapeOptionsCmp {
  constructor() {
    this.colors = [{
      name: 'Red',
      value: '#ff0000'
    }, {
      name: 'Green',
      value: '#008000'
    }, {
      name: 'Blue',
      value: '#0000ff'
    }];

    this._activeColorIndex = 1;

    this.rigid = true;
    this.fill = false;
  }


  get color() {
    return this.colors[ this._activeColorIndex ];
  }
  set color( value ) {
    let index = this.colors.indexOf( value );
    if ( index > -1 ) {
      this._activeColorIndex = index;
    }
  }
}
