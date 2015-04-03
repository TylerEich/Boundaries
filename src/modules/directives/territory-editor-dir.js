/* global angular */




import TerritoryEditorCmp from '../components/territory-editor-cmp';




export default angular.module( 'bndry' )
.directive( 'territoryEditor', function() {
  return {
    restrict: 'E',
    scope: {},
    controller: TerritoryEditorCmp,
    controllerAs: 'territoryEditor',
    templateUrl: '../templates/territory-editor-tpl.html',
    bindToController: true
  };
});
