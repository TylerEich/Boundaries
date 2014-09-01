"use strict";
angular.module('bndry', ['ngTouch', 'ngStorage', 'ui.map', 'ngAnimate', 'bndry.action', 'bndry.color', 'bndry.drawing', 'bndry.geo', 'bndry.history', 'bndry.image', 'bndry.map', 'bndry.mode', 'bndry.search', 'bndry.status']).directive('noScroll', function() {
  return {
    restrict: 'A',
    link: function(scope, elem) {
      elem.on('touchstart wheel', function(e) {
        e.preventDefault();
      });
    }
  };
}).controller('MasterCtrl', function($scope, $localStorage, ColorSvc) {
  $scope.$storage = $localStorage;
  $scope.fillActiveColor = function() {
    var hex = ColorSvc.convert.rgba(ColorSvc.activeColor()).to.hex24();
    return ("#" + hex);
  };
  $scope.show = {
    header: '',
    footer: ''
  };
  $scope.setShowHeader = function(show) {
    if ($scope.show.header === show) {
      $scope.show.header = '';
    } else {
      $scope.show.header = show;
    }
  };
  $scope.setShowFooter = function(show) {
    if ($scope.show.footer === show) {
      $scope.show.footer = '';
    } else {
      $scope.show.footer = show;
    }
  };
}).run(function() {
  window.addEventListener('orientationchange', function() {
    window.scrollTo(0, 0);
  });
});

//# sourceMappingURL=../sourcemaps/app.js.map