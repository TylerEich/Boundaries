"use strict";
'use strict';
angular.module('boundaries.drawing', ['ngStorage', 'boundaries.map', 'boundaries.color']).service('DirectionsSvc', function($q, MapSvc) {
  var directions = new MapSvc.DirectionsService();
  this.route = function(locations) {
    var requests = [];
    var chunkLength = 10;
    var i,
        j,
        chunk,
        start,
        end,
        waypoints;
    for (i = 0; i < locations.length; i += chunkLength) {
      if ((locations.length - i - chunkLength) === 1) {
        chunkLength--;
      }
      chunk = locations.slice(i, i + chunkLength);
      start = chunk.shift();
      end = chunk.pop();
      waypoints = [];
      for (j = 0; j < chunk.length; j++) {
        waypoints.push({location: chunk[i]});
      }
      requests.push({
        origin: start,
        destination: end,
        waypoints: waypoints,
        travelMode: MapSvc.TravelMode.DRIVING
      });
    }
    var deferreds = [],
        promises = [];
    function processRequest(i, tries) {
      directions.route(requests[i], function(result, status) {
        if (status === MapSvc.DirectionsStatus.OK) {
          var overviewPath = result.routes[0].overview_path;
          overviewPath.shift();
          deferreds[i].resolve(overviewPath);
        } else if (status === MapSvc.DirectionsStatus.UNKNOWN_ERROR && tries < 3) {
          tries++;
          processRequest(i, tries);
        } else {
          deferreds[i].reject();
        }
      }, function() {
        if (tries < 3) {
          tries++;
          processRequest(i, tries);
        } else {
          deferreds[i].reject();
        }
      });
    }
    for (i = 0; i < requests.length; i++) {
      deferreds.push($q.deferred());
      promises.push(deferreds[deferreds.length - 1].promise);
      (processRequest)(i, 0);
    }
    var finalPromise = $q.all(promises).then(function(paths) {
      var combinedPaths = Array.prototype.concat.apply(paths[0], paths.slice(1));
      return combinedPaths;
    });
    return finalPromise;
  };
}).service('DrawingSvc', function($q, $localStorage, DirectionsSvc, MapSvc, ColorSvc) {
  function makeIcon(color) {
    console.log(color);
    return {
      path: MapSvc.SymbolPath.CIRCLE,
      scale: 10,
      strokeColor: '#' + ColorSvc.convert.rgba(color).to.hex24(),
      strokeOpacity: 1,
      strokeWeight: 2.5
    };
  }
  function makeMarkerOptions(color, latLng) {
    console.log(color);
    return {
      clickable: false,
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
      clickable: false,
      draggable: false,
      editable: true,
      map: MapSvc.map
    };
    var hex = '#' + ColorSvc.convert.rgba(color).to.hex24(),
        a = color.a;
    if (fill) {
      value.fillColor = hex;
      value.fillOpacity = a;
    } else {
      value.strokeColor = hex;
      value.strokeOpacity = a;
    }
    return value;
  }
  this.makePath = function(locations, rigid) {
    var deferred = $q.defer();
    if (rigid) {
      deferred.resolve(locations);
    } else {
      DirectionsSvc.route(locations).then(deferred.resolve);
    }
    return deferred.promise;
  };
  this.splicePath = function(originalPath, index, removeLength, path) {
    var args = [index, removeLength].concat(path);
    Array.prototype.splice.apply(originalPath, args);
  };
  this.makeNode = function(colorIndex, latLng) {
    var color = $localStorage.colors[colorIndex];
    var marker = new MapSvc.Marker(makeMarkerOptions(color, latLng));
    return {
      lat: latLng.lat(),
      lng: latLng.lng(),
      index: -1,
      _marker: marker
    };
  };
  this.spliceNode = function(drawingIndex, nodeIndex, removeLength, newNodes) {
    if (removeLength === undefined) {
      removeLength = this.drawings[drawingIndex].nodes.length;
    }
    if (newNodes === undefined) {
      newNodes = [];
    }
    var args = [nodeIndex, removeLength].concat(newNodes);
    var removed = Array.prototype.splice.apply(this.drawings[drawingIndex], args);
    for (var i in removed) {
      removed[i]._marker.setMap(null);
    }
    var drawing = this.drawings[drawingIndex];
    var promises = [];
    var start,
        end;
    if (nodeIndex === 0) {
      start = 0;
    } else if (nodeIndex < drawing.nodes.length) {
      start = nodeIndex - 1;
    }
    end = start + newNodes.length;
    var changedNodes = this.drawings.slice(start, end);
    var locations = [];
    var rigid;
    for (i = 0; i < changedNodes.length; i++) {
      var node = changedNodes[i];
      if (i <= 1) {
        rigid = node.rigid;
      } else if (rigid !== node.rigid) {
        promises.push(this.makePath(locations));
        locations = locations.slice(-1);
      }
      locations.push(new MapSvc.LatLng(node.lat, node.lng));
      if (i === changedNodes.length - 1) {
        promises.push(this.makePath(locations));
      }
    }
    $q.all(promises).then(function(resolves) {
      var newPath = [].concat(resolves);
    });
  };
  this.makeDrawing = function(colorIndex, rigid, fill) {
    console.log('makeDrawing:', arguments);
    var poly;
    var color = $localStorage.colors[colorIndex];
    if (fill) {
      poly = new MapSvc.Polygon(makePolyOptions(color, true));
    } else {
      poly = new MapSvc.Polyline(makePolyOptions(color, true));
    }
    return {
      colorIndex: colorIndex,
      rigid: rigid,
      fill: fill,
      _poly: poly,
      nodes: []
    };
  };
  this.spliceDrawing = function(drawingIndex, removeLength, newDrawings) {
    console.log('spliceDrawing:', arguments, 'drawings:', this.drawings);
    if (removeLength === undefined) {
      removeLength = this.drawings.length;
    }
    if (newDrawings === undefined) {
      newDrawings = [];
    }
    var args = [drawingIndex, removeLength].concat(newDrawings);
    var removed = Array.prototype.splice.apply(this.drawings, args);
    for (var i in removed) {
      removed[i].poly.setMap(null);
      this.spliceNode(i, 0);
    }
  };
  this.drawings = [];
}).controller('DrawingCtrl', function($scope, $localStorage, DrawingSvc) {
  $scope.$storage = $localStorage.$default({
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
  $scope.$on('map:click', function(event, param) {
    var lastDrawingIndex = DrawingSvc.drawings.length - 1;
    var colorIndex = $scope.$storage.activeColor;
    var rigid = true,
        fill = false;
    if (lastDrawingIndex === -1) {
      var newDrawing = DrawingSvc.makeDrawing(colorIndex, rigid, fill);
      DrawingSvc.spliceDrawing(0, 0, newDrawing);
      lastDrawingIndex++;
    }
    var newNodeIndex = DrawingSvc.drawings[lastDrawingIndex].nodes.length;
    DrawingSvc.spliceNode(lastDrawingIndex, newNodeIndex, 0, DrawingSvc.makeNode(colorIndex, param.latLng));
    console.log(param.latLng.lat(), param.latLng.lng());
  });
  $scope.marker = {click: function($event) {}};
  $scope.poly = {click: function($event) {}};
});
