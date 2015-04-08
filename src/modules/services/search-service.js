/*
Search Service
Includes results from existing territories and
  Google Places search.

*/




import assert from '../assert';
// import storageService from './storage-service';
import { LatLng } from '../map-class';
import { mapCanvas, autocompleteService } from '../map-view';




export function search( query ) {
  assert( typeof query === 'string' );

  let geoJsonResults =
    storageService.territories.filter(( territory ) => {
      let info = territory.properties,
        nameMatched = info.name.indexOf( query ) > -1,
        localityMatched = info.name.indexOf( query ) > -1;

      return nameMatched || localityMatched;
    });

  autocompleteService.searchPlaces({
    input: query,
    bounds: mapCanvas.bounds
  });
}




export function loadResult( result ) {

}