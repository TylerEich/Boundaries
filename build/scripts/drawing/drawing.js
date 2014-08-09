"use strict";
'use strict';
angular.module('boundaries.drawing', ['ngStorage', 'boundaries.map', 'boundaries.color']).service('DirectionsSvc', function($q, MapSvc) {
  var self = this;
  var directions = new MapSvc.DirectionsService();
  self.route = function(locations) {
    if (locations.length !== 2) {
      console.error('Requires exactly 2 locations.');
      return false;
    }
    var request = {
      origin: locations[0],
      destination: locations[1],
      travelMode: MapSvc.TravelMode.DRIVING
    };
    var deferred = $q.defer();
    function processRequest(tries) {
      directions.route(request, function(result, status) {
        if (status === MapSvc.DirectionsStatus.OK) {
          var overviewPath = result.routes[0].overview_path;
          deferred.resolve(overviewPath);
        } else if (status === MapSvc.DirectionsStatus.UNKNOWN_ERROR && tries < 3) {
          tries++;
          processRequest(tries);
        } else {
          deferred.reject();
        }
      }, function() {
        if (tries < 3) {
          tries++;
          processRequest(tries);
        } else {
          deferred.reject();
        }
      });
    }
    processRequest(0);
    return deferred.promise;
  };
}).service('DrawingSvc', function($rootScope, $q, $localStorage, DirectionsSvc, MapSvc, ColorSvc) {
  var self = this;
  function rgbaColorToString(rgba) {
    return ("rgba(" + rgba.r * 100 + "%," + rgba.g * 100 + "%," + rgba.b * 100 + "%," + rgba.a + ")");
  }
  function makeIcon(color) {
    return {
      path: MapSvc.SymbolPath.CIRCLE,
      scale: 10,
      strokeColor: '#' + ColorSvc.convert.rgba(color).to.hex24(),
      strokeOpacity: 1,
      strokeWeight: 2.5
    };
  }
  function makeMarkerOptions(color, latLng) {
    return {
      clickable: true,
      crossOnDrag: false,
      cursor: 'pointer',
      draggable: true,
      flat: true,
      icon: makeIcon(color),
      map: MapSvc.map,
      position: latLng
    };
  }
  function makePolyOptions(color, fill) {
    var value = {
      clickable: true,
      draggable: false,
      editable: false,
      map: MapSvc.map
    };
    if (fill) {
      value.fillColor = rgbaColorToString(color);
      value.strokeWeight = 0;
    } else {
      value.strokeColor = rgbaColorToString(color);
      value.strokeWeight = color.weight;
    }
    return value;
  }
  self.makePath = function(locations, rigid) {
    var deferred = $q.defer();
    if (rigid) {
      deferred.resolve(locations);
    } else {
      DirectionsSvc.route(locations).then(deferred.resolve);
    }
    return deferred.promise;
  };
  self.splicePath = function(originalPath, index, removeLength, path) {
    var args = [index, removeLength].concat(path);
    Array.prototype.splice.apply(originalPath, args);
  };
  self.makeNode = function(colorIndex, latLng) {
    var color = $localStorage.colors[colorIndex];
    var marker = new MapSvc.Marker(makeMarkerOptions(color, latLng));
    return {
      lat: latLng.lat(),
      lng: latLng.lng(),
      index: null,
      _marker: marker
    };
  };
  self.spliceNode = function(drawingIndex, nodeIndex, removeLength, newNode) {
    if (removeLength === undefined) {
      removeLength = self.drawings[drawingIndex].nodes.length;
    }
    var drawing = self.drawings[drawingIndex];
    var nodeBefore,
        nodeAtIndex,
        nodeAfter;
    nodeAtIndex = drawing.nodes[nodeIndex];
    if (nodeIndex >= 1 && nodeIndex - 1 < drawing.nodes.length) {
      nodeBefore = drawing.nodes[nodeIndex - 1];
    }
    if (nodeIndex >= 0 && nodeIndex + 1 < drawing.nodes.length) {
      nodeAfter = drawing.nodes[nodeIndex + 1];
    }
    var removed = drawing.nodes.splice(nodeIndex, removeLength, newNode);
    for (var i in removed) {
      removed[i]._marker.setMap(null);
    }
    if (!newNode) {
      return;
    }
    var promises = [],
        promise;
    var newNodeLocation = new MapSvc.LatLng(newNode.lat, newNode.lng);
    var nodeBeforeLocation,
        nodeAfterLocation;
    if (nodeBefore) {
      nodeBeforeLocation = new MapSvc.LatLng(nodeBefore.lat, nodeBefore.lng);
      promise = self.makePath([nodeBeforeLocation, newNodeLocation], drawing.rigid).then(function(path) {
        newNode.index = nodeBefore.index + path.length;
        return path;
      });
      promises.push(promise);
    }
    if (nodeAfter) {
      nodeAfterLocation = new MapSvc.LatLng(nodeAfter.lat, nodeAfter.lng);
      promises.push(self.makePath([newNodeLocation, nodeAfterLocation], drawing.rigid));
    }
    if (!nodeBefore && !nodeAfter) {
      promises.push(self.makePath([newNodeLocation, newNodeLocation], drawing.rigid));
    }
    $q.all(promises).then(function(paths) {
      var newPath = Array.prototype.concat.apply([], paths);
      var path = drawing._poly.getPath().getArray();
      var spliceIndex = 0;
      var newNodeMarkerPosition;
      var pathRemoveLength = 1;
      if (nodeBefore) {
        var pathBefore = paths.shift();
        newNode.index = nodeBefore.index + pathBefore.length;
        if (nodeAtIndex) {
          pathRemoveLength += nodeAtIndex.index - nodeBefore.index;
        }
        spliceIndex = nodeBefore.index;
        newNodeMarkerPosition = pathBefore[pathBefore.length - 1];
      } else {
        newNode.index = 0;
      }
      if (nodeAfter) {
        var pathAfter = paths[0];
        if (nodeAtIndex) {
          pathRemoveLength += nodeAfter.index - nodeAtIndex.index;
        }
        nodeAfter.index = newNode.index + pathAfter.length;
        newNodeMarkerPosition = pathAfter[0];
      }
      if (!nodeBefore && !nodeAfter) {
        newNodeMarkerPosition = paths[0][0];
      }
      self.splicePath(path, spliceIndex, pathRemoveLength, newPath);
      newNode._marker.setPosition(newNodeMarkerPosition);
      drawing._poly.setPath(path);
    });
  };
  self.makeDrawing = function(colorIndex, rigid, fill) {
    var poly;
    var color = $localStorage.colors[colorIndex];
    if (fill) {
      poly = new MapSvc.Polygon(makePolyOptions(color, fill));
    } else {
      poly = new MapSvc.Polyline(makePolyOptions(color, fill));
    }
    return {
      colorIndex: colorIndex,
      rigid: rigid,
      fill: fill,
      _poly: poly,
      nodes: []
    };
  };
  self.spliceDrawing = function(drawingIndex, removeLength, newDrawing) {
    if (removeLength === undefined) {
      removeLength = self.drawings.length;
    }
    console.log(removeLength, newDrawing);
    var removed = self.drawings.slice(drawingIndex, drawingIndex + removeLength);
    for (var i in removed) {
      removed[i]._poly.setMap(null);
      self.spliceNode(i, 0);
    }
    Array.prototype.splice.apply(self.drawings, arguments);
  };
  self.drawings = [];
}).controller('DrawingCtrl', function($scope, $localStorage, DrawingSvc) {
  $scope.$storage = $localStorage.$default({
    rigid: false,
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
  function addNode(event, param) {
    var colorIndex = $scope.$storage.activeColor;
    var rigid = false,
        fill = false;
    if (automaticNewDrawing()) {
      var newDrawing = DrawingSvc.makeDrawing(colorIndex, rigid, fill);
      DrawingSvc.spliceDrawing(DrawingSvc.drawings.length, 0, newDrawing);
    }
    var lastDrawingIndex = DrawingSvc.drawings.length - 1;
    var newNodeIndex = DrawingSvc.drawings[lastDrawingIndex].nodes.length;
    DrawingSvc.spliceNode(lastDrawingIndex, newNodeIndex, 0, DrawingSvc.makeNode(colorIndex, param.latLng));
  }
  function automaticNewDrawing() {
    if (DrawingSvc.drawings.length === 0) {
      return true;
    }
    var latestDrawing = DrawingSvc.drawings[DrawingSvc.drawings.length - 1];
    return (latestDrawing && latestDrawing.colorIndex !== $scope.$storage.activeColor);
  }
  $scope.drawings = DrawingSvc.drawings;
  $scope.$on('map:click', addNode);
  $scope.$on('action:clear', function($params) {
    DrawingSvc.spliceDrawing(0);
  });
  $scope.marker = {
    click: function($params) {
      addNode(undefined, $params[0]);
    },
    dragend: function($params, drawingIndex, nodeIndex) {
      var event = $params[0];
      var colorIndex = DrawingSvc.drawings[drawingIndex].colorIndex;
      var newNode = DrawingSvc.makeNode(colorIndex, event.latLng);
      DrawingSvc.spliceNode(drawingIndex, nodeIndex, 1, newNode);
    }
  };
  $scope.poly = {click: function($params) {}.deb()};
});
