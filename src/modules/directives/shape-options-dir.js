/* global angular */


import ShapeOptionsCmp from 'src/modules/components/shape-options-cmp';


angular.module( 'bndry' )
.directive( 'shapeOptions', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: ShapeOptionsCmp,
    controllerAs: 'shapeOptions',
    templateUrl: '/templates/shape-options-tpl.html',
    bindToController: true
  };
});
