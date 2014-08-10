"use strict";
angular.module('bndry.history', []).service('HistorySvc', function() {
  "use strict";
  var commands = [],
      index = -1,
      isExecuting = false,
      callback,
      execute;
  execute = function(command, action) {
    if (!command || typeof command[action] !== "function") {
      return this;
    }
    isExecuting = true;
    command[action]();
    isExecuting = false;
    return this;
  };
  return {
    add: function(command) {
      if (isExecuting) {
        return this;
      }
      commands.splice(index + 1, commands.length - index);
      commands.push(command);
      index = commands.length - 1;
      if (callback) {
        callback();
      }
      return this;
    },
    setCallback: function(callbackFunc) {
      callback = callbackFunc;
    },
    undo: function() {
      var command = commands[index];
      if (!command) {
        return this;
      }
      execute(command, "undo");
      index -= 1;
      if (callback) {
        callback();
      }
      return this;
    },
    redo: function() {
      var command = commands[index + 1];
      if (!command) {
        return this;
      }
      execute(command, "redo");
      index += 1;
      if (callback) {
        callback();
      }
      return this;
    },
    clear: function() {
      var prev_size = commands.length;
      commands = [];
      index = -1;
      if (callback && (prev_size > 0)) {
        callback();
      }
    },
    hasUndo: function() {
      return index !== -1;
    },
    hasRedo: function() {
      return index < (commands.length - 1);
    },
    getCommands: function() {
      return commands;
    }
  };
});
