import EventEmitter from 'src/modules/event-emitter';
import Shape from 'src/modules/shape-class';




export default class ShapeCollection extends EventEmitter {
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
    let shapeStore = new ShapeCollection();

    try {
      featureCollection.features.forEach(
        ( feature ) => {
          const shape = Shape.fromFeature( feature );

          shapeStore.addShape( shape );
        }
      );
    } catch ( error ) {
      console.warn( 'geoJson is invalid', error );
      return new ShapeCollection();
    }

    return shapeStore;
  }
}
