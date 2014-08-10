angular.module('bndry.action', [])
  .controller('ActionCtrl', function($rootScope, $scope) {
    $scope.clear = $rootScope.$broadcast.bind($rootScope, 'action:clear');
  });
