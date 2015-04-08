// require( '6to5ify/polyfill' );

import { MapCanvas } from './map-class';
import territoryEditorDir from './directives/territory-editor-dir';
import MapView from './map-view';

window.mapCanvas = new MapCanvas(
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

window.mapView = new MapView( window.mapCanvas );
// let territorEditorCmp = new TerritoryEditorCmp( mapView );

if ( document.readyState !== 'loading' ) {
  angular.bootstrap( document, [ 'bndry' ]);
} else {
  document.addEventListener( 'DOMContentLoaded', () => {
    angular.bootstrap( document, [ 'bndry' ]);
  });
}
