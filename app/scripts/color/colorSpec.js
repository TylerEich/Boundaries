
var ColorSvc;
var converts, tos;
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
        h: 2/3,
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
        var actualValue = ColorSvc
          .convert[convert](data[convert])
          .to[to]();

        if (typeof expectedValue === 'object') {
          for (var key in expectedValue) {
            expect(actualValue[key])
              .toBeCloseTo(expectedValue[key], 1/255);
          }
        } else {
          expect(actualValue).toEqual(expectedValue);
        }
      });
    }

    angular.injector(['ng', 'bndry.color'])
      .invoke(function(ColorSvc) {
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
