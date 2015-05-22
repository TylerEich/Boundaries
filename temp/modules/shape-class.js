System.register('src/modules/shape-class', ['src/modules/event-emitter'], function (_export) {
  'use strict';

  var EventEmitter, Shape, ShapeStore;

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x5, _x6, _x7) { var _again = true; _function: while (_again) { var object = _x5, property = _x6, receiver = _x7; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x5 = parent; _x6 = property; _x7 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

  function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

  return {
    setters: [function (_srcModulesEventEmitter) {
      EventEmitter = _srcModulesEventEmitter['default'];
    }],
    execute: function () {
      Shape = (function (_EventEmitter) {
        function Shape(color, fill, rigid) {
          _classCallCheck(this, Shape);

          _get(Object.getPrototypeOf(Shape.prototype), 'constructor', this).call(this);

          this.color = String(color);
          this.fill = Boolean(fill);
          this.rigid = Boolean(rigid);
          this.path = [];
        }

        _inherits(Shape, _EventEmitter);

        _createClass(Shape, [{
          key: '_sanitizePath',
          value: function _sanitizePath() {
            if (!this.path.length) {
              return;
            }

            var firstNode = this.path[0];
            var lastNode = this.path[this.path.length - 1];

            firstNode.node = true;
            lastNode.node = true;

            if (this.fill && firstNode !== lastNode) {
              this.path.push(firstNode);
            } else if (!this.fill && firstNode === lastNode && this.path.length > 1) {
              this.path.pop();
            }
          }
        }, {
          key: 'addPath',
          value: function addPath() {
            var _path;

            var path = arguments[0] === undefined ? [] : arguments[0];
            var index = arguments[1] === undefined ? Number.MAX_VALUE : arguments[1];

            (_path = this.path).splice.apply(_path, [index, 0].concat(_toConsumableArray(path)));

            this.emit('add', path, this);

            this._sanitizePath();
          }
        }, {
          key: 'deleteNode',
          value: function deleteNode(node) {
            var index = this.path.indexOf(node);
            if (index === -1) {
              throw 'node not found';
            }
            var startIndex = index;
            var deleteCount = 0;

            // Look backwards for nearest node
            for (var i = index - 1; i >= 0; i--) {
              if (this.path[i].node) {
                // Start immediately after discovered node
                startIndex = i + 1;
                deleteCount += index - startIndex;
                break;
              }
            }

            // Delete node itself
            deleteCount++;

            // Look ahead for nearest node
            for (var i = index + 1; i < this.path.length; i++) {
              if (this.path[i].node) {
                deleteCount += i - index - 1;
                break;
              }
            }

            console.log(startIndex, deleteCount);

            var deletedPath = this.path.splice(startIndex, deleteCount);

            this._sanitizePath();

            this.emit('delete', deletedPath, this);
          }
        }, {
          key: 'toFeature',
          value: function toFeature() {
            var fill = this.fill;
            var color = this.color;
            var rigid = this.rigid;

            var coordinates = [];
            var nodePositions = [];

            this.path.forEach(function (point, i) {
              var x = point.x;
              var y = point.y;

              coordinates.push([x, y]);

              if (point.node) {
                nodePositions.push(i);
              }
            });

            return {
              type: 'Feature',
              geometry: {
                type: fill ? 'Polygon' : 'LineString',
                coordinates: fill ? [coordinates] : coordinates
              },
              properties: {
                color: color,
                fill: fill,
                rigid: rigid,
                nodePositions: nodePositions
              }
            };
          }
        }], [{
          key: 'fromFeature',
          value: function fromFeature() {
            var feature = arguments[0] === undefined ? {} : arguments[0];

            try {
              var _ret = (function () {
                var _feature$properties = feature.properties;
                var color = _feature$properties.color;
                var rigid = _feature$properties.rigid;
                var fill = _feature$properties.fill;
                var nodePositions = _feature$properties.nodePositions;

                var coordinates = undefined;
                if (fill) {
                  coordinates = feature.geometry.coordinates[0];
                } else {
                  coordinates = feature.geometry.coordinates;
                }

                var path = coordinates.map(function (coordinate, i) {
                  var _coordinate = _slicedToArray(coordinate, 2);

                  var x = _coordinate[0];
                  var y = _coordinate[1];

                  var point = { x: x, y: y };

                  if (nodePositions.indexOf(i) > -1) {
                    point.node = true;
                  }

                  return point;
                });

                var shape = new Shape(color, fill, rigid);
                shape.addPath(path);

                return {
                  v: shape
                };
              })();

              if (typeof _ret === 'object') return _ret.v;
            } catch (e) {
              console.warn('Feature is invalid');
              return new Shape();
            }
          }
        }]);

        return Shape;
      })(EventEmitter);

      _export('Shape', Shape);

      ShapeStore = (function (_EventEmitter2) {
        function ShapeStore() {
          _classCallCheck(this, ShapeStore);

          _get(Object.getPrototypeOf(ShapeStore.prototype), 'constructor', this).call(this);

          this._shapes = [];
        }

        _inherits(ShapeStore, _EventEmitter2);

        _createClass(ShapeStore, [{
          key: 'getShapes',
          value: function getShapes() {
            return this._shapes;
          }
        }, {
          key: 'addShape',
          value: function addShape(shape) {
            this._shapes.push(shape);

            this.emit('add', shape, this);
          }
        }, {
          key: 'deleteShape',
          value: function deleteShape(shape) {
            var shapeIndex = this._shapes.indexOf(shape);

            if (shapeIndex > -1) {
              this._shapes.splice(shapeIndex, 1);
              this.emit('delete', shape, this);
            }
          }
        }, {
          key: 'toFeatureCollection',
          value: function toFeatureCollection() {
            var features = this._shapes.map(function (shape) {
              return shape.toFeature();
            });

            return {
              type: 'FeatureCollection',
              features: features
            };
          }
        }], [{
          key: 'fromFeatureCollection',
          value: function fromFeatureCollection() {
            var featureCollection = arguments[0] === undefined ? {} : arguments[0];

            var shapeStore = new ShapeStore();

            try {
              featureCollection.features.forEach(function (feature) {
                var shape = Shape.fromFeature(feature);

                shapeStore.addShape(shape);
              });
            } catch (error) {
              console.warn('geoJson is invalid', error);
              return new ShapeStore();
            }

            return shapeStore;
          }
        }]);

        return ShapeStore;
      })(EventEmitter);

      _export('ShapeStore', ShapeStore);
    }
  };
});