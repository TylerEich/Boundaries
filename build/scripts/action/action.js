"use strict";
angular.module('bndry.action', []).controller('ActionCtrl', function($rootScope, $scope, HistorySvc) {
  $scope.clear = function() {
    $rootScope.$broadcast('action:clear');
    HistorySvc.clear();
  };
  $scope.undo = function() {
    if (HistorySvc.hasUndo()) {
      HistorySvc.undo();
    }
  };
  $scope.redo = function() {
    if (HistorySvc.hasRedo()) {
      HistorySvc.redo();
    }
  };
});
