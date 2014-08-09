"use strict";
angular.module('boundaries.action', []).controller('ActionCtrl', function($rootScope, $scope) {
  $scope.clear = $rootScope.$broadcast.bind($rootScope, 'action:clear');
});
