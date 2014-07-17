/* jshint bitwise: false */

'use strict';

angular.module('boundaries.color', [])

/*
Color Service
 
Converts color notations to various formats
Supported formats: rgba, hsla, hex24, hex32
*/
.service('ColorSvc', function() {
  var _rgba = {};
  var self = this;

  this.convert = {
    rgba: function(rgba) {
      var r = Math.round(rgba.r * 255),
        g = Math.round(rgba.g * 255),
        b = Math.round(rgba.b * 255),
        a = Math.round(rgba.a * 255);

      /*
      Bitwise black magic (given r = 0x12, g = 0x34, b = 56, a = 78):
      (r << 24) => 0x12000000
      (g << 16) => 0x00340000
      (b << 8)  => 0x00005600
      (a)       => 0x00000078
      
      All OR'ed => 0x12345678
      
      `>>> 0` converts to unsigned 32-bit int
      */
      _rgba = (((r << 24) | (g << 16) | (b << 8) | (a)) >>> 0);
      
      return self;
    },
    hsla: function(hsla) {
      var r, g, b;

      var h = Math.round(hsla.h * 360),
        s = Math.round(hsla.s * 100),
        l = Math.round(hsla.l * 100),
        a = hsla.a;

      var c = (100 - Math.abs(2 * l - 1)) * s;
      var x = c * (1 - Math.abs((h / 60 % 2) - 1));

      if (0 <= h && h < 1) {
        r = c;
        g = x;
        b = 0;
      } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
      } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
      } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
      } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
      } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
      }
      var m = l - c / 2;
      r += m;
      g += m;
      b += m;

      self.convert.rgba({
        r: r / 100,
        g: g / 100,
        b: b / 100,
        a: a
      });
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

      return {
        r: r,
        g: g,
        b: b,
        a: a
      };
    },
    hsla: function() {
      var rgba = self.to.rgba();

      var r = rgba.r,
        g = rgba.g,
        b = rgba.b,
        a = rgba.a;

      var min = Math.min(r, g, b),
        max = Math.max(r, g, b);

      var h, s, l, d; // d means delta
      h = s = l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        d = max - min;
        s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return {
        h: h,
        s: s,
        l: l,
        a: a
      };
    },
    hex24: function() {
      return self.to.hex32().substring(0, 6);
    },
    hex32: function() {
      var hex = _rgba.toString(16);
      _rgba = 0;

      return ((hex.length > 7) ? '' : '0') + hex; // Pad output with leading zero
    }
  };
})
  .controller('ColorCtrl', function($scope, $localStorage, ColorSvc) {
    $scope.$storage = $localStorage.$default({
      colors: [{
        r: 1,
        g: 0,
        b: 0,
        a: 0.125,
        weight: 10
      }, {
        r: 0,
        g: 1,
        b: 0,
        a: 0.125,
        weight: 10
      }, {
        r: 0,
        g: 0,
        b: 1,
        a: 0.125,
        weight: 10
      }],
      activeColor: 1
    });

    $scope.fillColor = function(index) {
      var color = $scope.$storage.colors[index];
      return '#' + ColorSvc.convert.rgba(color).to.hex24();
    };
  });
