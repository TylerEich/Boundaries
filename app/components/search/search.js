'use strict';

angular.module('boundaries.search', [])
.service('SearchService', ['$q', function($q) {
    this.search = function(input) {
        var autocomplete = new google.maps.places.AutocompleteService();
        var deferred = $q.defer();
        
        if (input.length <= 0) {
            deferred.resolve([]);
        } else {
            var request = {
                input: input
            };
            
            if (map && map.getBounds) request.bounds = map.getBounds();
            autocomplete.getPlacePredictions(request, function(suggestions, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    deferred.resolve(suggestions);
                } else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                    deferred.reject('No Results');
                } else {
                    deferred.reject('An Error Occurred');
                }
            });
        }
        
        return deferred.promise;
    }
}]);