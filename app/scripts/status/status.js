/* jshint camelcase: false */

angular.module('bndry.status', ['bndry.map', 'bndry.geo'])
  .directive('statusBar', function($interval) {
    return {
      restrict: 'E',
      scope: {
        hide: '@',
        value: '@'
      },
      template: '<div ng-style="{width: value * 100 + \'%\'}" style="height: 100%; position: absolute;" ng-hide="hide"></div>',
      link: function(scope) {
        
      }
    };
  })
  .controller('StatusCtrl', function($scope, $timeout, MapSvc, GeocodeSvc) {
    var locality = '';
    
    $scope.locality = function() {
      return locality;
    };

    $scope.$on('map:idle', function() {
      GeocodeSvc.geocode(MapSvc.map.getCenter())
        .then(function(results) {
          var localityOptions = [
            'administrative_area_level_3',
            'administrative_area_level_2',
            'administrative_area_level_1',
            'country'
          ];
          
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
        },
        function() {
          locality = 'Unknown Locality';
        });
    });
  });
