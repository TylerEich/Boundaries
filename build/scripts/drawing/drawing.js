"use strict";
'use strict';
angular.module('bndry.drawing', ['ngStorage', 'bndry.map', 'bndry.color', 'bndry.history']).service('DirectionsSvc', function($q, MapSvc) {
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
  function saveDrawings() {
    var storableDrawings = [];
    for (var i = 0; i < self.drawings.length; i++) {
      var drawing = self.drawings[i];
      var storableDrawing = {};
      for (var key in drawing) {
        if (key === '_poly') {
          storableDrawing.path = MapSvc.geometry.encoding.encodePath(drawing._poly.getPath());
        } else if (key === 'nodes') {
          var storableNodes = [];
          for (var j = 0; j < drawing.nodes.length; j++) {
            var node = drawing.nodes[j];
            var storableNode = {};
            for (var nodeKey in node) {
              if (key[0] !== '_' && key[0] !== '$' && node.hasOwnProperty(nodeKey)) {
                storableNode[nodeKey] = node[nodeKey];
              }
            }
            storableNodes[i] = storableNode;
          }
        } else if (drawing.hasOwnProperty(key)) {
          storableDrawing[key] = drawing[key];
        }
      }
      storableDrawings[i] = storableDrawing;
    }
    $localStorage.drawings = storableDrawings;
  }
  self.loadDrawings = function() {
    var storedDrawings = $localStorage.drawings || {};
    for (var i = 0; i < storedDrawings.length; i++) {
      var storedDrawing = storedDrawings[i];
      var path = MapSvc.geometry.encoding.decodePath(storedDrawing.path);
      var drawing = self.makeDrawing(storedDrawing.colorIndex, storedDrawing.rigid, storedDrawing.fill, path);
      for (var j = 0; j < storedDrawing.nodes.length; j++) {
        var storedNode = storedDrawing[j];
        var latLng = new MapSvc.LatLng(storedNode.lat, storedNode.lng);
        var node = self.makeNode(storedDrawing.colorIndex, latLng);
        drawing.nodes.push(node);
      }
      self.drawings.push(drawing);
    }
  };
  function rgbaColorToString(rgba) {
    return ("rgba(" + rgba.r * 100 + "%," + rgba.g * 100 + "%," + rgba.b * 100 + "%," + rgba.a + ")");
  }
  function shiftNodeIndices(drawingIndex, nodeIndex, shift) {
    var drawing = self.drawings[drawingIndex];
    for (var i = nodeIndex; i < drawing.nodes.length; i++) {
      var node = drawing.nodes[i];
      node.index += shift;
    }
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
    var args = [index, removeLength];
    if (path) {
      args = args.concat(path);
    }
    return Array.prototype.splice.apply(originalPath, args);
  };
  self.makeNode = function(colorIndex, latLng, index) {
    var color = $localStorage.colors[colorIndex];
    var marker = new MapSvc.Marker(makeMarkerOptions(color, latLng));
    return {
      lat: latLng.lat(),
      lng: latLng.lng(),
      index: null,
      _marker: marker
    };
  };
  self.spliceNode = function(drawingIndex, nodeIndex, removeLength, newNode, cachedPath) {
    if (removeLength === undefined) {
      removeLength = self.drawings[drawingIndex].nodes.length;
    }
    var drawing = self.drawings[drawingIndex];
    var args = [nodeIndex, removeLength];
    if (newNode) {
      newNode._marker.setMap(MapSvc.map);
      args = args.concat(newNode);
    }
    var removed = Array.prototype.splice.apply(drawing.nodes, args);
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
    var poly = drawing._poly,
        path = poly.getPath().getArray();
    if (removed.length > 0) {
      var removeStart = (nodeBefore ? nodeBefore.index : -1) + 1,
          removeEnd = (nodeAfter ? nodeAfter.index : removed[removed.length - 1].index + 1),
          pathRemoveLength = removeEnd - removeStart;
      self.splicePath(path, removeStart, pathRemoveLength);
      poly.setPath(path);
      if (nodeAtIndex) {
        nodeAtIndex.index = nodeBefore ? nodeBefore.index : 0;
      }
      shiftNodeIndices(drawingIndex, nodeIndex + 1, -pathRemoveLength);
      for (var i = 0; i < removed.length; i++) {
        removed[i]._marker.setMap(null);
      }
    }
    if (cachedPath) {
      var poly = drawing._poly,
          path = poly.getPath().getArray();
      self.splicePath(path, removedPath);
    }
    saveDrawings();
    var promises = [],
        promise;
    var nodeAtIndexLocation,
        nodeBeforeLocation,
        nodeAfterLocation;
    if (nodeAtIndex) {
      nodeAtIndexLocation = new MapSvc.LatLng(nodeAtIndex.lat, nodeAtIndex.lng);
    } else {
      return;
    }
    if (nodeBefore) {
      nodeBeforeLocation = new MapSvc.LatLng(nodeBefore.lat, nodeBefore.lng);
      promise = self.makePath([nodeBeforeLocation, nodeAtIndexLocation], drawing.rigid).then(function(path) {
        nodeAtIndex.index = nodeBefore.index;
        return path;
      });
      promises.push(promise);
    }
    if (nodeAfter) {
      nodeAfterLocation = new MapSvc.LatLng(nodeAfter.lat, nodeAfter.lng);
      promises.push(self.makePath([nodeAtIndexLocation, nodeAfterLocation], drawing.rigid));
    }
    if (!nodeBefore && !nodeAfter) {
      promises.push(self.makePath([nodeAtIndexLocation, nodeAtIndexLocation], drawing.rigid));
    }
    $q.all(promises).then(function(pathResults) {
      var newPath,
          newPathBefore,
          newPathAfter,
          polyPath = drawing._poly.getPath().getArray(),
          spliceIndex = 0,
          nodeAtIndexMarkerPosition;
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
    var removed = self.drawings.slice(drawingIndex, drawingIndex + removeLength);
    for (var i in removed) {
      removed[i]._poly.setMap(null);
      self.spliceNode(i, 0);
    }
    var args = [drawingIndex, removeLength];
    if (newDrawing) {
      args.push(newDrawing);
    }
    Array.prototype.splice.apply(self.drawings, args);
  };
  self.drawings = [];
}).controller('DrawingCtrl', function($scope, $localStorage, DrawingSvc, HistorySvc) {
  $scope.$storage = $localStorage.$default({
    drawings: [],
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
    var createNewDrawing = automaticNewDrawing();
    if (createNewDrawing) {
      var newDrawing = DrawingSvc.makeDrawing(colorIndex, rigid, fill);
      DrawingSvc.spliceDrawing(DrawingSvc.drawings.length, 0, newDrawing);
    }
    var lastDrawingIndex = DrawingSvc.drawings.length - 1;
    var newNodeIndex = DrawingSvc.drawings[lastDrawingIndex].nodes.length;
    var newNode = DrawingSvc.makeNode(colorIndex, param.latLng);
    DrawingSvc.spliceNode(lastDrawingIndex, newNodeIndex, 0, newNode);
    HistorySvc.add({
      undo: function(drawingIndex, nodeIndex, createNewDrawing) {
        DrawingSvc.spliceNode(drawingIndex, nodeIndex, 1);
        if (createNewDrawing) {
          DrawingSvc.spliceDrawing(drawingIndex, 1);
        }
      }.bind(null, lastDrawingIndex, newNodeIndex, createNewDrawing),
      redo: function(drawingIndex, nodeIndex, newNode) {
        DrawingSvc.spliceNode(drawingIndex, nodeIndex, 0, newNode);
      }.bind(null, lastDrawingIndex, newNodeIndex, newNode)
    });
  }
  function changeNode($params, drawingIndex, nodeIndex) {
    var event = $params[0];
    var colorIndex = DrawingSvc.drawings[drawingIndex].colorIndex;
    var originalNode = DrawingSvc.drawings[drawingIndex].nodes[nodeIndex];
    var newNode = DrawingSvc.makeNode(colorIndex, event.latLng);
    DrawingSvc.spliceNode(drawingIndex, nodeIndex, 1, newNode);
    HistorySvc.add({
      undo: function(drawingIndex, nodeIndex, originalNode) {
        DrawingSvc.spliceNode(drawingIndex, nodeIndex, 1, originalNode);
      }.bind(null, drawingIndex, nodeIndex, originalNode),
      redo: function(drawingIndex, nodeIndex, newNode) {
        DrawingSvc.spliceNode(drawingIndex, nodeIndex, 1, newNode);
      }.bind(null, drawingIndex, nodeIndex, newNode)
    });
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
    dragend: changeNode
  };
  $scope.poly = {click: function($params) {}};
});
