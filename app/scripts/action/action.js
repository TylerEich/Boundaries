angular.module('bndry.action', ['bndry.history'])
.controller('ActionCtrl', function($rootScope, $scope, HistorySvc) {
  $scope.clear = function() {
    $rootScope.$broadcast('action:clear');
    HistorySvc.clear();
  };
	
	$scope.hasUndo = HistorySvc.hasUndo;
  $scope.undo = function() {
    if (HistorySvc.hasUndo()) {
      HistorySvc.undo();
    }
  };
	
	$scope.hasRedo = HistorySvc.hasRedo;
  $scope.redo = function() {
    if (HistorySvc.hasRedo()) {
      HistorySvc.redo();
    }
  };
});
