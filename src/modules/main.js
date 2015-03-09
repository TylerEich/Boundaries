import { MapCanvas } from './map-class';
import MapView from './map-view';
import EditorCtrl from './editor-ctrl';

require( '6to5ify/polyfill' );

let mapCanvas = new MapCanvas(
  document.querySelector( '#map_canvas' ),
  {
    center: {
      lat: 41.123728,
      lng: -84.864721
    },
    zoom: 17,
    disableDefaultUI: true
  }
);

new MapView( mapCanvas );
new EditorCtrl( mapCanvas );