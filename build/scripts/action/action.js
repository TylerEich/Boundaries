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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aW9uL2FjdGlvbi5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbImFjdGlvbi9hY3Rpb24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ2JuZHJ5LmFjdGlvbicsIFtdKVxuICAuY29udHJvbGxlcignQWN0aW9uQ3RybCcsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzY29wZSwgSGlzdG9yeVN2Yykge1xuICAgICRzY29wZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdhY3Rpb246Y2xlYXInKTtcbiAgICAgIEhpc3RvcnlTdmMuY2xlYXIoKTtcbiAgICB9O1xuICAgICRzY29wZS51bmRvID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoSGlzdG9yeVN2Yy5oYXNVbmRvKCkpIHtcbiAgICAgICAgSGlzdG9yeVN2Yy51bmRvKCk7XG4gICAgICB9XG4gICAgfTtcbiAgICAkc2NvcGUucmVkbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKEhpc3RvcnlTdmMuaGFzUmVkbygpKSB7XG4gICAgICAgIEhpc3RvcnlTdmMucmVkbygpO1xuICAgICAgfVxuICAgIH07XG4gIH0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9