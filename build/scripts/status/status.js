"use strict";
angular.module('bndry.status', ['bndry.map', 'bndry.geo']).directive('statusBar', function($interval) {
  return {
    restrict: 'E',
    scope: {
      hide: '@',
      value: '@'
    },
    template: '<div ng-style="{width: percentage()}" style="height: 100%; position: absolute;" ng-hide="hide"></div>',
    link: function(scope) {
      var pending = 0,
          finished = 0;
      scope.$on('load:start', (function() {
        pending++;
      }));
      scope.$on('load:done', (function() {
        finished++;
        if (finished >= pending) {
          pending = 0;
          finished = 0;
        }
      }));
      scope.$on('load:error', (function() {
        pending = 0;
        finished = 0;
      }));
      scope.percentage = function() {
        console.log(((finished + 1) / (pending + 1) * 100 + "%"));
        return ((finished + 1) / (pending + 1) * 100 + "%");
      };
    }
  };
}).controller('StatusCtrl', function($scope, $timeout, MapSvc, GeocodeSvc) {
  var locality = '';
  $scope.locality = function() {
    return locality;
  };
  $scope.$on('map:idle', function() {
    GeocodeSvc.geocode(MapSvc.map.getCenter()).then(function(results) {
      console.info(results);
      var localityOptions = ['administrative_area_level_3', 'administrative_area_level_2', 'administrative_area_level_1', 'country'];
      locality = '';
      results.forEach(function(result) {
        if (locality) {
          return;
        }
        for (var i = 0; i < localityOptions.length; i++) {
          if (result.types.indexOf(localityOptions[i]) > -1) {
            locality = result.formatted_address;
          }
          if (locality) {
            return false;
          }
        }
      });
    }, function() {
      locality = 'Unknown Locality';
    });
  });
});

//# sourceMappingURL=../../sourcemaps/status/status.js.map