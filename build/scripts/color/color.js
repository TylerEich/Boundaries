"use strict";
angular.module('boundaries.color', []).service('ColorSvc', function() {
  var _rgba = {};
  var self = this;
  function min() {
    for (var i = 1,
        m = 0,
        len = arguments.length; i < len; i++) {
      if (arguments[m] > arguments[i]) {
        m = i;
      }
    }
    return arguments[m];
  }
  function max() {
    for (var i = 1,
        m = 0,
        len = arguments.length; i < len; i++) {
      if (arguments[i] > arguments[m]) {
        m = i;
      }
    }
    return arguments[m];
  }
  function rgbaToInt(r, g, b, a) {
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    a = Math.round(a * 255);
    return ((r << 24) | (g << 16) | (b << 8) | (a)) >>> 0;
  }
  this.convert = {
    rgba: function(rgba) {
      _rgba = rgbaToInt(rgba.r, rgba.g, rgba.b, rgba.a);
      return self;
    },
    hsla: function(hsla) {
      var $__0 = $traceurRuntime.assertObject(hsla),
          h = $__0.h,
          s = $__0.s,
          l = $__0.l,
          a = $__0.a,
          vals;
      h *= 6;
      vals = [l += s *= l < 0.5 ? l : 1 - l, l - h % 1 * s * 2, l -= s *= 2, l, l + h % 1 * s, l + s];
      _rgba = rgbaToInt(vals[~~h % 6], vals[(h | 16) % 6], vals[(h | 8) % 6], a);
      return self;
    },
    hex24: function(hex24) {
      self.convert.hex32(hex24 + 'FF');
      return self;
    },
    hex32: function(hex32) {
      _rgba = parseInt(hex32, 16) >>> 0;
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
      var $__0 = $traceurRuntime.assertObject(rgba),
          r = $__0.r,
          g = $__0.g,
          b = $__0.b,
          a = $__0.a;
      var m = min(r, g, b),
          M = max(r, g, b);
      var h,
          s,
          l,
          d = M - m;
      h = s = l = (M + m) / 2;
      if (M === m) {
        h = s = 0;
      } else {
        if (r === M) {
          h = (g - b) / d % 6;
        } else if (g === M) {
          h = (b - r) / d + 2;
        } else {
          h = (r - g) / d + 4;
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
      return ('00000000' + hex).slice(-8);
    }
  };
}).controller('ColorCtrl', function($scope, $localStorage, ColorSvc) {
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
