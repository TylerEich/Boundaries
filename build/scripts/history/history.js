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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGlzdG9yeS9oaXN0b3J5LmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiaGlzdG9yeS9oaXN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdibmRyeS5oaXN0b3J5JywgW10pXG4gIC5zZXJ2aWNlKCdIaXN0b3J5U3ZjJywgZnVuY3Rpb24oKSB7XG4gICAgLyoganNoaW50IHF1b3RtYXJrOnRydWUgKi9cbiAgICAvKiBqc2hpbnQgY2FtZWxjYXNlOmZhbHNlICovXG4gICAgICAvKlxuICAgICAgU2ltcGxlIEphdmFzY3JpcHQgdW5kbyBhbmQgcmVkby5cbiAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9BcnRodXJDbGVtZW5zL0phdmFzY3JpcHQtVW5kby1NYW5hZ2VyXG4gICAgICAqL1xuICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICAgIHZhciBjb21tYW5kcyA9IFtdLFxuICAgICAgICBpbmRleCA9IC0xLFxuICAgICAgICBpc0V4ZWN1dGluZyA9IGZhbHNlLFxuICAgICAgICBjYWxsYmFjayxcblxuICAgICAgICAvLyBmdW5jdGlvbnNcbiAgICAgICAgZXhlY3V0ZTtcblxuICAgICAgZXhlY3V0ZSA9IGZ1bmN0aW9uKGNvbW1hbmQsIGFjdGlvbikge1xuICAgICAgICBpZiAoIWNvbW1hbmQgfHwgdHlwZW9mIGNvbW1hbmRbYWN0aW9uXSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgaXNFeGVjdXRpbmcgPSB0cnVlO1xuXG4gICAgICAgIGNvbW1hbmRbYWN0aW9uXSgpO1xuXG4gICAgICAgIGlzRXhlY3V0aW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcblxuICAgICAgICAvKlxuICAgICAgICBBZGQgYSBjb21tYW5kIHRvIHRoZSBxdWV1ZS5cbiAgICAgICAgKi9cbiAgICAgICAgYWRkOiBmdW5jdGlvbihjb21tYW5kKSB7XG4gICAgICAgICAgaWYgKGlzRXhlY3V0aW5nKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gaWYgd2UgYXJlIGhlcmUgYWZ0ZXIgaGF2aW5nIGNhbGxlZCB1bmRvLFxuICAgICAgICAgIC8vIGludmFsaWRhdGUgaXRlbXMgaGlnaGVyIG9uIHRoZSBzdGFja1xuICAgICAgICAgIGNvbW1hbmRzLnNwbGljZShpbmRleCArIDEsIGNvbW1hbmRzLmxlbmd0aCAtIGluZGV4KTtcblxuICAgICAgICAgIGNvbW1hbmRzLnB1c2goY29tbWFuZCk7XG5cbiAgICAgICAgICAvLyBzZXQgdGhlIGN1cnJlbnQgaW5kZXggdG8gdGhlIGVuZFxuICAgICAgICAgIGluZGV4ID0gY29tbWFuZHMubGVuZ3RoIC0gMTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qXG4gICAgICAgIFBhc3MgYSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gdW5kbyBhbmQgcmVkbyBhY3Rpb25zLlxuICAgICAgICAqL1xuICAgICAgICBzZXRDYWxsYmFjazogZnVuY3Rpb24oY2FsbGJhY2tGdW5jKSB7XG4gICAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFja0Z1bmM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLypcbiAgICAgICAgUGVyZm9ybSB1bmRvOiBjYWxsIHRoZSB1bmRvIGZ1bmN0aW9uIGF0IHRoZSBjdXJyZW50IGluZGV4IGFuZCBkZWNyZWFzZSB0aGUgaW5kZXggYnkgMS5cbiAgICAgICAgKi9cbiAgICAgICAgdW5kbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIGNvbW1hbmQgPSBjb21tYW5kc1tpbmRleF07XG4gICAgICAgICAgaWYgKCFjb21tYW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICB9XG4gICAgICAgICAgZXhlY3V0ZShjb21tYW5kLCBcInVuZG9cIik7XG4gICAgICAgICAgaW5kZXggLT0gMTtcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qXG4gICAgICAgIFBlcmZvcm0gcmVkbzogY2FsbCB0aGUgcmVkbyBmdW5jdGlvbiBhdCB0aGUgbmV4dCBpbmRleCBhbmQgaW5jcmVhc2UgdGhlIGluZGV4IGJ5IDEuXG4gICAgICAgICovXG4gICAgICAgIHJlZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBjb21tYW5kID0gY29tbWFuZHNbaW5kZXggKyAxXTtcbiAgICAgICAgICBpZiAoIWNvbW1hbmQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgIH1cbiAgICAgICAgICBleGVjdXRlKGNvbW1hbmQsIFwicmVkb1wiKTtcbiAgICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLypcbiAgICAgICAgQ2xlYXJzIHRoZSBtZW1vcnksIGxvc2luZyBhbGwgc3RvcmVkIHN0YXRlcy4gUmVzZXQgdGhlIGluZGV4LlxuICAgICAgICAqL1xuICAgICAgICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgdmFyIHByZXZfc2l6ZSA9IGNvbW1hbmRzLmxlbmd0aDtcblxuICAgICAgICAgIGNvbW1hbmRzID0gW107XG4gICAgICAgICAgaW5kZXggPSAtMTtcblxuICAgICAgICAgIGlmIChjYWxsYmFjayAmJiAocHJldl9zaXplID4gMCkpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGhhc1VuZG86IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiBpbmRleCAhPT0gLTE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGFzUmVkbzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGluZGV4IDwgKGNvbW1hbmRzLmxlbmd0aCAtIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldENvbW1hbmRzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gY29tbWFuZHM7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG5cbiAgICAgIC8qXG5MSUNFTlNFXG5cblRoZSBNSVQgTGljZW5zZVxuXG5Db3B5cmlnaHQgKGMpIDIwMTAtMjAxNCBBcnRodXIgQ2xlbWVucywgYXJ0aHVyY2xlbWVuc0BnbWFpbC5jb21cblxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxub2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xudG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG5mdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOiBcblxuVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbmFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG5JTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbkZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbk9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cblRIRSBTT0ZUV0FSRS5cbiovXG5cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==