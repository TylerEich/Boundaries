"use strict";
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
  function splice(itemArray) {
    var index = arguments[1] !== (void 0) ? arguments[1] : 0;
    var removeLength = arguments[2] !== (void 0) ? arguments[2] : 0;
    var newItems = arguments[3] !== (void 0) ? arguments[3] : [];
    var args = [index, removeLength].concat(newItems);
    return Array.prototype.splice.apply(itemArray, args);
  }
  function splicePassThru(itemArray) {
    var args = [itemArray].concat(arguments);
    splice.apply(null, args);
    return itemArray;
  }
  function change(object, changes) {
    for (var key in changes) {
      if (changes.hasOwnProperty(key)) {
        object[key] = changes[key];
      }
    }
  }
  function makePoint(latLng) {
    console.assert('lat' in latLng && 'lng' in latLng && typeof latLng.lat === 'number' && typeof latLng.lat === 'number', 'latLng is not formatted properly');
    return new MapSvc.LatLng(latLng.lat, latLng.lng);
  }
  function makePaths(locations) {
    var rigid = arguments[1] !== (void 0) ? arguments[1] : false;
    console.assert(Array.isArray(locations), 'locations is not an Array');
    var promises = [];
    for (var i = 0; i < locations.length - 1; i++) {
      var start = locations[i],
          end = locations[i + 1],
          promise;
      if (rigid) {
        promise = start.equals(end) ? $q.when([start]) : $q.when([start, end]);
      } else {
        promise = DirectionsSvc.route([start, end]);
      }
      promises.push(promise);
    }
    return $q.all(promises);
  }
  function addPoints(path, index, points) {
    return splice(path, index, 0, points);
  }
  function removePoints(path, index, removeLength) {
    return splice(path, index, removeLength);
  }
  function arrayify(nodes) {
    if (!Array.isArray(nodes)) {
      return [nodes];
    } else {
      return nodes;
    }
  }
  function addNodes(nodes, index, nodesToAdd) {
    splice(nodes, index, 0, nodesToAdd);
  }
  var addNode = addNodes;
  function removeNodes(nodes, index) {
    var removeLength = arguments[2] !== (void 0) ? arguments[2] : 1;
    var removed = splice(nodes, index, removeLength);
    for (var i = 0; i < removed.length; i++) {
      removed[i]._marker.setMap(null);
    }
  }
  var removeNode = removeNodes;
  function changeNode(node, changes) {
    console.assert(typeof node === 'object' && typeof changes === 'object', 'Invalid parameters');
    change(node, changes);
    for (var key in changes) {
      switch (key) {
        case 'lat':
        case 'lng':
          node._marker.setPosition(makePoint(node));
          break;
      }
    }
  }
  function duplicateNode(drawing, node) {
    return makeNode(drawing.colorIndex, makePoint(node), node.index);
  }
  function shiftIndexOfNodes(nodes, index, shifts) {
    var nodeArray = arrayify(nodes),
        shift = 0,
        i = 0;
    if (Array.isArray(shifts)) {
      for (i = 0; (i + index) < nodeArray.length && i < shifts.length; i++) {
        nodeArray[index + i].index += shifts[i];
        shift += shifts[i];
      }
    }
    for (i += index; i < nodeArray.length; i++) {
      nodeArray[i].index += shift;
    }
  }
  function setIndexOfNodes(nodes, index, value) {
    var nodeArray = arrayify(nodes);
    for (var i = index; i < nodeArray.length; i++) {
      nodeArray[i].index = value;
    }
  }
  function setInitialIndexOfNodes(nodes, index, nodesToAdd) {
    var nodeBefore = nodes[index - 1],
        indexForNode = 0;
    if (nodeBefore) {
      indexForNode = nodeBefore.index;
    }
    setIndexOfNodes(nodesToAdd, 0, indexForNode);
  }
  function rangeOfPathAroundNodes(nodes, start, end) {
    var range = {
      start: null,
      end: null,
      length: null,
      affectedNodeIndex: null,
      lastNode: false,
      firstNode: false
    };
    var nodeBeforeStart = nodes[start - 1],
        nodeAtStart = nodes[start],
        nodeAtEnd = nodes[end],
        nodeAfterEnd = nodes[end + 1];
    if (!nodeBeforeStart) {
      range.firstNode = true;
    }
    if (nodeBeforeStart && nodeBeforeStart.index !== null) {
      range.start = nodeBeforeStart.index;
      range.affectedNodeIndex = start;
    } else if (nodeAtStart && nodeAtStart.index !== null) {
      range.start = nodeAtStart.index;
      range.affectedNodeIndex = start + 1;
    } else {
      range.start = 0;
    }
    if (!nodeAfterEnd) {
      range.lastNode = true;
    }
    if (nodeAtEnd && nodeAtEnd.index !== null) {
      if (!nodeAfterEnd) {
        range.end = nodeAtEnd.index + 1;
      } else if (nodeAfterEnd.index !== null) {
        range.end = nodeAfterEnd.index;
      }
    } else {
      range.end = range.start + 1;
    }
    range.length = range.end - range.start;
    return range;
  }
  function rangeOfPathAroundNode(nodes, index) {
    return rangeOfPathAroundNodes(nodes, index, index);
  }
  function makePathsAroundNodes(nodes, start, end, rigid) {
    var points = [],
        nodeBefore = nodes[start - 1],
        nodeAfter = nodes[end];
    if (nodeBefore) {
      points.push(makePoint(nodeBefore));
    }
    for (var i = start; i < end; i++) {
      points.push(makePoint(nodes[i]));
    }
    if (nodeAfter) {
      points.push(makePoint(nodeAfter));
    }
    if (points.length < 2) {
      points.push(points[0]);
    }
    return makePaths(points, rigid);
  }
  function makePathsAroundNode(nodes, index, rigid) {
    return makePathsAroundNodes(nodes, index, index, rigid);
  }
  function alignNodesWithPath(path, nodes) {
    var latLng;
    for (var $__0 = nodes[Symbol.iterator](),
        $__1; !($__1 = $__0.next()).done; ) {
      var node = $__1.value;
      {
        latLng = path[node.index];
        console.assert(latLng, 'latLng is not defined');
        changeNode(node, {
          lat: latLng.lat(),
          lng: latLng.lng()
        });
      }
    }
  }
  function processPaths(paths) {}
  function removeNodesAndTheirPathsFromDrawing(drawing, index, nodeRemoveLength) {
    var range = rangeOfPathAroundNodes(drawing.nodes, index, index + nodeRemoveLength);
    if (nodeRemoveLength === 0 && range.firstNode && !range.lastNode) {
      return;
    }
    var path = drawing._poly.getPath().getArray(),
        range = rangeOfPathAroundNodes(drawing.nodes, index, index + nodeRemoveLength);
    removePoints(path, range.start, range.length);
    shiftIndexOfNodes(drawing.nodes, range.affectedNodeIndex, -range.length);
    removeNodes(drawing.nodes, index, nodeRemoveLength);
    drawing._poly.setPath(path);
  }
  function addNodesAndTheirPathsToDrawing(drawing, index, newNodes) {
    var newPaths = arguments[3] !== (void 0) ? arguments[3] : null;
    setInitialIndexOfNodes(drawing.nodes, index, newNodes);
    addNodes(drawing.nodes, index, newNodes);
    var promise = $q.when();
    if (newPaths) {
      promise = promise.then((function(newPaths) {
        return newPaths;
      }));
    } else {
      promise = promise.then(makePathsAroundNodes.bind(null, drawing.nodes, index, index + newNodes.length, drawing.rigid));
    }
    promise = promise.then(function(drawing, index, pathsToAdd) {
      var polyPath = drawing._poly.getPath().getArray(),
          nodes = drawing.nodes;
      var shifts = [];
      var path,
          lastPoint,
          i,
          pathRange = rangeOfPathAroundNodes(nodes, index, index + pathsToAdd.length),
          pathIndex = pathRange.start;
      for (i = 0; i < pathsToAdd.length; i++) {
        path = pathsToAdd[i];
        lastPoint = path.pop();
        addPoints(polyPath, pathIndex, path);
        pathIndex += path.length;
        shifts.push(path.length);
      }
      var alignLength = pathsToAdd.length;
      shiftIndexOfNodes(nodes, pathRange.affectedNodeIndex, shifts);
      if (pathRange.lastNode && lastPoint) {
        polyPath.push(lastPoint);
        alignLength++;
      }
      var nodesToAlign = nodes.slice(index, index + alignLength);
      alignNodesWithPath(polyPath, nodesToAlign);
      drawing._poly.setPath(polyPath);
      return polyPath;
    }.bind(null, drawing, index));
    return promise;
  }
  function spliceNodesIntoDrawing(drawing, index, nodeRemoveLength) {
    var nodesToAdd = arguments[3] !== (void 0) ? arguments[3] : [];
    var pathsToAdd = arguments[4] !== (void 0) ? arguments[4] : null;
    var polyPath = drawing._poly.getPath().getArray();
    nodesToAdd = arrayify(nodesToAdd);
    var promise = $q.when();
    promise = promise.then(function(drawing, index, nodeRemoveLength, nodesToAdd, pathsToAdd) {
      removeNodesAndTheirPathsFromDrawing(drawing, index, nodeRemoveLength);
      return addNodesAndTheirPathsToDrawing(drawing, index, nodesToAdd, pathsToAdd);
    }.bind(null, drawing, index, nodeRemoveLength, nodesToAdd, pathsToAdd));
    return promise;
  }
  var internalQueue = $q.when();
  function queue(promise) {
    internalQueue = internalQueue.then((function(promise) {
      return promise;
    }));
  }
  function makeNode(colorIndex, latLng) {
    var index = arguments[2] !== (void 0) ? arguments[2] : null;
    var marker = new MapSvc.Marker(makeMarkerOptions(colorIndex, latLng));
    return {
      lat: latLng.lat(),
      lng: latLng.lng(),
      index: index,
      _marker: marker
    };
  }
  self.makeNode = makeNode;
  function makeDrawing(colorIndex, rigid) {
    var fill = arguments[2] !== (void 0) ? arguments[2] : false;
    var poly;
    if (fill) {
      poly = new MapSvc.Polygon(makePolyOptions(colorIndex, fill));
    } else {
      poly = new MapSvc.Polyline(makePolyOptions(colorIndex, fill));
    }
    return {
      colorIndex: colorIndex,
      rigid: rigid,
      fill: fill,
      _poly: poly,
      nodes: []
    };
  }
  self.makeDrawing = makeDrawing;
  function addDrawings(drawings, index, drawingsToAdd) {
    splice(drawings, index, 0, drawingsToAdd);
  }
  self.addDrawings = self.addDrawing = addDrawings;
  function addNodesToDrawing(drawing, index) {
    var nodesToAdd = arguments[2] !== (void 0) ? arguments[2] : [];
    var pathsToAdd = arguments[3] !== (void 0) ? arguments[3] : null;
    return spliceNodesIntoDrawing(drawing, index, 0, nodesToAdd, pathsToAdd);
  }
  self.addNodesToDrawing = self.addNodeToDrawing = addNodesToDrawing;
  function removeDrawings(drawings, index, removeLength) {
    var removedDrawings = splice(drawings, index, removeLength);
    for (var i = 0; i < removedDrawings.length; i++) {
      var removedDrawing = removedDrawings[i];
      removeNodesFromDrawing(removedDrawing, 0, removedDrawing.nodes.length);
      removedDrawing._poly.setMap(null);
    }
  }
  self.removeDrawings = self.removeDrawing = removeDrawings;
  function removeNodesFromDrawing(drawing, index, removeLength) {
    var pathsToAdd = arguments[3] !== (void 0) ? arguments[3] : null;
    spliceNodesIntoDrawing(drawing, index, removeLength, [], pathsToAdd);
  }
  self.removeNodesFromDrawing = self.removeNodeFromDrawing = removeNodesFromDrawing;
  function changeNodeOfDrawing(drawing, index, changes) {
    var pathsToAdd = arguments[3] !== (void 0) ? arguments[3] : null;
    var node = drawing.nodes[index];
    changeNode(node, changes);
    spliceNodesIntoDrawing(drawing, index, 1, duplicateNode(drawing, node), pathsToAdd);
  }
  self.changeNodeOfDrawing = changeNodeOfDrawing;
  function changePathOfDrawing(drawing, index, pathsToAdd, range) {
    if (range.firstNode && range.lastNode) {
      return;
    }
    var nodes = drawing.nodes;
    var promise,
        path = drawing._poly.getPath().getArray(),
        pathIndex = range.start,
        pathRemoveLength = range.end - range.start;
    if (pathsToAdd === null) {
      promise = makePathsAroundNodes(nodes, index, drawing.rigid);
    } else {
      var deferred = $q.defer();
      deferred.resolve(pathsToAdd);
      promise = deferred.promise;
    }
    promise.then(function(pathsToAdd) {
      removePoints(path, pathIndex, pathRemoveLength);
      shiftIndexOfNodes(nodes, range.indexOfAffectedNode + 1, -pathRemoveLength);
      var shifts = [],
          nodeLocations = [],
          pathLength,
          i,
          j;
      for (i = 0; i < pathsToAdd.length; i++) {
        if (i < pathsToAdd.length - 1) {
          nodeLocations.push(pathsToAdd[i].pop());
          pathLength = pathsToAdd[i].length;
        } else {
          pathLength = pathsToAdd.length - 1;
        }
        shifts.push(pathLength);
      }
      var combinedPath = Array.prototype.concat.apply([], pathsToAdd);
      addPoints(path, pathIndex, combinedPath);
      shiftIndexOfNodes(nodes, range.indexOfAffectedNode + 1, shifts);
      for (i = range.indexOfAffectedNode, j = 0; j < nodeLocations.length; i++, j++) {
        changeNode(nodes[i], {
          lat: nodeLocations[j].lat(),
          lng: nodeLocations[j].lng()
        });
      }
      drawing._poly.setPath(path);
    });
  }
  function changeDrawing(drawing, changes) {
    change(drawing, changes);
    for (var key in changes) {
      switch (key) {
        case 'colorIndex':
        case 'fill':
          var options = makePolyOptions(drawing.colorIndex, drawing.fill);
          drawing._poly.setOptions(options);
          break;
        case 'rigid':
          break;
      }
    }
  }
  function drawingsToGeoJson(drawings) {
    var storableDrawings = [];
    for (var i = 0; i < drawings.length; i++) {
      var drawing = drawings[i];
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
      return storableDrawing;
    }
    $localStorage.drawings = storableDrawings;
  }
  function geoJsonToDrawings(drawings) {
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
  }
  function rgbaColorToString(rgba) {
    return ("rgba(" + rgba.r * 100 + "%," + rgba.g * 100 + "%," + rgba.b * 100 + "%," + rgba.a + ")");
  }
  function shiftIndices(array, index, shift) {
    for (var i = index; i < array.length; i++) {
      array[i].index += shift;
    }
  }
  function makeIcon(colorIndex) {
    var color = ColorSvc.colors[colorIndex];
    return {
      path: MapSvc.SymbolPath.CIRCLE,
      scale: 10,
      strokeColor: '#' + ColorSvc.convert.rgba(color).to.hex24(),
      strokeOpacity: 1,
      strokeWeight: 2.5
    };
  }
  function makeMarkerOptions(colorIndex, latLng) {
    return {
      clickable: true,
      crossOnDrag: false,
      cursor: 'pointer',
      draggable: true,
      flat: true,
      icon: makeIcon(colorIndex),
      map: MapSvc.map,
      position: latLng
    };
  }
  function makePolyOptions(colorIndex, fill) {
    var value = {
      clickable: true,
      draggable: false,
      editable: false,
      map: MapSvc.map
    };
    var color = ColorSvc.colors[colorIndex];
    if (fill) {
      value.fillColor = rgbaColorToString(color);
      value.strokeWeight = 0;
    } else {
      value.strokeColor = rgbaColorToString(color);
      value.strokeWeight = color.weight;
    }
    return value;
  }
}).controller('DrawingCtrl', function($scope, $localStorage, DrawingSvc, ColorSvc, HistorySvc) {
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
  var drawings = $scope.drawings = [];
  var activeDrawingIndex = -1;
  function addNode(event, param) {
    var colorIndex = $scope.$storage.activeColor;
    var rigid = false,
        fill = false;
    if (shouldCreateNewDrawing()) {
      var newDrawing = DrawingSvc.makeDrawing(colorIndex, rigid, fill);
      activeDrawingIndex++;
      DrawingSvc.addDrawing(drawings, activeDrawingIndex, newDrawing);
    }
    var drawing = drawings[activeDrawingIndex];
    var newNode = DrawingSvc.makeNode(colorIndex, param.latLng);
    DrawingSvc.addNodeToDrawing(drawing, drawing.nodes.length, newNode);
    return;
  }
  function changeNode($params, drawingIndex, nodeIndex) {
    var event = $params[0],
        drawing = drawings[drawingIndex],
        originalNode = drawing.nodes[nodeIndex],
        latLng = event.latLng;
    DrawingSvc.changeNodeOfDrawing(drawing, nodeIndex, {
      lat: latLng.lat(),
      lng: latLng.lng()
    });
  }
  function shouldCreateNewDrawing() {
    if (drawings.length === 0) {
      return true;
    }
    var latestDrawing = drawings[drawings.length - 1];
    return (latestDrawing && latestDrawing.colorIndex !== ColorSvc.activeColorIndex);
  }
  $scope.$on('map:click', addNode);
  $scope.$on('action:clear', function($params) {
    DrawingSvc.removeDrawings(drawings, 0, drawings.length);
    activeDrawingIndex = -1;
  });
  $scope.marker = {
    click: function($params) {
      addNode(undefined, $params[0]);
    },
    dragend: changeNode
  };
  $scope.poly = {click: function($params) {}};
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy9kcmF3aW5nLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiZHJhd2luZy9kcmF3aW5nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG5cbmFuZ3VsYXIubW9kdWxlKCdibmRyeS5kcmF3aW5nJywgWyduZ1N0b3JhZ2UnLCAnYm5kcnkubWFwJywgJ2JuZHJ5LmNvbG9yJywgJ2JuZHJ5Lmhpc3RvcnknXSlcbiAgLnNlcnZpY2UoJ0RpcmVjdGlvbnNTdmMnLCBmdW5jdGlvbigkcSwgTWFwU3ZjKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkaXJlY3Rpb25zID0gbmV3IE1hcFN2Yy5EaXJlY3Rpb25zU2VydmljZSgpO1xuXG4gICAgc2VsZi5yb3V0ZSA9IGZ1bmN0aW9uKGxvY2F0aW9ucykge1xuICAgICAgaWYgKGxvY2F0aW9ucy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignUmVxdWlyZXMgZXhhY3RseSAyIGxvY2F0aW9ucy4nKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgb3JpZ2luOiBsb2NhdGlvbnNbMF0sXG4gICAgICAgIGRlc3RpbmF0aW9uOiBsb2NhdGlvbnNbMV0sXG4gICAgICAgIHRyYXZlbE1vZGU6IE1hcFN2Yy5UcmF2ZWxNb2RlLkRSSVZJTkdcbiAgICAgIH07XG5cbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGZ1bmN0aW9uIHByb2Nlc3NSZXF1ZXN0KHRyaWVzKSB7XG4gICAgICAgIGRpcmVjdGlvbnMucm91dGUocmVxdWVzdCxcbiAgICAgICAgICAvLyBTdWNjZXNzIGhhbmRsZXJcblxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3VsdCwgc3RhdHVzKSB7XG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSBNYXBTdmMuRGlyZWN0aW9uc1N0YXR1cy5PSykge1xuICAgICAgICAgICAgICB2YXIgb3ZlcnZpZXdQYXRoID0gcmVzdWx0LnJvdXRlc1swXS5vdmVydmlld19wYXRoO1xuXG4gICAgICAgICAgICAgIC8vIFJlc29sdmUgd2l0aCBwYXRoXG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUob3ZlcnZpZXdQYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PVxuICAgICAgICAgICAgICBNYXBTdmMuRGlyZWN0aW9uc1N0YXR1cy5VTktOT1dOX0VSUk9SICYmIHRyaWVzIDwgMykge1xuICAgICAgICAgICAgICB0cmllcysrO1xuICAgICAgICAgICAgICAvLyBUcnkgYWdhaW5cbiAgICAgICAgICAgICAgcHJvY2Vzc1JlcXVlc3QodHJpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBFcnJvciBoYW5kbGVyXG5cbiAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0cmllcyA8IDMpIHtcbiAgICAgICAgICAgICAgLy8gVHJ5IGFnYWluXG4gICAgICAgICAgICAgIHRyaWVzKys7XG4gICAgICAgICAgICAgIHByb2Nlc3NSZXF1ZXN0KHRyaWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBwcm9jZXNzUmVxdWVzdCgwKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbiAgfSlcbiAgLnNlcnZpY2UoJ0RyYXdpbmdTdmMnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkcSwgJGxvY2FsU3RvcmFnZSwgRGlyZWN0aW9uc1N2YywgTWFwU3ZjLCBDb2xvclN2Yykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHNwbGljZShpdGVtQXJyYXksIGluZGV4ID0gMCwgcmVtb3ZlTGVuZ3RoID0gMCwgbmV3SXRlbXMgPSBbXSkge1xuICAgICAgdmFyIGFyZ3MgPSBbaW5kZXgsIHJlbW92ZUxlbmd0aF0uY29uY2F0KG5ld0l0ZW1zKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkoaXRlbUFycmF5LCBhcmdzKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3BsaWNlUGFzc1RocnUoaXRlbUFycmF5KSB7XG4gICAgICB2YXIgYXJncyA9IFtpdGVtQXJyYXldLmNvbmNhdChhcmd1bWVudHMpO1xuICAgICAgc3BsaWNlLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgcmV0dXJuIGl0ZW1BcnJheTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2hhbmdlKG9iamVjdCwgY2hhbmdlcykge1xuICAgICAgZm9yICh2YXIga2V5IGluIGNoYW5nZXMpIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIG9iamVjdFtrZXldID0gY2hhbmdlc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qIERyYXdpbmdTdmMgaGllcmFyY2h5OlxuICAgICB8IC0gZHJhd2luZ3NcbiAgICAgICB8IC0gbm9kZXNcbiAgICAgICB8IC0gcGF0aFxuICAgICovXG4gICAgXG4gICAgLypcbiAgICAqKiogUFJJVkFURSBNRVRIT0RTICoqKlxuICAgICovXG4gICAgLy8gUGF0aCBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBtYWtlUG9pbnQobGF0TG5nKSB7XG4gICAgICBjb25zb2xlLmFzc2VydChcbiAgICAgICAgJ2xhdCcgaW4gbGF0TG5nICYmXG4gICAgICAgICdsbmcnIGluIGxhdExuZyAmJlxuICAgICAgICB0eXBlb2YgbGF0TG5nLmxhdCA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgdHlwZW9mIGxhdExuZy5sYXQgPT09ICdudW1iZXInLFxuICAgICAgICBcbiAgICAgICAgJ2xhdExuZyBpcyBub3QgZm9ybWF0dGVkIHByb3Blcmx5J1xuICAgICAgKTtcbiAgICAgIHJldHVybiBuZXcgTWFwU3ZjLkxhdExuZyhsYXRMbmcubGF0LCBsYXRMbmcubG5nKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWFrZVBhdGhzKGxvY2F0aW9ucywgcmlnaWQgPSBmYWxzZSkge1xuICAgICAgY29uc29sZS5hc3NlcnQoXG4gICAgICAgIEFycmF5LmlzQXJyYXkobG9jYXRpb25zKSxcbiAgICAgICAgXG4gICAgICAgICdsb2NhdGlvbnMgaXMgbm90IGFuIEFycmF5J1xuICAgICAgKTtcbiAgICAgIFxuICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gbG9jYXRpb25zW2ldLFxuICAgICAgICAgIGVuZCA9IGxvY2F0aW9uc1tpICsgMV0sXG4gICAgICAgICAgcHJvbWlzZTtcbiAgICAgICAgXG4gICAgICAgIGlmIChyaWdpZCkge1xuICAgICAgICAgIHByb21pc2UgPSBzdGFydC5lcXVhbHMoZW5kKSA/XG4gICAgICAgICAgICAkcS53aGVuKFtzdGFydF0pIDpcbiAgICAgICAgICAgICRxLndoZW4oW3N0YXJ0LCBlbmRdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9taXNlID0gRGlyZWN0aW9uc1N2Yy5yb3V0ZShbc3RhcnQsIGVuZF0pO1xuICAgICAgICB9XG4gICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiAkcS5hbGwocHJvbWlzZXMpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhZGRQb2ludHMocGF0aCwgaW5kZXgsIHBvaW50cykge1xuICAgICAgcmV0dXJuIHNwbGljZShwYXRoLCBpbmRleCwgMCwgcG9pbnRzKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlUG9pbnRzKHBhdGgsIGluZGV4LCByZW1vdmVMZW5ndGgpIHtcbiAgICAgIHJldHVybiBzcGxpY2UocGF0aCwgaW5kZXgsIHJlbW92ZUxlbmd0aCk7XG4gICAgfVxuXG4gICAgLy8gTm9kZSBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBhcnJheWlmeShub2Rlcykge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG5vZGVzKSkge1xuICAgICAgICByZXR1cm4gW25vZGVzXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkTm9kZXMobm9kZXMsIGluZGV4LCBub2Rlc1RvQWRkKSB7XG4gICAgICBzcGxpY2Uobm9kZXMsIGluZGV4LCAwLCBub2Rlc1RvQWRkKTtcbiAgICB9XG4gICAgdmFyIGFkZE5vZGUgPSBhZGROb2RlcztcbiAgICBcbiAgICBmdW5jdGlvbiByZW1vdmVOb2Rlcyhub2RlcywgaW5kZXgsIHJlbW92ZUxlbmd0aCA9IDEpIHtcbiAgICAgIHZhciByZW1vdmVkID0gc3BsaWNlKG5vZGVzLCBpbmRleCwgcmVtb3ZlTGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3ZlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICByZW1vdmVkW2ldLl9tYXJrZXIuc2V0TWFwKG51bGwpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgcmVtb3ZlTm9kZSA9IHJlbW92ZU5vZGVzO1xuICAgIFxuICAgIGZ1bmN0aW9uIGNoYW5nZU5vZGUobm9kZSwgY2hhbmdlcykge1xuICAgICAgY29uc29sZS5hc3NlcnQoXG4gICAgICAgIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICB0eXBlb2YgY2hhbmdlcyA9PT0gJ29iamVjdCcsXG4gICAgICAgIFxuICAgICAgICAnSW52YWxpZCBwYXJhbWV0ZXJzJ1xuICAgICAgKVxuICAgICAgY2hhbmdlKG5vZGUsIGNoYW5nZXMpO1xuICAgICAgZm9yICh2YXIga2V5IGluIGNoYW5nZXMpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGF0JzpcbiAgICAgICAgY2FzZSAnbG5nJzpcbiAgICAgICAgICBub2RlLl9tYXJrZXIuc2V0UG9zaXRpb24obWFrZVBvaW50KG5vZGUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkdXBsaWNhdGVOb2RlKGRyYXdpbmcsIG5vZGUpIHtcbiAgICAgIHJldHVybiBtYWtlTm9kZShkcmF3aW5nLmNvbG9ySW5kZXgsIG1ha2VQb2ludChub2RlKSwgbm9kZS5pbmRleCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNoaWZ0SW5kZXhPZk5vZGVzKG5vZGVzLCBpbmRleCwgc2hpZnRzKSB7XG4gICAgICB2YXIgbm9kZUFycmF5ID0gYXJyYXlpZnkobm9kZXMpLFxuICAgICAgICBzaGlmdCA9IDAsXG4gICAgICAgIGkgPSAwO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoc2hpZnRzKSkge1xuICAgICAgICBmb3IgKGkgPSAwOyAoaSArIGluZGV4KSA8IG5vZGVBcnJheS5sZW5ndGggJiYgaSA8IHNoaWZ0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIG5vZGVBcnJheVtpbmRleCArIGldLmluZGV4ICs9IHNoaWZ0c1tpXTtcbiAgICAgICAgICBzaGlmdCArPSBzaGlmdHNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZvciAoaSArPSBpbmRleDsgaSA8IG5vZGVBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBub2RlQXJyYXlbaV0uaW5kZXggKz0gc2hpZnQ7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHNldEluZGV4T2ZOb2Rlcyhub2RlcywgaW5kZXgsIHZhbHVlKSB7XG4gICAgICB2YXIgbm9kZUFycmF5ID0gYXJyYXlpZnkobm9kZXMpO1xuICAgICAgZm9yICh2YXIgaSA9IGluZGV4OyBpIDwgbm9kZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5vZGVBcnJheVtpXS5pbmRleCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRJbml0aWFsSW5kZXhPZk5vZGVzKG5vZGVzLCBpbmRleCwgbm9kZXNUb0FkZCkge1xuICAgICAgdmFyIG5vZGVCZWZvcmUgPSBub2Rlc1tpbmRleCAtIDFdLCBpbmRleEZvck5vZGUgPSAwO1xuICAgICAgXG4gICAgICBpZiAobm9kZUJlZm9yZSkge1xuICAgICAgICBpbmRleEZvck5vZGUgPSBub2RlQmVmb3JlLmluZGV4O1xuICAgICAgfVxuICAgICAgLy8gaWYgKG5vZGVzLmxlbmd0aCA+IDAgJiYgaW5kZXggPT09IG5vZGVzLmxlbmd0aCkge1xuICAgICAgLy8gICBpbmRleEZvck5vZGUrKztcbiAgICAgIC8vIH1cbiAgICAgIHNldEluZGV4T2ZOb2Rlcyhub2Rlc1RvQWRkLCAwLCBpbmRleEZvck5vZGUpO1xuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiByYW5nZU9mUGF0aEFyb3VuZE5vZGVzKG5vZGVzLCBzdGFydCwgZW5kKSB7XG4gICAgICB2YXIgcmFuZ2UgPSB7XG4gICAgICAgIHN0YXJ0OiBudWxsLFxuICAgICAgICBlbmQ6IG51bGwsXG4gICAgICAgIGxlbmd0aDogbnVsbCxcbiAgICAgICAgYWZmZWN0ZWROb2RlSW5kZXg6IG51bGwsXG4gICAgICAgIGxhc3ROb2RlOiBmYWxzZSxcbiAgICAgICAgZmlyc3ROb2RlOiBmYWxzZVxuICAgICAgfTtcbiAgICAgIHZhciBub2RlQmVmb3JlU3RhcnQgPSBub2Rlc1tzdGFydCAtIDFdLFxuICAgICAgICBub2RlQXRTdGFydCA9IG5vZGVzW3N0YXJ0XSxcbiAgICAgICAgbm9kZUF0RW5kID0gbm9kZXNbZW5kXSxcbiAgICAgICAgbm9kZUFmdGVyRW5kID0gbm9kZXNbZW5kICsgMV07XG4gICAgICBcbiAgICAgIGlmICghbm9kZUJlZm9yZVN0YXJ0KSB7XG4gICAgICAgIHJhbmdlLmZpcnN0Tm9kZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAobm9kZUJlZm9yZVN0YXJ0ICYmIG5vZGVCZWZvcmVTdGFydC5pbmRleCAhPT0gbnVsbCkge1xuICAgICAgICByYW5nZS5zdGFydCA9IG5vZGVCZWZvcmVTdGFydC5pbmRleDtcbiAgICAgICAgcmFuZ2UuYWZmZWN0ZWROb2RlSW5kZXggPSBzdGFydDtcbiAgICAgIH0gZWxzZSBpZiAobm9kZUF0U3RhcnQgJiYgbm9kZUF0U3RhcnQuaW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgcmFuZ2Uuc3RhcnQgPSBub2RlQXRTdGFydC5pbmRleDtcbiAgICAgICAgcmFuZ2UuYWZmZWN0ZWROb2RlSW5kZXggPSBzdGFydCArIDE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYW5nZS5zdGFydCA9IDA7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmICghbm9kZUFmdGVyRW5kKSB7XG4gICAgICAgIHJhbmdlLmxhc3ROb2RlID0gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlQXRFbmQgJiYgbm9kZUF0RW5kLmluZGV4ICE9PSBudWxsKSB7XG4gICAgICAgIGlmICghbm9kZUFmdGVyRW5kKSB7XG4gICAgICAgICAgcmFuZ2UuZW5kID0gbm9kZUF0RW5kLmluZGV4ICsgMTtcbiAgICAgICAgfSBlbHNlIGlmIChub2RlQWZ0ZXJFbmQuaW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgICByYW5nZS5lbmQgPSBub2RlQWZ0ZXJFbmQuaW5kZXg7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlLmVuZCA9IHJhbmdlLnN0YXJ0ICsgMTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmFuZ2UubGVuZ3RoID0gcmFuZ2UuZW5kIC0gcmFuZ2Uuc3RhcnQ7XG4gICAgICBcbiAgICAgIHJldHVybiByYW5nZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmFuZ2VPZlBhdGhBcm91bmROb2RlKG5vZGVzLCBpbmRleCkge1xuICAgICAgcmV0dXJuIHJhbmdlT2ZQYXRoQXJvdW5kTm9kZXMobm9kZXMsIGluZGV4LCBpbmRleCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1ha2VQYXRoc0Fyb3VuZE5vZGVzKG5vZGVzLCBzdGFydCwgZW5kLCByaWdpZCkge1xuICAgICAgdmFyIHBvaW50cyA9IFtdLFxuICAgICAgICBub2RlQmVmb3JlID0gbm9kZXNbc3RhcnQgLSAxXSxcbiAgICAgICAgbm9kZUFmdGVyID0gbm9kZXNbZW5kXTtcbiAgICAgIFxuICAgICAgaWYgKG5vZGVCZWZvcmUpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gobWFrZVBvaW50KG5vZGVCZWZvcmUpKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICAgIHBvaW50cy5wdXNoKG1ha2VQb2ludChub2Rlc1tpXSkpO1xuICAgICAgfVxuICAgICAgaWYgKG5vZGVBZnRlcikge1xuICAgICAgICBwb2ludHMucHVzaChtYWtlUG9pbnQobm9kZUFmdGVyKSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChwb2ludHMubGVuZ3RoIDwgMikge1xuICAgICAgICBwb2ludHMucHVzaChwb2ludHNbMF0pOyAvLyBEdXBsaWNhdGUgZmlyc3QgcG9pbnQ7IG1ha2VQYXRocyBuZWVkcyBhdCBsZWFzdCB0d28gcG9pbnRzXG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiBtYWtlUGF0aHMocG9pbnRzLCByaWdpZCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1ha2VQYXRoc0Fyb3VuZE5vZGUobm9kZXMsIGluZGV4LCByaWdpZCkge1xuICAgICAgcmV0dXJuIG1ha2VQYXRoc0Fyb3VuZE5vZGVzKG5vZGVzLCBpbmRleCwgaW5kZXgsIHJpZ2lkKTtcbiAgICB9XG4gICAgXG5cbiAgICBmdW5jdGlvbiBhbGlnbk5vZGVzV2l0aFBhdGgocGF0aCwgbm9kZXMpIHtcbiAgICAgIHZhciBsYXRMbmc7XG4gICAgICBmb3IgKHZhciBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgIGxhdExuZyA9IHBhdGhbbm9kZS5pbmRleF07XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KFxuICAgICAgICAgIGxhdExuZyxcbiAgXG4gICAgICAgICAgJ2xhdExuZyBpcyBub3QgZGVmaW5lZCdcbiAgICAgICAgKTtcbiAgICAgICAgY2hhbmdlTm9kZShub2RlLCB7XG4gICAgICAgICAgbGF0OiBsYXRMbmcubGF0KCksXG4gICAgICAgICAgbG5nOiBsYXRMbmcubG5nKClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb2Nlc3NQYXRocyhwYXRocykge1xuICAgICAgXG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGVzQW5kVGhlaXJQYXRoc0Zyb21EcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBub2RlUmVtb3ZlTGVuZ3RoKSB7XG4gICAgICB2YXIgcmFuZ2UgPSByYW5nZU9mUGF0aEFyb3VuZE5vZGVzKGRyYXdpbmcubm9kZXMsIGluZGV4LCBpbmRleCArIG5vZGVSZW1vdmVMZW5ndGgpO1xuICAgICAgaWYgKG5vZGVSZW1vdmVMZW5ndGggPT09IDAgJiYgcmFuZ2UuZmlyc3ROb2RlICYmICFyYW5nZS5sYXN0Tm9kZSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBcbiAgICAgIHZhciBwYXRoID0gZHJhd2luZy5fcG9seS5nZXRQYXRoKCkuZ2V0QXJyYXkoKSxcbiAgICAgICAgcmFuZ2UgPSByYW5nZU9mUGF0aEFyb3VuZE5vZGVzKGRyYXdpbmcubm9kZXMsIGluZGV4LCBpbmRleCArIG5vZGVSZW1vdmVMZW5ndGgpO1xuICAgICAgXG4gICAgICByZW1vdmVQb2ludHMocGF0aCwgcmFuZ2Uuc3RhcnQsIHJhbmdlLmxlbmd0aCk7XG4gICAgICBzaGlmdEluZGV4T2ZOb2RlcyhkcmF3aW5nLm5vZGVzLCByYW5nZS5hZmZlY3RlZE5vZGVJbmRleCwgLXJhbmdlLmxlbmd0aCk7XG4gICAgICByZW1vdmVOb2RlcyhkcmF3aW5nLm5vZGVzLCBpbmRleCwgbm9kZVJlbW92ZUxlbmd0aCk7XG4gICAgICBcbiAgICAgIGRyYXdpbmcuX3BvbHkuc2V0UGF0aChwYXRoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkTm9kZXNBbmRUaGVpclBhdGhzVG9EcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBuZXdOb2RlcywgbmV3UGF0aHMgPSBudWxsKSB7XG4gICAgICBzZXRJbml0aWFsSW5kZXhPZk5vZGVzKGRyYXdpbmcubm9kZXMsIGluZGV4LCBuZXdOb2Rlcyk7XG4gICAgICBhZGROb2RlcyhkcmF3aW5nLm5vZGVzLCBpbmRleCwgbmV3Tm9kZXMpO1xuICAgICAgXG4gICAgICB2YXIgcHJvbWlzZSA9ICRxLndoZW4oKTtcbiAgICAgIGlmIChuZXdQYXRocykge1xuICAgICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKFxuICAgICAgICAgIChuZXdQYXRocykgPT4gbmV3UGF0aHNcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oXG4gICAgICAgICAgbWFrZVBhdGhzQXJvdW5kTm9kZXMuYmluZChudWxsLCBkcmF3aW5nLm5vZGVzLCBpbmRleCwgaW5kZXggKyBuZXdOb2Rlcy5sZW5ndGgsIGRyYXdpbmcucmlnaWQpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKGRyYXdpbmcsIGluZGV4LCBwYXRoc1RvQWRkKSB7XG4gICAgICAgICAgdmFyIHBvbHlQYXRoID0gZHJhd2luZy5fcG9seS5nZXRQYXRoKCkuZ2V0QXJyYXkoKSxcbiAgICAgICAgICAgIG5vZGVzID0gZHJhd2luZy5ub2RlcztcbiAgICAgICAgICAgIFxuICAgICAgICAgIC8vIGlmICghcmFuZ2VPZlBhdGhBcm91bmROb2RlKG5vZGVzLCBpbmRleCkuZmlyc3ROb2RlKSB7XG4gICAgICAgICAgLy8gICBpbmRleC0tOyAvLyBGaXJzdCBwYXRoIG9mIHBhdGhzVG9BZGQgd2lsbCBhZmZlY3QgcHJldmlvdXMgbm9kZVxuICAgICAgICAgIC8vIH1cbiAgICAgICAgICBcbiAgICAgICAgICB2YXIgc2hpZnRzID0gW107XG4gICAgICAgICAgdmFyIHBhdGgsIGxhc3RQb2ludCwgaSxcbiAgICAgICAgICAgIHBhdGhSYW5nZSA9IHJhbmdlT2ZQYXRoQXJvdW5kTm9kZXMobm9kZXMsIGluZGV4LCBpbmRleCArIHBhdGhzVG9BZGQubGVuZ3RoKSxcbiAgICAgICAgICAgIHBhdGhJbmRleCA9IHBhdGhSYW5nZS5zdGFydDtcbiAgICAgICAgICAgIFxuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXRoc1RvQWRkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwYXRoID0gcGF0aHNUb0FkZFtpXTtcbiAgICAgICAgICAgIGxhc3RQb2ludCA9IHBhdGgucG9wKCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEFkZHMgbmV3IHBhdGhcbiAgICAgICAgICAgIGFkZFBvaW50cyhwb2x5UGF0aCwgcGF0aEluZGV4LCBwYXRoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgcGF0aEluZGV4ICs9IHBhdGgubGVuZ3RoO1xuICAgICAgICAgICAgc2hpZnRzLnB1c2gocGF0aC5sZW5ndGgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBcbiAgICAgICAgICB2YXIgYWxpZ25MZW5ndGggPSBwYXRoc1RvQWRkLmxlbmd0aDtcbiAgICAgICAgICBzaGlmdEluZGV4T2ZOb2Rlcyhub2RlcywgcGF0aFJhbmdlLmFmZmVjdGVkTm9kZUluZGV4LCBzaGlmdHMpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChwYXRoUmFuZ2UubGFzdE5vZGUgJiYgbGFzdFBvaW50KSB7IC8vIElmIGxhc3ROb2RlIGlzIGludm9sdmVkLCBwdXQgbGFzdFBvaW50IGJhY2tcbiAgICAgICAgICAgIHBvbHlQYXRoLnB1c2gobGFzdFBvaW50KTtcbiAgICAgICAgICAgIGFsaWduTGVuZ3RoKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIHZhciBub2Rlc1RvQWxpZ24gPSBub2Rlcy5zbGljZShpbmRleCwgaW5kZXggKyBhbGlnbkxlbmd0aCk7XG4gICAgICAgICAgLy8gY29uc29sZS5pbmZvKGluZGV4LCBhbGlnbkxlbmd0aCk7XG4gICAgICAgICAgLy8gY29uc29sZS50YWJsZShub2Rlc1RvQWxpZ24pO1xuICAgICAgICAgIGFsaWduTm9kZXNXaXRoUGF0aChwb2x5UGF0aCwgbm9kZXNUb0FsaWduKTtcbiAgICAgICAgICBcbiAgICAgICAgICAvLyBjb25zb2xlLnRhYmxlKG5vZGVzKTtcbiAgICAgICAgICAvLyBjb25zb2xlLmluZm8ocG9seVBhdGgpO1xuICAgICAgICAgIC8vIGNvbnNvbGUuaW5mbyhgTGVuZ3RoIG9mIHBvbHlQYXRoOiAke3BvbHlQYXRoLmxlbmd0aH1gKTtcbiAgICAgICAgICBcbiAgICAgICAgICBkcmF3aW5nLl9wb2x5LnNldFBhdGgocG9seVBhdGgpO1xuICAgICAgICAgIHJldHVybiBwb2x5UGF0aDtcbiAgICAgICAgfS5iaW5kKG51bGwsIGRyYXdpbmcsIGluZGV4KVxuICAgICAgKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzcGxpY2VOb2Rlc0ludG9EcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBub2RlUmVtb3ZlTGVuZ3RoLCBub2Rlc1RvQWRkID0gW10sIHBhdGhzVG9BZGQgPSBudWxsKSB7XG4gICAgICB2YXIgcG9seVBhdGggPSBkcmF3aW5nLl9wb2x5LmdldFBhdGgoKS5nZXRBcnJheSgpO1xuICAgICAgbm9kZXNUb0FkZCA9IGFycmF5aWZ5KG5vZGVzVG9BZGQpO1xuICAgICAgXG4gICAgICAvLyBGaXJzdCwgcmVtb3ZlIG5vZGVzIGFuZCBhZGQgbmV3IG9uZXNcbiAgICAgIHZhciBwcm9taXNlID0gJHEud2hlbigpO1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihcbiAgICAgICAgZnVuY3Rpb24oZHJhd2luZywgaW5kZXgsIG5vZGVSZW1vdmVMZW5ndGgsIG5vZGVzVG9BZGQsIHBhdGhzVG9BZGQpIHtcbiAgICAgICAgICByZW1vdmVOb2Rlc0FuZFRoZWlyUGF0aHNGcm9tRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgbm9kZVJlbW92ZUxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGFkZE5vZGVzQW5kVGhlaXJQYXRoc1RvRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgbm9kZXNUb0FkZCwgcGF0aHNUb0FkZCk7XG4gICAgICAgIH0uYmluZChudWxsLCBkcmF3aW5nLCBpbmRleCwgbm9kZVJlbW92ZUxlbmd0aCwgbm9kZXNUb0FkZCwgcGF0aHNUb0FkZClcbiAgICAgICk7XG4gICAgICAvLyAudGhlbihcbiAgICAgIC8vICAgLy8gQWRkIG5ldyBwYXRoc1xuICAgICAgLy8gICBmdW5jdGlvbihkcmF3aW5nLCBpbmRleCwgcGF0aHNUb0FkZCkge1xuICAgICAgLy8gICAgIHZhciBwb2x5UGF0aCA9IGRyYXdpbmcuX3BvbHkuZ2V0UGF0aCgpLmdldEFycmF5KCksXG4gICAgICAvLyAgICAgICBub2RlcyA9IGRyYXdpbmcubm9kZXM7XG4gICAgICAvL1xuICAgICAgLy8gICAgIGlmICghcmFuZ2VPZlBhdGhBcm91bmROb2RlKG5vZGVzLCBpbmRleCkuZmlyc3ROb2RlKSB7XG4gICAgICAvLyAgICAgICBpbmRleC0tOyAvLyBGaXJzdCBwYXRoIG9mIHBhdGhzVG9BZGQgd2lsbCBhZmZlY3QgcHJldmlvdXMgbm9kZVxuICAgICAgLy8gICAgIH1cbiAgICAgIC8vICAgICB2YXIgc2hpZnRzID0gW107XG4gICAgICAvLyAgICAgdmFyIHBhdGgsIGxhc3RQb2ludCwgaSxcbiAgICAgIC8vICAgICAgIHBhdGhSYW5nZSA9IHJhbmdlT2ZQYXRoQXJvdW5kTm9kZXMobm9kZXMsIGluZGV4LCBpbmRleCArIHBhdGhzVG9BZGQubGVuZ3RoKSxcbiAgICAgIC8vICAgICAgIHBhdGhJbmRleCA9IHBhdGhSYW5nZS5zdGFydDtcbiAgICAgIC8vICAgICBmb3IgKGkgPSAwOyBpIDwgcGF0aHNUb0FkZC5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gICAgICAgcGF0aCA9IHBhdGhzVG9BZGRbaV07XG4gICAgICAvLyAgICAgICBsYXN0UG9pbnQgPSBwYXRoLnBvcCgpO1xuICAgICAgLy9cbiAgICAgIC8vICAgICAgIC8vIEFkZHMgbmV3IHBhdGhcbiAgICAgIC8vICAgICAgIGFkZFBvaW50cyhwb2x5UGF0aCwgcGF0aEluZGV4LCBwYXRoKTtcbiAgICAgIC8vXG4gICAgICAvLyAgICAgICBwYXRoSW5kZXggKz0gcGF0aC5sZW5ndGg7XG4gICAgICAvLyAgICAgICBzaGlmdHMucHVzaChwYXRoLmxlbmd0aCk7XG4gICAgICAvLyAgICAgfVxuICAgICAgLy9cbiAgICAgIC8vICAgICB2YXIgYWxpZ25MZW5ndGggPSBwYXRoc1RvQWRkLmxlbmd0aDtcbiAgICAgIC8vICAgICBzaGlmdEluZGV4T2ZOb2Rlcyhub2RlcywgaW5kZXggKyAxLCBzaGlmdHMpO1xuICAgICAgLy9cbiAgICAgIC8vICAgICBpZiAocGF0aFJhbmdlLmxhc3ROb2RlICYmIGxhc3RQb2ludCkgeyAvLyBJZiBsYXN0Tm9kZSBpcyBpbnZvbHZlZCwgcHV0IGxhc3RQb2ludCBiYWNrXG4gICAgICAvLyAgICAgICBwb2x5UGF0aC5wdXNoKGxhc3RQb2ludCk7XG4gICAgICAvLyAgICAgICBhbGlnbkxlbmd0aCsrO1xuICAgICAgLy8gICAgIH1cbiAgICAgIC8vXG4gICAgICAvLyAgICAgdmFyIG5vZGVzVG9BbGlnbiA9IG5vZGVzLnNsaWNlKGluZGV4LCBpbmRleCArIGFsaWduTGVuZ3RoKTtcbiAgICAgIC8vICAgICBjb25zb2xlLmluZm8oaW5kZXgsIGFsaWduTGVuZ3RoKTtcbiAgICAgIC8vICAgICBjb25zb2xlLnRhYmxlKG5vZGVzVG9BbGlnbik7XG4gICAgICAvLyAgICAgYWxpZ25Ob2Rlc1dpdGhQYXRoKHBvbHlQYXRoLCBub2Rlc1RvQWxpZ24pO1xuICAgICAgLy9cbiAgICAgIC8vICAgICBjb25zb2xlLmluZm8ocG9seVBhdGgpO1xuICAgICAgLy8gICAgIGNvbnNvbGUuaW5mbyhgTGVuZ3RoIG9mIHBvbHlQYXRoOiAke3BvbHlQYXRoLmxlbmd0aH1gKTtcbiAgICAgIC8vXG4gICAgICAvLyAgICAgZHJhd2luZy5fcG9seS5zZXRQYXRoKHBvbHlQYXRoKTtcbiAgICAgIC8vICAgfS5iaW5kKG51bGwsIGRyYXdpbmcsIGluZGV4KVxuICAgICAgLy8gKTtcbiAgICAgIC8vIHF1ZXVlKHByb21pc2UpO1xuICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgfVxuICAgIFxuICAgIC8qXG4gICAgKioqIFBVQkxJQyBBUEkgKioqXG4gICAgKi9cbiAgICB2YXIgaW50ZXJuYWxRdWV1ZSA9ICRxLndoZW4oKTtcbiAgICBmdW5jdGlvbiBxdWV1ZShwcm9taXNlKSB7IC8vIEtlZXBzIHBhdGggb3BlcmF0aW9ucyBpbiBjb3JyZWN0IG9yZGVyXG4gICAgICBpbnRlcm5hbFF1ZXVlID0gaW50ZXJuYWxRdWV1ZS50aGVuKHByb21pc2UgPT4gcHJvbWlzZSk7IC8vIFJldHVybiBwcm9taXNlXG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIG1ha2VOb2RlKGNvbG9ySW5kZXgsIGxhdExuZywgaW5kZXggPSBudWxsKSB7XG4gICAgICB2YXIgbWFya2VyID0gbmV3IE1hcFN2Yy5NYXJrZXIobWFrZU1hcmtlck9wdGlvbnMoY29sb3JJbmRleCwgbGF0TG5nKSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxhdDogbGF0TG5nLmxhdCgpLFxuICAgICAgICBsbmc6IGxhdExuZy5sbmcoKSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBfbWFya2VyOiBtYXJrZXJcbiAgICAgIH07XG4gICAgfVxuICAgIHNlbGYubWFrZU5vZGUgPSBtYWtlTm9kZTtcbiAgICBcbiAgICAvLyBEcmF3aW5nIGZ1bmN0aW9uc1xuICAgIGZ1bmN0aW9uIG1ha2VEcmF3aW5nKGNvbG9ySW5kZXgsIHJpZ2lkLCBmaWxsID0gZmFsc2UpIHtcbiAgICAgIHZhciBwb2x5O1xuXG4gICAgICBpZiAoZmlsbCkge1xuICAgICAgICBwb2x5ID0gbmV3IE1hcFN2Yy5Qb2x5Z29uKG1ha2VQb2x5T3B0aW9ucyhjb2xvckluZGV4LCBmaWxsKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb2x5ID0gbmV3IE1hcFN2Yy5Qb2x5bGluZShtYWtlUG9seU9wdGlvbnMoY29sb3JJbmRleCwgZmlsbCkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29sb3JJbmRleDogY29sb3JJbmRleCxcbiAgICAgICAgcmlnaWQ6IHJpZ2lkLFxuICAgICAgICBmaWxsOiBmaWxsLFxuICAgICAgICBfcG9seTogcG9seSxcbiAgICAgICAgbm9kZXM6IFtdXG4gICAgICB9O1xuICAgIH1cbiAgICBzZWxmLm1ha2VEcmF3aW5nID0gbWFrZURyYXdpbmc7XG4gICAgXG4gICAgZnVuY3Rpb24gYWRkRHJhd2luZ3MoZHJhd2luZ3MsIGluZGV4LCBkcmF3aW5nc1RvQWRkKSB7XG4gICAgICBzcGxpY2UoZHJhd2luZ3MsIGluZGV4LCAwLCBkcmF3aW5nc1RvQWRkKTtcbiAgICB9XG4gICAgc2VsZi5hZGREcmF3aW5ncyA9IHNlbGYuYWRkRHJhd2luZyA9IGFkZERyYXdpbmdzO1xuICAgIFxuICAgIGZ1bmN0aW9uIGFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBub2Rlc1RvQWRkID0gW10sIHBhdGhzVG9BZGQgPSBudWxsKSB7XG4gICAgICByZXR1cm4gc3BsaWNlTm9kZXNJbnRvRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgMCwgbm9kZXNUb0FkZCwgcGF0aHNUb0FkZCk7XG4gICAgICAvLyB2YXIgbm9kZXMgPSBkcmF3aW5nLm5vZGVzO1xuICAgICAgLy8gc2V0SW5pdGlhbEluZGV4T2ZOb2Rlcyhub2RlcywgaW5kZXgsIG5vZGVzVG9BZGQpO1xuICAgICAgLy8gYWRkTm9kZXMobm9kZXMsIGluZGV4LCBub2Rlc1RvQWRkKTtcbiAgICAgIC8vXG4gICAgICAvLyB2YXIgcmFuZ2UgPSBnZXRSYW5nZU9mQWZmZWN0ZWRQYXRoRm9yTm9kZShub2RlcywgaW5kZXgpO1xuICAgICAgLy9cbiAgICAgIC8vIGNoYW5nZVBhdGhPZkRyYXdpbmcoZHJhd2luZywgaW5kZXgsIHBhdGhzVG9BZGQsIHJhbmdlKTtcbiAgICB9XG4gICAgc2VsZi5hZGROb2Rlc1RvRHJhd2luZyA9IHNlbGYuYWRkTm9kZVRvRHJhd2luZyA9IGFkZE5vZGVzVG9EcmF3aW5nO1xuICAgIFxuICAgIGZ1bmN0aW9uIHJlbW92ZURyYXdpbmdzKGRyYXdpbmdzLCBpbmRleCwgcmVtb3ZlTGVuZ3RoKSB7XG4gICAgICB2YXIgcmVtb3ZlZERyYXdpbmdzID0gc3BsaWNlKGRyYXdpbmdzLCBpbmRleCwgcmVtb3ZlTGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3ZlZERyYXdpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZW1vdmVkRHJhd2luZyA9IHJlbW92ZWREcmF3aW5nc1tpXTtcbiAgICAgICAgcmVtb3ZlTm9kZXNGcm9tRHJhd2luZyhyZW1vdmVkRHJhd2luZywgMCwgcmVtb3ZlZERyYXdpbmcubm9kZXMubGVuZ3RoKTtcbiAgICAgICAgcmVtb3ZlZERyYXdpbmcuX3BvbHkuc2V0TWFwKG51bGwpO1xuICAgICAgfVxuICAgIH1cbiAgICBzZWxmLnJlbW92ZURyYXdpbmdzID0gc2VsZi5yZW1vdmVEcmF3aW5nID0gcmVtb3ZlRHJhd2luZ3M7XG4gICAgXG4gICAgZnVuY3Rpb24gcmVtb3ZlTm9kZXNGcm9tRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgcmVtb3ZlTGVuZ3RoLCBwYXRoc1RvQWRkID0gbnVsbCkge1xuICAgICAgc3BsaWNlTm9kZXNJbnRvRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgcmVtb3ZlTGVuZ3RoLCBbXSwgcGF0aHNUb0FkZCk7XG4gICAgICAvLyB2YXIgbm9kZXMgPSBkcmF3aW5nLm5vZGVzLFxuICAgICAgLy8gICByYW5nZSA9IGdldFJhbmdlT2ZBZmZlY3RlZFBhdGhGb3JOb2RlKG5vZGVzLCBpbmRleCk7XG4gICAgICAvLyByZW1vdmVOb2Rlcyhub2RlcywgaW5kZXgsIHJlbW92ZUxlbmd0aCk7XG4gICAgICAvL1xuICAgICAgLy8gY2hhbmdlUGF0aE9mRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgcGF0aHNUb0FkZCwgcmFuZ2UpO1xuICAgIH1cbiAgICBzZWxmLnJlbW92ZU5vZGVzRnJvbURyYXdpbmcgPSBzZWxmLnJlbW92ZU5vZGVGcm9tRHJhd2luZyA9IHJlbW92ZU5vZGVzRnJvbURyYXdpbmc7XG4gICAgXG4gICAgZnVuY3Rpb24gY2hhbmdlTm9kZU9mRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgY2hhbmdlcywgcGF0aHNUb0FkZCA9IG51bGwpIHtcbiAgICAgIHZhciBub2RlID0gZHJhd2luZy5ub2Rlc1tpbmRleF07XG4gICAgICBjaGFuZ2VOb2RlKG5vZGUsIGNoYW5nZXMpO1xuICAgICAgc3BsaWNlTm9kZXNJbnRvRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgMSwgZHVwbGljYXRlTm9kZShkcmF3aW5nLCBub2RlKSwgcGF0aHNUb0FkZCk7XG4gICAgICAvLyB2YXIgcmFuZ2UgPSBnZXRSYW5nZU9mQWZmZWN0ZWRQYXRoRm9yTm9kZShkcmF3aW5nLm5vZGVzLCBpbmRleCk7XG4gICAgICAvLyBjaGFuZ2VOb2RlKGRyYXdpbmcubm9kZXNbaW5kZXhdLCBjaGFuZ2VzKTtcbiAgICAgIC8vXG4gICAgICAvLyBjaGFuZ2VQYXRoT2ZEcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBwYXRoc1RvQWRkLCByYW5nZSk7XG4gICAgfVxuICAgIHNlbGYuY2hhbmdlTm9kZU9mRHJhd2luZyA9IGNoYW5nZU5vZGVPZkRyYXdpbmc7XG4gICAgXG4gICAgZnVuY3Rpb24gY2hhbmdlUGF0aE9mRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgcGF0aHNUb0FkZCwgcmFuZ2UpIHtcbiAgICAgIGlmIChyYW5nZS5maXJzdE5vZGUgJiYgcmFuZ2UubGFzdE5vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICB2YXIgbm9kZXMgPSBkcmF3aW5nLm5vZGVzO1xuICAgICAgXG4gICAgICB2YXIgcHJvbWlzZSxcbiAgICAgICAgcGF0aCA9IGRyYXdpbmcuX3BvbHkuZ2V0UGF0aCgpLmdldEFycmF5KCksXG4gICAgICAgIHBhdGhJbmRleCA9IHJhbmdlLnN0YXJ0LFxuICAgICAgICBwYXRoUmVtb3ZlTGVuZ3RoID0gcmFuZ2UuZW5kIC0gcmFuZ2Uuc3RhcnQ7XG4gICAgICBcbiAgICAgIGlmIChwYXRoc1RvQWRkID09PSBudWxsKSB7XG4gICAgICAgIHByb21pc2UgPSBtYWtlUGF0aHNBcm91bmROb2Rlcyhub2RlcywgaW5kZXgsIGRyYXdpbmcucmlnaWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShwYXRoc1RvQWRkKTtcbiAgICAgICAgcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgICB9XG4gICAgXG4gICAgICBwcm9taXNlLnRoZW4oZnVuY3Rpb24ocGF0aHNUb0FkZCkge1xuICAgICAgICByZW1vdmVQb2ludHMocGF0aCwgcGF0aEluZGV4LCBwYXRoUmVtb3ZlTGVuZ3RoKTtcbiAgICAgICAgc2hpZnRJbmRleE9mTm9kZXMobm9kZXMsIHJhbmdlLmluZGV4T2ZBZmZlY3RlZE5vZGUgKyAxLCAtcGF0aFJlbW92ZUxlbmd0aCk7XG4gICAgICAgIFxuICAgICAgICB2YXIgc2hpZnRzID0gW10sXG4gICAgICAgICAgbm9kZUxvY2F0aW9ucyA9IFtdLFxuICAgICAgICAgIHBhdGhMZW5ndGgsXG4gICAgICAgICAgaSwgajtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHBhdGhzVG9BZGQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoaSA8IHBhdGhzVG9BZGQubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgbm9kZUxvY2F0aW9ucy5wdXNoKHBhdGhzVG9BZGRbaV0ucG9wKCkpO1xuICAgICAgICAgICAgcGF0aExlbmd0aCA9IHBhdGhzVG9BZGRbaV0ubGVuZ3RoO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwYXRoTGVuZ3RoID0gcGF0aHNUb0FkZC5sZW5ndGggLSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzaGlmdHMucHVzaChwYXRoTGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29tYmluZWRQYXRoID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5hcHBseShbXSwgcGF0aHNUb0FkZCk7XG4gICAgICAgIGFkZFBvaW50cyhwYXRoLCBwYXRoSW5kZXgsIGNvbWJpbmVkUGF0aCk7XG4gICAgICAgIHNoaWZ0SW5kZXhPZk5vZGVzKG5vZGVzLCByYW5nZS5pbmRleE9mQWZmZWN0ZWROb2RlICsgMSwgc2hpZnRzKTtcbiAgICAgICAgXG4gICAgICAgIGZvciAoaSA9IHJhbmdlLmluZGV4T2ZBZmZlY3RlZE5vZGUsIGogPSAwOyBqIDwgbm9kZUxvY2F0aW9ucy5sZW5ndGg7IGkrKywgaisrKSB7XG4gICAgICAgICAgY2hhbmdlTm9kZShub2Rlc1tpXSwge1xuICAgICAgICAgICAgbGF0OiBub2RlTG9jYXRpb25zW2pdLmxhdCgpLFxuICAgICAgICAgICAgbG5nOiBub2RlTG9jYXRpb25zW2pdLmxuZygpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZm9yIChpID0gMTsgaSA8IHBhdGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gICBpZiAocGF0aFtpIC0gMV0uZXF1YWxzKHBhdGhbaV0pKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLndhcm4oYFBvaW50ICR7aSAtIDF9IGFuZCAke2l9IGFyZSB0aGUgc2FtZWAsIHBhdGhbaV0pO1xuICAgICAgICAvLyAgIH1cbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBjb25zb2xlLmluZm8ocGF0aCk7XG4gICAgICAgIFxuICAgICAgICBcbiAgICAgICAgZHJhd2luZy5fcG9seS5zZXRQYXRoKHBhdGgpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIGNoYW5nZURyYXdpbmcoZHJhd2luZywgY2hhbmdlcykge1xuICAgICAgY2hhbmdlKGRyYXdpbmcsIGNoYW5nZXMpO1xuICAgICAgXG4gICAgICBmb3IgKHZhciBrZXkgaW4gY2hhbmdlcykge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICBjYXNlICdjb2xvckluZGV4JzpcbiAgICAgICAgY2FzZSAnZmlsbCc6XG4gICAgICAgICAgdmFyIG9wdGlvbnMgPSBtYWtlUG9seU9wdGlvbnMoZHJhd2luZy5jb2xvckluZGV4LCBkcmF3aW5nLmZpbGwpO1xuICAgICAgICAgIGRyYXdpbmcuX3BvbHkuc2V0T3B0aW9ucyhvcHRpb25zKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncmlnaWQnOlxuICAgICAgICAgIFxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIGZ1bmN0aW9uIHNwbGljZURyYXdpbmcoZHJhd2luZ0luZGV4LCByZW1vdmVMZW5ndGgsIG5ld0RyYXdpbmcpIHtcbiAgICAvLyAgIGlmIChyZW1vdmVMZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIC8vICAgICByZW1vdmVMZW5ndGggPSBzZWxmLmRyYXdpbmdzLmxlbmd0aDtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgdmFyIHJlbW92ZWQgPSBkcmF3aW5ncy5zbGljZShkcmF3aW5nSW5kZXgsIGRyYXdpbmdJbmRleCArIHJlbW92ZUxlbmd0aCk7IC8vIEdldCBvYnNlbGV0ZSBkcmF3aW5nc1xuICAgIC8vXG4gICAgLy8gICAvLyBSZW1vdmUgb2JzZWxldGUgZHJhd2luZ3MgZnJvbSBtYXBcbiAgICAvLyAgIGZvciAodmFyIGkgaW4gcmVtb3ZlZCkge1xuICAgIC8vICAgICByZW1vdmVkW2ldLl9wb2x5LnNldE1hcChudWxsKTtcbiAgICAvL1xuICAgIC8vICAgICAvLyBSZW1vdmUgYWxsIG5vZGVzIG9mIGRyYXdpbmdcbiAgICAvLyAgICAgc3BsaWNlTm9kZShpLCAwKTtcbiAgICAvLyAgIH1cbiAgICAvL1xuICAgIC8vICAgdmFyIGFyZ3MgPSBbZHJhd2luZ0luZGV4LCByZW1vdmVMZW5ndGhdO1xuICAgIC8vICAgaWYgKG5ld0RyYXdpbmcpIHtcbiAgICAvLyAgICAgYXJncy5wdXNoKG5ld0RyYXdpbmcpO1xuICAgIC8vICAgfVxuICAgIC8vICAgQXJyYXkucHJvdG90eXBlLnNwbGljZVxuICAgIC8vICAgICAuYXBwbHkoZHJhd2luZ3MsIGFyZ3MpOyAvLyBSZW1vdmUgb2JzZWxldGUgZHJhd2luZ3NcbiAgICAvLyB9XG5cbiAgICBmdW5jdGlvbiBkcmF3aW5nc1RvR2VvSnNvbihkcmF3aW5ncykge1xuICAgICAgdmFyIHN0b3JhYmxlRHJhd2luZ3MgPSBbXTtcblxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBkcmF3aW5ncy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZHJhd2luZyA9IGRyYXdpbmdzW2ldO1xuICAgICAgICB2YXIgc3RvcmFibGVEcmF3aW5nID0ge307XG4gICAgICAgIFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZHJhd2luZykge1xuICAgICAgICAgIGlmIChrZXkgPT09ICdfcG9seScpIHtcbiAgICAgICAgICAgIHN0b3JhYmxlRHJhd2luZy5wYXRoID0gTWFwU3ZjLmdlb21ldHJ5LmVuY29kaW5nLmVuY29kZVBhdGgoZHJhd2luZy5fcG9seS5nZXRQYXRoKCkpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbm9kZXMnKSB7XG4gICAgICAgICAgICB2YXIgc3RvcmFibGVOb2RlcyA9IFtdO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGRyYXdpbmcubm9kZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgdmFyIG5vZGUgPSBkcmF3aW5nLm5vZGVzW2pdO1xuICAgICAgICAgICAgICB2YXIgc3RvcmFibGVOb2RlID0ge307XG4gICAgICAgICAgICAgIGZvciAodmFyIG5vZGVLZXkgaW4gbm9kZSkge1xuICAgICAgICAgICAgICAgIGlmIChrZXlbMF0gIT09ICdfJyAmJiBrZXlbMF0gIT09ICckJyAmJiBub2RlLmhhc093blByb3BlcnR5KG5vZGVLZXkpKSB7XG4gICAgICAgICAgICAgICAgICBzdG9yYWJsZU5vZGVbbm9kZUtleV0gPSBub2RlW25vZGVLZXldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgc3RvcmFibGVOb2Rlc1tpXSA9IHN0b3JhYmxlTm9kZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGRyYXdpbmcuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgc3RvcmFibGVEcmF3aW5nW2tleV0gPSBkcmF3aW5nW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICByZXR1cm4gc3RvcmFibGVEcmF3aW5nO1xuICAgICAgfVxuXG4gICAgICAkbG9jYWxTdG9yYWdlLmRyYXdpbmdzID0gc3RvcmFibGVEcmF3aW5ncztcbiAgICB9XG4gICAgZnVuY3Rpb24gZ2VvSnNvblRvRHJhd2luZ3MoZHJhd2luZ3MpIHtcbiAgICAgIHZhciBzdG9yZWREcmF3aW5ncyA9ICRsb2NhbFN0b3JhZ2UuZHJhd2luZ3MgfHwge307XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0b3JlZERyYXdpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBzdG9yZWREcmF3aW5nID0gc3RvcmVkRHJhd2luZ3NbaV07XG4gICAgICAgIHZhciBwYXRoID0gTWFwU3ZjLmdlb21ldHJ5LmVuY29kaW5nLmRlY29kZVBhdGgoc3RvcmVkRHJhd2luZy5wYXRoKTtcbiAgICAgICAgdmFyIGRyYXdpbmcgPSBzZWxmLm1ha2VEcmF3aW5nKHN0b3JlZERyYXdpbmcuY29sb3JJbmRleCwgc3RvcmVkRHJhd2luZy5yaWdpZCxcbiAgICAgICAgICBzdG9yZWREcmF3aW5nLmZpbGwsIHBhdGgpO1xuICAgICAgICAgIFxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHN0b3JlZERyYXdpbmcubm9kZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICB2YXIgc3RvcmVkTm9kZSA9IHN0b3JlZERyYXdpbmdbal07XG4gICAgICAgICAgdmFyIGxhdExuZyA9IG5ldyBNYXBTdmMuTGF0TG5nKHN0b3JlZE5vZGUubGF0LCBzdG9yZWROb2RlLmxuZyk7XG4gICAgICAgICAgdmFyIG5vZGUgPSBzZWxmLm1ha2VOb2RlKHN0b3JlZERyYXdpbmcuY29sb3JJbmRleCwgbGF0TG5nKTtcbiAgICAgICAgICBcbiAgICAgICAgICBkcmF3aW5nLm5vZGVzLnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHNlbGYuZHJhd2luZ3MucHVzaChkcmF3aW5nKTtcbiAgICAgIH1cbiAgICAgIFxuICAgIH1cbiAgICBcbiAgICAvLyBmdW5jdGlvbihwYXRoUmVzdWx0cykge1xuICAgIC8vICAgaWYgKHBhdGhSZXN1bHRzLmxlbmd0aCA9PT0gMikge1xuICAgIC8vICAgICBwYXRoUmVzdWx0c1sxXS5zaGlmdCgpO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICBcbiAgICAvL1xuICAgIC8vICAgbmV3UGF0aCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHBhdGhSZXN1bHRzKTtcbiAgICAvL1xuICAgIC8vICAgLy8gV2lsbCBhbHRlciBvcmlnaW5hbCBwYXRoXG4gICAgLy8gICBzZWxmLnNwbGljZVBhdGgocG9seVBhdGgsIHNwbGljZUluZGV4LCAwLCBuZXdQYXRoKTtcbiAgICAvL1xuICAgIC8vICAgbmV3Tm9kZS5fbWFya2VyLnNldFBvc2l0aW9uKG5vZGVBdEluZGV4TWFya2VyUG9zaXRpb24pO1xuICAgIC8vICAgZHJhd2luZy5fcG9seS5zZXRQYXRoKHBvbHlQYXRoKTtcbiAgICAvL1xuICAgIC8vICAgc2F2ZURyYXdpbmdzKCk7XG4gICAgLy8gfVxuXG4gICAgZnVuY3Rpb24gcmdiYUNvbG9yVG9TdHJpbmcocmdiYSkge1xuICAgICAgcmV0dXJuIGByZ2JhKCR7cmdiYS5yKjEwMH0lLCR7cmdiYS5nKjEwMH0lLCR7cmdiYS5iKjEwMH0lLCR7cmdiYS5hfSlgO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNoaWZ0SW5kaWNlcyhhcnJheSwgaW5kZXgsIHNoaWZ0KSB7XG4gICAgICBmb3IgKHZhciBpID0gaW5kZXg7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBhcnJheVtpXS5pbmRleCArPSBzaGlmdDtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgZnVuY3Rpb24gbWFrZUljb24oY29sb3JJbmRleCkge1xuICAgICAgdmFyIGNvbG9yID0gQ29sb3JTdmMuY29sb3JzW2NvbG9ySW5kZXhdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcGF0aDogTWFwU3ZjLlN5bWJvbFBhdGguQ0lSQ0xFLFxuICAgICAgICBzY2FsZTogMTAsXG4gICAgICAgIHN0cm9rZUNvbG9yOiAnIycgKyBDb2xvclN2Yy5jb252ZXJ0LnJnYmEoY29sb3IpLnRvLmhleDI0KCksXG4gICAgICAgIHN0cm9rZU9wYWNpdHk6IDEsXG4gICAgICAgIHN0cm9rZVdlaWdodDogMi41XG4gICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBtYWtlTWFya2VyT3B0aW9ucyhjb2xvckluZGV4LCBsYXRMbmcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNsaWNrYWJsZTogdHJ1ZSxcbiAgICAgICAgY3Jvc3NPbkRyYWc6IGZhbHNlLFxuICAgICAgICBjdXJzb3I6ICdwb2ludGVyJyxcbiAgICAgICAgZHJhZ2dhYmxlOiB0cnVlLFxuICAgICAgICBmbGF0OiB0cnVlLFxuICAgICAgICBpY29uOiBtYWtlSWNvbihjb2xvckluZGV4KSxcbiAgICAgICAgbWFwOiBNYXBTdmMubWFwLFxuICAgICAgICBwb3NpdGlvbjogbGF0TG5nXG4gICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBtYWtlUG9seU9wdGlvbnMoY29sb3JJbmRleCwgZmlsbCkge1xuICAgICAgdmFyIHZhbHVlID0ge1xuICAgICAgICBjbGlja2FibGU6IHRydWUsXG4gICAgICAgIGRyYWdnYWJsZTogZmFsc2UsXG4gICAgICAgIGVkaXRhYmxlOiBmYWxzZSxcbiAgICAgICAgbWFwOiBNYXBTdmMubWFwXG4gICAgICB9O1xuXG4gICAgICB2YXIgY29sb3IgPSBDb2xvclN2Yy5jb2xvcnNbY29sb3JJbmRleF07XG4gICAgICBcbiAgICAgIGlmIChmaWxsKSB7XG4gICAgICAgIHZhbHVlLmZpbGxDb2xvciA9IHJnYmFDb2xvclRvU3RyaW5nKGNvbG9yKTtcbiAgICAgICAgdmFsdWUuc3Ryb2tlV2VpZ2h0ID0gMDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlLnN0cm9rZUNvbG9yID0gcmdiYUNvbG9yVG9TdHJpbmcoY29sb3IpO1xuICAgICAgICB2YWx1ZS5zdHJva2VXZWlnaHQgPSBjb2xvci53ZWlnaHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gIH0pXG5cbi8vIENvbnRyb2xsZXJzXG4uY29udHJvbGxlcignRHJhd2luZ0N0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhbFN0b3JhZ2UsIERyYXdpbmdTdmMsIENvbG9yU3ZjLCBIaXN0b3J5U3ZjKSB7XG4gICRzY29wZS4kc3RvcmFnZSA9ICRsb2NhbFN0b3JhZ2UuJGRlZmF1bHQoe1xuICAgIGRyYXdpbmdzOiBbXSxcbiAgICByaWdpZDogZmFsc2UsXG4gICAgY29sb3JzOiBbe1xuICAgICAgcjogMSxcbiAgICAgIGc6IDAsXG4gICAgICBiOiAwLFxuICAgICAgYTogMC4xMjUsXG4gICAgICB3ZWlnaHQ6IDEwXG4gICAgfSwge1xuICAgICAgcjogMCxcbiAgICAgIGc6IDEsXG4gICAgICBiOiAwLFxuICAgICAgYTogMC4xMjUsXG4gICAgICB3ZWlnaHQ6IDEwXG4gICAgfSwge1xuICAgICAgcjogMCxcbiAgICAgIGc6IDAsXG4gICAgICBiOiAxLFxuICAgICAgYTogMC4xMjUsXG4gICAgICB3ZWlnaHQ6IDEwXG4gICAgfV0sXG4gICAgYWN0aXZlQ29sb3I6IDFcbiAgfSk7XG4gIHZhciBkcmF3aW5ncyA9ICRzY29wZS5kcmF3aW5ncyA9IFtdO1xuICBcbiAgdmFyIGFjdGl2ZURyYXdpbmdJbmRleCA9IC0xO1xuICAvLyAkc2NvcGUuJHN0b3JhZ2UgPSBEcmF3aW5nU3ZjLmxvYWREcmF3aW5ncygpO1xuXG4gIGZ1bmN0aW9uIGFkZE5vZGUoZXZlbnQsIHBhcmFtKSB7XG4gICAgdmFyIGNvbG9ySW5kZXggPSAkc2NvcGUuJHN0b3JhZ2UuYWN0aXZlQ29sb3I7XG5cbiAgICAvLyBUT0RPOiBhY3R1YWwgdmFyaWFibGUgdmFsdWVzXG4gICAgdmFyIHJpZ2lkID0gZmFsc2UsXG4gICAgICBmaWxsID0gZmFsc2U7XG5cbiAgICBpZiAoc2hvdWxkQ3JlYXRlTmV3RHJhd2luZygpKSB7XG4gICAgICB2YXIgbmV3RHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoY29sb3JJbmRleCwgcmlnaWQsIGZpbGwpO1xuICAgICAgYWN0aXZlRHJhd2luZ0luZGV4Kys7XG4gICAgICBEcmF3aW5nU3ZjLmFkZERyYXdpbmcoZHJhd2luZ3MsIGFjdGl2ZURyYXdpbmdJbmRleCwgbmV3RHJhd2luZyk7XG4gICAgfVxuICAgIFxuICAgIHZhciBkcmF3aW5nID0gZHJhd2luZ3NbYWN0aXZlRHJhd2luZ0luZGV4XTtcbiAgICB2YXIgbmV3Tm9kZSA9IERyYXdpbmdTdmMubWFrZU5vZGUoY29sb3JJbmRleCwgcGFyYW0ubGF0TG5nKTtcbiAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgZHJhd2luZy5ub2Rlcy5sZW5ndGgsIG5ld05vZGUpO1xuICAgIFxuICAgIHJldHVybjtcbiAgICBcbiAgICAvLyBIaXN0b3J5U3ZjLmFkZCh7XG4gICAgLy8gICB1bmRvOiBmdW5jdGlvbihkcmF3aW5nLCBub2RlSW5kZXgsIGRpZENyZWF0ZU5ld0RyYXdpbmcpIHtcbiAgICAvLyAgICAgRHJhd2luZ1N2Yy5zcGxpY2VOb2RlKGRyYXdpbmdJbmRleCwgbm9kZUluZGV4LCAxKTtcbiAgICAvLyAgICAgaWYgKGRpZENyZWF0ZU5ld0RyYXdpbmcpIHtcbiAgICAvLyAgICAgICBEcmF3aW5nU3ZjLnNwbGljZURyYXdpbmcoZHJhd2luZ0luZGV4LCAxKTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgfS5iaW5kKG51bGwsIGxhc3REcmF3aW5nSW5kZXgsIG5ld05vZGVJbmRleCwgc2hvdWxkQ3JlYXRlTmV3RHJhd2luZygpKSxcbiAgICAvLyAgIHJlZG86IGZ1bmN0aW9uKGRyYXdpbmdJbmRleCwgbm9kZUluZGV4LCBuZXdOb2RlKSB7XG4gICAgLy8gICAgIERyYXdpbmdTdmMuc3BsaWNlTm9kZShkcmF3aW5nSW5kZXgsIG5vZGVJbmRleCwgMCwgbmV3Tm9kZSk7XG4gICAgLy8gICB9LmJpbmQobnVsbCwgbGFzdERyYXdpbmdJbmRleCwgbmV3Tm9kZUluZGV4LCBuZXdOb2RlKVxuICAgIC8vIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGNoYW5nZU5vZGUoJHBhcmFtcywgZHJhd2luZ0luZGV4LCBub2RlSW5kZXgpIHtcbiAgICB2YXIgZXZlbnQgPSAkcGFyYW1zWzBdLFxuICAgICAgZHJhd2luZyA9IGRyYXdpbmdzW2RyYXdpbmdJbmRleF0sXG4gICAgICBvcmlnaW5hbE5vZGUgPSBkcmF3aW5nLm5vZGVzW25vZGVJbmRleF0sXG4gICAgICBsYXRMbmcgPSBldmVudC5sYXRMbmc7XG4gICAgXG4gICAgRHJhd2luZ1N2Yy5jaGFuZ2VOb2RlT2ZEcmF3aW5nKGRyYXdpbmcsIG5vZGVJbmRleCwge1xuICAgICAgbGF0OiBsYXRMbmcubGF0KCksXG4gICAgICBsbmc6IGxhdExuZy5sbmcoKVxuICAgIH0pO1xuICAgIFxuICAgIC8vIEhpc3RvcnlTdmMuYWRkKHtcbiAgICAvLyAgIHVuZG86IGZ1bmN0aW9uKGRyYXdpbmdJbmRleCwgbm9kZUluZGV4LCBvcmlnaW5hbE5vZGUpIHtcbiAgICAvLyAgICAgRHJhd2luZ1N2Yy5zcGxpY2VOb2RlKGRyYXdpbmdJbmRleCwgbm9kZUluZGV4LCAxLCBvcmlnaW5hbE5vZGUpO1xuICAgIC8vICAgfS5iaW5kKG51bGwsIGRyYXdpbmdJbmRleCwgbm9kZUluZGV4LCBvcmlnaW5hbE5vZGUpLFxuICAgIC8vICAgcmVkbzogZnVuY3Rpb24oZHJhd2luZ0luZGV4LCBub2RlSW5kZXgsIG5ld05vZGUpIHtcbiAgICAvLyAgICAgRHJhd2luZ1N2Yy5zcGxpY2VOb2RlKGRyYXdpbmdJbmRleCwgbm9kZUluZGV4LCAxLCBuZXdOb2RlKTtcbiAgICAvLyAgIH0uYmluZChudWxsLCBkcmF3aW5nSW5kZXgsIG5vZGVJbmRleCwgbmV3Tm9kZSlcbiAgICAvLyB9KTtcbiAgfVxuICBmdW5jdGlvbiBzaG91bGRDcmVhdGVOZXdEcmF3aW5nKCkge1xuICAgIGlmIChkcmF3aW5ncy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICB2YXIgbGF0ZXN0RHJhd2luZyA9IGRyYXdpbmdzW2RyYXdpbmdzLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiAobGF0ZXN0RHJhd2luZyAmJiBsYXRlc3REcmF3aW5nLmNvbG9ySW5kZXggIT09IENvbG9yU3ZjLmFjdGl2ZUNvbG9ySW5kZXgpO1xuICB9XG4gICRzY29wZS4kb24oJ21hcDpjbGljaycsIGFkZE5vZGUpO1xuICAkc2NvcGUuJG9uKCdhY3Rpb246Y2xlYXInLCBmdW5jdGlvbigkcGFyYW1zKSB7XG4gICAgRHJhd2luZ1N2Yy5yZW1vdmVEcmF3aW5ncyhkcmF3aW5ncywgMCwgZHJhd2luZ3MubGVuZ3RoKTtcbiAgICBhY3RpdmVEcmF3aW5nSW5kZXggPSAtMTtcbiAgfSk7XG5cbiAgJHNjb3BlLm1hcmtlciA9IHtcbiAgICBjbGljazogZnVuY3Rpb24oJHBhcmFtcykge1xuICAgICAgYWRkTm9kZSh1bmRlZmluZWQsICRwYXJhbXNbMF0pO1xuICAgIH0sXG4gICAgZHJhZ2VuZDogY2hhbmdlTm9kZVxuICB9O1xuICAkc2NvcGUucG9seSA9IHtcbiAgICBjbGljazogZnVuY3Rpb24oJHBhcmFtcykge1xuXG4gICAgfVxuICB9O1xufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=