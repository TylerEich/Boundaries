"use strict";
describe('DrawingSvc ·', function() {
  var $q,
      $timeout,
      DrawingSvc,
      MapSvc,
      MockDirectionsSvc,
      drawing,
      node0,
      node1,
      node2,
      latLng;
  MockDirectionsSvc = function() {
    this.route = function(locations) {
      var path = [],
          lat,
          lng;
      path.push(locations[0]);
      if (!(locations[0].lat() === locations[1].lat() && locations[0].lng() === locations[1].lng())) {
        for (var i = 0; i < 8; i++) {
          lat = -90 + (180 * Math.random());
          lng = -180 + (360 * Math.random());
          path.push(new MapSvc.LatLng(lat, lng));
        }
        path.push(locations[1]);
      }
      return $q.when(path);
    };
  };
  var MockMapSvc = MapSvc = {
    '__gjsload__': function() {},
    'Animation': {
      'BOUNCE': 1,
      'DROP': 2,
      'k': 3,
      'j': 4
    },
    'Circle': function() {},
    'ControlPosition': {
      'TOP_LEFT': 1,
      'TOP_CENTER': 2,
      'TOP': 2,
      'TOP_RIGHT': 3,
      'LEFT_CENTER': 4,
      'LEFT_TOP': 5,
      'LEFT': 5,
      'LEFT_BOTTOM': 6,
      'RIGHT_TOP': 7,
      'RIGHT': 7,
      'RIGHT_CENTER': 8,
      'RIGHT_BOTTOM': 9,
      'BOTTOM_LEFT': 10,
      'BOTTOM_CENTER': 11,
      'BOTTOM': 11,
      'BOTTOM_RIGHT': 12,
      'CENTER': 13
    },
    'Data': function() {},
    'GroundOverlay': function() {},
    'ImageMapType': function() {},
    'InfoWindow': function() {},
    'LatLng': function(lat, lng) {
      var $__0 = this;
      this.lat = (function() {
        return lat;
      });
      this.lng = (function() {
        return lng;
      });
      this.equals = (function(latLng) {
        return ($__0.lat() === latLng.lat() && $__0.lng() === latLng.lng());
      });
    },
    'LatLngBounds': function() {},
    'MVCArray': function() {},
    'MVCObject': function() {},
    'Map': function() {},
    'MapTypeControlStyle': {
      'DEFAULT': 0,
      'HORIZONTAL_BAR': 1,
      'DROPDOWN_MENU': 2
    },
    'MapTypeId': {
      'ROADMAP': 'roadmap',
      'SATELLITE': 'satellite',
      'HYBRID': 'hybrid',
      'TERRAIN': 'terrain'
    },
    'MapTypeRegistry': function() {},
    'Marker': function() {
      this.setPosition = (function() {});
      this.setMap = (function() {});
    },
    'MarkerImage': function() {},
    'NavigationControlStyle': {
      'DEFAULT': 0,
      'SMALL': 1,
      'ANDROID': 2,
      'ZOOM_PAN': 3,
      'Dn': 4,
      'Xm': 5
    },
    'OverlayView': function() {},
    'Point': function() {},
    'Polygon': function() {
      var path;
      this.setPath = (function(polyPath) {
        path = polyPath;
      });
      this.getPath = (function() {
        return {getArray: (function() {
            return path;
          })};
      });
    },
    'Polyline': function() {
      var path = [];
      this.setPath = (function(polyPath) {
        path = polyPath;
      });
      this.getPath = (function() {
        return {getArray: (function() {
            return path;
          })};
      });
    },
    'Rectangle': function() {},
    'ScaleControlStyle': {'DEFAULT': 0},
    'Size': function() {},
    'StrokePosition': {
      'CENTER': 0,
      'INSIDE': 1,
      'OUTSIDE': 2
    },
    'SymbolPath': {
      'CIRCLE': 0,
      'FORWARD_CLOSED_ARROW': 1,
      'FORWARD_OPEN_ARROW': 2,
      'BACKWARD_CLOSED_ARROW': 3,
      'BACKWARD_OPEN_ARROW': 4
    },
    'ZoomControlStyle': {
      'DEFAULT': 0,
      'SMALL': 1,
      'LARGE': 2,
      'Xm': 3
    },
    'event': {
      'Re': false,
      'Zd': {},
      'addListener': function() {},
      'yf': function() {},
      'removeListener': function() {},
      'clearListeners': function() {},
      'clearInstanceListeners': function() {},
      'trigger': function() {},
      'addDomListener': function() {},
      'addDomListenerOnce': function() {},
      'ca': function() {},
      'bind': function() {},
      'addListenerOnce': function() {},
      'forward': function() {},
      'Ua': function() {},
      'bi': function() {},
      'Qj': function() {}
    },
    'BicyclingLayer': function() {},
    'DirectionsRenderer': function() {},
    'DirectionsService': function() {},
    'DirectionsStatus': {
      'OK': 'OK',
      'UNKNOWN_ERROR': 'UNKNOWN_ERROR',
      'OVER_QUERY_LIMIT': 'OVER_QUERY_LIMIT',
      'REQUEST_DENIED': 'REQUEST_DENIED',
      'INVALID_REQUEST': 'INVALID_REQUEST',
      'ZERO_RESULTS': 'ZERO_RESULTS',
      'MAX_WAYPOINTS_EXCEEDED': 'MAX_WAYPOINTS_EXCEEDED',
      'NOT_FOUND': 'NOT_FOUND'
    },
    'DirectionsTravelMode': {
      'DRIVING': 'DRIVING',
      'WALKING': 'WALKING',
      'BICYCLING': 'BICYCLING',
      'TRANSIT': 'TRANSIT'
    },
    'DirectionsUnitSystem': {
      'METRIC': 0,
      'IMPERIAL': 1
    },
    'DistanceMatrixService': function() {},
    'DistanceMatrixStatus': {
      'OK': 'OK',
      'INVALID_REQUEST': 'INVALID_REQUEST',
      'OVER_QUERY_LIMIT': 'OVER_QUERY_LIMIT',
      'REQUEST_DENIED': 'REQUEST_DENIED',
      'UNKNOWN_ERROR': 'UNKNOWN_ERROR',
      'MAX_ELEMENTS_EXCEEDED': 'MAX_ELEMENTS_EXCEEDED',
      'MAX_DIMENSIONS_EXCEEDED': 'MAX_DIMENSIONS_EXCEEDED'
    },
    'DistanceMatrixElementStatus': {
      'OK': 'OK',
      'NOT_FOUND': 'NOT_FOUND',
      'ZERO_RESULTS': 'ZERO_RESULTS'
    },
    'ElevationService': function() {},
    'ElevationStatus': {
      'OK': 'OK',
      'UNKNOWN_ERROR': 'UNKNOWN_ERROR',
      'OVER_QUERY_LIMIT': 'OVER_QUERY_LIMIT',
      'REQUEST_DENIED': 'REQUEST_DENIED',
      'INVALID_REQUEST': 'INVALID_REQUEST',
      'Bn': 'DATA_NOT_AVAILABLE'
    },
    'FusionTablesLayer': function() {},
    'Geocoder': function() {},
    'GeocoderLocationType': {
      'ROOFTOP': 'ROOFTOP',
      'RANGE_INTERPOLATED': 'RANGE_INTERPOLATED',
      'GEOMETRIC_CENTER': 'GEOMETRIC_CENTER',
      'APPROXIMATE': 'APPROXIMATE'
    },
    'GeocoderStatus': {
      'OK': 'OK',
      'UNKNOWN_ERROR': 'UNKNOWN_ERROR',
      'OVER_QUERY_LIMIT': 'OVER_QUERY_LIMIT',
      'REQUEST_DENIED': 'REQUEST_DENIED',
      'INVALID_REQUEST': 'INVALID_REQUEST',
      'ZERO_RESULTS': 'ZERO_RESULTS',
      'ERROR': 'ERROR'
    },
    'KmlLayer': function() {},
    'KmlLayerStatus': {
      'UNKNOWN': 'UNKNOWN',
      'OK': 'OK',
      'INVALID_REQUEST': 'INVALID_REQUEST',
      'DOCUMENT_NOT_FOUND': 'DOCUMENT_NOT_FOUND',
      'FETCH_ERROR': 'FETCH_ERROR',
      'INVALID_DOCUMENT': 'INVALID_DOCUMENT',
      'DOCUMENT_TOO_LARGE': 'DOCUMENT_TOO_LARGE',
      'LIMITS_EXCEEDED': 'LIMITS_EXECEEDED',
      'TIMED_OUT': 'TIMED_OUT'
    },
    'MaxZoomService': function() {},
    'MaxZoomStatus': {
      'OK': 'OK',
      'ERROR': 'ERROR'
    },
    'StreetViewCoverageLayer': function() {},
    'StreetViewPanorama': function() {},
    'StreetViewService': function() {},
    'StreetViewStatus': {
      'OK': 'OK',
      'UNKNOWN_ERROR': 'UNKNOWN_ERROR',
      'ZERO_RESULTS': 'ZERO_RESULTS'
    },
    'StyledMapType': function() {},
    'TrafficLayer': function() {},
    'TransitLayer': function() {},
    'TravelMode': {
      'DRIVING': 'DRIVING',
      'WALKING': 'WALKING',
      'BICYCLING': 'BICYCLING',
      'TRANSIT': 'TRANSIT'
    },
    'UnitSystem': {
      'METRIC': 0,
      'IMPERIAL': 1
    },
    'version': '3.16.8',
    'map': {}
  };
  beforeEach(module('bndry.drawing', function($provide) {
    $provide.value('DirectionsSvc', new MockDirectionsSvc());
    $provide.value('MapSvc', MockMapSvc);
  }));
  beforeEach(inject(function(_$timeout_, _$q_) {
    $q = _$q_;
    $timeout = _$timeout_;
  }));
  beforeEach(inject(function(_DrawingSvc_) {
    DrawingSvc = _DrawingSvc_;
  }));
  describe('Flexible paths ·', function() {
    describe('Addition ·', function() {
      it('Creates a path with a single point', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0));
        DrawingSvc.addNodeToDrawing(drawing, 0, node).then(function(path) {
          expect(path.length).toBe(1);
          expect(node.index).toBe(0);
          expect(path[0].lat()).toBe(node.lat);
          expect(path[0].lng()).toBe(node.lng);
        }).finally(done);
        $timeout.flush();
      });
      it('Creates a path with multiple points', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(2, new MapSvc.LatLng(2, 2));
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function(path) {
          expect(path.length).toBe(19);
          expect(drawing.nodes[0]).toBe(node0);
          expect(node0.index).toBe(0);
          expect(path[0].lat()).toBe(node0.lat);
          expect(path[0].lng()).toBe(node0.lng);
          expect(drawing.nodes[1]).toBe(node1);
          expect(node1.index).toBe(9);
          expect(path[9].lat()).toBe(node1.lat);
          expect(path[9].lng()).toBe(node1.lng);
          expect(drawing.nodes[2]).toBe(node2);
          expect(node2.index).toBe(18);
          expect(path[18].lat()).toBe(node2.lat);
          expect(path[18].lng()).toBe(node2.lng);
        }).finally(done);
        $timeout.flush();
      });
      it('Appends a path to a single point', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1));
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function() {
          DrawingSvc.addNodeToDrawing(drawing, 1, node1).then(function(path) {
            expect(path.length).toBe(10);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(node1.index).toBe(9);
            expect(path[9].lat()).toBe(node1.lat);
            expect(path[9].lng()).toBe(node1.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Appends a path to a path', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]).then(function() {
          DrawingSvc.addNodeToDrawing(drawing, 2, node2).then(function(path) {
            expect(path.length).toBe(19);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(node1.index).toBe(9);
            expect(path[9].lat()).toBe(node1.lat);
            expect(path[9].lng()).toBe(node1.lng);
            expect(node2.index).toBe(18);
            expect(path[18].lat()).toBe(node2.lat);
            expect(path[18].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Inserts a path into a path', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]).then(function(path) {
          DrawingSvc.addNodeToDrawing(drawing, 1, node2).then(function(path) {
            expect(path.length).toBe(19);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(node1.index).toBe(18);
            expect(path[18].lat()).toBe(node1.lat);
            expect(path[18].lng()).toBe(node1.lng);
            expect(node2.index).toBe(9);
            expect(path[9].lat()).toBe(node2.lat);
            expect(path[9].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Prepends a path to a single point', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1));
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function() {
          DrawingSvc.addNodeToDrawing(drawing, 0, node1).then(function(path) {
            expect(path.length).toBe(10);
            expect(node0.index).toBe(9);
            expect(path[9].lat()).toBe(node0.lat);
            expect(path[9].lng()).toBe(node0.lng);
            expect(node1.index).toBe(0);
            expect(path[0].lat()).toBe(node1.lat);
            expect(path[0].lng()).toBe(node1.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Prepends a path to a path', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]).then(function() {
          DrawingSvc.addNodeToDrawing(drawing, 0, node2).then(function(path) {
            expect(path.length).toBe(19);
            expect(node0.index).toBe(9);
            expect(path[9].lat()).toBe(node0.lat);
            expect(path[9].lng()).toBe(node0.lng);
            expect(node1.index).toBe(18);
            expect(path[18].lat()).toBe(node1.lat);
            expect(path[18].lng()).toBe(node1.lng);
            expect(node2.index).toBe(0);
            expect(path[0].lat()).toBe(node2.lat);
            expect(path[0].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
    });
    describe('Change existing ·', function() {
      it('Moves orphan node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            latLng = new MapSvc.LatLng(1, 1);
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function() {
          DrawingSvc.changeNodeOfDrawing(drawing, 0, {
            lat: latLng.lat(),
            lng: latLng.lng()
          }).then(function(path) {
            expect(path.length).toBe(1);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(latLng.lat()).toBe(node0.lat);
            expect(latLng.lng()).toBe(node0.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Moves last node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2)),
            latLng = new MapSvc.LatLng(3, 3);
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function() {
          DrawingSvc.changeNodeOfDrawing(drawing, 2, {
            lat: latLng.lat(),
            lng: latLng.lng()
          }).then(function(path) {
            expect(path.length).toBe(19);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(node1.index).toBe(9);
            expect(path[9].lat()).toBe(node1.lat);
            expect(path[9].lng()).toBe(node1.lng);
            expect(drawing.nodes).not.toContain(node2);
            node2 = drawing.nodes[2];
            expect(node2.index).toBe(18);
            expect(path[18].lat()).toBe(node2.lat);
            expect(path[18].lng()).toBe(node2.lng);
            expect(latLng.lat()).toBe(node2.lat);
            expect(latLng.lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Moves first node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2)),
            latLng = new MapSvc.LatLng(3, 3);
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function() {
          DrawingSvc.changeNodeOfDrawing(drawing, 0, {
            lat: latLng.lat(),
            lng: latLng.lng()
          }).then(function(path) {
            expect(path.length).toBe(19);
            expect(drawing.nodes).not.toContain(node0);
            node0 = drawing.nodes[0];
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(latLng.lat()).toBe(node0.lat);
            expect(latLng.lng()).toBe(node0.lng);
            expect(node1.index).toBe(9);
            expect(path[9].lat()).toBe(node1.lat);
            expect(path[9].lng()).toBe(node1.lng);
            expect(node2.index).toBe(18);
            expect(path[18].lat()).toBe(node2.lat);
            expect(path[18].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Moves middle node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2)),
            latLng = new MapSvc.LatLng(3, 3);
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function(path) {
          DrawingSvc.changeNodeOfDrawing(drawing, 1, {
            lat: latLng.lat(),
            lng: latLng.lng()
          }).then(function(path) {
            expect(path.length).toBe(19);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(drawing.nodes).not.toContain(node1);
            node1 = drawing.nodes[1];
            expect(node1.index).toBe(9);
            expect(path[9].lat()).toBe(node1.lat);
            expect(path[9].lng()).toBe(node1.lng);
            expect(latLng.lat()).toBe(node1.lat);
            expect(latLng.lng()).toBe(node1.lng);
            expect(node2.index).toBe(18);
            expect(path[18].lat()).toBe(node2.lat);
            expect(path[18].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
    });
    describe('Removal ·', function() {
      it('Removes orphan node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            latLng = new MapSvc.LatLng(1, 1);
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function() {
          DrawingSvc.removeNodeFromDrawing(drawing, 0, 1).then(function(path) {
            expect(path.length).toBe(0);
            expect(drawing.nodes.length).toBe(0);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Removes last node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function() {
          DrawingSvc.removeNodeFromDrawing(drawing, 2, 1).then(function(path) {
            expect(path.length).toBe(10);
            expect(drawing.nodes.length).toBe(2);
            expect(drawing.nodes[0]).toBe(node0);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(drawing.nodes[1]).toBe(node1);
            expect(node1.index).toBe(9);
            expect(path[9].lat()).toBe(node1.lat);
            expect(path[9].lng()).toBe(node1.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Removes first node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function() {
          DrawingSvc.removeNodeFromDrawing(drawing, 0, 1).then(function(path) {
            expect(path.length).toBe(10);
            expect(drawing.nodes.length).toBe(2);
            expect(drawing.nodes[0]).toBe(node1);
            expect(node1.index).toBe(0);
            expect(path[0].lat()).toBe(node1.lat);
            expect(path[0].lng()).toBe(node1.lng);
            expect(drawing.nodes[1]).toBe(node2);
            expect(node2.index).toBe(9);
            expect(path[9].lat()).toBe(node2.lat);
            expect(path[9].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Removes middle node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function(path) {
          DrawingSvc.removeNodeFromDrawing(drawing, 1, 1).then(function(path) {
            expect(path.length).toBe(10);
            expect(drawing.nodes.length).toBe(2);
            expect(drawing.nodes[0]).toBe(node0);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(drawing.nodes[1]).toBe(node2);
            expect(node2.index).toBe(9);
            expect(path[9].lat()).toBe(node2.lat);
            expect(path[9].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
    });
  });
  describe('Rigid paths ·', function() {
    beforeEach((function() {
      drawing = DrawingSvc.makeDrawing(0, true);
      node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0));
      node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1));
      node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
      latLng = new MapSvc.LatLng(3, 3);
    }));
    describe('Addition ·', function() {
      it('Creates a path with a single point', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function(path) {
          expect(path.length).toBe(1);
          expect(node0.index).toBe(0);
          expect(path[0].lat()).toBe(node0.lat);
          expect(path[0].lng()).toBe(node0.lng);
        }).finally(done);
        $timeout.flush();
      });
      it('Creates a path with multiple points', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function(path) {
          expect(path.length).toBe(3);
          expect(node0.index).toBe(0);
          expect(path[0].lat()).toBe(node0.lat);
          expect(path[0].lng()).toBe(node0.lng);
          expect(node1.index).toBe(1);
          expect(path[1].lat()).toBe(node1.lat);
          expect(path[1].lng()).toBe(node1.lng);
          expect(node2.index).toBe(2);
          expect(path[2].lat()).toBe(node2.lat);
          expect(path[2].lng()).toBe(node2.lng);
        }).finally(done);
        $timeout.flush();
      });
      it('Appends a path to a single point', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function() {
          DrawingSvc.addNodeToDrawing(drawing, 1, node1).then(function(path) {
            expect(path.length).toBe(2);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(node1.index).toBe(1);
            expect(path[1].lat()).toBe(node1.lat);
            expect(path[1].lng()).toBe(node1.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Appends a path to a path', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]).then(function() {
          DrawingSvc.addNodeToDrawing(drawing, 2, node2).then(function(path) {
            expect(path.length).toBe(3);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(node1.index).toBe(1);
            expect(path[1].lat()).toBe(node1.lat);
            expect(path[1].lng()).toBe(node1.lng);
            expect(node2.index).toBe(2);
            expect(path[2].lat()).toBe(node2.lat);
            expect(path[2].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Inserts a path into a path', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]).then(function(path) {
          DrawingSvc.addNodeToDrawing(drawing, 1, node2).then(function(path) {
            expect(path.length).toBe(3);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(node1.index).toBe(2);
            expect(path[2].lat()).toBe(node1.lat);
            expect(path[2].lng()).toBe(node1.lng);
            expect(node2.index).toBe(1);
            expect(path[1].lat()).toBe(node2.lat);
            expect(path[1].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Prepends a path to a single point', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function() {
          DrawingSvc.addNodeToDrawing(drawing, 0, node1).then(function(path) {
            expect(path.length).toBe(2);
            expect(node0.index).toBe(1);
            expect(path[1].lat()).toBe(node0.lat);
            expect(path[1].lng()).toBe(node0.lng);
            expect(node1.index).toBe(0);
            expect(path[0].lat()).toBe(node1.lat);
            expect(path[0].lng()).toBe(node1.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Prepends a path to a path', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]).then(function() {
          DrawingSvc.addNodeToDrawing(drawing, 0, node2).then(function(path) {
            expect(path.length).toBe(3);
            expect(node0.index).toBe(1);
            expect(path[1].lat()).toBe(node0.lat);
            expect(path[1].lng()).toBe(node0.lng);
            expect(node1.index).toBe(2);
            expect(path[2].lat()).toBe(node1.lat);
            expect(path[2].lng()).toBe(node1.lng);
            expect(node2.index).toBe(0);
            expect(path[0].lat()).toBe(node2.lat);
            expect(path[0].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
    });
    describe('Change existing ·', function() {
      it('Moves orphan node', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function() {
          DrawingSvc.changeNodeOfDrawing(drawing, 0, {
            lat: latLng.lat(),
            lng: latLng.lng()
          }).then(function(path) {
            expect(path.length).toBe(1);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(latLng.lat()).toBe(node0.lat);
            expect(latLng.lng()).toBe(node0.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Moves last node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function() {
          DrawingSvc.changeNodeOfDrawing(drawing, 2, {
            lat: latLng.lat(),
            lng: latLng.lng()
          }).then(function(path) {
            expect(path.length).toBe(3);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(node1.index).toBe(1);
            expect(path[1].lat()).toBe(node1.lat);
            expect(path[1].lng()).toBe(node1.lng);
            expect(drawing.nodes).not.toContain(node2);
            node2 = drawing.nodes[2];
            expect(node2.index).toBe(2);
            expect(path[2].lat()).toBe(node2.lat);
            expect(path[2].lng()).toBe(node2.lng);
            expect(latLng.lat()).toBe(node2.lat);
            expect(latLng.lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Moves first node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function() {
          DrawingSvc.changeNodeOfDrawing(drawing, 0, {
            lat: latLng.lat(),
            lng: latLng.lng()
          }).then(function(path) {
            expect(path.length).toBe(3);
            expect(drawing.nodes).not.toContain(node0);
            node0 = drawing.nodes[0];
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(latLng.lat()).toBe(node0.lat);
            expect(latLng.lng()).toBe(node0.lng);
            expect(node1.index).toBe(1);
            expect(path[1].lat()).toBe(node1.lat);
            expect(path[1].lng()).toBe(node1.lng);
            expect(node2.index).toBe(2);
            expect(path[2].lat()).toBe(node2.lat);
            expect(path[2].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Moves middle node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function(path) {
          DrawingSvc.changeNodeOfDrawing(drawing, 1, {
            lat: latLng.lat(),
            lng: latLng.lng()
          }).then(function(path) {
            expect(path.length).toBe(3);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(drawing.nodes).not.toContain(node1);
            node1 = drawing.nodes[1];
            expect(node1.index).toBe(1);
            expect(path[1].lat()).toBe(node1.lat);
            expect(path[1].lng()).toBe(node1.lng);
            expect(latLng.lat()).toBe(node1.lat);
            expect(latLng.lng()).toBe(node1.lng);
            expect(node2.index).toBe(2);
            expect(path[2].lat()).toBe(node2.lat);
            expect(path[2].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
    });
    describe('Removal ·', function() {
      it('Removes orphan node', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0).then(function() {
          DrawingSvc.removeNodeFromDrawing(drawing, 0, 1).then(function(path) {
            expect(path.length).toBe(0);
            expect(drawing.nodes.length).toBe(0);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Removes first node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function() {
          DrawingSvc.removeNodeFromDrawing(drawing, 0, 1).then(function(path) {
            expect(path.length).toBe(2);
            expect(drawing.nodes.length).toBe(2);
            expect(drawing.nodes[0]).toBe(node1);
            expect(node1.index).toBe(0);
            expect(path[0].lat()).toBe(node1.lat);
            expect(path[0].lng()).toBe(node1.lng);
            expect(drawing.nodes[1]).toBe(node2);
            expect(node2.index).toBe(1);
            expect(path[1].lat()).toBe(node2.lat);
            expect(path[1].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Removes middle node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function(path) {
          DrawingSvc.removeNodeFromDrawing(drawing, 1, 1).then(function(path) {
            expect(path.length).toBe(2);
            expect(drawing.nodes.length).toBe(2);
            expect(drawing.nodes[0]).toBe(node0);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(drawing.nodes[1]).toBe(node2);
            expect(node2.index).toBe(1);
            expect(path[1].lat()).toBe(node2.lat);
            expect(path[1].lng()).toBe(node2.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Removes last node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function() {
          DrawingSvc.removeNodeFromDrawing(drawing, 2, 1).then(function(path) {
            expect(path.length).toBe(2);
            expect(drawing.nodes.length).toBe(2);
            expect(drawing.nodes[0]).toBe(node0);
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(drawing.nodes[1]).toBe(node1);
            expect(node1.index).toBe(1);
            expect(path[1].lat()).toBe(node1.lat);
            expect(path[1].lng()).toBe(node1.lng);
          }).finally(done);
        });
        $timeout.flush();
      });
      it('Removes all nodes', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]).then(function(path) {
          DrawingSvc.removeNodesFromDrawing(drawing, 0, 3).then(function(path) {
            expect(path.length).toBe(0);
            expect(drawing.nodes.length).toBe(0);
          }).finally(done);
        });
        $timeout.flush();
      });
    });
  });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy9kcmF3aW5nU3BlYy5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbImRyYXdpbmcvZHJhd2luZ1NwZWMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZGVzY3JpYmUoJ0RyYXdpbmdTdmMgwrcnLCBmdW5jdGlvbigpIHtcbiAgdmFyICRxLFxuICAgICR0aW1lb3V0LFxuICAgIERyYXdpbmdTdmMsXG4gICAgTWFwU3ZjLFxuICAgIE1vY2tEaXJlY3Rpb25zU3ZjLFxuICAgIGRyYXdpbmcsXG4gICAgbm9kZTAsXG4gICAgbm9kZTEsXG4gICAgbm9kZTIsXG4gICAgbGF0TG5nO1xuXG4gIE1vY2tEaXJlY3Rpb25zU3ZjID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5yb3V0ZSA9IGZ1bmN0aW9uKGxvY2F0aW9ucykge1xuICAgICAgdmFyIHBhdGggPSBbXSwgbGF0LCBsbmc7XG5cbiAgICAgIHBhdGgucHVzaChsb2NhdGlvbnNbMF0pO1xuICAgICAgaWYgKFxuICAgICAgICAhKGxvY2F0aW9uc1swXS5sYXQoKSA9PT0gbG9jYXRpb25zWzFdLmxhdCgpICYmXG4gICAgICAgIGxvY2F0aW9uc1swXS5sbmcoKSA9PT0gbG9jYXRpb25zWzFdLmxuZygpKVxuICAgICAgKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgICAgbGF0ID0gLTkwICsgKDE4MCAqIE1hdGgucmFuZG9tKCkpO1xuICAgICAgICAgIGxuZyA9IC0xODAgKyAoMzYwICogTWF0aC5yYW5kb20oKSk7XG4gICAgICAgICAgcGF0aC5wdXNoKG5ldyBNYXBTdmMuTGF0TG5nKGxhdCwgbG5nKSk7XG4gICAgICAgIH1cbiAgICAgICAgcGF0aC5wdXNoKGxvY2F0aW9uc1sxXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAkcS53aGVuKHBhdGgpO1xuICAgIH07XG4gIH07XG5cbiAgdmFyIE1vY2tNYXBTdmMgPSBNYXBTdmMgPSB7XG4gICAgJ19fZ2pzbG9hZF9fJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnQW5pbWF0aW9uJzoge1xuICAgICAgJ0JPVU5DRSc6IDEsXG4gICAgICAnRFJPUCc6IDIsXG4gICAgICAnayc6IDMsXG4gICAgICAnaic6IDRcbiAgICB9LFxuICAgICdDaXJjbGUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdDb250cm9sUG9zaXRpb24nOiB7XG4gICAgICAnVE9QX0xFRlQnOiAxLFxuICAgICAgJ1RPUF9DRU5URVInOiAyLFxuICAgICAgJ1RPUCc6IDIsXG4gICAgICAnVE9QX1JJR0hUJzogMyxcbiAgICAgICdMRUZUX0NFTlRFUic6IDQsXG4gICAgICAnTEVGVF9UT1AnOiA1LFxuICAgICAgJ0xFRlQnOiA1LFxuICAgICAgJ0xFRlRfQk9UVE9NJzogNixcbiAgICAgICdSSUdIVF9UT1AnOiA3LFxuICAgICAgJ1JJR0hUJzogNyxcbiAgICAgICdSSUdIVF9DRU5URVInOiA4LFxuICAgICAgJ1JJR0hUX0JPVFRPTSc6IDksXG4gICAgICAnQk9UVE9NX0xFRlQnOiAxMCxcbiAgICAgICdCT1RUT01fQ0VOVEVSJzogMTEsXG4gICAgICAnQk9UVE9NJzogMTEsXG4gICAgICAnQk9UVE9NX1JJR0hUJzogMTIsXG4gICAgICAnQ0VOVEVSJzogMTNcbiAgICB9LFxuICAgICdEYXRhJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnR3JvdW5kT3ZlcmxheSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0ltYWdlTWFwVHlwZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0luZm9XaW5kb3cnOiBmdW5jdGlvbigpIHt9LFxuICAgICdMYXRMbmcnOiBmdW5jdGlvbihsYXQsIGxuZykge1xuICAgICAgdGhpcy5sYXQgPSAoKSA9PiBsYXQ7XG4gICAgICB0aGlzLmxuZyA9ICgpID0+IGxuZztcbiAgICAgIHRoaXMuZXF1YWxzID0gKGxhdExuZykgPT4ge1xuICAgICAgICByZXR1cm4gKHRoaXMubGF0KCkgPT09IGxhdExuZy5sYXQoKSAmJlxuICAgICAgICAgIHRoaXMubG5nKCkgPT09IGxhdExuZy5sbmcoKSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAnTGF0TG5nQm91bmRzJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTVZDQXJyYXknOiBmdW5jdGlvbigpIHt9LFxuICAgICdNVkNPYmplY3QnOiBmdW5jdGlvbigpIHt9LFxuICAgICdNYXAnOiBmdW5jdGlvbigpIHt9LFxuICAgICdNYXBUeXBlQ29udHJvbFN0eWxlJzoge1xuICAgICAgJ0RFRkFVTFQnOiAwLFxuICAgICAgJ0hPUklaT05UQUxfQkFSJzogMSxcbiAgICAgICdEUk9QRE9XTl9NRU5VJzogMlxuICAgIH0sXG4gICAgJ01hcFR5cGVJZCc6IHtcbiAgICAgICdST0FETUFQJzogJ3JvYWRtYXAnLFxuICAgICAgJ1NBVEVMTElURSc6ICdzYXRlbGxpdGUnLFxuICAgICAgJ0hZQlJJRCc6ICdoeWJyaWQnLFxuICAgICAgJ1RFUlJBSU4nOiAndGVycmFpbidcbiAgICB9LFxuICAgICdNYXBUeXBlUmVnaXN0cnknOiBmdW5jdGlvbigpIHt9LFxuICAgICdNYXJrZXInOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc2V0UG9zaXRpb24gPSAoKSA9PiB7fTtcbiAgICAgIHRoaXMuc2V0TWFwID0gKCkgPT4ge307XG4gICAgfSxcbiAgICAnTWFya2VySW1hZ2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICdOYXZpZ2F0aW9uQ29udHJvbFN0eWxlJzoge1xuICAgICAgJ0RFRkFVTFQnOiAwLFxuICAgICAgJ1NNQUxMJzogMSxcbiAgICAgICdBTkRST0lEJzogMixcbiAgICAgICdaT09NX1BBTic6IDMsXG4gICAgICAnRG4nOiA0LFxuICAgICAgJ1htJzogNVxuICAgIH0sXG4gICAgJ092ZXJsYXlWaWV3JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnUG9pbnQnOiBmdW5jdGlvbigpIHt9LFxuICAgICdQb2x5Z29uJzogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0aDtcbiAgICAgIHRoaXMuc2V0UGF0aCA9IChwb2x5UGF0aCkgPT4ge1xuICAgICAgICBwYXRoID0gcG9seVBhdGg7XG4gICAgICB9XG4gICAgICB0aGlzLmdldFBhdGggPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2V0QXJyYXk6ICgpID0+IHBhdGhcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdQb2x5bGluZSc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBhdGggPSBbXTtcbiAgICAgIHRoaXMuc2V0UGF0aCA9IChwb2x5UGF0aCkgPT4ge1xuICAgICAgICBwYXRoID0gcG9seVBhdGg7XG4gICAgICB9XG4gICAgICB0aGlzLmdldFBhdGggPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2V0QXJyYXk6ICgpID0+IHBhdGhcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdSZWN0YW5nbGUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTY2FsZUNvbnRyb2xTdHlsZSc6IHtcbiAgICAgICdERUZBVUxUJzogMFxuICAgIH0sXG4gICAgJ1NpemUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJva2VQb3NpdGlvbic6IHtcbiAgICAgICdDRU5URVInOiAwLFxuICAgICAgJ0lOU0lERSc6IDEsXG4gICAgICAnT1VUU0lERSc6IDJcbiAgICB9LFxuICAgICdTeW1ib2xQYXRoJzoge1xuICAgICAgJ0NJUkNMRSc6IDAsXG4gICAgICAnRk9SV0FSRF9DTE9TRURfQVJST1cnOiAxLFxuICAgICAgJ0ZPUldBUkRfT1BFTl9BUlJPVyc6IDIsXG4gICAgICAnQkFDS1dBUkRfQ0xPU0VEX0FSUk9XJzogMyxcbiAgICAgICdCQUNLV0FSRF9PUEVOX0FSUk9XJzogNFxuICAgIH0sXG4gICAgJ1pvb21Db250cm9sU3R5bGUnOiB7XG4gICAgICAnREVGQVVMVCc6IDAsXG4gICAgICAnU01BTEwnOiAxLFxuICAgICAgJ0xBUkdFJzogMixcbiAgICAgICdYbSc6IDNcbiAgICB9LFxuICAgICdldmVudCc6IHtcbiAgICAgICdSZSc6IGZhbHNlLFxuICAgICAgJ1pkJzoge30sXG4gICAgICAnYWRkTGlzdGVuZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ3lmJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdyZW1vdmVMaXN0ZW5lcic6IGZ1bmN0aW9uKCkge30sXG4gICAgICAnY2xlYXJMaXN0ZW5lcnMnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2NsZWFySW5zdGFuY2VMaXN0ZW5lcnMnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ3RyaWdnZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2FkZERvbUxpc3RlbmVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdhZGREb21MaXN0ZW5lck9uY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2NhJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdiaW5kJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdhZGRMaXN0ZW5lck9uY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2ZvcndhcmQnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ1VhJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdiaSc6IGZ1bmN0aW9uKCkge30sXG4gICAgICAnUWonOiBmdW5jdGlvbigpIHt9XG4gICAgfSxcbiAgICAnQmljeWNsaW5nTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXJlY3Rpb25zUmVuZGVyZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXJlY3Rpb25zU2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0RpcmVjdGlvbnNTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ1VOS05PV05fRVJST1InOiAnVU5LTk9XTl9FUlJPUicsXG4gICAgICAnT1ZFUl9RVUVSWV9MSU1JVCc6ICdPVkVSX1FVRVJZX0xJTUlUJyxcbiAgICAgICdSRVFVRVNUX0RFTklFRCc6ICdSRVFVRVNUX0RFTklFRCcsXG4gICAgICAnSU5WQUxJRF9SRVFVRVNUJzogJ0lOVkFMSURfUkVRVUVTVCcsXG4gICAgICAnWkVST19SRVNVTFRTJzogJ1pFUk9fUkVTVUxUUycsXG4gICAgICAnTUFYX1dBWVBPSU5UU19FWENFRURFRCc6ICdNQVhfV0FZUE9JTlRTX0VYQ0VFREVEJyxcbiAgICAgICdOT1RfRk9VTkQnOiAnTk9UX0ZPVU5EJ1xuICAgIH0sXG4gICAgJ0RpcmVjdGlvbnNUcmF2ZWxNb2RlJzoge1xuICAgICAgJ0RSSVZJTkcnOiAnRFJJVklORycsXG4gICAgICAnV0FMS0lORyc6ICdXQUxLSU5HJyxcbiAgICAgICdCSUNZQ0xJTkcnOiAnQklDWUNMSU5HJyxcbiAgICAgICdUUkFOU0lUJzogJ1RSQU5TSVQnXG4gICAgfSxcbiAgICAnRGlyZWN0aW9uc1VuaXRTeXN0ZW0nOiB7XG4gICAgICAnTUVUUklDJzogMCxcbiAgICAgICdJTVBFUklBTCc6IDFcbiAgICB9LFxuICAgICdEaXN0YW5jZU1hdHJpeFNlcnZpY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXN0YW5jZU1hdHJpeFN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnSU5WQUxJRF9SRVFVRVNUJzogJ0lOVkFMSURfUkVRVUVTVCcsXG4gICAgICAnT1ZFUl9RVUVSWV9MSU1JVCc6ICdPVkVSX1FVRVJZX0xJTUlUJyxcbiAgICAgICdSRVFVRVNUX0RFTklFRCc6ICdSRVFVRVNUX0RFTklFRCcsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdNQVhfRUxFTUVOVFNfRVhDRUVERUQnOiAnTUFYX0VMRU1FTlRTX0VYQ0VFREVEJyxcbiAgICAgICdNQVhfRElNRU5TSU9OU19FWENFRURFRCc6ICdNQVhfRElNRU5TSU9OU19FWENFRURFRCdcbiAgICB9LFxuICAgICdEaXN0YW5jZU1hdHJpeEVsZW1lbnRTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ05PVF9GT1VORCc6ICdOT1RfRk9VTkQnLFxuICAgICAgJ1pFUk9fUkVTVUxUUyc6ICdaRVJPX1JFU1VMVFMnXG4gICAgfSxcbiAgICAnRWxldmF0aW9uU2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0VsZXZhdGlvblN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdPVkVSX1FVRVJZX0xJTUlUJzogJ09WRVJfUVVFUllfTElNSVQnLFxuICAgICAgJ1JFUVVFU1RfREVOSUVEJzogJ1JFUVVFU1RfREVOSUVEJyxcbiAgICAgICdJTlZBTElEX1JFUVVFU1QnOiAnSU5WQUxJRF9SRVFVRVNUJyxcbiAgICAgICdCbic6ICdEQVRBX05PVF9BVkFJTEFCTEUnXG4gICAgfSxcbiAgICAnRnVzaW9uVGFibGVzTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdHZW9jb2Rlcic6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0dlb2NvZGVyTG9jYXRpb25UeXBlJzoge1xuICAgICAgJ1JPT0ZUT1AnOiAnUk9PRlRPUCcsXG4gICAgICAnUkFOR0VfSU5URVJQT0xBVEVEJzogJ1JBTkdFX0lOVEVSUE9MQVRFRCcsXG4gICAgICAnR0VPTUVUUklDX0NFTlRFUic6ICdHRU9NRVRSSUNfQ0VOVEVSJyxcbiAgICAgICdBUFBST1hJTUFURSc6ICdBUFBST1hJTUFURSdcbiAgICB9LFxuICAgICdHZW9jb2RlclN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdPVkVSX1FVRVJZX0xJTUlUJzogJ09WRVJfUVVFUllfTElNSVQnLFxuICAgICAgJ1JFUVVFU1RfREVOSUVEJzogJ1JFUVVFU1RfREVOSUVEJyxcbiAgICAgICdJTlZBTElEX1JFUVVFU1QnOiAnSU5WQUxJRF9SRVFVRVNUJyxcbiAgICAgICdaRVJPX1JFU1VMVFMnOiAnWkVST19SRVNVTFRTJyxcbiAgICAgICdFUlJPUic6ICdFUlJPUidcbiAgICB9LFxuICAgICdLbWxMYXllcic6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0ttbExheWVyU3RhdHVzJzoge1xuICAgICAgJ1VOS05PV04nOiAnVU5LTk9XTicsXG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ0lOVkFMSURfUkVRVUVTVCc6ICdJTlZBTElEX1JFUVVFU1QnLFxuICAgICAgJ0RPQ1VNRU5UX05PVF9GT1VORCc6ICdET0NVTUVOVF9OT1RfRk9VTkQnLFxuICAgICAgJ0ZFVENIX0VSUk9SJzogJ0ZFVENIX0VSUk9SJyxcbiAgICAgICdJTlZBTElEX0RPQ1VNRU5UJzogJ0lOVkFMSURfRE9DVU1FTlQnLFxuICAgICAgJ0RPQ1VNRU5UX1RPT19MQVJHRSc6ICdET0NVTUVOVF9UT09fTEFSR0UnLFxuICAgICAgJ0xJTUlUU19FWENFRURFRCc6ICdMSU1JVFNfRVhFQ0VFREVEJyxcbiAgICAgICdUSU1FRF9PVVQnOiAnVElNRURfT1VUJ1xuICAgIH0sXG4gICAgJ01heFpvb21TZXJ2aWNlJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWF4Wm9vbVN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnRVJST1InOiAnRVJST1InXG4gICAgfSxcbiAgICAnU3RyZWV0Vmlld0NvdmVyYWdlTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJlZXRWaWV3UGFub3JhbWEnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJlZXRWaWV3U2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ1N0cmVldFZpZXdTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ1VOS05PV05fRVJST1InOiAnVU5LTk9XTl9FUlJPUicsXG4gICAgICAnWkVST19SRVNVTFRTJzogJ1pFUk9fUkVTVUxUUydcbiAgICB9LFxuICAgICdTdHlsZWRNYXBUeXBlJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhZmZpY0xheWVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhbnNpdExheWVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhdmVsTW9kZSc6IHtcbiAgICAgICdEUklWSU5HJzogJ0RSSVZJTkcnLFxuICAgICAgJ1dBTEtJTkcnOiAnV0FMS0lORycsXG4gICAgICAnQklDWUNMSU5HJzogJ0JJQ1lDTElORycsXG4gICAgICAnVFJBTlNJVCc6ICdUUkFOU0lUJ1xuICAgIH0sXG4gICAgJ1VuaXRTeXN0ZW0nOiB7XG4gICAgICAnTUVUUklDJzogMCxcbiAgICAgICdJTVBFUklBTCc6IDFcbiAgICB9LFxuICAgICd2ZXJzaW9uJzogJzMuMTYuOCcsXG4gICAgJ21hcCc6IHt9XG4gIH07XG5cbiAgYmVmb3JlRWFjaChtb2R1bGUoJ2JuZHJ5LmRyYXdpbmcnLCBmdW5jdGlvbigkcHJvdmlkZSkge1xuICAgICRwcm92aWRlLnZhbHVlKCdEaXJlY3Rpb25zU3ZjJywgbmV3IE1vY2tEaXJlY3Rpb25zU3ZjKCkpO1xuICAgICRwcm92aWRlLnZhbHVlKCdNYXBTdmMnLCBNb2NrTWFwU3ZjKTtcbiAgfSkpO1xuXG4gIGJlZm9yZUVhY2goaW5qZWN0KGZ1bmN0aW9uKF8kdGltZW91dF8sIF8kcV8pIHtcbiAgICAkcSA9IF8kcV87XG4gICAgJHRpbWVvdXQgPSBfJHRpbWVvdXRfO1xuICB9KSk7XG5cbiAgYmVmb3JlRWFjaChpbmplY3QoZnVuY3Rpb24oX0RyYXdpbmdTdmNfKSB7XG4gICAgRHJhd2luZ1N2YyA9IF9EcmF3aW5nU3ZjXztcbiAgfSkpO1xuXG4gIGRlc2NyaWJlKCdGbGV4aWJsZSBwYXRocyDCtycsIGZ1bmN0aW9uKCkge1xuICAgIGRlc2NyaWJlKCdBZGRpdGlvbiDCtycsIGZ1bmN0aW9uKCkge1xuICAgICAgaXQoJ0NyZWF0ZXMgYSBwYXRoIHdpdGggYSBzaW5nbGUgcG9pbnQnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIGZhbHNlKTtcbiAgICAgICAgdmFyIG5vZGUgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKTtcbiAgICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0KG5vZGUuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlLmxhdCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlLmxuZyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuICBcbiAgXG4gICAgICBpdCgnQ3JlYXRlcyBhIHBhdGggd2l0aCBtdWx0aXBsZSBwb2ludHMnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIGZhbHNlKTtcbiAgICAgICAgdmFyIG5vZGUwID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSksXG4gICAgICAgICAgbm9kZTEgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpKSxcbiAgICAgICAgICBub2RlMiA9IERyYXdpbmdTdmMubWFrZU5vZGUoMiwgbmV3IE1hcFN2Yy5MYXRMbmcoMiwgMikpO1xuICAgICAgXG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZXNUb0RyYXdpbmcoZHJhd2luZywgMCwgW25vZGUwLCBub2RlMSwgbm9kZTJdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgxOSk7XG4gICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXNbMF0pLnRvQmUobm9kZTApO1xuICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzWzFdKS50b0JlKG5vZGUxKTtcbiAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSg5KTtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxhdCgpKS50b0JlKG5vZGUxLmxhdCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlc1syXSkudG9CZShub2RlMik7XG4gICAgICAgICAgICBleHBlY3Qobm9kZTIuaW5kZXgpLnRvQmUoMTgpO1xuICAgICAgICAgICAgZXhwZWN0KHBhdGhbMThdLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gIFxuICBcbiAgICAgIGl0KCdBcHBlbmRzIGEgcGF0aCB0byBhIHNpbmdsZSBwb2ludCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgZmFsc2UpO1xuICAgICAgICB2YXIgbm9kZTAgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKSxcbiAgICAgICAgICBub2RlMSA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMSwgMSkpO1xuICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZTApXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMSwgbm9kZTEpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMTApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSg5KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gIFxuICBcbiAgICAgIGl0KCdBcHBlbmRzIGEgcGF0aCB0byBhIHBhdGgnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIGZhbHNlKTtcbiAgICAgICAgdmFyIG5vZGUwID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSksXG4gICAgICAgICAgbm9kZTEgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpKSxcbiAgICAgICAgICBub2RlMiA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMiwgMikpO1xuICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTFdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIDIsIG5vZGUyKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDE5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMC5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoOSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDE4KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubGF0KCkpLnRvQmUobm9kZTIubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcblxuXG4gICAgICBpdCgnSW5zZXJ0cyBhIHBhdGggaW50byBhIHBhdGgnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIGZhbHNlKTtcbiAgICAgICAgdmFyIG5vZGUwID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSksXG4gICAgICAgICAgbm9kZTEgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpKSxcbiAgICAgICAgICBub2RlMiA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMiwgMikpO1xuICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTFdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAxLCBub2RlMilcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgxOSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUxLmluZGV4KS50b0JlKDE4KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubG5nKCkpLnRvQmUobm9kZTEubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMi5pbmRleCkudG9CZSg5KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxuZygpKS50b0JlKG5vZGUyLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG5cblxuICAgICAgaXQoJ1ByZXBlbmRzIGEgcGF0aCB0byBhIHNpbmdsZSBwb2ludCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgZmFsc2UpO1xuICAgICAgICB2YXIgbm9kZTAgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKSxcbiAgICAgICAgICBub2RlMSA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMSwgMSkpO1xuICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZTApXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZTEpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMTApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDkpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gIFxuICBcbiAgICAgIGl0KCdQcmVwZW5kcyBhIHBhdGggdG8gYSBwYXRoJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCBmYWxzZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIG5vZGUxID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygxLCAxKSksXG4gICAgICAgICAgbm9kZTIgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDIsIDIpKTtcbiAgICBcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMilcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgxOSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoOSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUxLmluZGV4KS50b0JlKDE4KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubG5nKCkpLnRvQmUobm9kZTEubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMi5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUyLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgXG4gICAgZGVzY3JpYmUoJ0NoYW5nZSBleGlzdGluZyDCtycsIGZ1bmN0aW9uKCkge1xuICAgICAgaXQoJ01vdmVzIG9ycGhhbiBub2RlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCBmYWxzZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIGxhdExuZyA9IG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpO1xuICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZTApXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmNoYW5nZU5vZGVPZkRyYXdpbmcoZHJhd2luZywgMCwge1xuICAgICAgICAgICAgICBsYXQ6IGxhdExuZy5sYXQoKSxcbiAgICAgICAgICAgICAgbG5nOiBsYXRMbmcubG5nKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChsYXRMbmcubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QobGF0TG5nLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgXG4gICAgXG4gICAgICBpdCgnTW92ZXMgbGFzdCBub2RlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCBmYWxzZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIG5vZGUxID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygxLCAxKSksXG4gICAgICAgICAgbm9kZTIgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDIsIDIpKSxcbiAgICAgICAgICBsYXRMbmcgPSBuZXcgTWFwU3ZjLkxhdExuZygzLCAzKTtcbiAgICBcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxLCBub2RlMl0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmNoYW5nZU5vZGVPZkRyYXdpbmcoZHJhd2luZywgMiwge1xuICAgICAgICAgICAgICBsYXQ6IGxhdExuZy5sYXQoKSxcbiAgICAgICAgICAgICAgbG5nOiBsYXRMbmcubG5nKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMTkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSg5KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlcykubm90LnRvQ29udGFpbihub2RlMik7XG4gICAgICAgICAgICAgICAgbm9kZTIgPSBkcmF3aW5nLm5vZGVzWzJdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMi5pbmRleCkudG9CZSgxOCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMThdLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMThdLmxuZygpKS50b0JlKG5vZGUyLmxuZyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGxhdExuZy5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChsYXRMbmcubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICBcbiAgICBcbiAgICAgIGl0KCdNb3ZlcyBmaXJzdCBub2RlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCBmYWxzZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIG5vZGUxID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygxLCAxKSksXG4gICAgICAgICAgbm9kZTIgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDIsIDIpKSxcbiAgICAgICAgICBsYXRMbmcgPSBuZXcgTWFwU3ZjLkxhdExuZygzLCAzKTtcbiAgICBcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxLCBub2RlMl0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmNoYW5nZU5vZGVPZkRyYXdpbmcoZHJhd2luZywgMCwge1xuICAgICAgICAgICAgICBsYXQ6IGxhdExuZy5sYXQoKSxcbiAgICAgICAgICAgICAgbG5nOiBsYXRMbmcubG5nKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMTkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXMpLm5vdC50b0NvbnRhaW4obm9kZTApO1xuICAgICAgICAgICAgICAgIG5vZGUwID0gZHJhd2luZy5ub2Rlc1swXTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChsYXRMbmcubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QobGF0TG5nLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoOSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDE4KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubGF0KCkpLnRvQmUobm9kZTIubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcblxuXG4gICAgICBpdCgnTW92ZXMgbWlkZGxlIG5vZGUnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIGZhbHNlKTtcbiAgICAgICAgdmFyIG5vZGUwID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSksXG4gICAgICAgICAgbm9kZTEgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpKSxcbiAgICAgICAgICBub2RlMiA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMiwgMikpLFxuICAgICAgICAgIGxhdExuZyA9IG5ldyBNYXBTdmMuTGF0TG5nKDMsIDMpO1xuICAgICAgICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTEsIG5vZGUyXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmNoYW5nZU5vZGVPZkRyYXdpbmcoZHJhd2luZywgMSwge1xuICAgICAgICAgICAgICBsYXQ6IGxhdExuZy5sYXQoKSxcbiAgICAgICAgICAgICAgbG5nOiBsYXRMbmcubG5nKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMTkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzKS5ub3QudG9Db250YWluKG5vZGUxKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBub2RlMSA9IGRyYXdpbmcubm9kZXNbMV07XG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUxLmluZGV4KS50b0JlKDkpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxhdCgpKS50b0JlKG5vZGUxLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubG5nKCkpLnRvQmUobm9kZTEubG5nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QobGF0TG5nLmxhdCgpKS50b0JlKG5vZGUxLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGxhdExuZy5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDE4KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubGF0KCkpLnRvQmUobm9kZTIubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICBkZXNjcmliZSgnUmVtb3ZhbCDCtycsIGZ1bmN0aW9uKCkge1xuICAgICAgaXQoJ1JlbW92ZXMgb3JwaGFuIG5vZGUnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIGZhbHNlKTtcbiAgICAgICAgdmFyIG5vZGUwID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSksXG4gICAgICAgICAgbGF0TG5nID0gbmV3IE1hcFN2Yy5MYXRMbmcoMSwgMSk7XG4gICAgXG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMucmVtb3ZlTm9kZUZyb21EcmF3aW5nKGRyYXdpbmcsIDAsIDEpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXMubGVuZ3RoKS50b0JlKDApO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuICAgIFxuICAgIFxuICAgICAgaXQoJ1JlbW92ZXMgbGFzdCBub2RlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCBmYWxzZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIG5vZGUxID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygxLCAxKSksXG4gICAgICAgICAgbm9kZTIgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDIsIDIpKTtcbiAgICBcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxLCBub2RlMl0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLnJlbW92ZU5vZGVGcm9tRHJhd2luZyhkcmF3aW5nLCAyLCAxKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDEwKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzLmxlbmd0aCkudG9CZSgyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlc1swXSkudG9CZShub2RlMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzWzFdKS50b0JlKG5vZGUxKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoOSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuICAgIFxuICAgIFxuICAgICAgaXQoJ1JlbW92ZXMgZmlyc3Qgbm9kZScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgZmFsc2UpO1xuICAgICAgICB2YXIgbm9kZTAgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKSxcbiAgICAgICAgICBub2RlMSA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMSwgMSkpLFxuICAgICAgICAgIG5vZGUyID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygyLCAyKSk7XG4gICAgXG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZXNUb0RyYXdpbmcoZHJhd2luZywgMCwgW25vZGUwLCBub2RlMSwgbm9kZTJdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5yZW1vdmVOb2RlRnJvbURyYXdpbmcoZHJhd2luZywgMCwgMSlcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgxMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlcy5sZW5ndGgpLnRvQmUoMik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXNbMF0pLnRvQmUobm9kZTEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlc1sxXSkudG9CZShub2RlMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDkpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcblxuXG4gICAgICBpdCgnUmVtb3ZlcyBtaWRkbGUgbm9kZScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgZmFsc2UpO1xuICAgICAgICB2YXIgbm9kZTAgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKSxcbiAgICAgICAgICBub2RlMSA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMSwgMSkpLFxuICAgICAgICAgIG5vZGUyID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygyLCAyKSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZXNUb0RyYXdpbmcoZHJhd2luZywgMCwgW25vZGUwLCBub2RlMSwgbm9kZTJdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMucmVtb3ZlTm9kZUZyb21EcmF3aW5nKGRyYXdpbmcsIDEsIDEpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMTApO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXMubGVuZ3RoKS50b0JlKDIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzWzBdKS50b0JlKG5vZGUwKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXNbMV0pLnRvQmUobm9kZTIpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMi5pbmRleCkudG9CZSg5KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxuZygpKS50b0JlKG5vZGUyLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuICBcbiAgXG4gIGRlc2NyaWJlKCdSaWdpZCBwYXRocyDCtycsIGZ1bmN0aW9uKCkge1xuICAgIGJlZm9yZUVhY2goKCkgPT4ge1xuICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgdHJ1ZSk7XG4gICAgICBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpO1xuICAgICAgbm9kZTEgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpKTtcbiAgICAgIG5vZGUyID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygyLCAyKSk7XG4gICAgICBsYXRMbmcgPSBuZXcgTWFwU3ZjLkxhdExuZygzLCAzKTtcbiAgICB9KVxuICAgIGRlc2NyaWJlKCdBZGRpdGlvbiDCtycsIGZ1bmN0aW9uKCkge1xuICAgICAgaXQoJ0NyZWF0ZXMgYSBwYXRoIHdpdGggYSBzaW5nbGUgcG9pbnQnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuICBcbiAgXG4gICAgICBpdCgnQ3JlYXRlcyBhIHBhdGggd2l0aCBtdWx0aXBsZSBwb2ludHMnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZXNUb0RyYXdpbmcoZHJhd2luZywgMCwgW25vZGUwLCBub2RlMSwgbm9kZTJdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgzKTtcbiAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZXhwZWN0KG5vZGUxLmluZGV4KS50b0JlKDEpO1xuICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdChub2RlMi5pbmRleCkudG9CZSgyKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoWzJdLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICBleHBlY3QocGF0aFsyXS5sbmcoKSkudG9CZShub2RlMi5sbmcpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgXG4gIFxuICAgICAgaXQoJ0FwcGVuZHMgYSBwYXRoIHRvIGEgc2luZ2xlIHBvaW50JywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZTApXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMSwgbm9kZTEpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUxLmluZGV4KS50b0JlKDEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxhdCgpKS50b0JlKG5vZGUxLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubG5nKCkpLnRvQmUobm9kZTEubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgXG4gIFxuICAgICAgaXQoJ0FwcGVuZHMgYSBwYXRoIHRvIGEgcGF0aCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAyLCBub2RlMilcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMC5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDIpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzJdLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMl0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcblxuXG4gICAgICBpdCgnSW5zZXJ0cyBhIHBhdGggaW50byBhIHBhdGgnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZXNUb0RyYXdpbmcoZHJhd2luZywgMCwgW25vZGUwLCBub2RlMV0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIDEsIG5vZGUyKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSgyKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsyXS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzJdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTIuaW5kZXgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubGF0KCkpLnRvQmUobm9kZTIubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sbmcoKSkudG9CZShub2RlMi5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuXG5cbiAgICAgIGl0KCdQcmVwZW5kcyBhIHBhdGggdG8gYSBzaW5nbGUgcG9pbnQnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMSlcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMC5pbmRleCkudG9CZSgxKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuICBcbiAgXG4gICAgICBpdCgnUHJlcGVuZHMgYSBwYXRoIHRvIGEgcGF0aCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMilcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMC5pbmRleCkudG9CZSgxKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMl0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsyXS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICBkZXNjcmliZSgnQ2hhbmdlIGV4aXN0aW5nIMK3JywgZnVuY3Rpb24oKSB7XG4gICAgICBpdCgnTW92ZXMgb3JwaGFuIG5vZGUnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuY2hhbmdlTm9kZU9mRHJhd2luZyhkcmF3aW5nLCAwLCB7XG4gICAgICAgICAgICAgIGxhdDogbGF0TG5nLmxhdCgpLFxuICAgICAgICAgICAgICBsbmc6IGxhdExuZy5sbmcoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgxKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMC5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGxhdExuZy5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChsYXRMbmcubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICBcbiAgICBcbiAgICAgIGl0KCdNb3ZlcyBsYXN0IG5vZGUnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZXNUb0RyYXdpbmcoZHJhd2luZywgMCwgW25vZGUwLCBub2RlMSwgbm9kZTJdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5jaGFuZ2VOb2RlT2ZEcmF3aW5nKGRyYXdpbmcsIDIsIHtcbiAgICAgICAgICAgICAgbGF0OiBsYXRMbmcubGF0KCksXG4gICAgICAgICAgICAgIGxuZzogbGF0TG5nLmxuZygpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSgxKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlcykubm90LnRvQ29udGFpbihub2RlMik7XG4gICAgICAgICAgICAgICAgbm9kZTIgPSBkcmF3aW5nLm5vZGVzWzJdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMi5pbmRleCkudG9CZSgyKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsyXS5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzJdLmxuZygpKS50b0JlKG5vZGUyLmxuZyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGxhdExuZy5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChsYXRMbmcubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICBcbiAgICBcbiAgICAgIGl0KCdNb3ZlcyBmaXJzdCBub2RlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTEsIG5vZGUyXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuY2hhbmdlTm9kZU9mRHJhd2luZyhkcmF3aW5nLCAwLCB7XG4gICAgICAgICAgICAgIGxhdDogbGF0TG5nLmxhdCgpLFxuICAgICAgICAgICAgICBsbmc6IGxhdExuZy5sbmcoKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgzKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzKS5ub3QudG9Db250YWluKG5vZGUwKTtcbiAgICAgICAgICAgICAgICBub2RlMCA9IGRyYXdpbmcubm9kZXNbMF07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgICAgICBleHBlY3QobGF0TG5nLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KGxhdExuZy5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUxLmluZGV4KS50b0JlKDEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxhdCgpKS50b0JlKG5vZGUxLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubG5nKCkpLnRvQmUobm9kZTEubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMi5pbmRleCkudG9CZSgyKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsyXS5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzJdLmxuZygpKS50b0JlKG5vZGUyLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG5cblxuICAgICAgaXQoJ01vdmVzIG1pZGRsZSBub2RlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTEsIG5vZGUyXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmNoYW5nZU5vZGVPZkRyYXdpbmcoZHJhd2luZywgMSwge1xuICAgICAgICAgICAgICBsYXQ6IGxhdExuZy5sYXQoKSxcbiAgICAgICAgICAgICAgbG5nOiBsYXRMbmcubG5nKClcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXMpLm5vdC50b0NvbnRhaW4obm9kZTEpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG5vZGUxID0gZHJhd2luZy5ub2Rlc1sxXTtcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChsYXRMbmcubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QobGF0TG5nLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTIuaW5kZXgpLnRvQmUoMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMl0ubGF0KCkpLnRvQmUobm9kZTIubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsyXS5sbmcoKSkudG9CZShub2RlMi5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIFxuICAgIGRlc2NyaWJlKCdSZW1vdmFsIMK3JywgZnVuY3Rpb24oKSB7XG4gICAgICBpdCgnUmVtb3ZlcyBvcnBoYW4gbm9kZScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIDAsIG5vZGUwKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5yZW1vdmVOb2RlRnJvbURyYXdpbmcoZHJhd2luZywgMCwgMSlcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlcy5sZW5ndGgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgXG4gICAgXG4gICAgICBpdCgnUmVtb3ZlcyBmaXJzdCBub2RlJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTEsIG5vZGUyXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMucmVtb3ZlTm9kZUZyb21EcmF3aW5nKGRyYXdpbmcsIDAsIDEpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlcy5sZW5ndGgpLnRvQmUoMik7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXNbMF0pLnRvQmUobm9kZTEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlc1sxXSkudG9CZShub2RlMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcblxuXG4gICAgICBpdCgnUmVtb3ZlcyBtaWRkbGUgbm9kZScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxLCBub2RlMl0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5yZW1vdmVOb2RlRnJvbURyYXdpbmcoZHJhd2luZywgMSwgMSlcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgyKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzLmxlbmd0aCkudG9CZSgyKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3QoZHJhd2luZy5ub2Rlc1swXSkudG9CZShub2RlMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzWzFdKS50b0JlKG5vZGUyKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTIuaW5kZXgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubGF0KCkpLnRvQmUobm9kZTIubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sbmcoKSkudG9CZShub2RlMi5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuXG5cbiAgICAgIGl0KCdSZW1vdmVzIGxhc3Qgbm9kZScsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxLCBub2RlMl0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLnJlbW92ZU5vZGVGcm9tRHJhd2luZyhkcmF3aW5nLCAyLCAxKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXMubGVuZ3RoKS50b0JlKDIpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzWzBdKS50b0JlKG5vZGUwKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KGRyYXdpbmcubm9kZXNbMV0pLnRvQmUobm9kZTEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSgxKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgICBcbiAgICAgIFxuICAgICAgaXQoJ1JlbW92ZXMgYWxsIG5vZGVzJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTEsIG5vZGUyXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLnJlbW92ZU5vZGVzRnJvbURyYXdpbmcoZHJhd2luZywgMCwgMylcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgwKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChkcmF3aW5nLm5vZGVzLmxlbmd0aCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICAgIFxuICAgIH0pO1xuICB9KTtcbn0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9