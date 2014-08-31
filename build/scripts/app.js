"use strict";
'use strict';
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
    var index = $scope.$storage.activeColor;
    var color = $scope.$storage.colors[index];
    var hex = ColorSvc.convert.rgba(color).to.hex24();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiYXBwLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBGYXN0Q2xpY2sgKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5hbmd1bGFyXG4gIC5tb2R1bGUoJ2JuZHJ5JywgW1xuICAgICduZ1RvdWNoJyxcbiAgICAnbmdTdG9yYWdlJyxcbiAgICAndWkubWFwJyxcbiAgICAnbmdBbmltYXRlJyxcbiAgICBcbiAgICAnYm5kcnkuYWN0aW9uJyxcbiAgICAnYm5kcnkuY29sb3InLFxuICAgICdibmRyeS5kcmF3aW5nJyxcbiAgICAnYm5kcnkuZ2VvJyxcbiAgICAnYm5kcnkuaGlzdG9yeScsXG4gICAgJ2JuZHJ5LmltYWdlJyxcbiAgICAnYm5kcnkubWFwJyxcbiAgICAnYm5kcnkubW9kZScsXG4gICAgJ2JuZHJ5LnNlYXJjaCcsXG4gICAgJ2JuZHJ5LnN0YXR1cydcbiAgICAvLyAnYm5kcnkuc2V0dGluZ3MnXG4gIF0pXG4gIC5kaXJlY3RpdmUoJ25vU2Nyb2xsJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbSkge1xuICAgICAgICBlbGVtLm9uKCd0b3VjaHN0YXJ0IHdoZWVsJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgfSlcbiAgLmNvbnRyb2xsZXIoJ01hc3RlckN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhbFN0b3JhZ2UsIENvbG9yU3ZjKSB7XG4gICAgJHNjb3BlLiRzdG9yYWdlID0gJGxvY2FsU3RvcmFnZTtcbiAgICBcbiAgICAkc2NvcGUuZmlsbEFjdGl2ZUNvbG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaW5kZXggPSAkc2NvcGUuJHN0b3JhZ2UuYWN0aXZlQ29sb3I7XG4gICAgICB2YXIgY29sb3IgPSAkc2NvcGUuJHN0b3JhZ2UuY29sb3JzW2luZGV4XTtcbiAgICAgIHZhciBoZXggPSBDb2xvclN2Yy5jb252ZXJ0LnJnYmEoY29sb3IpLnRvLmhleDI0KCk7XG4gICAgICByZXR1cm4gYCMke2hleH1gO1xuICAgIH07XG4gICAgJHNjb3BlLnNob3cgPSB7XG4gICAgICBoZWFkZXI6ICcnLFxuICAgICAgZm9vdGVyOiAnJ1xuICAgIH07XG4gICAgXG4gICAgJHNjb3BlLnNldFNob3dIZWFkZXIgPSBmdW5jdGlvbihzaG93KSB7XG4gICAgICBpZiAoJHNjb3BlLnNob3cuaGVhZGVyID09PSBzaG93KSB7XG4gICAgICAgICRzY29wZS5zaG93LmhlYWRlciA9ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLnNob3cuaGVhZGVyID0gc2hvdztcbiAgICAgIH1cbiAgICB9O1xuICAgICRzY29wZS5zZXRTaG93Rm9vdGVyID0gZnVuY3Rpb24oc2hvdykge1xuICAgICAgaWYgKCRzY29wZS5zaG93LmZvb3RlciA9PT0gc2hvdykge1xuICAgICAgICAkc2NvcGUuc2hvdy5mb290ZXIgPSAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5zaG93LmZvb3RlciA9IHNob3c7XG4gICAgICB9XG4gICAgfTtcbiAgfSlcbiAgLnJ1bihmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignb3JpZW50YXRpb25jaGFuZ2UnLCBmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5zY3JvbGxUbygwLDApO1xuICAgIH0pO1xuICB9KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=