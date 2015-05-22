System.register('src/modules/google-map', ['src/modules/shape-class'], function (_export) {
  /* global google */

  'use strict';

  var ShapeStore, Shape, map, renderedShapes, shapeStore, newShape;

  function randomInterpolate(pointA, pointB) {
    var length = Math.round(Math.random() * 10 + 5);
    var randomPath = [];
    var xInterval = (pointB.x - pointA.x) / length;
    var yInterval = (pointB.y - pointA.y) / length;
    var x = pointA.x;
    var y = pointA.y;

    for (; length > 0; length--) {
      randomPath.push({
        x: x + xInterval * Math.random(),
        y: y + yInterval * Math.random()
      });

      x += xInterval;
      y += yInterval;
    }

    return Promise.resolve(randomPath);
  }

  function renderOnMap(path, shape) {
    var features = map.data.addGeoJson(shape.toFeature());

    if (renderedShapes.has(shape)) {
      var oldFeatures = renderedShapes.get(shape);
      oldFeatures.forEach(function (feature) {
        return map.data.remove(feature);
      });
    }

    renderedShapes.set(shape, features);
  }

  function unrenderOnMap(shape) {
    if (renderedShapes.has(shape)) {
      var oldFeatures = renderedShapes.get(shape);
      oldFeatures.forEach(function (feature) {
        return map.data.remove(feature);
      });
    }
  }

  return {
    setters: [function (_srcModulesShapeClass) {
      ShapeStore = _srcModulesShapeClass.ShapeStore;
      Shape = _srcModulesShapeClass.Shape;
    }],
    execute: function () {
      map = new google.maps.Map(document.querySelector('#map_canvas'), {
        center: { lat: 43, lng: -85 },
        zoom: 15
      });
      renderedShapes = new Map();

      map.data.setStyle(function (feature) {
        var color = feature.getProperty('color');
        var fill = feature.getProperty('fill');

        if (fill) {
          return {
            fillColor: color,
            fillOpacity: 0.25,
            strokeWeight: 0
          };
        } else {
          return {
            strokeColor: color,
            strokeOpacity: 0.5,
            strokeWeight: 5
          };
        }
      });shapeStore = new ShapeStore();

      shapeStore.on('add', function (shape) {
        console.log('Shape added');
        shape.addListeners({
          'add': renderOnMap,
          'delete': renderOnMap
        });
      });

      shapeStore.on('delete', function (shape) {
        shape.removeListeners({
          'add': renderOnMap,
          'delete': renderOnMap
        });

        unrenderOnMap(shape);
      });

      newShape = new Shape('#ff0000', false, true);

      shapeStore.addShape(newShape);

      map.addListener('click', function callee$0$0(mouseEvent) {
        var x, y, lastPoint, randomPath;
        return regeneratorRuntime.async(function callee$0$0$(context$1$0) {
          while (1) switch (context$1$0.prev = context$1$0.next) {
            case 0:
              x = mouseEvent.latLng.lng();
              y = mouseEvent.latLng.lat();
              lastPoint = newShape.path[newShape.path.length - 1];

              if (newShape.path.length) {
                context$1$0.next = 7;
                break;
              }

              newShape.addPath([{ x: x, y: y }]);
              context$1$0.next = 11;
              break;

            case 7:
              context$1$0.next = 9;
              return randomInterpolate(lastPoint, { x: x, y: y });

            case 9:
              randomPath = context$1$0.sent;

              newShape.addPath(randomPath);

            case 11:
            case 'end':
              return context$1$0.stop();
          }
        }, null, this);
      });

      window.changeShape = function (prop, value) {
        shapeStore.deleteShape(newShape);

        var color = newShape.color;
        var fill = newShape.fill;
        var rigid = newShape.rigid;
        var path = newShape.path;

        switch (prop) {
          case 'color':
            color = value;
            break;
          case 'fill':
            fill = value;
            break;
          case 'rigid':
            rigid = value;
            break;
        }

        newShape = new Shape(color, fill, rigid);
        newShape.addPath(path);

        shapeStore.addShape(newShape);
        renderOnMap(null, newShape);
      };

      window.toggleFill = function () {
        var fill = !newShape.fill;

        window.changeShape('fill', fill);
      };
    }
  };
});