'use strict';

angular.module('boundaries.map', [])
/*
MapService encapsulates google.maps, making it easier to mock for tests.
*/
.service('MapService', [function() {
    angular.extend(this, google.maps);
}]);