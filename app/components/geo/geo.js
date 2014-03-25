'use strict';

angular.module('boundaries.geo', [])
.service('GeolocationService', ['$q', function($q) {
    this.getLocation = function() {
        var deferred = $q.defer();
        
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(function(position) {
                deferred.resolve(position);
            }, function(error) {
                deferred.reject(error);
            });
        } else {
            deferred.reject(false);
        }
        
        return deferred.promise;
    }
}])
.service('GeocodeService', ['$q', function($q) {
    this.geocode = function(location) {
        var geocoder = new google.maps.Geocoder();
        var deferred = $q.defer();
    
        geocoder.geocode({
            location: location
        }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                deferred.resolve(results);
            } else {
                deferred.reject(status);
            }
        });
    
        return deferred.promise;
    };
}]);