/* jshint camelcase: false */

'use strict';

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
    function change(object, changes) {
      for (var key in changes) {
        if (changes.hasOwnProperty(key)) {
          object[key] = changes[key];
        }
      }
    }
    // function debugDrawing() {
    //   var drawing = self.drawings[self.drawings.length - 1];
    //   // console.info('Index of last node:', drawing.nodes[drawing.nodes.length - 1].index);
    //   // console.info('Length of path:', drawing._poly.getPath().getLength());
    // }
    
    
    /* DrawingSvc hierarchy:
     | - drawings
       | - nodes
       | - path
    */
    // Path functions
    function makePath(locations, rigid = false) {
      var deferred = $q.defer();
      if (rigid) {
        deferred.resolve(locations);
      } else {
        DirectionsSvc.route(locations)
          .then(deferred.resolve);
      }

      return deferred.promise;
    }
    function addPoints(path, index, points) {
      return splice(path, index, 0, points);
    }
    function removePoints(path, index, removeLength) {
      return splice(path, index, removeLength);
    }

    // Node functions
    function makeNode(color, latLng, index = null) {
      var marker = new MapSvc.Marker(makeMarkerOptions(color, latLng));

      return {
        lat: latLng.lat(),
        lng: latLng.lng(),
        index: index,
        _marker: marker
      };
    }
    self.makeNode = makeNode;
    
    function addNodes(nodes, index, nodeToAdd) {
      splice(nodes, index, 0, nodeToAdd);
    }
    var addNode = addNodes;
    
    function removeNodes(nodes, index, removeLength = 1) {
      var removed = splice(nodes, index, removeLength);
      for (var i = 0; i < removed.length; i++) {
        removed[i]._marker.setMap(null);
      }
    }
    var removeNode = removeNodes;
    
    function changeNode(nodes, index, changes) {
      
    }
    function shiftIndexOfNodes(nodes, index, shift) {
      for (var i = index; i < nodes.length; i++) {
        nodes[i].index += shift;
      }
    }
    function getRangeOfAffectedPathForNode(nodes, index) {
      var range = {
        start: null,
        end: null,
        isLastNode: false
      };
      var nodeBefore = nodes[index - 1],
        nodeAt = nodes[index],
        nodeAfter = nodes[index + 1];
      
      if (nodeBefore) {
        range.start = nodeBefore.index;
      } else {
        range.start = 0;
      }
      if (nodeAfter) {
        range.end = nodeAfter.index;
      } else {
        range.end = nodeAt.index;
        range.isLastNode = true;
      }
      
      return range;
    }
    function addNodeLocationToEndOfPath(nodes, path, respond = false) {
      if (!respond) {
        return;
      }
      
      var node;
      if (Array.isArray(nodes)) {
        node = nodes[nodes.length - 1];
      } else {
        node = nodes;
      }
      
      addPoints(path, path.length, {
        lat: node.lat,
        lng: node.lng
      });
    }
    
    // function spliceNode(drawingIndex, nodeIndex, removeLength, newNode, cachedPath) {
    //   if (removeLength === undefined) {
    //     removeLength = self.drawings[drawingIndex].nodes.length;
    //   }
    //
    //   var drawing = self.drawings[drawingIndex];
    //
    //   var args = [nodeIndex, removeLength];
    //   if (newNode) {
    //     newNode._marker.setMap(MapSvc.map);
    //     args = args.concat(newNode);
    //   }
    //   var removed = Array.prototype.splice.apply(drawing.nodes, args);
    //
    //   // Update paths of drawing
    //   var nodeBefore, nodeAtIndex, nodeAfter;
    //
    //   nodeAtIndex = drawing.nodes[nodeIndex];
    //
    //   if (nodeIndex >= 1 && nodeIndex - 1 < drawing.nodes.length) {
    //     nodeBefore = drawing.nodes[nodeIndex - 1];
    //   }
    //
    //   if (nodeIndex >= 0 && nodeIndex + 1 < drawing.nodes.length) {
    //     nodeAfter = drawing.nodes[nodeIndex + 1];
    //   }
    //
    //   var poly = drawing._poly,
    //     path = poly.getPath().getArray();
    //
    //   // If something was removed
    //   if (removed.length > 0) {
    //     var removeStart = (nodeBefore ? nodeBefore.index : -1) + 1,
    //       removeEnd = (nodeAfter ? nodeAfter.index : removed[removed.length - 1].index + 1),
    //       pathRemoveLength = removeEnd - removeStart;
    //
    //     self.splicePath(path, removeStart, pathRemoveLength);
    //     poly.setPath(path);
    //
    //     if (nodeAtIndex) {
    //       nodeAtIndex.index = nodeBefore ? nodeBefore.index : 0;
    //     }
    //
    //     shiftNodeIndices(drawingIndex, nodeIndex + 1, -pathRemoveLength);
    //
    //     // Remove obselete markers from map
    //     for (var i = 0; i < removed.length; i++) {
    //       removed[i]._marker.setMap(null);
    //     }
    //   }
    //
    //   if (cachedPath) {
    //     var poly = drawing._poly,
    //       path = poly.getPath().getArray();
    //
    //     self.splicePath(path, removedPath);
    //   }
    //
    //   saveDrawings();
    //
    //   var promises = [],
    //     promise;
    //   var nodeAtIndexLocation,
    //     nodeBeforeLocation,
    //     nodeAfterLocation;
    //
    //   if (nodeAtIndex) {
    //     nodeAtIndexLocation = new MapSvc.LatLng(nodeAtIndex.lat, nodeAtIndex.lng);
    //   } else {
    //     return;
    //   }
    //   if (nodeBefore) {
    //     nodeBeforeLocation = new MapSvc.LatLng(nodeBefore.lat, nodeBefore.lng);
    //
    //     promise = self.makePath([nodeBeforeLocation, nodeAtIndexLocation], drawing.rigid)
    //       .then(function(path) {
    //         nodeAtIndex.index = nodeBefore.index;
    //         return path;
    //       });
    //     promises.push(promise);
    //   }
    //   if (nodeAfter) {
    //     nodeAfterLocation = new MapSvc.LatLng(nodeAfter.lat, nodeAfter.lng);
    //
    //     promises.push(self.makePath([nodeAtIndexLocation, nodeAfterLocation], drawing.rigid));
    //   }
    //   if (!nodeBefore && !nodeAfter) {
    //     // Special case for single node; snaps to road if flexible
    //     promises.push(self.makePath([nodeAtIndexLocation, nodeAtIndexLocation], drawing.rigid));
    //   }
    //
    //   $q.all(promises).then(function(pathResults) {
    //     var newPath,
    //       newPathBefore,
    //       newPathAfter,
    //       polyPath = drawing._poly.getPath().getArray(),
    //       spliceIndex = 0,
    //       nodeAtIndexMarkerPosition;
    //
    //       // Function for splicing path goes here.
    //   });
    // };

    // Drawing functions
    function makeDrawing(colors, colorIndex, rigid, fill = false) {
      var poly,
      color = colors[colorIndex];

      if (fill) {
        poly = new MapSvc.Polygon(makePolyOptions(color, fill));
      } else {
        poly = new MapSvc.Polyline(makePolyOptions(color, fill));
      }

      return {
        color: color,
        rigid: rigid,
        fill: fill,
        _poly: poly,
        nodes: []
      };
    }
    function addDrawing(drawings, index, drawing) {
      
    }
    function addNodesToDrawing(drawing, index, nodesToAdd, pathToAdd = null) {
      var nodes = drawing.nodes;
      addNodes(nodes, index, nodesToAdd);
      
      var range = getRangeOfAffectedPathForNode(nodes, index);
      
      changePathOfDrawing(drawing, index, pathToAdd, range);
    }
    function removeDrawings(drawings, index, removeLength) {
      
    }
    function removeNodesFromDrawing(drawing, index, removeLength, pathToAdd = null) {
      var nodes = drawing.nodes;
      removeNodes(nodes, index, removeLength);
      
      var promise,
        rangeOfAffectedPath;
      rangeOfAffectedPath = getRangeOfAffectedPathForNode(nodes, index);
    }
    function changePathOfDrawing(drawing, index, pathToAdd, range) {
      var nodes = drawing.nodes;
      
      var promise,
        path = drawing._poly.getPath().getArray(),
        pathIndex = range.start,
        pathRemoveLength = range.end - range.start;
      
      if (pathToAdd === null) {
        promise = makePathAroundNode(nodes, index);
      } else {
        var deferred = $q.defer();
        deferred.resolve(pathToAdd);
        promise = deferred.promise;
      }
    
      promise.then(function(pathResult) {
        removePoints(path, pathIndex, pathRemoveLength);
        addPoints(path, pathIndex, pathToAdd);
        addNodeLocationToEndOfPath(nodes, path, range.isLastNode);
        shiftIndexOfNodes(nodes, index, pathResult.length - pathRemoveLength);
        drawing._poly.setPath(path);
      });
    }
    function changeDrawing(drawing, changes) {
      
    }
    // function spliceDrawing(drawingIndex, removeLength, newDrawing) {
    //   if (removeLength === undefined) {
    //     removeLength = self.drawings.length;
    //   }
    //
    //   var removed = drawings.slice(drawingIndex, drawingIndex + removeLength); // Get obselete drawings
    //
    //   // Remove obselete drawings from map
    //   for (var i in removed) {
    //     removed[i]._poly.setMap(null);
    //
    //     // Remove all nodes of drawing
    //     spliceNode(i, 0);
    //   }
    //
    //   var args = [drawingIndex, removeLength];
    //   if (newDrawing) {
    //     args.push(newDrawing);
    //   }
    //   Array.prototype.splice
    //     .apply(drawings, args); // Remove obselete drawings
    // }

    function createSavableDrawings(drawings) {
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
    function createLoadableDrawings(drawings) {
      var storedDrawings = $localStorage.drawings || {};
      for (var i = 0; i < storedDrawings.length; i++) {
        var storedDrawing = storedDrawings[i];
        var path = MapSvc.geometry.encoding.decodePath(storedDrawing.path);
        var drawing = self.makeDrawing(storedDrawing.colorIndex, storedDrawing.rigid,
          storedDrawing.fill, path);
          
        for (var j = 0; j < storedDrawing.nodes.length; j++) {
          var storedNode = storedDrawing[j];
          var latLng = new MapSvc.LatLng(storedNode.lat, storedNode.lng);
          var node = self.makeNode(storedDrawing.colorIndex, latLng);
          
          drawing.nodes.push(node);
        }
        
        self.drawings.push(drawing);
      }
      
    }
    
    // function(pathResults) {
    //   if (pathResults.length === 2) {
    //     pathResults[1].shift();
    //   }
    //
    //   
    //
    //   newPath = Array.prototype.concat.apply([], pathResults);
    //
    //   // Will alter original path
    //   self.splicePath(polyPath, spliceIndex, 0, newPath);
    //
    //   newNode._marker.setPosition(nodeAtIndexMarkerPosition);
    //   drawing._poly.setPath(polyPath);
    //
    //   saveDrawings();
    // }

    function rgbaColorToString(rgba) {
      return `rgba(${rgba.r*100}%,${rgba.g*100}%,${rgba.b*100}%,${rgba.a})`;
    }

    function shiftIndices(array, index, shift) {
      for (var i = index; i < array.length; i++) {
        array[i].index += shift;
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

    // Public functions
    self.makePath = makePath;
    
    self.makeNode = makeNode;
    // self.spliceNode = spliceNode;
    
    self.makeDrawing = makeDrawing;
    self.spliceDrawing = spliceDrawing;

    self.drawings = [];
  })

// Controllers
.controller('DrawingCtrl', function($scope, $localStorage, DrawingSvc, HistorySvc) {
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
  // $scope.$storage = DrawingSvc.loadDrawings();

  function addNode(event, param) {
    var colorIndex = $scope.$storage.activeColor;

    // TODO: actual variable values
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
  $scope.poly = {
    click: function($params) {

    }
  };
});
