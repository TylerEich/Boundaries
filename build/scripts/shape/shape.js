"use strict";
angular.module('bndry.shape', ['ngStorage']).service('ShapeSvc', function($localStorage) {
  this.rigid = (function(value) {
    if (value) {
      $localStorage.rigid = value;
    } else {
      return $localStorage.rigid;
    }
  });
  this.fill = (function(value) {
    if (value) {
      $localStorage.fill = value;
    } else {
      return $localStorage.fill;
    }
  });
}).controller('ShapeCtrl', function($scope, $localStorage) {
  $scope.$storage = $localStorage;
}).run(function($localStorage) {
  $localStorage.$default({
    rigid: false,
    fill: false
  });
});

//# sourceMappingURL=../../sourcemaps/shape/shape.js.map