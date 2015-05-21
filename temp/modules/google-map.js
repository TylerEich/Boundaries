System.register('src/modules/google-map', ['src/modules/shape-class'], function (_export) {
  /* global google */

  'use strict';

  var ShapeStore, Shape, map, renderedShapes, shapeStore, newShape;

  function renderOnMap(path, shape) {
    console.log(arguments);
    var features = map.data.addGeoJson(shape.toFeature());

    if (renderedShapes.has(shape)) {
      var oldFeatures = renderedShapes.get(shape);
      oldFeatures.forEach(function (feature) {
        return map.data.remove(feature);
      });
    }

    renderedShapes.set(shape, features);
  }

  return {
    setters: [function (_srcModulesShapeClass) {
      ShapeStore = _srcModulesShapeClass.ShapeStore;
      Shape = _srcModulesShapeClass.Shape;
    }],
    execute: function () {
      map = new google.maps.Map(document.querySelector('#map_canvas'), {
        center: { lat: 43, lng: -85 },
        zoom: 17
      });
      renderedShapes = new Map();

      map.data.setStyle(function (feature) {
        var color = feature.getProperty('color');
        return {
          strokeColor: color,
          strokeOpacity: 0.5,
          strokeWeight: 5
        };
      });shapeStore = new ShapeStore();

      shapeStore.on('add', function (shape) {
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
      });

      newShape = new Shape('#ff0000', false, true);

      shapeStore.addShape(newShape);

      map.addListener('click', function (mouseEvent) {
        var x = mouseEvent.latLng.lng();
        var y = mouseEvent.latLng.lat();

        newShape.addPath([{ x: x, y: y }]);
      });
    }
  };
});