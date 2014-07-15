'use strict';

angular.module('boundaries.mode', [])
  .controller('ModeCtrl', function($scope) {
    $scope.rigid = false;
    $scope.polygon = false;
  });
