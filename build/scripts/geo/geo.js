"use strict";
'use strict';
angular.module('bndry.geo', ['bndry.map']).service('GeolocationSvc', function($q) {
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
}).service('GeocodeSvc', function($q, MapSvc) {
  this.geocode = function(location) {
    var geocoder = new MapSvc.Geocoder();
    var deferred = $q.defer();
    geocoder.geocode({location: location}, function(results, status) {
      if (status === MapSvc.GeocoderStatus.OK) {
        deferred.resolve(results);
      } else {
        deferred.reject(status);
      }
    });
    return deferred.promise;
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvL2dlby5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbImdlby9nZW8uanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYm5kcnkuZ2VvJywgWydibmRyeS5tYXAnXSlcbiAgLnNlcnZpY2UoJ0dlb2xvY2F0aW9uU3ZjJywgZnVuY3Rpb24oJHEpIHtcbiAgICB0aGlzLmdldExvY2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBpZiAoJ2dlb2xvY2F0aW9uJyBpbiBuYXZpZ2F0b3IpIHtcbiAgICAgICAgbmF2aWdhdG9yLmdlb2xvY2F0aW9uLmdldEN1cnJlbnRQb3NpdGlvbihmdW5jdGlvbihwb3NpdGlvbikge1xuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUocG9zaXRpb24pO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGZhbHNlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbiAgfSlcbiAgLnNlcnZpY2UoJ0dlb2NvZGVTdmMnLCBmdW5jdGlvbigkcSwgTWFwU3ZjKSB7XG4gICAgdGhpcy5nZW9jb2RlID0gZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICAgIHZhciBnZW9jb2RlciA9IG5ldyBNYXBTdmMuR2VvY29kZXIoKTtcbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGdlb2NvZGVyLmdlb2NvZGUoe1xuICAgICAgICBsb2NhdGlvbjogbG9jYXRpb25cbiAgICAgIH0sIGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cykge1xuICAgICAgICBpZiAoc3RhdHVzID09PSBNYXBTdmMuR2VvY29kZXJTdGF0dXMuT0spIHtcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHJlc3VsdHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRlZmVycmVkLnJlamVjdChzdGF0dXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbiAgfSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=