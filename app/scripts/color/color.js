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
      _rgba = rgba;
      return self;
    },
    hsla: function(hsla) {
      function hue2rgb(p, q, t) {
        if (t < 0) {
          t += 1;
        }
        if (t > 1) {
          t -= 1;
        }
        if (t < 1 / 6) {
          return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
          return q;
        }
        if (t < 2 / 3) {
          return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
      }

      var r, g, b;

      var h = hsla.h,
        s = hsla.s,
        l = hsla.l,
        a = hsla.a;

      if (s === 0) {
        r = g = b = l; // achromatic
      } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      _rgba = {
        r: parseFloat(r.toFixed(3)),
        g: parseFloat(g.toFixed(3)),
        b: parseFloat(b.toFixed(3)),
        a: parseFloat(a.toFixed(3))
      };
      return self;
    },
    hex24: function(hex24) {
      var rgba = parseInt(hex24, 16);

      _rgba = {
        r: parseFloat((((rgba >> 16) & 255) / 255).toFixed(3)),
        g: parseFloat((((rgba >> 8) & 255) / 255).toFixed(3)),
        b: parseFloat(((rgba & 255) / 255).toFixed(3)),
        a: 1
      };
      return self;
    },
    hex32: function(hex32) {
      // Load RGB values, overwrite a later
      self.convert.hex24(hex32.substring(0, 6));

      var a = parseInt(hex32.substring(6, 8), 16);
      _rgba.a = parseFloat(((a & 255) / 255).toFixed(3));

      return self;
    }
  };
  this.to = {
    rgba: function() {
      var rgba = _rgba;
      _rgba = {};
      return rgba;
    },
    hsla: function() {
      var rgba = _rgba;
      _rgba = {};

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
      var rgba = _rgba;
      _rgba = {};
      
      var rgba255 = {};
      var keys = Object.keys(rgba);

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        rgba255[key] = Math.round(rgba[key] * 255);
      }

      return ((1 << 24) | (rgba255.r << 16) | (rgba255.g << 8) | rgba255.b).toString(16).substring(1);
    },
    hex32: function() {
      var rgba = _rgba;

      // hex24 will clear _rgba
      var hex24 = self.to.hex24();
      var a = Math.round(rgba.a * 255);

      return hex24 + ((1 << 8) | a).toString(16).substring(1);
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
