(function(UndoManager) {
  angular.module('bndry.history', [])
    .service('HistoryService', UndoManager);
})(UndoManager);
