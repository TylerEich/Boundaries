/* jslint camelcase: false */

angular.module('bndry.search', ['ngSanitize', 'bndry.map'])
  .directive('focusOn', function($parse) {
    return {
      restrict: 'A',
      link: function(scope, elem, attr) {
				attr.$observe('focusOn', function(newVal) {
          if (newVal === undefined) {
            return;
          }

          if (newVal) {
            elem[0].focus();
          } else {
            elem[0].blur();
          }
				});
      }
    };
  })
  .service('SearchSvc', function($q, MapSvc) {
    this.search = function(input) {
      var deferred = $q.defer();

      if (input.length <= 0) {
        deferred.resolve([]);
      } else {
        var request = {
          input: input
        };

        request.bounds = MapSvc.map.getBounds();

        MapSvc.autocompleteSvc.getPlacePredictions(request, function(suggestions, status) {
          if (status === MapSvc.places.PlacesServiceStatus.OK) {
            deferred.resolve(suggestions);
          } else if (status === MapSvc.places.PlacesServiceStatus.ZERO_RESULTS) {
            deferred.reject('No Results');
          } else {
            deferred.reject('An Error Occurred');
          }
        });
      }

      return deferred.promise;
    };

    this.loadPlaceFromReference = function(reference) {
      if (!reference) {
        return;
      }

      if (reference) {
        MapSvc.placesSvc.getDetails({
          reference: reference
        }, function(place, status) {
          if (status === MapSvc.places.PlacesServiceStatus.OK) {
            if (place.geometry.viewport) {
              // fitBounds because panToBounds does not zoom out to show entire bounding box
              MapSvc.map.fitBounds(place.geometry.viewport);
            } else if (place.geometry.location) {
              MapSvc.map.panTo(place.geometry.location);
            }
          }
        });
      }
    };
  })
  .controller('SearchCtrl', function($scope, $sce, $sessionStorage, SearchSvc) {
    function throttledSearch(newVal) {
			// console.log('newVal:', newVal, 'queue:', queue, 'resolved:', resolved, 'last:', last);
			if (!resolved) {
				// console.log('Queueing newVal because not resolved. Exiting.', newVal);
        queue = newVal;
        return;
      }

      last = newVal;
      resolved = false;

      SearchSvc.search(newVal)
        .then(formatSuggestions, errorMessage)
        .then(function() {
          resolved = true;

          if (typeof queue === 'string' && queue !== last) {
						// console.log('Searching with queued value.', queue);
            throttledSearch(queue);
            queue = false;
          }
        });
    }

    function formatSuggestions(suggestions) {
      for (var i = 0; i < suggestions.length; i++) {
        var desc = suggestions[i].description;
        suggestions[i].description = '';
        var index = 0;

        for (var j = 0; j < suggestions[i].matched_substrings.length; j++) {
          var offset = suggestions[i].matched_substrings[j].offset;
          var length = suggestions[i].matched_substrings[j].length;

          suggestions[i].description += desc.slice(index, offset) + '<b>' + desc.substr(offset, length) + '</b>';

          index = offset + length;
        }
        suggestions[i].description += desc.slice(index);
        suggestions[i].description = '<span>' + suggestions[i].description + '</span>';
        suggestions[i].description = $sce.trustAsHtml(suggestions[i].description);
      }

      $scope.suggestions = suggestions;
    }
    // Notifies user that no results were found

    function errorMessage(message) {
      if (typeof message === 'string') {

        $scope.suggestions = [{
          description: $sce.trustAsHtml('<i>' + message + '</i>'),
          error: true
        }];
      }
    }

    var resolved = true,
      queue = false,
      last = '';

    $scope.query = '';
		$scope.active = -1;
        
    $scope.keydown = function(e) {
      var enter = (e.which === 13),
        up = (e.which === 38),
        down = (e.which === 40);

      if (enter || up || down) {
        e.preventDefault();
      } else {
        $scope.active = 0;
        return;
      }

      if ($scope.suggestions[$scope.active]) {
        if (enter) {
          $scope.loadOnMap($scope.suggestions[$scope.active].reference);
          $scope.focus = false;
        } else if (up && $scope.active > -1) {
          $scope.active--;
        } else if (down && $scope.active < $scope.suggestions.length - 1) {
          $scope.active++;
        }
      }
    };

		$scope.focus = false;
    $scope.loadOnMap = function(reference) {
			SearchSvc.loadPlaceFromReference(reference);
			$scope.focus = false;
		};

    $scope.$watch('query', throttledSearch);
  });
