/* jshint camelcase: false */

angular.module('bndry.drawing', ['ngStorage', 'bndry.map', 'bndry.color', 'bndry.shape', 'bndry.history'])
.service('DirectionsSvc', function($q, MapSvc) {
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
      directions.route(request,
        // Success handler

        function(result, status) {
          if (status === MapSvc.DirectionsStatus.OK) {
            var overviewPath = result.routes[0].overview_path;

            // Resolve with path
            deferred.resolve(overviewPath);
          } else if (status ===
            MapSvc.DirectionsStatus.UNKNOWN_ERROR && tries < 3) {
            tries++;
            // Try again
            processRequest(tries);
          } else {
            deferred.reject();
          }
        },
        // Error handler

        function() {
          if (tries < 3) {
            // Try again
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
})
.service('DrawingSvc', function($rootScope, $q, $localStorage, DirectionsSvc, MapSvc, ColorSvc, ShapeSvc) {
  var self = this;



  function splice(itemArray, index = 0, removeLength = 0, newItems = []) {
    var args = [index, removeLength].concat(newItems);
    
    return Array.prototype.splice.apply(itemArray, args);
  }
  
  function change(object, changes) {
    for (var key in changes) {
      if (changes.hasOwnProperty(key)) {
        object[key] = changes[key];
      }
    }
  }
  
  function arrayify(items) {
    if (!Array.isArray(items)) {
      return [items];
    } else {
      return items;
    }
  }
  
  
  
  /*
  *** PRIVATE METHODS ***
  */
  // Path functions
  function makePoint(latLng) {
    console.assert(
      'lat' in latLng &&
      'lng' in latLng &&
      typeof latLng.lat === 'number' &&
      typeof latLng.lat === 'number',
      
      'latLng is not formatted properly'
    );
    return new MapSvc.LatLng(latLng.lat, latLng.lng);
  }
  
  function addPoints(path, index, points) {
    return splice(path, index, 0, points);
  }
  
  function removePoints(path, index, removeLength) {
    return splice(path, index, removeLength);
  }



  function makePaths(locations, rigid = false) {
    console.assert(
      Array.isArray(locations),
      
      'locations is not an Array'
    );
    
    var promises = [];
    for (var i = 0; i < locations.length - 1; i++) {
      var start = locations[i],
        end = locations[i + 1],
        promise;
      
      if (rigid) {
        promise = start.equals(end) ?
          $q.when([start]) :
          $q.when([start, end]);
      } else {
        promise = DirectionsSvc.route([start, end]);
      }
      promises.push(promise);
    }
    
    return $q.all(promises);
  }



  // Node functions
  function addNodes(nodes, index, nodesToAdd) {
    nodesToAdd = arrayify(nodesToAdd);
    for (var node of nodesToAdd) {
      node._marker.setMap(MapSvc.map);
    }
    
    return splice(nodes, index, 0, nodesToAdd);
  }
  var addNode = addNodes;
  
  function removeNodes(nodes, index, removeLength = 1) {
    var removed = splice(nodes, index, removeLength);
    for (var node of removed) {
      node._marker.setMap(null);
    }
    
    return removed;
  }
  var removeNode = removeNodes;
  
  function changeNode(node, changes) {
    console.assert(
      typeof node === 'object' &&
      typeof changes === 'object',
      
      'Invalid parameters'
    );
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
    var nodeBefore = nodes[index - 1], indexForNode = 0;
    
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
    for (node of nodeRange) {
      points.push(makePoint(node));
    }
    if (nodeAfter) {
      points.push(makePoint(nodeAfter));
    }
    
    if (points.length < 2) {
      points.push(points[0]); // Duplicate first point; makePaths needs at least two points
    }
    
    return makePaths(points, rigid);
  }
  
  function makePathsAroundNode(nodes, index, rigid) {
    return makePathsAroundNodes(nodes, index, index, rigid);
  }
  

  
  function alignNodesWithPath(path, nodes) {
    var latLng;
    
    for (var node of nodes) {
      latLng = path[node.index];
      console.assert(
        latLng,

        'latLng is not defined'
      );
      changeNode(node, {
        lat: latLng.lat(),
        lng: latLng.lng()
      });
    }
  }
  
  
  
  function removeNodesAndTheirPathsFromDrawing(drawing, index, nodeRemoveLength) {
    var range = rangeOfPathAroundNodes(drawing.nodes, index, index + nodeRemoveLength);

    if (nodeRemoveLength === 0 && range.firstNode && !range.lastNode) {
      return;
    }
    var path = drawing._poly.getPath().getArray(),
      pathRemoveLength = range.length;

    // Special case to remove last point if lastNode
    if (range.lastNode) {
      pathRemoveLength++;
    }

    removePoints(path, range.start, pathRemoveLength);

    shiftIndexOfNodes(drawing.nodes, range.nodeStart, -range.length);
    var removedNodes = removeNodes(drawing.nodes, index, nodeRemoveLength);
    
    drawing._poly.setPath(path);

    $rootScope.$broadcast('drawing:change');
    
    return removedNodes;
  }
  
  function addNodesAndTheirPathsToDrawing(drawing, index, newNodes, newPaths) {
    var polyPath = drawing._poly.getPath().getArray(),
      nodes = drawing.nodes;
      
    var shifts = [];
    var path, lastPoint, i,
      pathRange = rangeOfPathAroundNodes(nodes, index, index + newNodes.length),
      pathIndex = pathRange.start;
      
    for (path of newPaths) {
      lastPoint = path.pop();
      
      // Adds new path
      addPoints(polyPath, pathIndex, path);
      
      pathIndex += path.length;
      shifts.push(path.length);
    }
    
    var alignLength = newPaths.length;
    shiftIndexOfNodes(nodes, pathRange.nodeStart, shifts);
    
    if (pathRange.lastNode && lastPoint) { // If lastNode is involved, put lastPoint back
      polyPath.push(lastPoint);
      alignLength++;
    }
    
    var nodesToAlign = nodes.slice(index, index + alignLength);
    alignNodesWithPath(polyPath, nodesToAlign);
    
    drawing._poly.setPath(polyPath);
    
    $rootScope.$broadcast('drawing:change');
    
    return polyPath;
  }
  
  
  
  function spliceNodesIntoDrawing(drawing, index, nodeRemoveLength, nodesToAdd = [], pathsToAdd = null) {
    return queue(
      function(drawing, index, nodeRemoveLength, nodesToAdd, pathsToAdd) {
        var removedNodes = removeNodesAndTheirPathsFromDrawing(drawing, index, nodeRemoveLength);
        
        if (nodesToAdd === null) {
          nodesToAdd = removedNodes;
        } else {
          nodesToAdd = arrayify(nodesToAdd);
        }
        
        setInitialIndexOfNodes(drawing.nodes, index, nodesToAdd);
        addNodes(drawing.nodes, index, nodesToAdd);
      
        var promise;
        if (pathsToAdd) {
          promise = $q.when(pathsToAdd);
        } else {
          promise = makePathsAroundNodes.bind(null, drawing.nodes, index, index + nodesToAdd.length, drawing.rigid)();
        }
        
        return promise.then(
          function(drawing, index, nodeRemoveLength, nodesToAdd, pathsToAdd) {
            return addNodesAndTheirPathsToDrawing(drawing, index, nodesToAdd, pathsToAdd);
          }.bind(null, drawing, index, nodeRemoveLength, nodesToAdd)
        );
      }.bind(null, drawing, index, nodeRemoveLength, nodesToAdd, pathsToAdd)
    );
  }
  
  
  
  /*
  *** PUBLIC API ***
  */
  var internalQueue = $q.when();
  function queue(steps = []) { // Keeps path operations in correct order
    console.assert(
      steps !== undefined,

      'steps cannot be undefined'
    );
    
    steps = arrayify(steps);
    for (var step of steps) {
      internalQueue = internalQueue.then(step);
    }
    
    return internalQueue;
  }
  self.queue = queue;
  
  
  
  // Drawing functions
  function makeDrawing(colorIndex, rigid, fill = false) {
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
    return queue(
      splice.bind(null, drawings, index, 0, drawingsToAdd)
    );
  }
  self.addDrawings = self.addDrawing = addDrawings;
  
  function removeDrawings(drawings, index, removeLength) {
    return queue(
      function(drawings, index, removeLength) {
        var removedDrawings = splice(drawings, index, removeLength);
        for (var i = 0; i < removedDrawings.length; i++) {
          var removedDrawing = removedDrawings[i];
          removeNodesFromDrawing(removedDrawing, 0, removedDrawing.nodes.length);
          removedDrawing._poly.setMap(null);
        }
      }.bind(null, drawings, index, removeLength)
    );
  }
  self.removeDrawings = self.removeDrawing = removeDrawings;
  
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
    
    $rootScope.$broadcast('drawing:change');
  }
  
  
  
  function makeNode(colorIndex, latLng, index = null) {
    var marker = new MapSvc.Marker(makeMarkerOptions(colorIndex, latLng));

    return {
      lat: latLng.lat(),
      lng: latLng.lng(),
      index: index,
      _marker: marker
    };
  }
  self.makeNode = makeNode;
  
  function addNodesToDrawing(drawing, index, nodesToAdd = [], pathsToAdd = null) {
    return spliceNodesIntoDrawing(drawing, index, 0, nodesToAdd, pathsToAdd);
  }
  self.addNodesToDrawing = self.addNodeToDrawing = addNodesToDrawing;
  
  function removeNodesFromDrawing(drawing, index, removeLength, pathsToAdd = null) {
    return spliceNodesIntoDrawing(drawing, index, removeLength, [], pathsToAdd);
  }
  self.removeNodesFromDrawing = self.removeNodeFromDrawing = removeNodesFromDrawing;
  
  function changeNodeOfDrawing(drawing, index, changes, pathsToAdd = null) {
    queue(
      function(drawing, index, changes) {
        changeNode(drawing.nodes[index], changes);
      }.bind(null, drawing, index, changes)
    );
    
    return spliceNodesIntoDrawing.bind(null, drawing, index, 1, null, pathsToAdd)(); 
  }
  self.changeNodeOfDrawing = changeNodeOfDrawing;
  


  function makeIcon(colorIndex, options) {
    var color = ColorSvc.colors[colorIndex];
    var icon = {
      path: MapSvc.SymbolPath.CIRCLE,
      scale: 10,
      strokeColor: '#' + ColorSvc.convert.rgba(color).to.hex24(),
      strokeOpacity: 1,
      strokeWeight: 2.5
    };
    change(icon, options);
    
    return icon;
  }
  
  function makeMarkerOptions(colorIndex, latLng, options) {
    var markerOptions = {
      clickable: true,
      crossOnDrag: false,
      cursor: 'pointer',
      draggable: true,
      flat: true,
      icon: makeIcon(colorIndex),
      map: MapSvc.map,
      position: latLng
    };
    change(markerOptions, options);
    
    return markerOptions;
  }
  
  function makePolyOptions(colorIndex, fill) {
    var value = {
      clickable: !fill,
      draggable: false,
      editable: false,
      map: MapSvc.map
    };

    var color = angular.copy(ColorSvc.colors[colorIndex]);
    color.a = 0.5;
    
    if (fill) {
      value.fillColor = rgbaColorToString(color);
      value.fillOpacity = 1;
      value.strokeWeight = 0;
    } else {
      value.strokeColor = rgbaColorToString(color);
      value.strokeWeight = color.weight;
    }

    return value;
  }
  
  
  
  function drawingsToGeoJson(drawings) {
    var geoJson = {
      type: 'FeatureCollection'
    };

    geoJson.features = drawings.map(
      (drawing) => {
        var feature = {
          type: 'Feature'
        };
        
        var polyPath = drawing._poly.getPath().getArray();          
        var coordinates = polyPath.map(
          (latLng) => {
            return [
              latLng.lng(),
              latLng.lat()
            ];
          }
        );
        
        feature.geometry = {
          type: drawing.fill ? 'Polygon' : 'LineString',
          coordinates: drawing.fill ? [coordinates] : coordinates
        };
        
        var {colorIndex, rigid, fill, nodes} = drawing;
        feature.properties = {colorIndex, rigid, fill};
        feature.properties.nodes = nodes.map(
          (node) => {
            var {lat, lng, index} = node;
            return {lat, lng, index};
          }
        );
        return feature;
      }
    );
    
    return JSON.stringify(geoJson);
  }
  self.drawingsToGeoJson = drawingsToGeoJson;
  
  function geoJsonToDrawings(geoJsonString) {
    console.assert(
      typeof geoJsonString === 'string',

      'geoJson must be a string'
    );
    
    var drawings = [];
    var geoJson = JSON.parse(geoJsonString);
    var drawings = geoJson.features.map(
      (feature, i) => {
        var {colorIndex, rigid, fill, nodes} = feature.properties;
        var drawing = makeDrawing(colorIndex, rigid, fill);
        addDrawings(drawings, i, drawing);
        
        var nodesToAdd = nodes.map(
          (node) => {
            var latLng = new MapSvc.LatLng(node.lat, node.lng);
            return makeNode.bind(null, drawing.colorIndex, latLng, node.index)();
          }
        );
        
        var coordinates;
        if (fill) {
          coordinates = feature.geometry.coordinates[0];
        } else {
          coordinates = feature.geometry.coordinates;
        }
        var polyPath = coordinates.map(
          (coordinate) => new MapSvc.LatLng(coordinate[1], coordinate[0])
        );
        
        var pathsToAdd = [];
        for (var i = 0; i < nodesToAdd.length - 1; i++) {
          var nodeAt = nodesToAdd[i],
            nodeAfter = nodesToAdd[i + 1],
            pathChunk = polyPath.slice(nodeAt.index, nodeAfter.index + 1);
          
          pathsToAdd.push(pathChunk);
        }
        
        console.log(pathsToAdd);
        
        addNodesToDrawing.bind(null, drawing, 0, nodesToAdd, pathsToAdd)();
        
        return drawing;
      }
    );
    
    return drawings;
  }
  self.geoJsonToDrawings = geoJsonToDrawings;
  
  
  
  function rgbaColorToString(rgba) {
    return `rgba(${Math.round(rgba.r*255)},${Math.round(rgba.g*255)},${Math.round(rgba.b*255)},${rgba.a})`;
  }
  
  
  
  var activeMarker = new MapSvc.Marker();
  function showActiveNode(colorIndex, node) {
    var color = ColorSvc.colors[colorIndex];
    activeMarker.setOptions(makeMarkerOptions(colorIndex, makePoint(node), {
      clickable: false,
      draggable: false,
      icon: makeIcon(colorIndex, {
        scale: 20,
        strokeWeight: 2,
        strokeOpacity: 0.5,
        fillColor: '#' + ColorSvc.convert.rgba(color).to.hex24(),
        fillOpacity: 0.125
      })
    }));
  }
  self.showActiveNode = showActiveNode;
  
  function hideActiveNode() {
    activeMarker.setMap(null);
  }
  self.hideActiveNode = hideActiveNode;
  
  
  
  self.forceCreateNewDrawing = false;
  
  self.shouldCreateNewDrawing = () => {
    if (self.drawings.length === 0 || self.forceCreateNewDrawing) {
      return true;
    }
    var latestDrawing = self.drawings[self.drawings.length - 1];
    var value = (latestDrawing &&
      (latestDrawing.colorIndex !== ColorSvc.activeColorIndex() ||
      latestDrawing.rigid !== ShapeSvc.rigid() ||
      latestDrawing.fill !== ShapeSvc.fill()));
    return value;
  };
  
  self.drawings;
})
// Controllers
.controller('DrawingCtrl', function($scope, $localStorage, $timeout, DrawingSvc, ColorSvc, ShapeSvc, HistorySvc) {
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
    }]
  });
  
  var drawings = $scope.drawings = DrawingSvc.drawings = [];
  
  // Load last saved drawings from geoJson in localStorage
  var storedDrawings = DrawingSvc.geoJsonToDrawings(
    localStorage.geoJson || DrawingSvc.drawingsToGeoJson(drawings)
  );
  for (var storedDrawing of storedDrawings) {
    drawings.push(storedDrawing);
  }
  
  var activeDrawingIndex = drawings.length - 1;
  var queue = DrawingSvc.queue;
  // $scope.$storage = DrawingSvc.loadDrawings();

  function addNode(event, param) {
    var colorIndex = ColorSvc.activeColorIndex();
    
    var rigid = ShapeSvc.rigid(),
      fill = ShapeSvc.fill();

    var createNewDrawing = DrawingSvc.shouldCreateNewDrawing();
    if (createNewDrawing) {
      var newDrawing = DrawingSvc.makeDrawing(colorIndex, rigid, fill);
      activeDrawingIndex++;
      DrawingSvc.addDrawing(drawings, activeDrawingIndex, newDrawing);
      DrawingSvc.forceCreateNewDrawing = false;
    }

    queue(
      function(activeDrawingIndex, colorIndex, latLng, createNewDrawing) {
        var drawing = drawings[activeDrawingIndex];
        var newNode = DrawingSvc.makeNode(colorIndex, latLng);
        var nodeIndex = drawing.nodes.length;
        
        DrawingSvc.addNodeToDrawing(drawing, nodeIndex, newNode);
        
        HistorySvc.add({
          undo: function(drawings, drawing, drawingIndex, nodeIndex, didCreateNewDrawing) {
            DrawingSvc.removeNodeFromDrawing(drawing, nodeIndex, 1);
            
            if (didCreateNewDrawing) {
              DrawingSvc.removeDrawing(drawings, drawingIndex, 1);
            }
          }.bind(null, drawings, drawing, activeDrawingIndex, nodeIndex, createNewDrawing),
          
          redo: function(drawings, drawing, drawingIndex, nodeIndex, newNode, didCreateNewDrawing) {
            if (didCreateNewDrawing) {
              DrawingSvc.addDrawing(drawings, drawingIndex, drawing);
            }
            
            DrawingSvc.addNodeToDrawing(drawing, nodeIndex, newNode);
          }.bind(null, drawings, drawing, activeDrawingIndex, nodeIndex, newNode, createNewDrawing)
        });
      }.bind(null, activeDrawingIndex, colorIndex, param.latLng, createNewDrawing)
    );
  }
  function changeNode($params, drawingIndex, nodeIndex) {
    var event = $params[0],
      drawing = drawings[drawingIndex],
      latLng = event.latLng;
    
    queue(
      function(drawing, nodeIndex, latLng) {
        var originalNode = drawing.nodes[nodeIndex],
          originalPosition = {
            lat: originalNode.lat,
            lng: originalNode.lng
          },
          newPosition = {
            lat: latLng.lat(),
            lng: latLng.lng()
          };
        DrawingSvc.changeNodeOfDrawing(drawing, nodeIndex, newPosition);
        
        HistorySvc.add({
          undo: function(drawing, nodeIndex, originalPosition) {
            DrawingSvc.changeNodeOfDrawing(drawing, nodeIndex, originalPosition);
          }.bind(null, drawing, nodeIndex, originalPosition),
          
          redo: function(drawing, nodeIndex, newPosition) {
            DrawingSvc.changeNodeOfDrawing(drawing, nodeIndex, newPosition);
          }.bind(null, drawing, nodeIndex, newPosition)
        });
      }.bind(null, drawing, nodeIndex, latLng)
    );
  }
  
  $scope.$on('map:click', addNode);
  $scope.$on('action:clear', function($params) {
    DrawingSvc.removeDrawings(drawings, 0, drawings.length);
    activeDrawingIndex = -1;
  });
  
  $scope.$on('drawing:change', () => {
    localStorage.geoJson = DrawingSvc.drawingsToGeoJson(drawings);
    
    if (drawings.length > 0 && drawings[0].nodes.length > 0) {
      var latestNodes = drawings[drawings.length - 1].nodes,
        latestNode = latestNodes[latestNodes.length - 1];
      
      DrawingSvc.showActiveNode(ColorSvc.activeColorIndex(), latestNode);
    } else {
      DrawingSvc.hideActiveNode();
    }
  });
  
  $scope.marker = {
    click: function($params) {
      addNode(undefined, $params[0]);
    },
    dragend: changeNode
  };
  $scope.poly = {
    click: function($params) {
      addNode(undefined, $params[0]);
    }
  };
});
