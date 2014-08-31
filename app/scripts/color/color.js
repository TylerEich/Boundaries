/* jshint bitwise: false */

angular.module('bndry.color', ['ngStorage'])

/*
Color Service
 
Converts color notations to various formats
Supported formats: rgba, hsla, hex24, hex32
*/
.service('ColorSvc', function($localStorage) {
  var _rgba = {};
  var self = this;

  function rgbaToInt(r, g, b, a) {
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    a = Math.round(a * 255);

    /*
    Bitwise black magic (given r = 0x12, g = 0x34, b = 56, a = 78):
    (r << 24) => 0x12000000
    (g << 16) => 0x00340000
    (b << 8)  => 0x00005600
    (a)       => 0x00000078
    
    All OR'ed => 0x12345678
    
    `>>> 0` converts to unsigned 32-bit int
    */
    return ((r << 24) | (g << 16) | (b << 8) | (a)) >>> 0;
  }
  function hueToRgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  
  this.convert = {
    rgba: function(rgba) {
      _rgba = rgbaToInt(rgba.r,
        rgba.g,
        rgba.b,
        rgba.a);

      return self;
    },
    hsla: function(hsla) {
      var r, g, b;
      var {h, s, l, a} = hsla;

      if (s == 0) {
          r = g = b = l; // achromatic
      } else {
          var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
          var p = 2 * l - q;
          r = hueToRgb(p, q, h + 1/3);
          g = hueToRgb(p, q, h);
          b = hueToRgb(p, q, h - 1/3);
      }
      
      _rgba = rgbaToInt(r, g, b, a);
      
      return self;
    },
    hex24: function(hex24) {
      self.convert.hex32(hex24 + 'FF');

      return self;
    },
    hex32: function(hex32) {
      _rgba = parseInt(hex32, 16) >>> 0; // `>>> 0` => unsigned 32-bit int

      return self;
    }
  };
  this.to = {
    rgba: function() {
      var r = (_rgba >> 24 & 0xFF) / 0xFF,
        g = (_rgba >> 16 & 0xFF) / 0xFF,
        b = (_rgba >> 8 & 0xFF) / 0xFF,
        a = (_rgba & 0xFF) / 0xFF;

      _rgba = 0;

      return {r,g,b,a};
    },
    hsla: function() {
      var {r, g, b, a} = self.to.rgba();
      
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2;

      if (max === min) {
        h = s = 0; // achromatic
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }

      return {h, s, l, a};
    },
    hex24: function() {
      return self.to.hex32().substring(0, 6);
    },
    hex32: function() {
      var hex = _rgba.toString(16);
      _rgba = 0;

      return ('00000000' + hex).slice(-8); // Pad output with leading zero
    }
  };
  
  $localStorage.$default({
    colors: [{
      name: 'Red',
      r: 1,
      g: 0,
      b: 0,
      a: 0.125,
      weight: 10
    }, {
      name: 'Green',
      r: 0,
      g: 1,
      b: 0,
      a: 0.125,
      weight: 10
    }, {
      name: 'Blue',
      r: 0,
      g: 0,
      b: 1,
      a: 0.125,
      weight: 10
    }],
    activeColorIndex: 1
  });
  self.colors = $localStorage.colors;
  self.activeColorIndex = $localStorage.activeColorIndex;
  self.activeColor = function() {
    return self.colors[self.activeColorIndex];
  };
})
  .controller('ColorCtrl', function($scope, $localStorage, ColorSvc) {
    $scope.fillColor = function(index) {
      var color = ColorSvc.colors[index];
      return '#' + ColorSvc.convert.rgba(color).to.hex24();
    };
  });
