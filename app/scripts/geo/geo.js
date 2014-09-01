angular.module('bndry.geo', ['bndry.map'])
  .service('GeolocationSvc', function($q) {
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
    };
  })
  .service('GeocodeSvc', function($q, MapSvc) {
    this.geocode = function(location) {
      var geocoder = new MapSvc.Geocoder();
      var deferred = $q.defer();

      geocoder.geocode({
        location: location
      }, function(results, status) {
        if (status === MapSvc.GeocoderStatus.OK) {
          deferred.resolve(results);
        } else {
          deferred.reject(status);
        }
      });

      return deferred.promise;
    };
  });
