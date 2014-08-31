"use strict";
'use strict';
angular.module('bndry.status', ['bndry.map', 'bndry.geo']).directive('statusBar', function($interval) {
  return {
    restrict: 'E',
    scope: {
      hide: '@',
      value: '@'
    },
    template: '<div ng-style="{width: value * 100 + \'%\'}" style="height: 100%; position: absolute;" ng-hide="hide"></div>',
    link: function(scope) {
      $interval(function() {
        scope.value = Math.random();
      }, 1000);
    }
  };
}).controller('StatusCtrl', function($scope, $timeout, MapSvc, GeocodeSvc) {
  var locality = '';
  $scope.locality = function() {
    return locality;
  };
  $scope.$on('map:idle', function() {
    GeocodeSvc.geocode(MapSvc.map.getCenter()).then(function(results) {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RhdHVzL3N0YXR1cy5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbInN0YXR1cy9zdGF0dXMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoganNoaW50IGNhbWVsY2FzZTogZmFsc2UgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyLm1vZHVsZSgnYm5kcnkuc3RhdHVzJywgWydibmRyeS5tYXAnLCAnYm5kcnkuZ2VvJ10pXG4gIC5kaXJlY3RpdmUoJ3N0YXR1c0JhcicsIGZ1bmN0aW9uKCRpbnRlcnZhbCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgaGlkZTogJ0AnLFxuICAgICAgICB2YWx1ZTogJ0AnXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IG5nLXN0eWxlPVwie3dpZHRoOiB2YWx1ZSAqIDEwMCArIFxcJyVcXCd9XCIgc3R5bGU9XCJoZWlnaHQ6IDEwMCU7IHBvc2l0aW9uOiBhYnNvbHV0ZTtcIiBuZy1oaWRlPVwiaGlkZVwiPjwvZGl2PicsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSkge1xuICAgICAgICAkaW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2NvcGUudmFsdWUgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICB9LCAxMDAwKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KVxuICAuY29udHJvbGxlcignU3RhdHVzQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgJHRpbWVvdXQsIE1hcFN2YywgR2VvY29kZVN2Yykge1xuICAgIHZhciBsb2NhbGl0eSA9ICcnO1xuICAgIFxuICAgICRzY29wZS5sb2NhbGl0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGxvY2FsaXR5O1xuICAgIH07XG5cbiAgICAkc2NvcGUuJG9uKCdtYXA6aWRsZScsIGZ1bmN0aW9uKCkge1xuICAgICAgR2VvY29kZVN2Yy5nZW9jb2RlKE1hcFN2Yy5tYXAuZ2V0Q2VudGVyKCkpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdHMpIHtcbiAgICAgICAgICB2YXIgbG9jYWxpdHlPcHRpb25zID0gW1xuICAgICAgICAgICAgJ2FkbWluaXN0cmF0aXZlX2FyZWFfbGV2ZWxfMycsXG4gICAgICAgICAgICAnYWRtaW5pc3RyYXRpdmVfYXJlYV9sZXZlbF8yJyxcbiAgICAgICAgICAgICdhZG1pbmlzdHJhdGl2ZV9hcmVhX2xldmVsXzEnLFxuICAgICAgICAgICAgJ2NvdW50cnknXG4gICAgICAgICAgXTtcbiAgICAgICAgICBcbiAgICAgICAgICBsb2NhbGl0eSA9ICcnO1xuICAgICAgICAgIHJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICAgIGlmIChsb2NhbGl0eSkge1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9jYWxpdHlPcHRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIGlmIChyZXN1bHQudHlwZXMuaW5kZXhPZihsb2NhbGl0eU9wdGlvbnNbaV0pID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsb2NhbGl0eSA9IHJlc3VsdC5mb3JtYXR0ZWRfYWRkcmVzcztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChsb2NhbGl0eSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb2NhbGl0eSA9ICdVbmtub3duIExvY2FsaXR5JztcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9