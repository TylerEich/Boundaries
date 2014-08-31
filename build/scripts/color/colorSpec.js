"use strict";
'use strict';
var ColorSvc;
var converts,
    tos;
beforeEach(module('bndry.color'));
describe('ColorSvc', function() {
  beforeEach(inject(function(_ColorSvc_) {
    ColorSvc = _ColorSvc_;
  }));
  describe('converts', function() {
    var data = {
      rgba: {
        r: 0,
        g: 0,
        b: 1,
        a: 1
      },
      hsla: {
        h: 2 / 3,
        s: 1.0,
        l: 0.5,
        a: 1
      },
      hex24: '0000ff',
      hex32: '0000ffff'
    };
    function convertTo(convert, to) {
      it(convert + ' to ' + to, function() {
        var expectedValue = data[to];
        var actualValue = ColorSvc.convert[convert](data[convert]).to[to]();
        if (typeof expectedValue === 'object') {
          for (var key in expectedValue) {
            expect(actualValue[key]).toBeCloseTo(expectedValue[key], 1 / 255);
          }
        } else {
          expect(actualValue).toEqual(expectedValue);
        }
      });
    }
    angular.injector(['ng', 'bndry.color']).invoke(function(ColorSvc) {
      converts = ColorSvc.convert;
      tos = ColorSvc.to;
    });
    for (var convert in converts) {
      for (var to in tos) {
        convertTo(convert, to);
      }
    }
  });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3IvY29sb3JTcGVjLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiY29sb3IvY29sb3JTcGVjLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxudmFyIENvbG9yU3ZjO1xudmFyIGNvbnZlcnRzLCB0b3M7XG5iZWZvcmVFYWNoKG1vZHVsZSgnYm5kcnkuY29sb3InKSk7XG5cbmRlc2NyaWJlKCdDb2xvclN2YycsIGZ1bmN0aW9uKCkge1xuICBiZWZvcmVFYWNoKGluamVjdChmdW5jdGlvbihfQ29sb3JTdmNfKSB7XG4gICAgQ29sb3JTdmMgPSBfQ29sb3JTdmNfO1xuICB9KSk7XG5cbiAgZGVzY3JpYmUoJ2NvbnZlcnRzJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICByZ2JhOiB7XG4gICAgICAgIHI6IDAsXG4gICAgICAgIGc6IDAsXG4gICAgICAgIGI6IDEsXG4gICAgICAgIGE6IDFcbiAgICAgIH0sXG4gICAgICBoc2xhOiB7XG4gICAgICAgIGg6IDIvMyxcbiAgICAgICAgczogMS4wLFxuICAgICAgICBsOiAwLjUsXG4gICAgICAgIGE6IDFcbiAgICAgIH0sXG4gICAgICBoZXgyNDogJzAwMDBmZicsXG4gICAgICBoZXgzMjogJzAwMDBmZmZmJ1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBjb252ZXJ0VG8oY29udmVydCwgdG8pIHtcbiAgICAgIGl0KGNvbnZlcnQgKyAnIHRvICcgKyB0bywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBleHBlY3RlZFZhbHVlID0gZGF0YVt0b107XG4gICAgICAgIHZhciBhY3R1YWxWYWx1ZSA9IENvbG9yU3ZjXG4gICAgICAgICAgLmNvbnZlcnRbY29udmVydF0oZGF0YVtjb252ZXJ0XSlcbiAgICAgICAgICAudG9bdG9dKCk7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBleHBlY3RlZFZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgIGZvciAodmFyIGtleSBpbiBleHBlY3RlZFZhbHVlKSB7XG4gICAgICAgICAgICBleHBlY3QoYWN0dWFsVmFsdWVba2V5XSlcbiAgICAgICAgICAgICAgLnRvQmVDbG9zZVRvKGV4cGVjdGVkVmFsdWVba2V5XSwgMS8yNTUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBleHBlY3QoYWN0dWFsVmFsdWUpLnRvRXF1YWwoZXhwZWN0ZWRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGFuZ3VsYXIuaW5qZWN0b3IoWyduZycsICdibmRyeS5jb2xvciddKVxuICAgICAgLmludm9rZShmdW5jdGlvbihDb2xvclN2Yykge1xuICAgICAgICBjb252ZXJ0cyA9IENvbG9yU3ZjLmNvbnZlcnQ7XG4gICAgICAgIHRvcyA9IENvbG9yU3ZjLnRvO1xuICAgICAgfSk7XG4gICAgXG4gICAgZm9yICh2YXIgY29udmVydCBpbiBjb252ZXJ0cykge1xuICAgICAgZm9yICh2YXIgdG8gaW4gdG9zKSB7XG4gICAgICAgIGNvbnZlcnRUbyhjb252ZXJ0LCB0byk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9