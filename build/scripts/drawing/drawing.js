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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy9kcmF3aW5nLmpzIiwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsInNvdXJjZXMiOlsiZHJhd2luZy9kcmF3aW5nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG5cbmFuZ3VsYXIubW9kdWxlKCdibmRyeS5kcmF3aW5nJywgWyduZ1N0b3JhZ2UnLCAnYm5kcnkubWFwJywgJ2JuZHJ5LmNvbG9yJywgJ2JuZHJ5Lmhpc3RvcnknXSlcbiAgLnNlcnZpY2UoJ0RpcmVjdGlvbnNTdmMnLCBmdW5jdGlvbigkcSwgTWFwU3ZjKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBkaXJlY3Rpb25zID0gbmV3IE1hcFN2Yy5EaXJlY3Rpb25zU2VydmljZSgpO1xuXG4gICAgc2VsZi5yb3V0ZSA9IGZ1bmN0aW9uKGxvY2F0aW9ucykge1xuICAgICAgaWYgKGxvY2F0aW9ucy5sZW5ndGggIT09IDIpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignUmVxdWlyZXMgZXhhY3RseSAyIGxvY2F0aW9ucy4nKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVxdWVzdCA9IHtcbiAgICAgICAgb3JpZ2luOiBsb2NhdGlvbnNbMF0sXG4gICAgICAgIGRlc3RpbmF0aW9uOiBsb2NhdGlvbnNbMV0sXG4gICAgICAgIHRyYXZlbE1vZGU6IE1hcFN2Yy5UcmF2ZWxNb2RlLkRSSVZJTkdcbiAgICAgIH07XG5cbiAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG5cbiAgICAgIGZ1bmN0aW9uIHByb2Nlc3NSZXF1ZXN0KHRyaWVzKSB7XG4gICAgICAgIGRpcmVjdGlvbnMucm91dGUocmVxdWVzdCxcbiAgICAgICAgICAvLyBTdWNjZXNzIGhhbmRsZXJcblxuICAgICAgICAgIGZ1bmN0aW9uKHJlc3VsdCwgc3RhdHVzKSB7XG4gICAgICAgICAgICBpZiAoc3RhdHVzID09PSBNYXBTdmMuRGlyZWN0aW9uc1N0YXR1cy5PSykge1xuICAgICAgICAgICAgICB2YXIgb3ZlcnZpZXdQYXRoID0gcmVzdWx0LnJvdXRlc1swXS5vdmVydmlld19wYXRoO1xuXG4gICAgICAgICAgICAgIC8vIFJlc29sdmUgd2l0aCBwYXRoXG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUob3ZlcnZpZXdQYXRoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc3RhdHVzID09PVxuICAgICAgICAgICAgICBNYXBTdmMuRGlyZWN0aW9uc1N0YXR1cy5VTktOT1dOX0VSUk9SICYmIHRyaWVzIDwgMykge1xuICAgICAgICAgICAgICB0cmllcysrO1xuICAgICAgICAgICAgICAvLyBUcnkgYWdhaW5cbiAgICAgICAgICAgICAgcHJvY2Vzc1JlcXVlc3QodHJpZXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICAvLyBFcnJvciBoYW5kbGVyXG5cbiAgICAgICAgICBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICh0cmllcyA8IDMpIHtcbiAgICAgICAgICAgICAgLy8gVHJ5IGFnYWluXG4gICAgICAgICAgICAgIHRyaWVzKys7XG4gICAgICAgICAgICAgIHByb2Nlc3NSZXF1ZXN0KHRyaWVzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBwcm9jZXNzUmVxdWVzdCgwKTtcblxuICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgfTtcbiAgfSlcbiAgLnNlcnZpY2UoJ0RyYXdpbmdTdmMnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkcSwgJGxvY2FsU3RvcmFnZSwgRGlyZWN0aW9uc1N2YywgTWFwU3ZjLCBDb2xvclN2Yykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIGZ1bmN0aW9uIHNwbGljZShpdGVtQXJyYXksIGluZGV4ID0gMCwgcmVtb3ZlTGVuZ3RoID0gMCwgbmV3SXRlbXMgPSBbXSkge1xuICAgICAgdmFyIGFyZ3MgPSBbaW5kZXgsIHJlbW92ZUxlbmd0aF0uY29uY2F0KG5ld0l0ZW1zKTtcbiAgICAgIFxuICAgICAgcmV0dXJuIEFycmF5LnByb3RvdHlwZS5zcGxpY2UuYXBwbHkoaXRlbUFycmF5LCBhcmdzKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3BsaWNlUGFzc1RocnUoaXRlbUFycmF5KSB7XG4gICAgICB2YXIgYXJncyA9IFtpdGVtQXJyYXldLmNvbmNhdChhcmd1bWVudHMpO1xuICAgICAgc3BsaWNlLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgcmV0dXJuIGl0ZW1BcnJheTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2hhbmdlKG9iamVjdCwgY2hhbmdlcykge1xuICAgICAgZm9yICh2YXIga2V5IGluIGNoYW5nZXMpIHtcbiAgICAgICAgaWYgKGNoYW5nZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIG9iamVjdFtrZXldID0gY2hhbmdlc1trZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIC8qIERyYXdpbmdTdmMgaGllcmFyY2h5OlxuICAgICB8IC0gZHJhd2luZ3NcbiAgICAgICB8IC0gbm9kZXNcbiAgICAgICB8IC0gcGF0aFxuICAgICovXG4gICAgXG4gICAgLypcbiAgICAqKiogUFJJVkFURSBNRVRIT0RTICoqKlxuICAgICovXG4gICAgLy8gUGF0aCBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBtYWtlUG9pbnQobGF0TG5nKSB7XG4gICAgICBjb25zb2xlLmFzc2VydChcbiAgICAgICAgJ2xhdCcgaW4gbGF0TG5nICYmXG4gICAgICAgICdsbmcnIGluIGxhdExuZyAmJlxuICAgICAgICB0eXBlb2YgbGF0TG5nLmxhdCA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgdHlwZW9mIGxhdExuZy5sYXQgPT09ICdudW1iZXInLFxuICAgICAgICBcbiAgICAgICAgJ2xhdExuZyBpcyBub3QgZm9ybWF0dGVkIHByb3Blcmx5J1xuICAgICAgKTtcbiAgICAgIHJldHVybiBuZXcgTWFwU3ZjLkxhdExuZyhsYXRMbmcubGF0LCBsYXRMbmcubG5nKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWFrZVBhdGhzKGxvY2F0aW9ucywgcmlnaWQgPSBmYWxzZSkge1xuICAgICAgY29uc29sZS5hc3NlcnQoXG4gICAgICAgIEFycmF5LmlzQXJyYXkobG9jYXRpb25zKSxcbiAgICAgICAgXG4gICAgICAgICdsb2NhdGlvbnMgaXMgbm90IGFuIEFycmF5J1xuICAgICAgKTtcbiAgICAgIFxuICAgICAgdmFyIHByb21pc2VzID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxvY2F0aW9ucy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdmFyIHN0YXJ0ID0gbG9jYXRpb25zW2ldLFxuICAgICAgICAgIGVuZCA9IGxvY2F0aW9uc1tpICsgMV0sXG4gICAgICAgICAgcHJvbWlzZTtcbiAgICAgICAgXG4gICAgICAgIGlmIChyaWdpZCkge1xuICAgICAgICAgIHByb21pc2UgPSBzdGFydC5lcXVhbHMoZW5kKSA/XG4gICAgICAgICAgICAkcS53aGVuKFtzdGFydF0pIDpcbiAgICAgICAgICAgICRxLndoZW4oW3N0YXJ0LCBlbmRdKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwcm9taXNlID0gRGlyZWN0aW9uc1N2Yy5yb3V0ZShbc3RhcnQsIGVuZF0pO1xuICAgICAgICB9XG4gICAgICAgIHByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiAkcS5hbGwocHJvbWlzZXMpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhZGRQb2ludHMocGF0aCwgaW5kZXgsIHBvaW50cykge1xuICAgICAgcmV0dXJuIHNwbGljZShwYXRoLCBpbmRleCwgMCwgcG9pbnRzKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlUG9pbnRzKHBhdGgsIGluZGV4LCByZW1vdmVMZW5ndGgpIHtcbiAgICAgIHJldHVybiBzcGxpY2UocGF0aCwgaW5kZXgsIHJlbW92ZUxlbmd0aCk7XG4gICAgfVxuXG4gICAgLy8gTm9kZSBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBhcnJheWlmeShub2Rlcykge1xuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KG5vZGVzKSkge1xuICAgICAgICByZXR1cm4gW25vZGVzXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBub2RlcztcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkTm9kZXMobm9kZXMsIGluZGV4LCBub2Rlc1RvQWRkKSB7XG4gICAgICBzcGxpY2Uobm9kZXMsIGluZGV4LCAwLCBub2Rlc1RvQWRkKTtcbiAgICB9XG4gICAgdmFyIGFkZE5vZGUgPSBhZGROb2RlcztcbiAgICBcbiAgICBmdW5jdGlvbiByZW1vdmVOb2Rlcyhub2RlcywgaW5kZXgsIHJlbW92ZUxlbmd0aCA9IDEpIHtcbiAgICAgIHZhciByZW1vdmVkID0gc3BsaWNlKG5vZGVzLCBpbmRleCwgcmVtb3ZlTGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVtb3ZlZC5sZW5ndGg7IGkrKykge1xuICAgICAgICByZW1vdmVkW2ldLl9tYXJrZXIuc2V0TWFwKG51bGwpO1xuICAgICAgfVxuICAgIH1cbiAgICB2YXIgcmVtb3ZlTm9kZSA9IHJlbW92ZU5vZGVzO1xuICAgIFxuICAgIGZ1bmN0aW9uIGNoYW5nZU5vZGUobm9kZSwgY2hhbmdlcykge1xuICAgICAgY29uc29sZS5hc3NlcnQoXG4gICAgICAgIHR5cGVvZiBub2RlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICB0eXBlb2YgY2hhbmdlcyA9PT0gJ29iamVjdCcsXG4gICAgICAgIFxuICAgICAgICAnSW52YWxpZCBwYXJhbWV0ZXJzJ1xuICAgICAgKVxuICAgICAgY2hhbmdlKG5vZGUsIGNoYW5nZXMpO1xuICAgICAgZm9yICh2YXIga2V5IGluIGNoYW5nZXMpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnbGF0JzpcbiAgICAgICAgY2FzZSAnbG5nJzpcbiAgICAgICAgICBub2RlLl9tYXJrZXIuc2V0UG9zaXRpb24obWFrZVBvaW50KG5vZGUpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkdXBsaWNhdGVOb2RlKGRyYXdpbmcsIG5vZGUpIHtcbiAgICAgIHJldHVybiBtYWtlTm9kZShkcmF3aW5nLmNvbG9ySW5kZXgsIG1ha2VQb2ludChub2RlKSwgbm9kZS5pbmRleCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHNoaWZ0SW5kZXhPZk5vZGVzKG5vZGVzLCBpbmRleCwgc2hpZnRzKSB7XG4gICAgICB2YXIgbm9kZUFycmF5ID0gYXJyYXlpZnkobm9kZXMpLFxuICAgICAgICBzaGlmdCA9IDAsXG4gICAgICAgIGkgPSAwO1xuICAgICAgXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShzaGlmdHMpKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IChpICsgaW5kZXgpIDwgbm9kZUFycmF5Lmxlbmd0aCAmJiBpIDwgc2hpZnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgc2hpZnQgKz0gc2hpZnRzW2ldO1xuICAgICAgICAgIG5vZGVBcnJheVtpbmRleCArIGldLmluZGV4ICs9IHNoaWZ0O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzaGlmdCA9IHNoaWZ0cztcbiAgICAgIH1cbiAgICAgIGZvciAoaSArPSBpbmRleDsgaSA8IG5vZGVBcnJheS5sZW5ndGg7IGkrKykge1xuICAgICAgICBub2RlQXJyYXlbaV0uaW5kZXggKz0gc2hpZnQ7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHNldEluZGV4T2ZOb2Rlcyhub2RlcywgaW5kZXgsIHZhbHVlKSB7XG4gICAgICB2YXIgbm9kZUFycmF5ID0gYXJyYXlpZnkobm9kZXMpO1xuICAgICAgZm9yICh2YXIgaSA9IGluZGV4OyBpIDwgbm9kZUFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG5vZGVBcnJheVtpXS5pbmRleCA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzZXRJbml0aWFsSW5kZXhPZk5vZGVzKG5vZGVzLCBpbmRleCwgbm9kZXNUb0FkZCkge1xuICAgICAgdmFyIG5vZGVCZWZvcmUgPSBub2Rlc1tpbmRleCAtIDFdLCBpbmRleEZvck5vZGUgPSAwO1xuICAgICAgXG4gICAgICBpZiAobm9kZUJlZm9yZSkge1xuICAgICAgICBpbmRleEZvck5vZGUgPSBub2RlQmVmb3JlLmluZGV4O1xuICAgICAgfVxuICAgICAgc2V0SW5kZXhPZk5vZGVzKG5vZGVzVG9BZGQsIDAsIGluZGV4Rm9yTm9kZSk7XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHJhbmdlT2ZQYXRoQXJvdW5kTm9kZXMobm9kZXMsIHN0YXJ0LCBlbmQpIHtcbiAgICAgIHZhciByYW5nZSA9IHtcbiAgICAgICAgc3RhcnQ6IG51bGwsXG4gICAgICAgIGVuZDogbnVsbCxcbiAgICAgICAgbGVuZ3RoOiBudWxsLFxuICAgICAgICBub2RlU3RhcnQ6IG51bGwsXG4gICAgICAgIG5vZGVFbmQ6IG51bGwsXG4gICAgICAgIG5vZGVMZW5ndGg6IG51bGwsXG4gICAgICAgIGxhc3ROb2RlOiBmYWxzZSxcbiAgICAgICAgZmlyc3ROb2RlOiBmYWxzZVxuICAgICAgfTtcbiAgICAgIFxuICAgICAgdmFyIG5vZGVSYW5nZSA9IG5vZGVzLnNsaWNlKHN0YXJ0LCBlbmQpLFxuICAgICAgICBmaXJzdE5vZGVJblJhbmdlID0gbm9kZVJhbmdlWzBdLFxuICAgICAgICBsYXN0Tm9kZUluUmFuZ2UgPSBub2RlUmFuZ2Vbbm9kZVJhbmdlLmxlbmd0aCAtIDFdLFxuICAgICAgICBub2RlQmVmb3JlUmFuZ2UgPSBub2Rlc1tzdGFydCAtIDFdLFxuICAgICAgICBub2RlQWZ0ZXJSYW5nZSA9IG5vZGVzW2VuZF07XG4gICAgICBcbiAgICAgIGlmICghbm9kZUJlZm9yZVJhbmdlKSB7XG4gICAgICAgIHJhbmdlLmZpcnN0Tm9kZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAobm9kZUJlZm9yZVJhbmdlICYmIG5vZGVCZWZvcmVSYW5nZS5pbmRleCAhPT0gbnVsbCkge1xuICAgICAgICByYW5nZS5zdGFydCA9IG5vZGVCZWZvcmVSYW5nZS5pbmRleDtcbiAgICAgICAgcmFuZ2Uubm9kZVN0YXJ0ID0gc3RhcnQ7XG4gICAgICB9IGVsc2UgaWYgKGZpcnN0Tm9kZUluUmFuZ2UgJiYgZmlyc3ROb2RlSW5SYW5nZS5pbmRleCAhPT0gbnVsbCkge1xuICAgICAgICByYW5nZS5zdGFydCA9IGZpcnN0Tm9kZUluUmFuZ2UuaW5kZXg7XG4gICAgICAgIHJhbmdlLm5vZGVTdGFydCA9IHN0YXJ0ICsgMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlLnN0YXJ0ID0gMDtcbiAgICAgICAgcmFuZ2Uubm9kZVN0YXJ0ID0gMDtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKCFub2RlQWZ0ZXJSYW5nZSkge1xuICAgICAgICByYW5nZS5sYXN0Tm9kZSA9IHRydWU7XG4gICAgICB9XG4gICAgICBpZiAobm9kZUFmdGVyUmFuZ2UgJiYgbm9kZUFmdGVyUmFuZ2UuaW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgcmFuZ2UuZW5kID0gbm9kZUFmdGVyUmFuZ2UuaW5kZXg7XG4gICAgICAgIHJhbmdlLm5vZGVFbmQgPSBlbmQ7XG4gICAgICB9IGVsc2UgaWYgKGxhc3ROb2RlSW5SYW5nZSAmJiBsYXN0Tm9kZUluUmFuZ2UuaW5kZXggIT09IG51bGwpIHtcbiAgICAgICAgcmFuZ2UuZW5kID0gbGFzdE5vZGVJblJhbmdlLmluZGV4O1xuICAgICAgICByYW5nZS5ub2RlRW5kID0gZW5kIC0gMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJhbmdlLmVuZCA9IHJhbmdlLnN0YXJ0O1xuICAgICAgICByYW5nZS5ub2RlRW5kID0gcmFuZ2Uubm9kZVN0YXJ0O1xuICAgICAgfVxuICAgICAgXG4gICAgICByYW5nZS5ub2RlTGVuZ3RoID0gcmFuZ2Uubm9kZUVuZCAtIHJhbmdlLm5vZGVTdGFydDtcbiAgICAgIHJhbmdlLmxlbmd0aCA9IHJhbmdlLmVuZCAtIHJhbmdlLnN0YXJ0O1xuICAgICAgcmV0dXJuIHJhbmdlO1xuICAgIH1cbiAgICBmdW5jdGlvbiByYW5nZU9mUGF0aEFyb3VuZE5vZGUobm9kZXMsIGluZGV4KSB7XG4gICAgICByZXR1cm4gcmFuZ2VPZlBhdGhBcm91bmROb2Rlcyhub2RlcywgaW5kZXgsIGluZGV4KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWFrZVBhdGhzQXJvdW5kTm9kZXMobm9kZXMsIHN0YXJ0LCBlbmQsIHJpZ2lkKSB7XG4gICAgICB2YXIgcG9pbnRzID0gW10sXG4gICAgICAgIG5vZGVSYW5nZSA9IG5vZGVzLnNsaWNlKHN0YXJ0LCBlbmQpLFxuICAgICAgICBub2RlQmVmb3JlID0gbm9kZXNbc3RhcnQgLSAxXSxcbiAgICAgICAgbm9kZUFmdGVyID0gbm9kZXNbZW5kXSxcbiAgICAgICAgbm9kZTtcbiAgICAgIFxuICAgICAgaWYgKG5vZGVCZWZvcmUpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gobWFrZVBvaW50KG5vZGVCZWZvcmUpKTtcbiAgICAgIH1cbiAgICAgIGZvciAobm9kZSBvZiBub2RlUmFuZ2UpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gobWFrZVBvaW50KG5vZGUpKTtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlQWZ0ZXIpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gobWFrZVBvaW50KG5vZGVBZnRlcikpO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAocG9pbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnRzWzBdKTsgLy8gRHVwbGljYXRlIGZpcnN0IHBvaW50OyBtYWtlUGF0aHMgbmVlZHMgYXQgbGVhc3QgdHdvIHBvaW50c1xuICAgICAgfVxuICAgICAgXG4gICAgICByZXR1cm4gbWFrZVBhdGhzKHBvaW50cywgcmlnaWQpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBtYWtlUGF0aHNBcm91bmROb2RlKG5vZGVzLCBpbmRleCwgcmlnaWQpIHtcbiAgICAgIHJldHVybiBtYWtlUGF0aHNBcm91bmROb2Rlcyhub2RlcywgaW5kZXgsIGluZGV4LCByaWdpZCk7XG4gICAgfVxuICAgIFxuXG4gICAgZnVuY3Rpb24gYWxpZ25Ob2Rlc1dpdGhQYXRoKHBhdGgsIG5vZGVzKSB7XG4gICAgICB2YXIgbGF0TG5nO1xuICAgICAgXG4gICAgICBmb3IgKHZhciBub2RlIG9mIG5vZGVzKSB7XG4gICAgICAgIGxhdExuZyA9IHBhdGhbbm9kZS5pbmRleF07XG4gICAgICAgIGNvbnNvbGUuYXNzZXJ0KFxuICAgICAgICAgIGxhdExuZyxcbiAgXG4gICAgICAgICAgJ2xhdExuZyBpcyBub3QgZGVmaW5lZCdcbiAgICAgICAgKTtcbiAgICAgICAgY2hhbmdlTm9kZShub2RlLCB7XG4gICAgICAgICAgbGF0OiBsYXRMbmcubGF0KCksXG4gICAgICAgICAgbG5nOiBsYXRMbmcubG5nKClcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb2Nlc3NQYXRocyhwYXRocykge1xuICAgICAgXG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHJlbW92ZU5vZGVzQW5kVGhlaXJQYXRoc0Zyb21EcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBub2RlUmVtb3ZlTGVuZ3RoKSB7XG4gICAgICBpZiAobm9kZVJlbW92ZUxlbmd0aCAhPT0gMCkgZGVidWdnZXI7XG4gICAgICBcbiAgICAgIHZhciByYW5nZSA9IHJhbmdlT2ZQYXRoQXJvdW5kTm9kZXMoZHJhd2luZy5ub2RlcywgaW5kZXgsIGluZGV4ICsgbm9kZVJlbW92ZUxlbmd0aCk7XG5cbiAgICAgIGlmIChub2RlUmVtb3ZlTGVuZ3RoID09PSAwICYmIHJhbmdlLmZpcnN0Tm9kZSAmJiAhcmFuZ2UubGFzdE5vZGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHBhdGggPSBkcmF3aW5nLl9wb2x5LmdldFBhdGgoKS5nZXRBcnJheSgpLFxuICAgICAgICBwYXRoUmVtb3ZlTGVuZ3RoID0gcmFuZ2UubGVuZ3RoO1xuICAgICAgXG4gICAgICAvLyBTcGVjaWFsIGNhc2UgdG8gcmVtb3ZlIGxhc3QgcG9pbnQgaWYgbGFzdE5vZGVcbiAgICAgIGlmIChyYW5nZS5sYXN0Tm9kZSkge1xuICAgICAgICBwYXRoUmVtb3ZlTGVuZ3RoKys7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJlbW92ZVBvaW50cyhwYXRoLCByYW5nZS5zdGFydCwgcGF0aFJlbW92ZUxlbmd0aCk7XG4gICAgICBcbiAgICAgIHNoaWZ0SW5kZXhPZk5vZGVzKGRyYXdpbmcubm9kZXMsIHJhbmdlLm5vZGVTdGFydCwgLXJhbmdlLmxlbmd0aCk7XG4gICAgICByZW1vdmVOb2RlcyhkcmF3aW5nLm5vZGVzLCBpbmRleCwgbm9kZVJlbW92ZUxlbmd0aCk7XG4gICAgICBcbiAgICAgIGRyYXdpbmcuX3BvbHkuc2V0UGF0aChwYXRoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYWRkTm9kZXNBbmRUaGVpclBhdGhzVG9EcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBuZXdOb2RlcywgbmV3UGF0aHMgPSBudWxsKSB7XG4gICAgICBzZXRJbml0aWFsSW5kZXhPZk5vZGVzKGRyYXdpbmcubm9kZXMsIGluZGV4LCBuZXdOb2Rlcyk7XG4gICAgICBhZGROb2RlcyhkcmF3aW5nLm5vZGVzLCBpbmRleCwgbmV3Tm9kZXMpO1xuICAgICAgICAgICAgXG4gICAgICB2YXIgcHJvbWlzZSA9ICRxLndoZW4oKTtcbiAgICAgIGlmIChuZXdQYXRocykge1xuICAgICAgICBwcm9taXNlID0gcHJvbWlzZS50aGVuKFxuICAgICAgICAgIChuZXdQYXRocykgPT4gbmV3UGF0aHNcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oXG4gICAgICAgICAgbWFrZVBhdGhzQXJvdW5kTm9kZXMuYmluZChudWxsLCBkcmF3aW5nLm5vZGVzLCBpbmRleCwgaW5kZXggKyBuZXdOb2Rlcy5sZW5ndGgsIGRyYXdpbmcucmlnaWQpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHByb21pc2UgPSBwcm9taXNlLnRoZW4oXG4gICAgICAgIGZ1bmN0aW9uKGRyYXdpbmcsIGluZGV4LCBuZXdOb2RlcywgbmV3UGF0aHMpIHtcbiAgICAgICAgICB2YXIgcG9seVBhdGggPSBkcmF3aW5nLl9wb2x5LmdldFBhdGgoKS5nZXRBcnJheSgpLFxuICAgICAgICAgICAgbm9kZXMgPSBkcmF3aW5nLm5vZGVzO1xuICAgICAgICAgICAgXG4gICAgICAgICAgdmFyIHNoaWZ0cyA9IFtdO1xuICAgICAgICAgIHZhciBwYXRoLCBsYXN0UG9pbnQsIGksXG4gICAgICAgICAgICBwYXRoUmFuZ2UgPSByYW5nZU9mUGF0aEFyb3VuZE5vZGVzKG5vZGVzLCBpbmRleCwgaW5kZXggKyBuZXdOb2Rlcy5sZW5ndGgpLFxuICAgICAgICAgICAgcGF0aEluZGV4ID0gcGF0aFJhbmdlLnN0YXJ0O1xuICAgICAgICAgICAgXG4gICAgICAgICAgZm9yIChwYXRoIG9mIG5ld1BhdGhzKSB7XG4gICAgICAgICAgICBsYXN0UG9pbnQgPSBwYXRoLnBvcCgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBBZGRzIG5ldyBwYXRoXG4gICAgICAgICAgICBhZGRQb2ludHMocG9seVBhdGgsIHBhdGhJbmRleCwgcGF0aCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHBhdGhJbmRleCArPSBwYXRoLmxlbmd0aDtcbiAgICAgICAgICAgIHNoaWZ0cy5wdXNoKHBhdGgubGVuZ3RoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIGFsaWduTGVuZ3RoID0gbmV3UGF0aHMubGVuZ3RoO1xuICAgICAgICAgIHNoaWZ0SW5kZXhPZk5vZGVzKG5vZGVzLCBwYXRoUmFuZ2Uubm9kZVN0YXJ0LCBzaGlmdHMpO1xuICAgICAgICAgIFxuICAgICAgICAgIGlmIChwYXRoUmFuZ2UubGFzdE5vZGUgJiYgbGFzdFBvaW50KSB7IC8vIElmIGxhc3ROb2RlIGlzIGludm9sdmVkLCBwdXQgbGFzdFBvaW50IGJhY2tcbiAgICAgICAgICAgIHBvbHlQYXRoLnB1c2gobGFzdFBvaW50KTtcbiAgICAgICAgICAgIGFsaWduTGVuZ3RoKys7XG4gICAgICAgICAgfVxuICAgICAgICAgIFxuICAgICAgICAgIHZhciBub2Rlc1RvQWxpZ24gPSBub2Rlcy5zbGljZShpbmRleCwgaW5kZXggKyBhbGlnbkxlbmd0aCk7XG4gICAgICAgICAgYWxpZ25Ob2Rlc1dpdGhQYXRoKHBvbHlQYXRoLCBub2Rlc1RvQWxpZ24pO1xuICAgICAgICAgIC8vIGNvbnNvbGUudGFibGUobm9kZXMpO1xuICAgICAgICAgIC8vIGNvbnNvbGUuaW5mbyhwb2x5UGF0aCk7XG4gICAgICAgICAgLy8gY29uc29sZS5pbmZvKGBMZW5ndGggb2YgcG9seVBhdGg6ICR7cG9seVBhdGgubGVuZ3RofWApO1xuICAgICAgICAgIFxuICAgICAgICAgIGRyYXdpbmcuX3BvbHkuc2V0UGF0aChwb2x5UGF0aCk7XG4gICAgICAgICAgcmV0dXJuIHBvbHlQYXRoO1xuICAgICAgICB9LmJpbmQobnVsbCwgZHJhd2luZywgaW5kZXgsIG5ld05vZGVzKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzcGxpY2VOb2Rlc0ludG9EcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBub2RlUmVtb3ZlTGVuZ3RoLCBub2Rlc1RvQWRkID0gW10sIHBhdGhzVG9BZGQgPSBudWxsKSB7ICAgICAgXG4gICAgICB2YXIgcG9seVBhdGggPSBkcmF3aW5nLl9wb2x5LmdldFBhdGgoKS5nZXRBcnJheSgpO1xuICAgICAgbm9kZXNUb0FkZCA9IGFycmF5aWZ5KG5vZGVzVG9BZGQpO1xuICAgICAgXG4gICAgICAvLyBGaXJzdCwgcmVtb3ZlIG5vZGVzIGFuZCBhZGQgbmV3IG9uZXNcbiAgICAgIHZhciBwcm9taXNlID0gJHEud2hlbigpO1xuICAgICAgcHJvbWlzZSA9IHByb21pc2UudGhlbihcbiAgICAgICAgZnVuY3Rpb24oZHJhd2luZywgaW5kZXgsIG5vZGVSZW1vdmVMZW5ndGgsIG5vZGVzVG9BZGQsIHBhdGhzVG9BZGQpIHtcbiAgICAgICAgICByZW1vdmVOb2Rlc0FuZFRoZWlyUGF0aHNGcm9tRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgbm9kZVJlbW92ZUxlbmd0aCk7XG4gICAgICAgICAgcmV0dXJuIGFkZE5vZGVzQW5kVGhlaXJQYXRoc1RvRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgbm9kZXNUb0FkZCwgcGF0aHNUb0FkZCk7XG4gICAgICAgIH0uYmluZChudWxsLCBkcmF3aW5nLCBpbmRleCwgbm9kZVJlbW92ZUxlbmd0aCwgbm9kZXNUb0FkZCwgcGF0aHNUb0FkZClcbiAgICAgICk7XG4gICAgICAvLyBxdWV1ZShwcm9taXNlKTtcbiAgICAgIHJldHVybiBwcm9taXNlO1xuICAgIH1cbiAgICBcbiAgICAvKlxuICAgICoqKiBQVUJMSUMgQVBJICoqKlxuICAgICovXG4gICAgdmFyIGludGVybmFsUXVldWUgPSAkcS53aGVuKCk7XG4gICAgZnVuY3Rpb24gcXVldWUocHJvbWlzZSkgeyAvLyBLZWVwcyBwYXRoIG9wZXJhdGlvbnMgaW4gY29ycmVjdCBvcmRlclxuICAgICAgaW50ZXJuYWxRdWV1ZSA9IGludGVybmFsUXVldWUudGhlbihwcm9taXNlID0+IHByb21pc2UpOyAvLyBSZXR1cm4gcHJvbWlzZVxuICAgIH1cbiAgICBcbiAgICBmdW5jdGlvbiBtYWtlTm9kZShjb2xvckluZGV4LCBsYXRMbmcsIGluZGV4ID0gbnVsbCkge1xuICAgICAgdmFyIG1hcmtlciA9IG5ldyBNYXBTdmMuTWFya2VyKG1ha2VNYXJrZXJPcHRpb25zKGNvbG9ySW5kZXgsIGxhdExuZykpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBsYXQ6IGxhdExuZy5sYXQoKSxcbiAgICAgICAgbG5nOiBsYXRMbmcubG5nKCksXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgX21hcmtlcjogbWFya2VyXG4gICAgICB9O1xuICAgIH1cbiAgICBzZWxmLm1ha2VOb2RlID0gbWFrZU5vZGU7XG4gICAgXG4gICAgLy8gRHJhd2luZyBmdW5jdGlvbnNcbiAgICBmdW5jdGlvbiBtYWtlRHJhd2luZyhjb2xvckluZGV4LCByaWdpZCwgZmlsbCA9IGZhbHNlKSB7XG4gICAgICB2YXIgcG9seTtcblxuICAgICAgaWYgKGZpbGwpIHtcbiAgICAgICAgcG9seSA9IG5ldyBNYXBTdmMuUG9seWdvbihtYWtlUG9seU9wdGlvbnMoY29sb3JJbmRleCwgZmlsbCkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcG9seSA9IG5ldyBNYXBTdmMuUG9seWxpbmUobWFrZVBvbHlPcHRpb25zKGNvbG9ySW5kZXgsIGZpbGwpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvbG9ySW5kZXg6IGNvbG9ySW5kZXgsXG4gICAgICAgIHJpZ2lkOiByaWdpZCxcbiAgICAgICAgZmlsbDogZmlsbCxcbiAgICAgICAgX3BvbHk6IHBvbHksXG4gICAgICAgIG5vZGVzOiBbXVxuICAgICAgfTtcbiAgICB9XG4gICAgc2VsZi5tYWtlRHJhd2luZyA9IG1ha2VEcmF3aW5nO1xuICAgIFxuICAgIGZ1bmN0aW9uIGFkZERyYXdpbmdzKGRyYXdpbmdzLCBpbmRleCwgZHJhd2luZ3NUb0FkZCkge1xuICAgICAgc3BsaWNlKGRyYXdpbmdzLCBpbmRleCwgMCwgZHJhd2luZ3NUb0FkZCk7XG4gICAgfVxuICAgIHNlbGYuYWRkRHJhd2luZ3MgPSBzZWxmLmFkZERyYXdpbmcgPSBhZGREcmF3aW5ncztcbiAgICBcbiAgICBmdW5jdGlvbiBhZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgbm9kZXNUb0FkZCA9IFtdLCBwYXRoc1RvQWRkID0gbnVsbCkge1xuICAgICAgcmV0dXJuIHNwbGljZU5vZGVzSW50b0RyYXdpbmcoZHJhd2luZywgaW5kZXgsIDAsIG5vZGVzVG9BZGQsIHBhdGhzVG9BZGQpO1xuICAgIH1cbiAgICBzZWxmLmFkZE5vZGVzVG9EcmF3aW5nID0gc2VsZi5hZGROb2RlVG9EcmF3aW5nID0gYWRkTm9kZXNUb0RyYXdpbmc7XG4gICAgXG4gICAgZnVuY3Rpb24gcmVtb3ZlRHJhd2luZ3MoZHJhd2luZ3MsIGluZGV4LCByZW1vdmVMZW5ndGgpIHtcbiAgICAgIHZhciByZW1vdmVkRHJhd2luZ3MgPSBzcGxpY2UoZHJhd2luZ3MsIGluZGV4LCByZW1vdmVMZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZW1vdmVkRHJhd2luZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJlbW92ZWREcmF3aW5nID0gcmVtb3ZlZERyYXdpbmdzW2ldO1xuICAgICAgICByZW1vdmVOb2Rlc0Zyb21EcmF3aW5nKHJlbW92ZWREcmF3aW5nLCAwLCByZW1vdmVkRHJhd2luZy5ub2Rlcy5sZW5ndGgpO1xuICAgICAgICByZW1vdmVkRHJhd2luZy5fcG9seS5zZXRNYXAobnVsbCk7XG4gICAgICB9XG4gICAgfVxuICAgIHNlbGYucmVtb3ZlRHJhd2luZ3MgPSBzZWxmLnJlbW92ZURyYXdpbmcgPSByZW1vdmVEcmF3aW5ncztcbiAgICBcbiAgICBmdW5jdGlvbiByZW1vdmVOb2Rlc0Zyb21EcmF3aW5nKGRyYXdpbmcsIGluZGV4LCByZW1vdmVMZW5ndGgsIHBhdGhzVG9BZGQgPSBudWxsKSB7XG4gICAgICByZXR1cm4gc3BsaWNlTm9kZXNJbnRvRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgcmVtb3ZlTGVuZ3RoLCBbXSwgcGF0aHNUb0FkZCk7XG4gICAgfVxuICAgIHNlbGYucmVtb3ZlTm9kZXNGcm9tRHJhd2luZyA9IHNlbGYucmVtb3ZlTm9kZUZyb21EcmF3aW5nID0gcmVtb3ZlTm9kZXNGcm9tRHJhd2luZztcbiAgICBcbiAgICBmdW5jdGlvbiBjaGFuZ2VOb2RlT2ZEcmF3aW5nKGRyYXdpbmcsIGluZGV4LCBjaGFuZ2VzLCBwYXRoc1RvQWRkID0gbnVsbCkge1xuICAgICAgdmFyIG5vZGUgPSBkcmF3aW5nLm5vZGVzW2luZGV4XTtcbiAgICAgIGNoYW5nZU5vZGUobm9kZSwgY2hhbmdlcyk7XG4gICAgICByZXR1cm4gc3BsaWNlTm9kZXNJbnRvRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgMSwgZHVwbGljYXRlTm9kZShkcmF3aW5nLCBub2RlKSwgcGF0aHNUb0FkZCk7XG4gICAgfVxuICAgIHNlbGYuY2hhbmdlTm9kZU9mRHJhd2luZyA9IGNoYW5nZU5vZGVPZkRyYXdpbmc7XG4gICAgXG4gICAgLy8gZnVuY3Rpb24gY2hhbmdlUGF0aE9mRHJhd2luZyhkcmF3aW5nLCBpbmRleCwgcGF0aHNUb0FkZCwgcmFuZ2UpIHtcbiAgICAvLyAgIGlmIChyYW5nZS5maXJzdE5vZGUgJiYgcmFuZ2UubGFzdE5vZGUpIHtcbiAgICAvLyAgICAgcmV0dXJuO1xuICAgIC8vICAgfVxuICAgIC8vXG4gICAgLy8gICB2YXIgbm9kZXMgPSBkcmF3aW5nLm5vZGVzO1xuICAgIC8vXG4gICAgLy8gICB2YXIgcHJvbWlzZSxcbiAgICAvLyAgICAgcGF0aCA9IGRyYXdpbmcuX3BvbHkuZ2V0UGF0aCgpLmdldEFycmF5KCksXG4gICAgLy8gICAgIHBhdGhJbmRleCA9IHJhbmdlLnN0YXJ0LFxuICAgIC8vICAgICBwYXRoUmVtb3ZlTGVuZ3RoID0gcmFuZ2UuZW5kIC0gcmFuZ2Uuc3RhcnQ7XG4gICAgLy9cbiAgICAvLyAgIGlmIChwYXRoc1RvQWRkID09PSBudWxsKSB7XG4gICAgLy8gICAgIHByb21pc2UgPSBtYWtlUGF0aHNBcm91bmROb2Rlcyhub2RlcywgaW5kZXgsIGRyYXdpbmcucmlnaWQpO1xuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAvLyAgICAgZGVmZXJyZWQucmVzb2x2ZShwYXRoc1RvQWRkKTtcbiAgICAvLyAgICAgcHJvbWlzZSA9IGRlZmVycmVkLnByb21pc2U7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHByb21pc2UudGhlbihmdW5jdGlvbihwYXRoc1RvQWRkKSB7XG4gICAgLy8gICAgIHJlbW92ZVBvaW50cyhwYXRoLCBwYXRoSW5kZXgsIHBhdGhSZW1vdmVMZW5ndGgpO1xuICAgIC8vICAgICBzaGlmdEluZGV4T2ZOb2Rlcyhub2RlcywgcmFuZ2Uubm9kZVN0YXJ0LCAtcGF0aFJlbW92ZUxlbmd0aCk7XG4gICAgLy9cbiAgICAvLyAgICAgdmFyIHNoaWZ0cyA9IFtdLFxuICAgIC8vICAgICAgIG5vZGVMb2NhdGlvbnMgPSBbXSxcbiAgICAvLyAgICAgICBwYXRoTGVuZ3RoLFxuICAgIC8vICAgICAgIGksIGo7XG4gICAgLy8gICAgIGZvciAoaSA9IDA7IGkgPCBwYXRoc1RvQWRkLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gICAgICAgaWYgKGkgPCBwYXRoc1RvQWRkLmxlbmd0aCAtIDEpIHtcbiAgICAvLyAgICAgICAgIG5vZGVMb2NhdGlvbnMucHVzaChwYXRoc1RvQWRkW2ldLnBvcCgpKTtcbiAgICAvLyAgICAgICAgIHBhdGhMZW5ndGggPSBwYXRoc1RvQWRkW2ldLmxlbmd0aDtcbiAgICAvLyAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgcGF0aExlbmd0aCA9IHBhdGhzVG9BZGQubGVuZ3RoIC0gMTtcbiAgICAvLyAgICAgICB9XG4gICAgLy8gICAgICAgc2hpZnRzLnB1c2gocGF0aExlbmd0aCk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgdmFyIGNvbWJpbmVkUGF0aCA9IEFycmF5LnByb3RvdHlwZS5jb25jYXQuYXBwbHkoW10sIHBhdGhzVG9BZGQpO1xuICAgIC8vICAgICBhZGRQb2ludHMocGF0aCwgcGF0aEluZGV4LCBjb21iaW5lZFBhdGgpO1xuICAgIC8vICAgICBzaGlmdEluZGV4T2ZOb2Rlcyhub2RlcywgcmFuZ2UuaW5kZXhPZkFmZmVjdGVkTm9kZSArIDEsIHNoaWZ0cyk7XG4gICAgLy9cbiAgICAvLyAgICAgZm9yIChpID0gcmFuZ2UuaW5kZXhPZkFmZmVjdGVkTm9kZSwgaiA9IDA7IGogPCBub2RlTG9jYXRpb25zLmxlbmd0aDsgaSsrLCBqKyspIHtcbiAgICAvLyAgICAgICBjaGFuZ2VOb2RlKG5vZGVzW2ldLCB7XG4gICAgLy8gICAgICAgICBsYXQ6IG5vZGVMb2NhdGlvbnNbal0ubGF0KCksXG4gICAgLy8gICAgICAgICBsbmc6IG5vZGVMb2NhdGlvbnNbal0ubG5nKClcbiAgICAvLyAgICAgICB9KTtcbiAgICAvLyAgICAgfVxuICAgIC8vICAgICAvLyBmb3IgKGkgPSAxOyBpIDwgcGF0aC5sZW5ndGg7IGkrKykge1xuICAgIC8vICAgICAvLyAgIGlmIChwYXRoW2kgLSAxXS5lcXVhbHMocGF0aFtpXSkpIHtcbiAgICAvLyAgICAgLy8gICAgIGNvbnNvbGUud2FybihgUG9pbnQgJHtpIC0gMX0gYW5kICR7aX0gYXJlIHRoZSBzYW1lYCwgcGF0aFtpXSk7XG4gICAgLy8gICAgIC8vICAgfVxuICAgIC8vICAgICAvLyB9XG4gICAgLy8gICAgIC8vIGNvbnNvbGUuaW5mbyhwYXRoKTtcbiAgICAvL1xuICAgIC8vXG4gICAgLy8gICAgIGRyYXdpbmcuX3BvbHkuc2V0UGF0aChwYXRoKTtcbiAgICAvLyAgIH0pO1xuICAgIC8vIH1cbiAgICBcbiAgICBmdW5jdGlvbiBjaGFuZ2VEcmF3aW5nKGRyYXdpbmcsIGNoYW5nZXMpIHtcbiAgICAgIGNoYW5nZShkcmF3aW5nLCBjaGFuZ2VzKTtcbiAgICAgIFxuICAgICAgZm9yICh2YXIga2V5IGluIGNoYW5nZXMpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgY2FzZSAnY29sb3JJbmRleCc6XG4gICAgICAgIGNhc2UgJ2ZpbGwnOlxuICAgICAgICAgIHZhciBvcHRpb25zID0gbWFrZVBvbHlPcHRpb25zKGRyYXdpbmcuY29sb3JJbmRleCwgZHJhd2luZy5maWxsKTtcbiAgICAgICAgICBkcmF3aW5nLl9wb2x5LnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3JpZ2lkJzpcbiAgICAgICAgICBcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRyYXdpbmdzVG9HZW9Kc29uKGRyYXdpbmdzKSB7XG4gICAgICB2YXIgc3RvcmFibGVEcmF3aW5ncyA9IFtdO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRyYXdpbmdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkcmF3aW5nID0gZHJhd2luZ3NbaV07XG4gICAgICAgIHZhciBzdG9yYWJsZURyYXdpbmcgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGtleSBpbiBkcmF3aW5nKSB7XG4gICAgICAgICAgaWYgKGtleSA9PT0gJ19wb2x5Jykge1xuICAgICAgICAgICAgc3RvcmFibGVEcmF3aW5nLnBhdGggPSBNYXBTdmMuZ2VvbWV0cnkuZW5jb2RpbmcuZW5jb2RlUGF0aChkcmF3aW5nLl9wb2x5LmdldFBhdGgoKSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdub2RlcycpIHtcbiAgICAgICAgICAgIHZhciBzdG9yYWJsZU5vZGVzID0gW107XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZHJhd2luZy5ub2Rlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICB2YXIgbm9kZSA9IGRyYXdpbmcubm9kZXNbal07XG4gICAgICAgICAgICAgIHZhciBzdG9yYWJsZU5vZGUgPSB7fTtcbiAgICAgICAgICAgICAgZm9yICh2YXIgbm9kZUtleSBpbiBub2RlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGtleVswXSAhPT0gJ18nICYmIGtleVswXSAhPT0gJyQnICYmIG5vZGUuaGFzT3duUHJvcGVydHkobm9kZUtleSkpIHtcbiAgICAgICAgICAgICAgICAgIHN0b3JhYmxlTm9kZVtub2RlS2V5XSA9IG5vZGVbbm9kZUtleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICBzdG9yYWJsZU5vZGVzW2ldID0gc3RvcmFibGVOb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoZHJhd2luZy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICBzdG9yYWJsZURyYXdpbmdba2V5XSA9IGRyYXdpbmdba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIHJldHVybiBzdG9yYWJsZURyYXdpbmc7XG4gICAgICB9XG5cbiAgICAgICRsb2NhbFN0b3JhZ2UuZHJhd2luZ3MgPSBzdG9yYWJsZURyYXdpbmdzO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnZW9Kc29uVG9EcmF3aW5ncyhkcmF3aW5ncykge1xuICAgICAgdmFyIHN0b3JlZERyYXdpbmdzID0gJGxvY2FsU3RvcmFnZS5kcmF3aW5ncyB8fCB7fTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3RvcmVkRHJhd2luZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHN0b3JlZERyYXdpbmcgPSBzdG9yZWREcmF3aW5nc1tpXTtcbiAgICAgICAgdmFyIHBhdGggPSBNYXBTdmMuZ2VvbWV0cnkuZW5jb2RpbmcuZGVjb2RlUGF0aChzdG9yZWREcmF3aW5nLnBhdGgpO1xuICAgICAgICB2YXIgZHJhd2luZyA9IHNlbGYubWFrZURyYXdpbmcoc3RvcmVkRHJhd2luZy5jb2xvckluZGV4LCBzdG9yZWREcmF3aW5nLnJpZ2lkLFxuICAgICAgICAgIHN0b3JlZERyYXdpbmcuZmlsbCwgcGF0aCk7XG4gICAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc3RvcmVkRHJhd2luZy5ub2Rlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHZhciBzdG9yZWROb2RlID0gc3RvcmVkRHJhd2luZ1tqXTtcbiAgICAgICAgICB2YXIgbGF0TG5nID0gbmV3IE1hcFN2Yy5MYXRMbmcoc3RvcmVkTm9kZS5sYXQsIHN0b3JlZE5vZGUubG5nKTtcbiAgICAgICAgICB2YXIgbm9kZSA9IHNlbGYubWFrZU5vZGUoc3RvcmVkRHJhd2luZy5jb2xvckluZGV4LCBsYXRMbmcpO1xuICAgICAgICAgIFxuICAgICAgICAgIGRyYXdpbmcubm9kZXMucHVzaChub2RlKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgc2VsZi5kcmF3aW5ncy5wdXNoKGRyYXdpbmcpO1xuICAgICAgfVxuICAgICAgXG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIHJnYmFDb2xvclRvU3RyaW5nKHJnYmEpIHtcbiAgICAgIHJldHVybiBgcmdiYSgke3JnYmEucioxMDB9JSwke3JnYmEuZyoxMDB9JSwke3JnYmEuYioxMDB9JSwke3JnYmEuYX0pYDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzaGlmdEluZGljZXMoYXJyYXksIGluZGV4LCBzaGlmdCkge1xuICAgICAgZm9yICh2YXIgaSA9IGluZGV4OyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJyYXlbaV0uaW5kZXggKz0gc2hpZnQ7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIGZ1bmN0aW9uIG1ha2VJY29uKGNvbG9ySW5kZXgpIHtcbiAgICAgIHZhciBjb2xvciA9IENvbG9yU3ZjLmNvbG9yc1tjb2xvckluZGV4XTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHBhdGg6IE1hcFN2Yy5TeW1ib2xQYXRoLkNJUkNMRSxcbiAgICAgICAgc2NhbGU6IDEwLFxuICAgICAgICBzdHJva2VDb2xvcjogJyMnICsgQ29sb3JTdmMuY29udmVydC5yZ2JhKGNvbG9yKS50by5oZXgyNCgpLFxuICAgICAgICBzdHJva2VPcGFjaXR5OiAxLFxuICAgICAgICBzdHJva2VXZWlnaHQ6IDIuNVxuICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWFrZU1hcmtlck9wdGlvbnMoY29sb3JJbmRleCwgbGF0TG5nKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBjbGlja2FibGU6IHRydWUsXG4gICAgICAgIGNyb3NzT25EcmFnOiBmYWxzZSxcbiAgICAgICAgY3Vyc29yOiAncG9pbnRlcicsXG4gICAgICAgIGRyYWdnYWJsZTogdHJ1ZSxcbiAgICAgICAgZmxhdDogdHJ1ZSxcbiAgICAgICAgaWNvbjogbWFrZUljb24oY29sb3JJbmRleCksXG4gICAgICAgIG1hcDogTWFwU3ZjLm1hcCxcbiAgICAgICAgcG9zaXRpb246IGxhdExuZ1xuICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gbWFrZVBvbHlPcHRpb25zKGNvbG9ySW5kZXgsIGZpbGwpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHtcbiAgICAgICAgY2xpY2thYmxlOiB0cnVlLFxuICAgICAgICBkcmFnZ2FibGU6IGZhbHNlLFxuICAgICAgICBlZGl0YWJsZTogZmFsc2UsXG4gICAgICAgIG1hcDogTWFwU3ZjLm1hcFxuICAgICAgfTtcblxuICAgICAgdmFyIGNvbG9yID0gQ29sb3JTdmMuY29sb3JzW2NvbG9ySW5kZXhdO1xuICAgICAgXG4gICAgICBpZiAoZmlsbCkge1xuICAgICAgICB2YWx1ZS5maWxsQ29sb3IgPSByZ2JhQ29sb3JUb1N0cmluZyhjb2xvcik7XG4gICAgICAgIHZhbHVlLnN0cm9rZVdlaWdodCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZS5zdHJva2VDb2xvciA9IHJnYmFDb2xvclRvU3RyaW5nKGNvbG9yKTtcbiAgICAgICAgdmFsdWUuc3Ryb2tlV2VpZ2h0ID0gY29sb3Iud2VpZ2h0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICB9KVxuXG4vLyBDb250cm9sbGVyc1xuLmNvbnRyb2xsZXIoJ0RyYXdpbmdDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYWxTdG9yYWdlLCBEcmF3aW5nU3ZjLCBDb2xvclN2YywgSGlzdG9yeVN2Yykge1xuICAkc2NvcGUuJHN0b3JhZ2UgPSAkbG9jYWxTdG9yYWdlLiRkZWZhdWx0KHtcbiAgICBkcmF3aW5nczogW10sXG4gICAgcmlnaWQ6IGZhbHNlLFxuICAgIGNvbG9yczogW3tcbiAgICAgIHI6IDEsXG4gICAgICBnOiAwLFxuICAgICAgYjogMCxcbiAgICAgIGE6IDAuMTI1LFxuICAgICAgd2VpZ2h0OiAxMFxuICAgIH0sIHtcbiAgICAgIHI6IDAsXG4gICAgICBnOiAxLFxuICAgICAgYjogMCxcbiAgICAgIGE6IDAuMTI1LFxuICAgICAgd2VpZ2h0OiAxMFxuICAgIH0sIHtcbiAgICAgIHI6IDAsXG4gICAgICBnOiAwLFxuICAgICAgYjogMSxcbiAgICAgIGE6IDAuMTI1LFxuICAgICAgd2VpZ2h0OiAxMFxuICAgIH1dLFxuICAgIGFjdGl2ZUNvbG9yOiAxXG4gIH0pO1xuICB2YXIgZHJhd2luZ3MgPSAkc2NvcGUuZHJhd2luZ3MgPSBbXTtcbiAgXG4gIHZhciBhY3RpdmVEcmF3aW5nSW5kZXggPSAtMTtcbiAgLy8gJHNjb3BlLiRzdG9yYWdlID0gRHJhd2luZ1N2Yy5sb2FkRHJhd2luZ3MoKTtcblxuICBmdW5jdGlvbiBhZGROb2RlKGV2ZW50LCBwYXJhbSkge1xuICAgIHZhciBjb2xvckluZGV4ID0gJHNjb3BlLiRzdG9yYWdlLmFjdGl2ZUNvbG9yO1xuXG4gICAgLy8gVE9ETzogYWN0dWFsIHZhcmlhYmxlIHZhbHVlc1xuICAgIHZhciByaWdpZCA9IGZhbHNlLFxuICAgICAgZmlsbCA9IGZhbHNlO1xuXG4gICAgaWYgKHNob3VsZENyZWF0ZU5ld0RyYXdpbmcoKSkge1xuICAgICAgdmFyIG5ld0RyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKGNvbG9ySW5kZXgsIHJpZ2lkLCBmaWxsKTtcbiAgICAgIGFjdGl2ZURyYXdpbmdJbmRleCsrO1xuICAgICAgRHJhd2luZ1N2Yy5hZGREcmF3aW5nKGRyYXdpbmdzLCBhY3RpdmVEcmF3aW5nSW5kZXgsIG5ld0RyYXdpbmcpO1xuICAgIH1cbiAgICBcbiAgICB2YXIgZHJhd2luZyA9IGRyYXdpbmdzW2FjdGl2ZURyYXdpbmdJbmRleF07XG4gICAgdmFyIG5ld05vZGUgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKGNvbG9ySW5kZXgsIHBhcmFtLmxhdExuZyk7XG4gICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIGRyYXdpbmcubm9kZXMubGVuZ3RoLCBuZXdOb2RlKTtcbiAgICBcbiAgICByZXR1cm47XG4gICAgXG4gICAgLy8gSGlzdG9yeVN2Yy5hZGQoe1xuICAgIC8vICAgdW5kbzogZnVuY3Rpb24oZHJhd2luZywgbm9kZUluZGV4LCBkaWRDcmVhdGVOZXdEcmF3aW5nKSB7XG4gICAgLy8gICAgIERyYXdpbmdTdmMuc3BsaWNlTm9kZShkcmF3aW5nSW5kZXgsIG5vZGVJbmRleCwgMSk7XG4gICAgLy8gICAgIGlmIChkaWRDcmVhdGVOZXdEcmF3aW5nKSB7XG4gICAgLy8gICAgICAgRHJhd2luZ1N2Yy5zcGxpY2VEcmF3aW5nKGRyYXdpbmdJbmRleCwgMSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgIH0uYmluZChudWxsLCBsYXN0RHJhd2luZ0luZGV4LCBuZXdOb2RlSW5kZXgsIHNob3VsZENyZWF0ZU5ld0RyYXdpbmcoKSksXG4gICAgLy8gICByZWRvOiBmdW5jdGlvbihkcmF3aW5nSW5kZXgsIG5vZGVJbmRleCwgbmV3Tm9kZSkge1xuICAgIC8vICAgICBEcmF3aW5nU3ZjLnNwbGljZU5vZGUoZHJhd2luZ0luZGV4LCBub2RlSW5kZXgsIDAsIG5ld05vZGUpO1xuICAgIC8vICAgfS5iaW5kKG51bGwsIGxhc3REcmF3aW5nSW5kZXgsIG5ld05vZGVJbmRleCwgbmV3Tm9kZSlcbiAgICAvLyB9KTtcbiAgfVxuICBmdW5jdGlvbiBjaGFuZ2VOb2RlKCRwYXJhbXMsIGRyYXdpbmdJbmRleCwgbm9kZUluZGV4KSB7XG4gICAgdmFyIGV2ZW50ID0gJHBhcmFtc1swXSxcbiAgICAgIGRyYXdpbmcgPSBkcmF3aW5nc1tkcmF3aW5nSW5kZXhdLFxuICAgICAgb3JpZ2luYWxOb2RlID0gZHJhd2luZy5ub2Rlc1tub2RlSW5kZXhdLFxuICAgICAgbGF0TG5nID0gZXZlbnQubGF0TG5nO1xuICAgIFxuICAgIERyYXdpbmdTdmMuY2hhbmdlTm9kZU9mRHJhd2luZyhkcmF3aW5nLCBub2RlSW5kZXgsIHtcbiAgICAgIGxhdDogbGF0TG5nLmxhdCgpLFxuICAgICAgbG5nOiBsYXRMbmcubG5nKClcbiAgICB9KTtcbiAgICBcbiAgICAvLyBIaXN0b3J5U3ZjLmFkZCh7XG4gICAgLy8gICB1bmRvOiBmdW5jdGlvbihkcmF3aW5nSW5kZXgsIG5vZGVJbmRleCwgb3JpZ2luYWxOb2RlKSB7XG4gICAgLy8gICAgIERyYXdpbmdTdmMuc3BsaWNlTm9kZShkcmF3aW5nSW5kZXgsIG5vZGVJbmRleCwgMSwgb3JpZ2luYWxOb2RlKTtcbiAgICAvLyAgIH0uYmluZChudWxsLCBkcmF3aW5nSW5kZXgsIG5vZGVJbmRleCwgb3JpZ2luYWxOb2RlKSxcbiAgICAvLyAgIHJlZG86IGZ1bmN0aW9uKGRyYXdpbmdJbmRleCwgbm9kZUluZGV4LCBuZXdOb2RlKSB7XG4gICAgLy8gICAgIERyYXdpbmdTdmMuc3BsaWNlTm9kZShkcmF3aW5nSW5kZXgsIG5vZGVJbmRleCwgMSwgbmV3Tm9kZSk7XG4gICAgLy8gICB9LmJpbmQobnVsbCwgZHJhd2luZ0luZGV4LCBub2RlSW5kZXgsIG5ld05vZGUpXG4gICAgLy8gfSk7XG4gIH1cbiAgZnVuY3Rpb24gc2hvdWxkQ3JlYXRlTmV3RHJhd2luZygpIHtcbiAgICBpZiAoZHJhd2luZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgdmFyIGxhdGVzdERyYXdpbmcgPSBkcmF3aW5nc1tkcmF3aW5ncy5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gKGxhdGVzdERyYXdpbmcgJiYgbGF0ZXN0RHJhd2luZy5jb2xvckluZGV4ICE9PSBDb2xvclN2Yy5hY3RpdmVDb2xvckluZGV4KTtcbiAgfVxuICAkc2NvcGUuJG9uKCdtYXA6Y2xpY2snLCBhZGROb2RlKTtcbiAgJHNjb3BlLiRvbignYWN0aW9uOmNsZWFyJywgZnVuY3Rpb24oJHBhcmFtcykge1xuICAgIERyYXdpbmdTdmMucmVtb3ZlRHJhd2luZ3MoZHJhd2luZ3MsIDAsIGRyYXdpbmdzLmxlbmd0aCk7XG4gICAgYWN0aXZlRHJhd2luZ0luZGV4ID0gLTE7XG4gIH0pO1xuXG4gICRzY29wZS5tYXJrZXIgPSB7XG4gICAgY2xpY2s6IGZ1bmN0aW9uKCRwYXJhbXMpIHtcbiAgICAgIGFkZE5vZGUodW5kZWZpbmVkLCAkcGFyYW1zWzBdKTtcbiAgICB9LFxuICAgIGRyYWdlbmQ6IGNoYW5nZU5vZGVcbiAgfTtcbiAgJHNjb3BlLnBvbHkgPSB7XG4gICAgY2xpY2s6IGZ1bmN0aW9uKCRwYXJhbXMpIHtcblxuICAgIH1cbiAgfTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9