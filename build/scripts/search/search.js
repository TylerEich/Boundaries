"use strict";
'use strict';
angular.module('bndry.search', ['ngSanitize', 'bndry.map']).directive('focusOn', function($parse) {
  return {
    restrict: 'A',
    link: function(scope, elem, attr) {
      var focusOn = $parse(attr.focusOn);
      scope.$watch(focusOn, function(newVal) {
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
}).service('SearchSvc', function($q, MapSvc) {
  this.search = function(input) {
    var deferred = $q.defer();
    if (input.length <= 0) {
      deferred.resolve([]);
    } else {
      var request = {input: input};
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
      MapSvc.placesSvc.getDetails({reference: reference}, function(place, status) {
        if (status === MapSvc.places.PlacesServiceStatus.OK) {
          if (place.geometry.viewport) {
            MapSvc.map.fitBounds(place.geometry.viewport);
          } else if (place.geometry.location) {
            MapSvc.map.panTo(place.geometry.location);
          }
        }
      });
    }
  };
}).controller('SearchCtrl', function($scope, $sce, $sessionStorage, SearchSvc) {
  function throttledSearch(newVal) {
    if (!newVal) {
      return;
    } else if (!resolved) {
      queue = newVal;
      return;
    }
    last = newVal;
    resolved = false;
    SearchSvc.search(newVal).then(formatSuggestions, errorMessage).then(function() {
      resolved = true;
      if (queue !== last) {
        throttledSearch(queue);
        queue = '';
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
  function errorMessage(message) {
    if (typeof message === 'string') {
      $scope.suggestions = [{
        description: $sce.trustAsHtml('<i>' + message + '</i>'),
        error: true
      }];
    }
  }
  var resolved = true,
      queue = '',
      last = '';
  $scope.$tempStorage = $sessionStorage.$default({
    query: '',
    active: -1
  });
  $scope.keydown = function(e) {
    var enter = (e.which === 13),
        up = (e.which === 38),
        down = (e.which === 40);
    if (enter || up || down) {
      e.preventDefault();
    } else {
      $scope.$tempStorage.active = 0;
      return;
    }
    if ($scope.suggestions[$scope.$tempStorage.active]) {
      if (enter) {
        $scope.loadOnMap($scope.suggestions[$scope.$tempStorage.active].reference);
        $scope.show.value = '';
      } else if (up && $scope.$tempStorage.active > -1) {
        $scope.$tempStorage.active--;
      } else if (down && $scope.$tempStorage.active < $scope.suggestions.length - 1) {
        $scope.$tempStorage.active++;
      }
    }
  };
  $scope.loadOnMap = SearchSvc.loadPlaceFromReference;
  $scope.$watch('$tempStorage.query', throttledSearch);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VhcmNoL3NlYXJjaC5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbInNlYXJjaC9zZWFyY2guanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoganNsaW50IGNhbWVsY2FzZTogZmFsc2UgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYm5kcnkuc2VhcmNoJywgWyduZ1Nhbml0aXplJywgJ2JuZHJ5Lm1hcCddKVxuICAuZGlyZWN0aXZlKCdmb2N1c09uJywgZnVuY3Rpb24oJHBhcnNlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSwgYXR0cikge1xuICAgICAgICB2YXIgZm9jdXNPbiA9ICRwYXJzZShhdHRyLmZvY3VzT24pO1xuXG4gICAgICAgIHNjb3BlLiR3YXRjaChmb2N1c09uLCBmdW5jdGlvbihuZXdWYWwpIHtcbiAgICAgICAgICBpZiAobmV3VmFsID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAobmV3VmFsKSB7XG4gICAgICAgICAgICBlbGVtWzBdLmZvY3VzKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1bMF0uYmx1cigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSlcbiAgLnNlcnZpY2UoJ1NlYXJjaFN2YycsIGZ1bmN0aW9uKCRxLCBNYXBTdmMpIHtcbiAgICB0aGlzLnNlYXJjaCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xuXG4gICAgICBpZiAoaW5wdXQubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShbXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgICBpbnB1dDogaW5wdXRcbiAgICAgICAgfTtcblxuICAgICAgICByZXF1ZXN0LmJvdW5kcyA9IE1hcFN2Yy5tYXAuZ2V0Qm91bmRzKCk7XG5cbiAgICAgICAgTWFwU3ZjLmF1dG9jb21wbGV0ZVN2Yy5nZXRQbGFjZVByZWRpY3Rpb25zKHJlcXVlc3QsIGZ1bmN0aW9uKHN1Z2dlc3Rpb25zLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAoc3RhdHVzID09PSBNYXBTdmMucGxhY2VzLlBsYWNlc1NlcnZpY2VTdGF0dXMuT0spIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PSBNYXBTdmMucGxhY2VzLlBsYWNlc1NlcnZpY2VTdGF0dXMuWkVST19SRVNVTFRTKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoJ05vIFJlc3VsdHMnKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCdBbiBFcnJvciBPY2N1cnJlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgIH07XG5cbiAgICB0aGlzLmxvYWRQbGFjZUZyb21SZWZlcmVuY2UgPSBmdW5jdGlvbihyZWZlcmVuY2UpIHtcbiAgICAgIGlmICghcmVmZXJlbmNlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHJlZmVyZW5jZSkge1xuICAgICAgICBNYXBTdmMucGxhY2VzU3ZjLmdldERldGFpbHMoe1xuICAgICAgICAgIHJlZmVyZW5jZTogcmVmZXJlbmNlXG4gICAgICAgIH0sIGZ1bmN0aW9uKHBsYWNlLCBzdGF0dXMpIHtcbiAgICAgICAgICBpZiAoc3RhdHVzID09PSBNYXBTdmMucGxhY2VzLlBsYWNlc1NlcnZpY2VTdGF0dXMuT0spIHtcbiAgICAgICAgICAgIGlmIChwbGFjZS5nZW9tZXRyeS52aWV3cG9ydCkge1xuICAgICAgICAgICAgICAvLyBmaXRCb3VuZHMgYmVjYXVzZSBwYW5Ub0JvdW5kcyBkb2VzIG5vdCB6b29tIG91dCB0byBzaG93IGVudGlyZSBib3VuZGluZyBib3hcbiAgICAgICAgICAgICAgTWFwU3ZjLm1hcC5maXRCb3VuZHMocGxhY2UuZ2VvbWV0cnkudmlld3BvcnQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwbGFjZS5nZW9tZXRyeS5sb2NhdGlvbikge1xuICAgICAgICAgICAgICBNYXBTdmMubWFwLnBhblRvKHBsYWNlLmdlb21ldHJ5LmxvY2F0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gIH0pXG4gIC5jb250cm9sbGVyKCdTZWFyY2hDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkc2NlLCAkc2Vzc2lvblN0b3JhZ2UsIFNlYXJjaFN2Yykge1xuICAgIGZ1bmN0aW9uIHRocm90dGxlZFNlYXJjaChuZXdWYWwpIHtcbiAgICAgIGlmICghbmV3VmFsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH0gZWxzZSBpZiAoIXJlc29sdmVkKSB7XG4gICAgICAgIHF1ZXVlID0gbmV3VmFsO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxhc3QgPSBuZXdWYWw7XG4gICAgICByZXNvbHZlZCA9IGZhbHNlO1xuXG4gICAgICBTZWFyY2hTdmMuc2VhcmNoKG5ld1ZhbClcbiAgICAgICAgLnRoZW4oZm9ybWF0U3VnZ2VzdGlvbnMsIGVycm9yTWVzc2FnZSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmVzb2x2ZWQgPSB0cnVlO1xuXG4gICAgICAgICAgaWYgKHF1ZXVlICE9PSBsYXN0KSB7XG4gICAgICAgICAgICB0aHJvdHRsZWRTZWFyY2gocXVldWUpO1xuICAgICAgICAgICAgcXVldWUgPSAnJztcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGZvcm1hdFN1Z2dlc3Rpb25zKHN1Z2dlc3Rpb25zKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN1Z2dlc3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkZXNjID0gc3VnZ2VzdGlvbnNbaV0uZGVzY3JpcHRpb247XG4gICAgICAgIHN1Z2dlc3Rpb25zW2ldLmRlc2NyaXB0aW9uID0gJyc7XG4gICAgICAgIHZhciBpbmRleCA9IDA7XG5cbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBzdWdnZXN0aW9uc1tpXS5tYXRjaGVkX3N1YnN0cmluZ3MubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgb2Zmc2V0ID0gc3VnZ2VzdGlvbnNbaV0ubWF0Y2hlZF9zdWJzdHJpbmdzW2pdLm9mZnNldDtcbiAgICAgICAgICB2YXIgbGVuZ3RoID0gc3VnZ2VzdGlvbnNbaV0ubWF0Y2hlZF9zdWJzdHJpbmdzW2pdLmxlbmd0aDtcblxuICAgICAgICAgIHN1Z2dlc3Rpb25zW2ldLmRlc2NyaXB0aW9uICs9IGRlc2Muc2xpY2UoaW5kZXgsIG9mZnNldCkgKyAnPGI+JyArIGRlc2Muc3Vic3RyKG9mZnNldCwgbGVuZ3RoKSArICc8L2I+JztcblxuICAgICAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHN1Z2dlc3Rpb25zW2ldLmRlc2NyaXB0aW9uICs9IGRlc2Muc2xpY2UoaW5kZXgpO1xuICAgICAgICBzdWdnZXN0aW9uc1tpXS5kZXNjcmlwdGlvbiA9ICc8c3Bhbj4nICsgc3VnZ2VzdGlvbnNbaV0uZGVzY3JpcHRpb24gKyAnPC9zcGFuPic7XG4gICAgICAgIHN1Z2dlc3Rpb25zW2ldLmRlc2NyaXB0aW9uID0gJHNjZS50cnVzdEFzSHRtbChzdWdnZXN0aW9uc1tpXS5kZXNjcmlwdGlvbik7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5zdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zO1xuICAgIH1cbiAgICAvLyBOb3RpZmllcyB1c2VyIHRoYXQgbm8gcmVzdWx0cyB3ZXJlIGZvdW5kXG5cbiAgICBmdW5jdGlvbiBlcnJvck1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgICRzY29wZS5zdWdnZXN0aW9ucyA9IFt7XG4gICAgICAgICAgZGVzY3JpcHRpb246ICRzY2UudHJ1c3RBc0h0bWwoJzxpPicgKyBtZXNzYWdlICsgJzwvaT4nKSxcbiAgICAgICAgICBlcnJvcjogdHJ1ZVxuICAgICAgICB9XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVzb2x2ZWQgPSB0cnVlLFxuICAgICAgcXVldWUgPSAnJyxcbiAgICAgIGxhc3QgPSAnJztcblxuICAgICRzY29wZS4kdGVtcFN0b3JhZ2UgPSAkc2Vzc2lvblN0b3JhZ2UuJGRlZmF1bHQoe1xuICAgICAgcXVlcnk6ICcnLFxuICAgICAgYWN0aXZlOiAtMVxuICAgIH0pO1xuICAgICAgICBcbiAgICAkc2NvcGUua2V5ZG93biA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBlbnRlciA9IChlLndoaWNoID09PSAxMyksXG4gICAgICAgIHVwID0gKGUud2hpY2ggPT09IDM4KSxcbiAgICAgICAgZG93biA9IChlLndoaWNoID09PSA0MCk7XG5cbiAgICAgIGlmIChlbnRlciB8fCB1cCB8fCBkb3duKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS4kdGVtcFN0b3JhZ2UuYWN0aXZlID0gMDtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoJHNjb3BlLnN1Z2dlc3Rpb25zWyRzY29wZS4kdGVtcFN0b3JhZ2UuYWN0aXZlXSkge1xuICAgICAgICBpZiAoZW50ZXIpIHtcbiAgICAgICAgICAkc2NvcGUubG9hZE9uTWFwKCRzY29wZS5zdWdnZXN0aW9uc1skc2NvcGUuJHRlbXBTdG9yYWdlLmFjdGl2ZV0ucmVmZXJlbmNlKTtcbiAgICAgICAgICAkc2NvcGUuc2hvdy52YWx1ZSA9ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKHVwICYmICRzY29wZS4kdGVtcFN0b3JhZ2UuYWN0aXZlID4gLTEpIHtcbiAgICAgICAgICAkc2NvcGUuJHRlbXBTdG9yYWdlLmFjdGl2ZS0tO1xuICAgICAgICB9IGVsc2UgaWYgKGRvd24gJiYgJHNjb3BlLiR0ZW1wU3RvcmFnZS5hY3RpdmUgPCAkc2NvcGUuc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICRzY29wZS4kdGVtcFN0b3JhZ2UuYWN0aXZlKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmxvYWRPbk1hcCA9IFNlYXJjaFN2Yy5sb2FkUGxhY2VGcm9tUmVmZXJlbmNlO1xuXG4gICAgJHNjb3BlLiR3YXRjaCgnJHRlbXBTdG9yYWdlLnF1ZXJ5JywgdGhyb3R0bGVkU2VhcmNoKTtcbiAgfSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=