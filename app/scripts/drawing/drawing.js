/* jshint camelcase: false */

angular.module('bndry.drawing', ['ngStorage', 'bndry.map', 'bndry.color', 'bndry.history'])
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
  .service('DrawingSvc', function($rootScope, $q, $localStorage, DirectionsSvc, MapSvc, ColorSvc) {
    var self = this;

    function splice(itemArray, index = 0, removeLength = 0, newItems = []) {
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
    function arrayify(items) {
      if (!Array.isArray(items)) {
        return [items];
      } else {
        return items;
      }
    }
    /* DrawingSvc hierarchy:
     | - drawings
       | - nodes
       | - path
    */
    
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
    function addPoints(path, index, points) {
      return splice(path, index, 0, points);
    }
    function removePoints(path, index, removeLength) {
      return splice(path, index, removeLength);
    }

    // Node functions
    function addNodes(nodes, index, nodesToAdd) {
      splice(nodes, index, 0, nodesToAdd);
    }
    var addNode = addNodes;
    
    function removeNodes(nodes, index, removeLength = 1) {
      var removed = splice(nodes, index, removeLength);
      for (var i = 0; i < removed.length; i++) {
        removed[i]._marker.setMap(null);
      }
    }
    var removeNode = removeNodes;
    
    function changeNode(node, changes) {
      console.assert(
        typeof node === 'object' &&
        typeof changes === 'object',
        
        'Invalid parameters'
      )
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
    function processPaths(paths) {
      
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
      removeNodes(drawing.nodes, index, nodeRemoveLength);
      
      drawing._poly.setPath(path);
      
      $rootScope.$broadcast('drawing:change');
    }
    function addNodesAndTheirPathsToDrawing(drawing, index, newNodes, newPaths = null) {
      setInitialIndexOfNodes(drawing.nodes, index, newNodes);
      addNodes(drawing.nodes, index, newNodes);
      
      var steps = []
      if (newPaths) {
        steps.push((newPaths => newPaths).bind(null, newPaths));
      } else {
        steps.push(makePathsAroundNodes.bind(null, drawing.nodes, index, index + newNodes.length, drawing.rigid));
      }
      
      steps.push(
        function(drawing, index, newNodes, newPaths) {
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
        }.bind(null, drawing, index, newNodes)
      );
      return queue(steps);
    }
    function spliceNodesIntoDrawing(drawing, index, nodeRemoveLength, nodesToAdd = [], pathsToAdd = null) {      
      var polyPath = drawing._poly.getPath().getArray();
      nodesToAdd = arrayify(nodesToAdd);
      
      // First, remove nodes and add new ones
      return queue(
        function(drawing, index, nodeRemoveLength, nodesToAdd, pathsToAdd) {
          removeNodesAndTheirPathsFromDrawing(drawing, index, nodeRemoveLength);
          return addNodesAndTheirPathsToDrawing(drawing, index, nodesToAdd, pathsToAdd);
        }.bind(null, drawing, index, nodeRemoveLength, nodesToAdd, pathsToAdd)
      );
    }
    
    /*
    *** PUBLIC API ***
    */
    var internalQueue = $q.when();
    function queue(steps) { // Keeps path operations in correct order
      console.assert(
        steps !== undefined,
  
        'steps cannot be undefined'
      );
      var internalQueue = arrayify(steps).reduce($q.when, internalQueue);
      return internalQueue;
    }
    self.queue = queue;
    
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
    
    function addNodesToDrawing(drawing, index, nodesToAdd = [], pathsToAdd = null) {
      return spliceNodesIntoDrawing(drawing, index, 0, nodesToAdd, pathsToAdd);
    }
    self.addNodesToDrawing = self.addNodeToDrawing = addNodesToDrawing;
    
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
    
    function removeNodesFromDrawing(drawing, index, removeLength, pathsToAdd = null) {
      return spliceNodesIntoDrawing(drawing, index, removeLength, [], pathsToAdd);
    }
    self.removeNodesFromDrawing = self.removeNodeFromDrawing = removeNodesFromDrawing;
    
    function changeNodeOfDrawing(drawing, index, changes, pathsToAdd = null) {
      return queue(
        function(drawing, index, changes, pathsToAdd) {
          var node = drawing.nodes[index];
          changeNode(node, changes);
          return spliceNodesIntoDrawing(drawing, index, 1, duplicateNode(drawing, node), pathsToAdd);
        }.bind(null, drawing, index, changes, pathsToAdd)
      );
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
      
      $rootScope.$broadcast('drawing:change');
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
        color.a = 0.5;
        value.strokeColor = rgbaColorToString(color);
        value.strokeWeight = color.weight;
      }

      return value;
    }
    
    self.forceCreateNewDrawing = false;
    self.shouldCreateNewDrawing = () => {
      if (self.drawings.length === 0 || self.forceCreateNewDrawing) {
        return true;
      }
      var latestDrawing = self.drawings[self.drawings.length - 1];
      return (latestDrawing && latestDrawing.colorIndex !== ColorSvc.activeColorIndex());
    };
    self.drawings;
  })
// Controllers
.controller('DrawingCtrl', function($scope, $localStorage, $timeout, DrawingSvc, ColorSvc, HistorySvc) {
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
  
  var queue = DrawingSvc.queue;
  var activeDrawingIndex = -1;
  // $scope.$storage = DrawingSvc.loadDrawings();

  function addNode(event, param) {
    var colorIndex = ColorSvc.activeColorIndex();
    
    // TODO: actual variable values
    var rigid = false,
      fill = false;

    if (DrawingSvc.shouldCreateNewDrawing()) {
      var newDrawing = DrawingSvc.makeDrawing(colorIndex, rigid, fill);
      activeDrawingIndex++;
      DrawingSvc.addDrawing(drawings, activeDrawingIndex, newDrawing);
      DrawingSvc.forceCreateNewDrawing = false;
    }

    queue(
      ((activeDrawingIndex, colorIndex, latLng) => {
        var drawing = drawings[activeDrawingIndex];
        var newNode = DrawingSvc.makeNode(colorIndex, latLng);
        
        DrawingSvc.addNodeToDrawing(drawing, drawing.nodes.length, newNode);
      }).bind(null, activeDrawingIndex, colorIndex, param.latLng)
    );

    // if (DrawingSvc.shouldCreateNewDrawing()) {
    //   var newDrawing = DrawingSvc.makeDrawing(colorIndex, rigid, fill);
    //   activeDrawingIndex++;
    //   DrawingSvc.addDrawing(drawings, activeDrawingIndex, newDrawing);
    //   DrawingSvc.forceCreateNewDrawing = false;
    // }
    //
    // var drawing = drawings[activeDrawingIndex];
    // var newNode = DrawingSvc.makeNode(colorIndex, param.latLng);
    // DrawingSvc.addNodeToDrawing(drawing, drawing.nodes.length, newNode);
    //
    // return;
    
    // HistorySvc.add({
    //   undo: function(drawing, nodeIndex, didCreateNewDrawing) {
    //     DrawingSvc.spliceNode(drawingIndex, nodeIndex, 1);
    //     if (didCreateNewDrawing) {
    //       DrawingSvc.spliceDrawing(drawingIndex, 1);
    //     }
    //   }.bind(null, lastDrawingIndex, newNodeIndex, shouldCreateNewDrawing()),
    //   redo: function(drawingIndex, nodeIndex, newNode) {
    //     DrawingSvc.spliceNode(drawingIndex, nodeIndex, 0, newNode);
    //   }.bind(null, lastDrawingIndex, newNodeIndex, newNode)
    // });
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
    
    // HistorySvc.add({
    //   undo: function(drawingIndex, nodeIndex, originalNode) {
    //     DrawingSvc.spliceNode(drawingIndex, nodeIndex, 1, originalNode);
    //   }.bind(null, drawingIndex, nodeIndex, originalNode),
    //   redo: function(drawingIndex, nodeIndex, newNode) {
    //     DrawingSvc.spliceNode(drawingIndex, nodeIndex, 1, newNode);
    //   }.bind(null, drawingIndex, nodeIndex, newNode)
    // });
  }
  $scope.$on('map:click', addNode);
  $scope.$on('action:clear', function($params) {
    DrawingSvc.removeDrawings(drawings, 0, drawings.length);
    activeDrawingIndex = -1;
  });
  $scope.$on('drawing:change', () => {
    localStorage.geoJson = DrawingSvc.drawingsToGeoJson(drawings);
  });
  
  // $timeout(function() {
  //   localStorage.geoJson = DrawingSvc.drawingsToGeoJson(drawings);
  //   $scope.$emit('action:clear');
  //   console.log(localStorage.geoJson);
  // }, 10000);
  // $timeout(function() {
  //   var storedDrawings = DrawingSvc.geoJsonToDrawings(localStorage.geoJson);
  //   for (var storedDrawing of storedDrawings) {
  //     drawings.push(storedDrawing);
  //   }
  // }, 12000);

  $scope.marker = {
    click: function($params) {
      addNode(undefined, $params[0]);
    },
    dragend: changeNode
  };
  $scope.poly = {
    click: function($params) {

    }
  };
});
