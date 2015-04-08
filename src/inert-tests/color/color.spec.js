
var ColorSvc;
var converts, tos;
beforeEach(angular.mock.module('bndry.color'));

describe('ColorSvc', function() {
  beforeEach(inject(function(_ColorSvc_) {
    ColorSvc = _ColorSvc_;
  }));

  describe('converts', function() {
    var data = [
			{
				name: 'Black',
	      rgba: {
	        r: 0,
	        g: 0,
	        b: 0,
	        a: 1
	      },
	      hsla: {
	        h: 0,
	        s: 0.0,
	        l: 0,
	        a: 1
	      },
	      hex24: '000000',
	      hex32: '000000ff'
	    },
			{
				name: 'Red',
	      rgba: {
	        r: 1,
	        g: 0,
	        b: 0,
	        a: 1
	      },
	      hsla: {
	        h: 0,
	        s: 1.0,
	        l: 0.5,
	        a: 1
	      },
	      hex24: 'ff0000',
	      hex32: 'ff0000ff'
	    },
			{
				name: 'Green',
	      rgba: {
	        r: 0,
	        g: 1,
	        b: 0,
	        a: 1
	      },
	      hsla: {
	        h: 1/3,
	        s: 1.0,
	        l: 0.5,
	        a: 1
	      },
	      hex24: '00ff00',
	      hex32: '00ff00ff'
	    },
			{
				name: 'Blue',
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
	    },
			{
				name: 'Fuscia',
	      rgba: {
	        r: 1,
	        g: 0,
	        b: 1,
	        a: 1
	      },
	      hsla: {
	        h: 5/6,
	        s: 1.0,
	        l: 0.5,
	        a: 1
	      },
	      hex24: 'ff00ff',
	      hex32: 'ff00ffff'
	    },
			{
				name: 'Light Blue',
	      rgba: {
	        r: 0,
	        g: 0.5,
	        b: 1,
	        a: 1
	      },
	      hsla: {
	        h: 7/12,
	        s: 1.0,
	        l: 0.5,
	        a: 1
	      },
	      hex24: '0080ff',
	      hex32: '0080ffff'
	    },
			{
				name: 'Pale Blue',
	      rgba: {
	        r: 0.5,
	        g: 0.5,
	        b: 1,
	        a: 1
	      },
	      hsla: {
	        h: 2/3,
	        s: 1.0,
	        l: 0.75,
	        a: 1
	      },
	      hex24: '8080ff',
	      hex32: '8080ffff'
	    },
			{
				name: 'Dark Blue',
	      rgba: {
	        r: 0,
	        g: 0,
	        b: 0.5,
	        a: 1
	      },
	      hsla: {
	        h: 2/3,
	        s: 1.0,
	        l: 0.25,
	        a: 1
	      },
	      hex24: '000080',
	      hex32: '000080ff'
	    },
			{
				name: 'Orange',
	      rgba: {
	        r: 1,
	        g: 0.5,
	        b: 0,
	        a: 1
	      },
	      hsla: {
	        h: 1/12,
	        s: 1.0,
	        l: 0.5,
	        a: 1
	      },
	      hex24: 'ff8000',
	      hex32: 'ff8000ff'
	    }
		];

    function convertTo(convert, to, datum) {
			it(datum.name + ': ' + convert + ' to ' + to, function() {
        var expectedValue = datum[to];
        var actualValue = ColorSvc
          .convert[convert](datum[convert])
          .to[to]();

        if (typeof expectedValue === 'object') {
          for (var key in expectedValue) {
            expect(actualValue[key])
              .toBeCloseTo(expectedValue[key], 1/255);
          }
        } else {
					expect(actualValue.length).toBe(expectedValue.length);

					var expectedIntValue,
						actualIntValue;
					
					for (var i = 0; i < expectedValue.length; i += 2) {
						expectedIntValue = parseInt(expectedValue.slice(i, i + 2), 16);
						actualIntValue = parseInt(actualValue.slice(i, i + 2), 16);
						
						expect(actualIntValue/255).toBeCloseTo(expectedIntValue/255, 1/255);
					}
          // expect(actualValue).toEqual(expectedValue);
        }
      });
    }

    angular.injector(['ng', 'bndry.color'])
      .invoke(function(ColorSvc) {
        converts = ColorSvc.convert;
        tos = ColorSvc.to;
      });
    
    for (var datum of data) {
			for (var convert in converts) {
	      for (var to in tos) {
	        convertTo(convert, to, datum);
	      }
	    }
		}
  });
	
	describe('stores colors', function() {
		it('Sets the activeColor index', function() {
			ColorSvc.setActiveColorIndex(2);
			expect(ColorSvc.activeColorIndex()).toEqual(2);
		});
		
		it('Returns the active color itself', function() {
			ColorSvc.setActiveColorIndex(2);
			expect(ColorSvc.activeColor()).toBe(ColorSvc.colors[2]);
		});
	});
});

describe('ColorCtrl', function() {
	var scope, ColorCtrl;
	beforeEach(inject(function($controller, _ColorSvc_) {
		scope = {};
		ColorCtrl = $controller('ColorCtrl', {$scope: scope});
		ColorSvc = _ColorSvc_;
	}));
	
	it('Provides the correct fill color', function() {
		ColorSvc.setActiveColorIndex(2);
		var color = ColorSvc.activeColor();
		var hex = '#' + ColorSvc.convert.rgba(color).to.hex24();
		
		expect(scope.fillColor()).toBe(hex);
		
		color = ColorSvc.colors[1];
		hex = '#' + ColorSvc.convert.rgba(color).to.hex24();
		
		expect(scope.fillColor(1)).toBe(hex);
	});
});
