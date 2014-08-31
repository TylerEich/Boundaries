"use strict";
angular.module('bndry.color', ['ngStorage']).service('ColorSvc', function($localStorage) {
  var _rgba = {};
  var self = this;
  function rgbaToInt(r, g, b, a) {
    r = Math.round(r * 255);
    g = Math.round(g * 255);
    b = Math.round(b * 255);
    a = Math.round(a * 255);
    return ((r << 24) | (g << 16) | (b << 8) | (a)) >>> 0;
  }
  function hueToRgb(p, q, t) {
    if (t < 0)
      t += 1;
    if (t > 1)
      t -= 1;
    if (t < 1 / 6)
      return p + (q - p) * 6 * t;
    if (t < 1 / 2)
      return q;
    if (t < 2 / 3)
      return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  this.convert = {
    rgba: function(rgba) {
      _rgba = rgbaToInt(rgba.r, rgba.g, rgba.b, rgba.a);
      return self;
    },
    hsla: function(hsla) {
      var r,
          g,
          b;
      var $__0 = hsla,
          h = $__0.h,
          s = $__0.s,
          l = $__0.l,
          a = $__0.a;
      if (s == 0) {
        r = g = b = l;
      } else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hueToRgb(p, q, h + 1 / 3);
        g = hueToRgb(p, q, h);
        b = hueToRgb(p, q, h - 1 / 3);
      }
      _rgba = rgbaToInt(r, g, b, a);
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
      var $__0 = self.to.rgba(),
          r = $__0.r,
          g = $__0.g,
          b = $__0.b,
          a = $__0.a;
      var max = Math.max(r, g, b),
          min = Math.min(r, g, b);
      var h,
          s,
          l = (max + min) / 2;
      if (max === min) {
        h = s = 0;
      } else {
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
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
      return ('00000000' + hex).slice(-8);
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
}).controller('ColorCtrl', function($scope, $localStorage, ColorSvc) {
  $scope.fillColor = function(index) {
    var color = ColorSvc.colors[index];
    return '#' + ColorSvc.convert.rgba(color).to.hex24();
  };
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sb3IvY29sb3IuanMiLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb2xvci9jb2xvci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBqc2hpbnQgYml0d2lzZTogZmFsc2UgKi9cblxuYW5ndWxhci5tb2R1bGUoJ2JuZHJ5LmNvbG9yJywgWyduZ1N0b3JhZ2UnXSlcblxuLypcbkNvbG9yIFNlcnZpY2VcbiBcbkNvbnZlcnRzIGNvbG9yIG5vdGF0aW9ucyB0byB2YXJpb3VzIGZvcm1hdHNcblN1cHBvcnRlZCBmb3JtYXRzOiByZ2JhLCBoc2xhLCBoZXgyNCwgaGV4MzJcbiovXG4uc2VydmljZSgnQ29sb3JTdmMnLCBmdW5jdGlvbigkbG9jYWxTdG9yYWdlKSB7XG4gIHZhciBfcmdiYSA9IHt9O1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgZnVuY3Rpb24gcmdiYVRvSW50KHIsIGcsIGIsIGEpIHtcbiAgICByID0gTWF0aC5yb3VuZChyICogMjU1KTtcbiAgICBnID0gTWF0aC5yb3VuZChnICogMjU1KTtcbiAgICBiID0gTWF0aC5yb3VuZChiICogMjU1KTtcbiAgICBhID0gTWF0aC5yb3VuZChhICogMjU1KTtcblxuICAgIC8qXG4gICAgQml0d2lzZSBibGFjayBtYWdpYyAoZ2l2ZW4gciA9IDB4MTIsIGcgPSAweDM0LCBiID0gNTYsIGEgPSA3OCk6XG4gICAgKHIgPDwgMjQpID0+IDB4MTIwMDAwMDBcbiAgICAoZyA8PCAxNikgPT4gMHgwMDM0MDAwMFxuICAgIChiIDw8IDgpICA9PiAweDAwMDA1NjAwXG4gICAgKGEpICAgICAgID0+IDB4MDAwMDAwNzhcbiAgICBcbiAgICBBbGwgT1InZWQgPT4gMHgxMjM0NTY3OFxuICAgIFxuICAgIGA+Pj4gMGAgY29udmVydHMgdG8gdW5zaWduZWQgMzItYml0IGludFxuICAgICovXG4gICAgcmV0dXJuICgociA8PCAyNCkgfCAoZyA8PCAxNikgfCAoYiA8PCA4KSB8IChhKSkgPj4+IDA7XG4gIH1cbiAgZnVuY3Rpb24gaHVlVG9SZ2IocCwgcSwgdCkge1xuICAgIGlmICh0IDwgMCkgdCArPSAxO1xuICAgIGlmICh0ID4gMSkgdCAtPSAxO1xuICAgIGlmICh0IDwgMS82KSByZXR1cm4gcCArIChxIC0gcCkgKiA2ICogdDtcbiAgICBpZiAodCA8IDEvMikgcmV0dXJuIHE7XG4gICAgaWYgKHQgPCAyLzMpIHJldHVybiBwICsgKHEgLSBwKSAqICgyLzMgLSB0KSAqIDY7XG4gICAgcmV0dXJuIHA7XG4gIH1cbiAgXG4gIHRoaXMuY29udmVydCA9IHtcbiAgICByZ2JhOiBmdW5jdGlvbihyZ2JhKSB7XG4gICAgICBfcmdiYSA9IHJnYmFUb0ludChyZ2JhLnIsXG4gICAgICAgIHJnYmEuZyxcbiAgICAgICAgcmdiYS5iLFxuICAgICAgICByZ2JhLmEpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuICAgIGhzbGE6IGZ1bmN0aW9uKGhzbGEpIHtcbiAgICAgIHZhciByLCBnLCBiO1xuICAgICAgdmFyIHtoLCBzLCBsLCBhfSA9IGhzbGE7XG5cbiAgICAgIGlmIChzID09IDApIHtcbiAgICAgICAgICByID0gZyA9IGIgPSBsOyAvLyBhY2hyb21hdGljXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciBxID0gbCA8IDAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICAgICAgICB2YXIgcCA9IDIgKiBsIC0gcTtcbiAgICAgICAgICByID0gaHVlVG9SZ2IocCwgcSwgaCArIDEvMyk7XG4gICAgICAgICAgZyA9IGh1ZVRvUmdiKHAsIHEsIGgpO1xuICAgICAgICAgIGIgPSBodWVUb1JnYihwLCBxLCBoIC0gMS8zKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgX3JnYmEgPSByZ2JhVG9JbnQociwgZywgYiwgYSk7XG4gICAgICBcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG4gICAgaGV4MjQ6IGZ1bmN0aW9uKGhleDI0KSB7XG4gICAgICBzZWxmLmNvbnZlcnQuaGV4MzIoaGV4MjQgKyAnRkYnKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcbiAgICBoZXgzMjogZnVuY3Rpb24oaGV4MzIpIHtcbiAgICAgIF9yZ2JhID0gcGFyc2VJbnQoaGV4MzIsIDE2KSA+Pj4gMDsgLy8gYD4+PiAwYCA9PiB1bnNpZ25lZCAzMi1iaXQgaW50XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cbiAgfTtcbiAgdGhpcy50byA9IHtcbiAgICByZ2JhOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciByID0gKF9yZ2JhID4+IDI0ICYgMHhGRikgLyAweEZGLFxuICAgICAgICBnID0gKF9yZ2JhID4+IDE2ICYgMHhGRikgLyAweEZGLFxuICAgICAgICBiID0gKF9yZ2JhID4+IDggJiAweEZGKSAvIDB4RkYsXG4gICAgICAgIGEgPSAoX3JnYmEgJiAweEZGKSAvIDB4RkY7XG5cbiAgICAgIF9yZ2JhID0gMDtcblxuICAgICAgcmV0dXJuIHtyLGcsYixhfTtcbiAgICB9LFxuICAgIGhzbGE6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHtyLCBnLCBiLCBhfSA9IHNlbGYudG8ucmdiYSgpO1xuICAgICAgXG4gICAgICB2YXIgbWF4ID0gTWF0aC5tYXgociwgZywgYiksIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpO1xuICAgICAgdmFyIGgsIHMsIGwgPSAobWF4ICsgbWluKSAvIDI7XG5cbiAgICAgIGlmIChtYXggPT09IG1pbikge1xuICAgICAgICBoID0gcyA9IDA7IC8vIGFjaHJvbWF0aWNcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBkID0gbWF4IC0gbWluO1xuICAgICAgICBzID0gbCA+IDAuNSA/IGQgLyAoMiAtIG1heCAtIG1pbikgOiBkIC8gKG1heCArIG1pbik7XG4gICAgICAgIHN3aXRjaCAobWF4KSB7XG4gICAgICAgICAgY2FzZSByOiBoID0gKGcgLSBiKSAvIGQgKyAoZyA8IGIgPyA2IDogMCk7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgZzogaCA9IChiIC0gcikgLyBkICsgMjsgYnJlYWs7XG4gICAgICAgICAgY2FzZSBiOiBoID0gKHIgLSBnKSAvIGQgKyA0OyBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBoIC89IDY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7aCwgcywgbCwgYX07XG4gICAgfSxcbiAgICBoZXgyNDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gc2VsZi50by5oZXgzMigpLnN1YnN0cmluZygwLCA2KTtcbiAgICB9LFxuICAgIGhleDMyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBoZXggPSBfcmdiYS50b1N0cmluZygxNik7XG4gICAgICBfcmdiYSA9IDA7XG5cbiAgICAgIHJldHVybiAoJzAwMDAwMDAwJyArIGhleCkuc2xpY2UoLTgpOyAvLyBQYWQgb3V0cHV0IHdpdGggbGVhZGluZyB6ZXJvXG4gICAgfVxuICB9O1xuICBcbiAgJGxvY2FsU3RvcmFnZS4kZGVmYXVsdCh7XG4gICAgY29sb3JzOiBbe1xuICAgICAgbmFtZTogJ1JlZCcsXG4gICAgICByOiAxLFxuICAgICAgZzogMCxcbiAgICAgIGI6IDAsXG4gICAgICBhOiAwLjEyNSxcbiAgICAgIHdlaWdodDogMTBcbiAgICB9LCB7XG4gICAgICBuYW1lOiAnR3JlZW4nLFxuICAgICAgcjogMCxcbiAgICAgIGc6IDEsXG4gICAgICBiOiAwLFxuICAgICAgYTogMC4xMjUsXG4gICAgICB3ZWlnaHQ6IDEwXG4gICAgfSwge1xuICAgICAgbmFtZTogJ0JsdWUnLFxuICAgICAgcjogMCxcbiAgICAgIGc6IDAsXG4gICAgICBiOiAxLFxuICAgICAgYTogMC4xMjUsXG4gICAgICB3ZWlnaHQ6IDEwXG4gICAgfV0sXG4gICAgYWN0aXZlQ29sb3JJbmRleDogMVxuICB9KTtcbiAgc2VsZi5jb2xvcnMgPSAkbG9jYWxTdG9yYWdlLmNvbG9ycztcbiAgc2VsZi5hY3RpdmVDb2xvckluZGV4ID0gJGxvY2FsU3RvcmFnZS5hY3RpdmVDb2xvckluZGV4O1xuICBzZWxmLmFjdGl2ZUNvbG9yID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHNlbGYuY29sb3JzW3NlbGYuYWN0aXZlQ29sb3JJbmRleF07XG4gIH07XG59KVxuICAuY29udHJvbGxlcignQ29sb3JDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYWxTdG9yYWdlLCBDb2xvclN2Yykge1xuICAgICRzY29wZS5maWxsQ29sb3IgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgdmFyIGNvbG9yID0gQ29sb3JTdmMuY29sb3JzW2luZGV4XTtcbiAgICAgIHJldHVybiAnIycgKyBDb2xvclN2Yy5jb252ZXJ0LnJnYmEoY29sb3IpLnRvLmhleDI0KCk7XG4gICAgfTtcbiAgfSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=