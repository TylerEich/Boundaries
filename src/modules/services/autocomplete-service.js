import { AutocompleteService } from '../map-class';




let autocomplete = new AutocompleteService();




class SearchComponent {
  constructor( geoJsonStore = false ) {
    this.query = '';

    this.suggestions = [];
    this.noResults = false;
  }


  suggest( query ) {
    if ( this.geoJsonStore ) {

    }
    autocomplete.suggestPlaces( query );
  }


  clearQuery() {
    this.query = '';
  }
}




angular.module( '' )
.directive( 'searchBar', {

});
