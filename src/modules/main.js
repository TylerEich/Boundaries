import mapView from './map-view';
import editorCtrl from './editor-ctrl';

require( '6to5ify/polyfill' );

mapView({
  center: {
    lat: 41.123728,
    lng: -84.864721
  },
  zoom: 17,
  disableDefaultUI: true
});
editorCtrl();