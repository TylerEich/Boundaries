/* jshint camelcase: false */

angular.module('bndry.status', ['bndry.map', 'bndry.geo'])
  .directive('statusBar', function($interval) {
    return {
      restrict: 'E',
      scope: {
        hide: '@',
        value: '@'
      },
      template: '<div style="height: 100%; width: 100%; position: relative;" ng-hide="indeterminate()"><div class="bar"></div></div>',
      link: function(scope) {
        var pending = 0,
          finished = 0;
        
        scope.$on('load:start', () => {
          pending++;
        });
        scope.$on('load:done', () => {
          finished++;
          if (finished >= pending) {
            pending = 0;
            finished = 0;
          }
        });
        scope.$on('load:error', () => {
          pending = 0;
          finished = 0;
					alert('Directions are not available for this location.');
        });
        
				scope.indeterminate = () => (finished >= pending);
        scope.percentage = function() {
          return `${(finished + 1) / (pending + 1) * 100}%`;
        };
      }
    };
  })
  .controller('StatusCtrl', function($scope, $timeout, MapSvc, GeocodeSvc) {
    var locality = '';
		var lastBounds;
    
    $scope.locality = function() {
      return locality;
    };

    $scope.$on('map:idle', function() {
			if (lastBounds && MapSvc.map.getBounds().equals(lastBounds)) {
				return;
			}
      GeocodeSvc.geocode(MapSvc.map.getCenter())
        .then(function(results) {          
          var localityTypes = [
						'locality',
						'administrative_area_level_1',
						'country'
					];
						//
						// [
						// 	'locality'
						// ],
						// [
						// 	'administrative_area_level_1',
						// 	'administrative_area_level_2',
						// 	'administrative_area_level_3'
						// ],
						// [
						// 	'country'
						// ]
						//             'administrative_area_level_3',
						//             'administrative_area_level_2',
						//             'administrative_area_level_1',
						//             'country'
						//           ];
          
          locality = '';
					
					if (results.length < 1) {
						locality = 'Unknown Locality';
						return;
					}
					for (var type of localityTypes) {
						for (var result of results) {
							if (result.types.indexOf(type) > -1) {
								locality = result.formatted_address;
								return;
							}
						}
					}
        //   results.forEach(function(result) {
        //     if (locality) {
        //       return;
        //     }
        //
        //     for (var i = 0; i < localityOptions.length; i++) {
        //       if (result.types.indexOf(localityOptions[i]) > -1) {
        //         locality = result.formatted_address;
        //       }
        //
        //       if (locality) {
        //         return false;
        //       }
        //     }
        //   });
        // },
        // function() {
        //   locality = 'Unknown Locality';
        // });
			});
    });
  });
