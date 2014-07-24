"use strict";
'use strict';
var ColorSvc;
var converts,
    tos;
beforeEach(module('boundaries.color'));
describe('ColorSvc', function() {
  beforeEach(inject(function(_ColorSvc_) {
    ColorSvc = _ColorSvc_;
  }));
  describe('converts', function() {
    var data = {
      rgba: {
        r: 0.5,
        g: 0.25,
        b: 0.75,
        a: 1
      },
      hsla: {
        h: 0.75,
        s: 0.50,
        l: 0.50,
        a: 1
      },
      hex24: '8040bf',
      hex32: '8040bfff'
    };
    function convertTo(convert, to) {
      it(convert + ' to ' + to, function() {
        var expectedValue = data[to];
        var actualValue = ColorSvc.convert[convert](data[convert]).to[to]();
        if (typeof expectedValue === 'object') {
          for (var key in expectedValue) {
            expect(actualValue[key]).toBeCloseTo(expectedValue[key], 1 / 256);
          }
        } else {
          expect(actualValue).toEqual(expectedValue, 1 / 256);
        }
      });
    }
    angular.injector(['ng', 'boundaries.color']).invoke(function(ColorSvc) {
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
