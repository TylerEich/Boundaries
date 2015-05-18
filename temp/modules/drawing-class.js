'use strict';

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _emit = require('./pubsub');

var _assert = require('./assert');

var _assert2 = _interopRequireWildcard(_assert);

/**
  Path should `extend Array`, but browsers don't support that yet
**/

var Path = (function () {
  function Path() {
    for (var _len = arguments.length, points = Array(_len), _key = 0; _key < _len; _key++) {
      points[_key] = arguments[_key];
    }

    _classCallCheck(this, Path);

    this._points = points;
  }

  _createClass(Path, [{
    key: 'push',
    value: function push() {
      var _points;

      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return (_points = this._points).push.apply(_points, args);
    }
  }, {
    key: 'splice',
    value: function splice() {
      var _points2;

      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return (_points2 = this._points).splice.apply(_points2, args);
    }
  }, {
    key: 'filter',
    value: function filter(cb) {
      return this._points.filter(cb);
    }
  }, {
    key: 'find',
    value: function find(cb) {
      return this._points.find(cb);
    }
  }, {
    key: 'every',
    value: function every(cb) {
      return this._points.every(cb);
    }
  }, {
    key: 'some',
    value: function some(cb) {
      return this._points.some(cb);
    }
  }, {
    key: 'atIndex',
    value: function atIndex(i) {
      _assert2['default'](i < this._points.length, 'Out of bounds');
      return this._points[i];
    }
  }, {
    key: 'length',
    get: function () {
      return this._points.length;
    }
  }, {
    key: 'indexOf',
    value: function indexOf(point, fromIndex) {
      _assert2['default'](point instanceof Point);

      return this._points.indexOf(point, fromIndex);
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      var points = this._points;

      return (
        // Path can be empty
        points.length === 0 ||

        // Non-empty Path must start and end with a Node
        points[points.length - 1] instanceof Node && points[0] instanceof Node
      );
    }
  }]);

  return Path;
})();

var Point = (function () {
  function Point(x, y) {
    _classCallCheck(this, Point);

    _assert2['default'](typeof x === 'number');
    _assert2['default'](typeof y === 'number');

    this._x = x;
    this._y = y;
  }

  _createClass(Point, [{
    key: 'x',
    get: function () {
      return this._x;
    }
  }, {
    key: 'y',
    get: function () {
      return this._y;
    }
  }, {
    key: 'lat',
    get: function () {
      return this._y;
    }
  }, {
    key: 'lng',
    get: function () {
      return this._x;
    }
  }, {
    key: 'equals',
    value: function equals(point) {
      return this.x === point.x && this.y === point.y;
    }
  }]);

  return Point;
})();

var Node = (function (_Point) {
  function Node(x, y) {
    _classCallCheck(this, Node);

    _get(Object.getPrototypeOf(Node.prototype), 'constructor', this).call(this, x, y);
  }

  _inherits(Node, _Point);

  _createClass(Node, [{
    key: 'moveTo',
    value: function moveTo(x, y) {
      _assert2['default'](typeof x === 'number', 'X must be a number');
      _assert2['default'](typeof y === 'number', 'Y must be a number');

      this._x = x;
      this._y = y;

      _emit.emit(Node.event.MOVED, {
        x: x,
        y: y,
        context: this
      });
    }
  }]);

  return Node;
})(Point);

Node.event = {
  MOVED: 'Node.moved'
};

var Drawing = (function (_Path) {
  function Drawing(_ref) {
    var color = _ref.color;
    var fill = _ref.fill;
    var rigid = _ref.rigid;

    _classCallCheck(this, Drawing);

    _get(Object.getPrototypeOf(Drawing.prototype), 'constructor', this).call(this);

    _assert2['default'](typeof color === 'string');
    _assert2['default'](typeof fill === 'boolean');
    _assert2['default'](typeof rigid === 'boolean');
    this._color = color;
    this._fill = fill;
    this._rigid = rigid;

    _assert2['default'](this.isValid());
  }

  _inherits(Drawing, _Path);

  _createClass(Drawing, [{
    key: 'isValid',
    value: function isValid() {
      var valid = _get(Object.getPrototypeOf(Drawing.prototype), 'isValid', this).call(this),
          rigid = this.rigid ? this.every(function (point) {
        return point instanceof Node;
      }) : true,
          fill = this.fill ? this.length === 0 || this.atIndex(0) === this.atIndex(this.length - 1) : true;
      return valid && rigid && fill;
    }
  }, {
    key: 'color',
    get: function () {
      return this._color;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'string');
      this._color = value;

      _emit.emit(Drawing.event.COLOR_CHANGED, {
        color: value,
        context: this
      });
    }
  }, {
    key: 'fill',
    get: function () {
      return this._fill;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'boolean');

      var oldValue = this.fill;

      this._fill = value;

      if (value !== oldValue) {
        if (value && this.length > 0) {
          this._addPoints({
            atIndex: this.length,
            points: [this.atIndex(0)]
          });
        } else if (!value) {
          this.removeNode(this.atIndex(this.length - 1));
        }
      }

      _emit.emit(Drawing.event.FILL_CHANGED, {
        fill: value,
        context: this
      });
    }
  }, {
    key: 'rigid',
    get: function () {
      return this._rigid;
    },
    set: function (value) {
      _assert2['default'](typeof value === 'boolean');

      var oldValue = this.rigid;

      this._rigid = value;

      if (value && value !== oldValue) {
        for (var i = 0; i < this.length; i++) {
          if (!(this.atIndex(i) instanceof Node)) {
            this.splice(i, 1);
          }
        }
      }

      _emit.emit(Drawing.event.RIGID_CHANGED, {
        rigid: value,
        context: this
      });
    }
  }, {
    key: 'nodesAroundNode',
    value: function nodesAroundNode(node) {
      var nodes = this.nodes(),
          index = nodes.indexOf(node);

      var _nodeIndicesAroundNodeIndex = this._nodeIndicesAroundNodeIndex(index);

      var start = _nodeIndicesAroundNodeIndex.start;
      var end = _nodeIndicesAroundNodeIndex.end;
      var hasFirst = _nodeIndicesAroundNodeIndex.hasFirst;
      var hasLast = _nodeIndicesAroundNodeIndex.hasLast;

      return {
        start: this.atIndex(start),
        end: this.atIndex(end),
        hasFirst: hasFirst,
        hasLast: hasLast
      };
    }
  }, {
    key: '_nodeIndicesAroundNodeIndex',
    value: function _nodeIndicesAroundNodeIndex(index) {
      var start = undefined,
          end = undefined,
          hasFirst = false,
          hasLast = false,
          positions = this.nodePositions();

      _assert2['default'](index >= 0 && index < positions.length);

      if (index === 0 && !this.fill) {
        // First node
        start = positions[index]; // Include Node at index in splice
        hasFirst = true;
      } else if (index === 0 && this.fill) {
        // Nodes at front and end are identical. Ignore last node
        _assert2['default'](positions.length >= 2);
        start = positions[positions.length - 2]; // Wrap to exclude Node at -2
      } else {
        start = positions[index - 1]; // Exclude previous Node from splice
      }

      if (index === positions.length - 1 && !this.fill) {
        // Last node
        end = positions[index]; // Include Node at index in splice
        hasLast = true;
      } else {
        end = positions[index + 1]; // Exclude next Node from splice
      }

      return { start: start, end: end, hasFirst: hasFirst, hasLast: hasLast };
    }
  }, {
    key: 'removePointsBetweenNodes',
    value: function removePointsBetweenNodes(node1, node2) {
      _assert2['default'](node1 instanceof Node);
      _assert2['default'](node2 instanceof Node);

      var start = this.indexOf(node1),
          end = this.indexOf(node2, start);

      _assert2['default'](start > -1, 'Node not found');
      _assert2['default'](end > -1, 'Node not found');
      _assert2['default'](start <= end);

      start++; // Exclude node itself from operation

      return this._removePoints({ start: start, end: end });
    }
  }, {
    key: 'addPointsAfterNode',
    value: function addPointsAfterNode(node, points) {
      _assert2['default'](node instanceof Node);
      _assert2['default'](Array.isArray(points));
      _assert2['default'](this.indexOf(node) > -1, 'Node not found');

      var atIndex = this.indexOf(node) + 1;

      return this._addPoints({ atIndex: atIndex, points: points });
    }
  }, {
    key: 'addNode',
    value: function addNode(node, nodeIndex) {
      var nodePositions = this.nodePositions(),
          atIndex = this.length;

      _assert2['default'](node instanceof Node);

      _assert2['default'](Number.isInteger(nodeIndex));
      _assert2['default'](nodeIndex > -1);

      if (nodePositions.length > 0 && nodeIndex >= 0 && nodeIndex < nodePositions.length) {
        atIndex = nodePositions[nodeIndex] + 1;
      }

      var points = [node];
      if (this.length === 0 && this.fill) {
        points.push(node);
      } else if (this.fill && atIndex === this.length) {
        atIndex--;
      }

      this._addPoints({
        atIndex: atIndex,
        points: points
      });
    }
  }, {
    key: 'removeNode',
    value: function removeNode(node) {
      _assert2['default'](node instanceof Node);

      var indexOnPath = this.indexOf(node),
          index = this.nodePositions().indexOf(indexOnPath);

      return this.removeNodeAtIndex(index);
    }
  }, {
    key: 'removeNodeAtIndex',
    value: function removeNodeAtIndex(index) {
      var _nodeIndicesAroundNodeIndex2 = this._nodeIndicesAroundNodeIndex(index);

      var start = _nodeIndicesAroundNodeIndex2.start;
      var end = _nodeIndicesAroundNodeIndex2.end;
      var hasFirst = _nodeIndicesAroundNodeIndex2.hasFirst;
      var hasLast = _nodeIndicesAroundNodeIndex2.hasLast;

      if (!hasFirst && (!this.fill || this.length > 2)) {
        start++;
      }

      if (hasLast || this.fill && this.length <= 2) {
        end++;
      }

      var removedPoints = this._removePoints({ start: start, end: end });

      return removedPoints;
    }
  }, {
    key: '_removePoints',
    value: function _removePoints(_ref2) {
      var start = _ref2.start;
      var end = _ref2.end;

      _assert2['default'](start >= 0);
      _assert2['default'](end <= this.length);
      _assert2['default'](start <= end || this.fill);

      var removeLength = 0,
          removedPoints = [];

      if (this.fill && start > end) {
        // assert( start < this.length - 1 );

        // removeLength = this.length - start - 1;
        removeLength = this.length - start;

        _assert2['default'](removeLength >= 0);

        removedPoints.push.apply(removedPoints, _toConsumableArray(this.splice(start, removeLength)));

        // Remove last point
        // @Why: This point is also the first point of
        //       the next operation. Removing the last point now
        //       prevents duplicates.
        removedPoints.pop();

        this.push(this.atIndex(end));

        start = 0;
      }

      removeLength = end - start;
      removedPoints.push.apply(removedPoints, _toConsumableArray(this.splice(start, removeLength)));

      _assert2['default'](this.isValid(), 'Invalid path operation');

      if (removedPoints.length === 2 && removedPoints[0] === removedPoints[1]) {
        removedPoints.pop();
      }

      _emit.emit(Drawing.event.POINTS_REMOVED, {
        start: start,
        end: end,
        removedPoints: removedPoints,
        context: this
      });

      return removedPoints;
    }
  }, {
    key: '_addPoints',
    value: function _addPoints(_ref3) {
      var atIndex = _ref3.atIndex;
      var points = _ref3.points;

      _assert2['default'](atIndex >= 0 && atIndex <= this.length, 'Out of bounds');
      _assert2['default'](Array.isArray(points), 'points must be an Array');

      this.splice.apply(this, [atIndex, 0].concat(_toConsumableArray(points)));

      // if ( this.fill && atIndex === 0 ) {
      //   if ( this.length === 1 && this.atIndex( 0 ) instanceof Node ) {
      //     this.push( this.atIndex( 0 ) );
      //   } else if ( this.length > 1 ) {
      //     this.removePoints({
      //       start: this.length - 1,
      //       end: this.length
      //     });
      //     this.push( this.atIndex( 0 ) );
      //   }
      // }

      _assert2['default'](this.isValid(), 'Invalid path operation');

      _emit.emit(Drawing.event.POINTS_ADDED, {
        atIndex: atIndex,
        addedPoints: points,
        context: this
      });
    }
  }, {
    key: 'pointAtIndex',
    value: function pointAtIndex(index) {
      return this.atIndex(index);
    }
  }, {
    key: 'nodePositions',
    value: function nodePositions() {
      var points = this,
          positions = [];

      for (var i = 0; i < points.length; i++) {
        var point = points.atIndex(i);

        if (point instanceof Node) {
          positions.push(i);
        }
      }

      return positions;
    }
  }, {
    key: 'points',
    value: function points() {
      return this.filter(function () {
        return true;
      });
    }
  }, {
    key: 'nodes',
    value: (function (_nodes) {
      function nodes() {
        return _nodes.apply(this, arguments);
      }

      nodes.toString = function () {
        return _nodes.toString();
      };

      return nodes;
    })(function () {
      var nodes = this.filter(function (point) {
        return point instanceof Node;
      });
      if (this.fill) {
        nodes.pop();
      }

      return nodes;
    })
  }]);

  return Drawing;
})(Path);

Drawing.event = {
  COLOR_CHANGED: 'Drawing.colorChanged',
  FILL_CHANGED: 'Drawing.fillChanged',
  RIGID_CHANGED: 'Drawing.rigidChanged',
  POINTS_ADDED: 'Drawing.pointsAdded',
  POINTS_REMOVED: 'Drawing.pointsRemoved'
};

var Territory = (function () {
  function Territory() {
    _classCallCheck(this, Territory);

    this._drawings = [];
    this._activeDrawingIndex = -1;
  }

  _createClass(Territory, [{
    key: 'length',
    get: function () {
      return this._drawings.length;
    }
  }, {
    key: 'find',
    value: function find(cb) {
      return this._drawings.find(cb);
    }
  }, {
    key: 'atIndex',
    value: function atIndex(index) {
      _assert2['default'](Number.isInteger(index));
      _assert2['default'](index >= 0 && index < this._drawings.length);

      return this._drawings[index];
    }
  }, {
    key: 'addDrawing',
    value: function addDrawing(_ref4) {
      var atIndex = _ref4.atIndex;
      var drawing = _ref4.drawing;

      _assert2['default'](Number.isInteger(atIndex));
      _assert2['default'](drawing instanceof Drawing);

      _emit.emit(Territory.event.DRAWING_ADDED, {
        atIndex: atIndex,
        drawing: drawing,
        context: this
      });

      return this._drawings.splice(atIndex, 0, drawing);
    }
  }, {
    key: 'removeDrawing',
    value: function removeDrawing(drawing) {
      _assert2['default'](drawing instanceof Drawing);

      var index = this._drawings.indexOf(drawing);
      _assert2['default'](index > -1, 'Drawing not found');

      return this.removeDrawingAtIndex(index);
    }
  }, {
    key: 'removeDrawingAtIndex',
    value: function removeDrawingAtIndex(index) {
      _assert2['default'](index >= 0 && index < this._drawings.length, 'Out of bounds');

      var removedDrawing = this._drawings.splice(index, 1)[0],
          nodes = removedDrawing.nodes();

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          removedDrawing.removeNode(node);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      _emit.emit(Territory.event.DRAWING_REMOVED, {
        atIndex: index,
        drawing: removedDrawing,
        context: this
      });

      return removedDrawing;
    }
  }, {
    key: 'toGeoJson',
    value: function toGeoJson() {
      var geoJson = {
        type: 'FeatureCollection'
      };

      geoJson.features = this._drawings.map(function (drawing) {
        var feature = {
          type: 'Feature'
        };

        var coordinates = drawing._points.map(function (point) {
          var x = point.x;
          var y = point.y;

          return [x, y];
        });

        feature.geometry = {
          type: drawing.fill ? 'Polygon' : 'LineString',
          coordinates: drawing.fill ? [coordinates] : coordinates
        };

        var color = drawing.color;
        var rigid = drawing.rigid;
        var fill = drawing.fill;

        feature.properties = { color: color, rigid: rigid, fill: fill };
        feature.properties.nodePositions = drawing.nodePositions();

        return feature;
      });

      return geoJson;
    }
  }], [{
    key: 'fromGeoJson',
    value: function fromGeoJson(geoJson) {
      _assert2['default'](typeof geoJson === 'object');
      var drawings = new Territory();

      _assert2['default'](Array.isArray(geoJson.features));
      geoJson.features.forEach(function (feature, i) {
        _assert2['default'](typeof feature.properties === 'object');
        _assert2['default'](typeof feature.geometry === 'object');

        var _feature$properties = feature.properties;
        var color = _feature$properties.color;
        var rigid = _feature$properties.rigid;
        var fill = _feature$properties.fill;
        var nodePositions = _feature$properties.nodePositions;

        _assert2['default'](typeof color === 'string');
        _assert2['default'](typeof rigid === 'boolean');
        _assert2['default'](typeof fill === 'boolean');
        _assert2['default'](Array.isArray(nodePositions));

        var drawing = new Drawing({ color: color, rigid: rigid, fill: fill });

        drawings.addDrawings({
          atIndex: -1,
          drawing: drawing
        });

        var coordinates = undefined;
        if (fill) {
          coordinates = feature.geometry.coordinates[0];
        } else {
          coordinates = feature.geometry.coordinates;
        }
        _assert2['default'](Array.isArray(coordinates));

        var points = coordinates.map(function (coordinate, i) {
          var _coordinate = _slicedToArray(coordinate, 2);

          var x = _coordinate[0];
          var y = _coordinate[1];

          if (nodePositions.indexOf(i) === -1) {
            return new Point(x, y);
          } else {
            return new Node(x, y);
          }
        });

        drawing.addPoints({
          atIndex: 0,
          points: points
        });

        return drawing;
      });

      return drawings;
    }
  }]);

  return Territory;
})();

Territory.event = {
  DRAWING_ADDED: 'Territory.drawingAdded',
  DRAWING_REMOVED: 'Territory.drawingRemoved'
};

exports.Point = Point;
exports.Node = Node;
exports.Drawing = Drawing;
exports.Territory = Territory;