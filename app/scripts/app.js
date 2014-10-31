/* global FastClick */

angular
.module('bndry', [
  'ngTouch',
  'ngStorage',
  'ui.map',
  'ngAnimate',
  
  'bndry.action',
  'bndry.color',
  'bndry.drawing',
  'bndry.geo',
  'bndry.history',
  'bndry.image',
  'bndry.map',
  'bndry.shape',
  'bndry.search',
  'bndry.status'
  // 'bndry.settings'
])
.config(function($compileProvider) {
	$compileProvider.debugInfoEnabled(false);
})
.directive('ngXlinkHref', function() {
  return {
    priority: 99,
    restrict: 'A',
    link: function (scope, element, attr) {
      var attrName = 'xlink:href';
      attr.$observe('ngXlinkHref', function(value) {
        if (!value)
          return;

        element.attr(attrName, value);
      });
    }
  };
})
.directive('noScroll', function() {
  return {
    restrict: 'A',
    link: function(scope, elem) {
      elem.on('touchstart wheel', function(e) {
        e.preventDefault();
      });
    }
  };
})
.controller('MasterCtrl', function($scope, $localStorage, $sce, ColorSvc, DrawingSvc) {
  $scope.$storage = $localStorage;
  
  $scope.fillActiveColor = function() {
    var hex = ColorSvc.convert.rgba(ColorSvc.activeColor()).to.hex24();
    return `#${hex}`;
  };
  $scope.shouldCreateNewDrawing = DrawingSvc.shouldCreateNewDrawing;
  $scope.toggleForceCreateNewDrawing = () => {
    DrawingSvc.forceCreateNewDrawing = !DrawingSvc.forceCreateNewDrawing;
  };
  
  $scope.sprite = function() {
    return $sce.trustAsResourceUrl('#' + ($scope.$storage.rigid ? 'rigid' : 'flex') + '-' + ($scope.$storage.fill ? 'fill' : 'nofill'));
  }
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
})
.run(function() {
  window.addEventListener('orientationchange', function() {
    window.scrollTo(0,0);
  });
	FastClick.attach(document.body);
});

