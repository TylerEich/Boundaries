/* global FastClick */

'use strict';

angular
  .module('boundaries', [
    'ngStorage',
    'ui.map',
    'ngAnimate',

    'boundaries.color',
    'boundaries.drawing',
    'boundaries.geo',
    'boundaries.image',
    'boundaries.map',
    'boundaries.mode',
    'boundaries.search',
    'boundaries.status'
    // 'boundaries.settings'
  ])
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
  .controller('MasterCtrl', function($scope, $localStorage, ColorSvc) {
    $scope.$storage = $localStorage;
    
    $scope.fillActiveColor = function() {
      var index = $scope.$storage.activeColor;
      var color = $scope.$storage.colors[index];
      var hex = ColorSvc.convert.rgba(color).to.hex24();
      return `#${hex}`;
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
  })
  .run(function() {
    window.addEventListener('DOMContentLoaded', function() {
      FastClick.attach(document.body);
      angular.element(document.querySelector('#splash')).removeClass('loading');
    }, false);
    window.addEventListener('orientationchange', function() {
      window.scrollTo(0,0);
    });
  });