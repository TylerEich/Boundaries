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
        shift += shifts[i];
        nodeArray[index + i].index += shift;
      }
    } else {
      shift = shifts;
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
      nodeStart: null,
      nodeEnd: null,
      nodeLength: null,
      lastNode: false,
      firstNode: false
    };
    var nodeRange = nodes.slice(start, end),
        firstNodeInRange = nodeRange[0],
        lastNodeInRange = nodeRange[nodeRange.length - 1],
        nodeBeforeRange = nodes[start - 1],
        nodeAfterRange = nodes[end];
    if (!nodeBeforeRange) {
      range.firstNode = true;
    }
    if (nodeBeforeRange && nodeBeforeRange.index !== null) {
      range.start = nodeBeforeRange.index;
      range.nodeStart = start;
    } else if (firstNodeInRange && firstNodeInRange.index !== null) {
      range.start = firstNodeInRange.index;
      range.nodeStart = start + 1;
    } else {
      range.start = 0;
      range.nodeStart = 0;
    }
    if (!nodeAfterRange) {
      range.lastNode = true;
    }
    if (nodeAfterRange && nodeAfterRange.index !== null) {
      range.end = nodeAfterRange.index;
      range.nodeEnd = end;
    } else if (lastNodeInRange && lastNodeInRange.index !== null) {
      range.end = lastNodeInRange.index;
      range.nodeEnd = end - 1;
    } else {
      range.end = range.start;
      range.nodeEnd = range.nodeStart;
    }
    range.nodeLength = range.nodeEnd - range.nodeStart;
    range.length = range.end - range.start;
    return range;
  }
  function rangeOfPathAroundNode(nodes, index) {
    return rangeOfPathAroundNodes(nodes, index, index);
  }
  function makePathsAroundNodes(nodes, start, end, rigid) {
    var points = [],
        nodeRange = nodes.slice(start, end),
        nodeBefore = nodes[start - 1],
        nodeAfter = nodes[end],
        node;
    if (nodeBefore) {
      points.push(makePoint(nodeBefore));
    }
    for (var $__0 = nodeRange[Symbol.iterator](),
        $__1; !($__1 = $__0.next()).done; ) {
      node = $__1.value;
      {
        points.push(makePoint(node));
      }
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
    if (nodeRemoveLength !== 0)
      debugger;
    var range = rangeOfPathAroundNodes(drawing.nodes, index, index + nodeRemoveLength);
    if (nodeRemoveLength === 0 && range.firstNode && !range.lastNode) {
      return;
    }
    var path = drawing._poly.getPath().getArray(),
        pathRemoveLength = range.length;
    if (range.lastNode) {
      pathRemoveLength++;
    }
    removePoints(path, range.start, pathRemoveLength);
    shiftIndexOfNodes(drawing.nodes, range.nodeStart, -range.length);
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
    promise = promise.then(function(drawing, index, newNodes, newPaths) {
      var polyPath = drawing._poly.getPath().getArray(),
          nodes = drawing.nodes;
      var shifts = [];
      var path,
          lastPoint,
          i,
          pathRange = rangeOfPathAroundNodes(nodes, index, index + newNodes.length),
          pathIndex = pathRange.start;
      for (var $__0 = newPaths[Symbol.iterator](),
          $__1; !($__1 = $__0.next()).done; ) {
        path = $__1.value;
        {
          lastPoint = path.pop();
          addPoints(polyPath, pathIndex, path);
          pathIndex += path.length;
          shifts.push(path.length);
        }
      }
      var alignLength = newPaths.length;
      shiftIndexOfNodes(nodes, pathRange.nodeStart, shifts);
      if (pathRange.lastNode && lastPoint) {
        polyPath.push(lastPoint);
        alignLength++;
      }
      var nodesToAlign = nodes.slice(index, index + alignLength);
      alignNodesWithPath(polyPath, nodesToAlign);
      drawing._poly.setPath(polyPath);
      return polyPath;
    }.bind(null, drawing, index, newNodes));
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
    return spliceNodesIntoDrawing(drawing, index, removeLength, [], pathsToAdd);
  }
  self.removeNodesFromDrawing = self.removeNodeFromDrawing = removeNodesFromDrawing;
  function changeNodeOfDrawing(drawing, index, changes) {
    var pathsToAdd = arguments[3] !== (void 0) ? arguments[3] : null;
    var node = drawing.nodes[index];
    changeNode(node, changes);
    return spliceNodesIntoDrawing(drawing, index, 1, duplicateNode(drawing, node), pathsToAdd);
  }
  self.changeNodeOfDrawing = changeNodeOfDrawing;
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

//# sourceMappingURL=../../sourcemaps/drawing/drawing.js.map