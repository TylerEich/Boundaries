'use strict';

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
	value: true
});
/* jshint bitwise: false */

function hueToRgb(p, q, t) {
	if (t < 0) t += 1;
	if (t > 1) t -= 1;
	if (t < 1 / 6) {
		return p + (q - p) * 6 * t;
	}if (t < 1 / 2) {
		return q;
	}if (t < 2 / 3) {
		return p + (q - p) * (2 / 3 - t) * 6;
	}return p;
}

function rgba(r, g, b) {
	var a = arguments[3] === undefined ? 1 : arguments[3];

	return [r, g, b, a];
}

function hsla(h, s, l) {
	var a = arguments[3] === undefined ? 1 : arguments[3];

	var r = undefined,
	    g = undefined,
	    b = undefined;

	if (s == 0) {
		r = g = b = l; // achromatic
	} else {
		var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		var p = 2 * l - q;
		r = hueToRgb(p, q, h + 1 / 3);
		g = hueToRgb(p, q, h);
		b = hueToRgb(p, q, h - 1 / 3);
	}

	return [r, g, b, a];
}

function hex(hexString) {
	if (hexString.length == 6) {
		hexString += 'FF';
	}

	var rgbaInt = parseInt(hexString, 16) >>> 0;
	var r = (rgbaInt >> 24 & 255) / 255,
	    g = (rgbaInt >> 16 & 255) / 255,
	    b = (rgbaInt >> 8 & 255) / 255,
	    a = (rgbaInt & 255) / 255;

	return [r, g, b, a];
}

var Color = (function () {
	function Color(color) {
		_classCallCheck(this, Color);

		if (typeof color === 'object') {
			var r = color.r;
			var g = color.g;
			var b = color.b;
			var h = color.h;
			var s = color.s;
			var l = color.l;
			var a = color.a;

			if (r !== undefined && g !== undefined && b !== undefined) {
				this.rgbaArray = rgba(r, g, b, a);
			} else if (h !== undefined && s !== undefined && l !== undefined) {
				this.rgbaArray = hsla(h, s, l, a);
			} else {
				throw 'Malformed argument object';
			}
		} else if (typeof color === 'string') {
			this.rgbaArray = hex(color);
		} else {
			throw 'Malformed argument';
		}
	}

	_createClass(Color, [{
		key: 'rgba',
		get: function () {
			var _rgbaArray = _slicedToArray(this.rgbaArray, 4);

			var r = _rgbaArray[0];
			var g = _rgbaArray[1];
			var b = _rgbaArray[2];
			var a = _rgbaArray[3];

			return { r: r, g: g, b: b, a: a };
		}
	}, {
		key: 'rgbaString',
		get: function () {
			var _rgbaArray2 = _slicedToArray(this.rgbaArray, 4);

			var r = _rgbaArray2[0];
			var g = _rgbaArray2[1];
			var b = _rgbaArray2[2];
			var a = _rgbaArray2[3];

			var _map = [r, g, b].map(function (value) {
				return (value * 100).toFixed(1);
			});

			var _map2 = _slicedToArray(_map, 3);

			var r100 = _map2[0];
			var g100 = _map2[1];
			var b100 = _map2[2];

			var aFixed = a.toFixed(2);

			return 'rgba(' + r100 + '%, ' + g100 + '%, ' + b100 + '%, ' + aFixed + ')';
		}
	}, {
		key: 'rgb',
		get: function () {
			var _rgbaArray3 = _slicedToArray(this.rgbaArray, 3);

			var r = _rgbaArray3[0];
			var g = _rgbaArray3[1];
			var b = _rgbaArray3[2];

			return { r: r, g: g, b: b };
		}
	}, {
		key: 'rgbString',
		get: function () {
			var _rgbaArray4 = _slicedToArray(this.rgbaArray, 3);

			var r = _rgbaArray4[0];
			var g = _rgbaArray4[1];
			var b = _rgbaArray4[2];

			var _map3 = [r, g, b].map(function (value) {
				return (value * 100).toFixed(1);
			});

			var _map32 = _slicedToArray(_map3, 3);

			var r100 = _map32[0];
			var g100 = _map32[1];
			var b100 = _map32[2];

			return 'rgb(' + r100 + '%, ' + g100 + '%, ' + b100 + '%)';
		}
	}, {
		key: 'hsla',
		get: function () {
			var _rgbaArray5 = _slicedToArray(this.rgbaArray, 4);

			var r = _rgbaArray5[0];
			var g = _rgbaArray5[1];
			var b = _rgbaArray5[2];
			var a = _rgbaArray5[3];

			var max = Math.max(r, g, b),
			    min = Math.min(r, g, b);
			var h = undefined,
			    s = undefined,
			    l = (max + min) / 2;

			if (max === min) {
				h = s = 0; // achromatic
			} else {
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);break;
					case g:
						h = (b - r) / d + 2;break;
					case b:
						h = (r - g) / d + 4;break;
				}
				h /= 6;
			}

			return { h: h, s: s, l: l, a: a };
		}
	}, {
		key: 'hslaString',
		get: function () {
			var _hsla = this.hsla;
			var h = _hsla.h;
			var s = _hsla.s;
			var l = _hsla.l;
			var a = _hsla.a;

			var h360 = (h * 360).toFixed(1);

			var _map4 = [s, l].map(function (value) {
				return (value * 100).toFixed(1);
			});

			var _map42 = _slicedToArray(_map4, 2);

			var s100 = _map42[0];
			var l100 = _map42[1];

			var aFixed = a.toFixed(2);

			return 'hsla(' + h360 + ', ' + s100 + '%, ' + l100 + '%, ' + aFixed + ')';
		}
	}, {
		key: 'hsl',
		get: function () {
			var _hsla2 = this.hsla;
			var h = _hsla2.h;
			var s = _hsla2.s;
			var l = _hsla2.l;

			return { h: h, s: s, l: l };
		}
	}, {
		key: 'hslString',
		get: function () {
			var _hsl = this.hsl;
			var h = _hsl.h;
			var s = _hsl.s;
			var l = _hsl.l;

			var h360 = (h * 360).toFixed(1);

			var _map5 = [s, l].map(function (value) {
				return (value * 100).toFixed(1);
			});

			var _map52 = _slicedToArray(_map5, 2);

			var s100 = _map52[0];
			var l100 = _map52[1];

			return 'hsl(' + h360 + ', ' + s100 + '%, ' + l100 + '%)';
		}
	}, {
		key: 'hex32',
		get: function () {
			var hexArray = this.rgbaArray.map(function (val) {
				var hexString = '00' + Math.round(val * 255).toString(16);
				return hexString.slice(-2); // Pad with leading zero
			});

			return hexArray.join('');
		}
	}, {
		key: 'hex24',
		get: function () {
			return this.hex32.substring(0, 6);
		}
	}]);

	return Color;
})();

exports['default'] = Color;
module.exports = exports['default'];