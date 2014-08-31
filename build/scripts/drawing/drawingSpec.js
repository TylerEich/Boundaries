"use strict";
describe('DrawingSvc ·', function() {
  var $q,
      $timeout,
      DrawingSvc,
      MapSvc,
      MockDirectionsSvc,
      drawing;
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
  describe('Splice tests ·', function() {
    describe('Flexible paths ·', function() {
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
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]).then(function() {
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
    describe('Rigid paths ·', function() {
      it('Creates a path with a single point', function(done) {
        drawing = DrawingSvc.makeDrawing(0, true);
        var node = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0));
        DrawingSvc.addNodeToDrawing(drawing, 0, node).then(function(path) {
          expect(path.length).toBe(1);
          expect(node.index).toBe(0);
          expect(path[0].lat()).toBe(node.lat);
          expect(path[0].lng()).toBe(node.lng);
        }).finally(done);
        $timeout.flush();
      });
      it('Appends a path to a single point', function(done) {
        drawing = DrawingSvc.makeDrawing(0, true);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1));
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
        drawing = DrawingSvc.makeDrawing(0, true);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
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
        drawing = DrawingSvc.makeDrawing(0, true);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]).then(function() {
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
        drawing = DrawingSvc.makeDrawing(0, true);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1));
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
        drawing = DrawingSvc.makeDrawing(0, true);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
            node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
            node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
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
  });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJhd2luZy9kcmF3aW5nU3BlYy5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbImRyYXdpbmcvZHJhd2luZ1NwZWMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZGVzY3JpYmUoJ0RyYXdpbmdTdmMgwrcnLCBmdW5jdGlvbigpIHtcbiAgdmFyICRxLCAkdGltZW91dCwgRHJhd2luZ1N2YywgTWFwU3ZjLCBNb2NrRGlyZWN0aW9uc1N2YywgZHJhd2luZztcblxuICBNb2NrRGlyZWN0aW9uc1N2YyA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucm91dGUgPSBmdW5jdGlvbihsb2NhdGlvbnMpIHtcbiAgICAgIHZhciBwYXRoID0gW10sIGxhdCwgbG5nO1xuXG4gICAgICBwYXRoLnB1c2gobG9jYXRpb25zWzBdKTtcbiAgICAgIGlmIChcbiAgICAgICAgIShsb2NhdGlvbnNbMF0ubGF0KCkgPT09IGxvY2F0aW9uc1sxXS5sYXQoKSAmJlxuICAgICAgICBsb2NhdGlvbnNbMF0ubG5nKCkgPT09IGxvY2F0aW9uc1sxXS5sbmcoKSlcbiAgICAgICkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgIGxhdCA9IC05MCArICgxODAgKiBNYXRoLnJhbmRvbSgpKTtcbiAgICAgICAgICBsbmcgPSAtMTgwICsgKDM2MCAqIE1hdGgucmFuZG9tKCkpO1xuICAgICAgICAgIHBhdGgucHVzaChuZXcgTWFwU3ZjLkxhdExuZyhsYXQsIGxuZykpO1xuICAgICAgICB9XG4gICAgICAgIHBhdGgucHVzaChsb2NhdGlvbnNbMV0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gJHEud2hlbihwYXRoKTtcbiAgICB9O1xuICB9O1xuXG4gIHZhciBNb2NrTWFwU3ZjID0gTWFwU3ZjID0ge1xuICAgICdfX2dqc2xvYWRfXyc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0FuaW1hdGlvbic6IHtcbiAgICAgICdCT1VOQ0UnOiAxLFxuICAgICAgJ0RST1AnOiAyLFxuICAgICAgJ2snOiAzLFxuICAgICAgJ2onOiA0XG4gICAgfSxcbiAgICAnQ2lyY2xlJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnQ29udHJvbFBvc2l0aW9uJzoge1xuICAgICAgJ1RPUF9MRUZUJzogMSxcbiAgICAgICdUT1BfQ0VOVEVSJzogMixcbiAgICAgICdUT1AnOiAyLFxuICAgICAgJ1RPUF9SSUdIVCc6IDMsXG4gICAgICAnTEVGVF9DRU5URVInOiA0LFxuICAgICAgJ0xFRlRfVE9QJzogNSxcbiAgICAgICdMRUZUJzogNSxcbiAgICAgICdMRUZUX0JPVFRPTSc6IDYsXG4gICAgICAnUklHSFRfVE9QJzogNyxcbiAgICAgICdSSUdIVCc6IDcsXG4gICAgICAnUklHSFRfQ0VOVEVSJzogOCxcbiAgICAgICdSSUdIVF9CT1RUT00nOiA5LFxuICAgICAgJ0JPVFRPTV9MRUZUJzogMTAsXG4gICAgICAnQk9UVE9NX0NFTlRFUic6IDExLFxuICAgICAgJ0JPVFRPTSc6IDExLFxuICAgICAgJ0JPVFRPTV9SSUdIVCc6IDEyLFxuICAgICAgJ0NFTlRFUic6IDEzXG4gICAgfSxcbiAgICAnRGF0YSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0dyb3VuZE92ZXJsYXknOiBmdW5jdGlvbigpIHt9LFxuICAgICdJbWFnZU1hcFR5cGUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdJbmZvV2luZG93JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTGF0TG5nJzogZnVuY3Rpb24obGF0LCBsbmcpIHtcbiAgICAgIHRoaXMubGF0ID0gKCkgPT4gbGF0O1xuICAgICAgdGhpcy5sbmcgPSAoKSA9PiBsbmc7XG4gICAgICB0aGlzLmVxdWFscyA9IChsYXRMbmcpID0+IHtcbiAgICAgICAgcmV0dXJuICh0aGlzLmxhdCgpID09PSBsYXRMbmcubGF0KCkgJiZcbiAgICAgICAgICB0aGlzLmxuZygpID09PSBsYXRMbmcubG5nKCkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ0xhdExuZ0JvdW5kcyc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ01WQ0FycmF5JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTVZDT2JqZWN0JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWFwJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWFwVHlwZUNvbnRyb2xTdHlsZSc6IHtcbiAgICAgICdERUZBVUxUJzogMCxcbiAgICAgICdIT1JJWk9OVEFMX0JBUic6IDEsXG4gICAgICAnRFJPUERPV05fTUVOVSc6IDJcbiAgICB9LFxuICAgICdNYXBUeXBlSWQnOiB7XG4gICAgICAnUk9BRE1BUCc6ICdyb2FkbWFwJyxcbiAgICAgICdTQVRFTExJVEUnOiAnc2F0ZWxsaXRlJyxcbiAgICAgICdIWUJSSUQnOiAnaHlicmlkJyxcbiAgICAgICdURVJSQUlOJzogJ3RlcnJhaW4nXG4gICAgfSxcbiAgICAnTWFwVHlwZVJlZ2lzdHJ5JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWFya2VyJzogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnNldFBvc2l0aW9uID0gKCkgPT4ge307XG4gICAgfSxcbiAgICAnTWFya2VySW1hZ2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICdOYXZpZ2F0aW9uQ29udHJvbFN0eWxlJzoge1xuICAgICAgJ0RFRkFVTFQnOiAwLFxuICAgICAgJ1NNQUxMJzogMSxcbiAgICAgICdBTkRST0lEJzogMixcbiAgICAgICdaT09NX1BBTic6IDMsXG4gICAgICAnRG4nOiA0LFxuICAgICAgJ1htJzogNVxuICAgIH0sXG4gICAgJ092ZXJsYXlWaWV3JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnUG9pbnQnOiBmdW5jdGlvbigpIHt9LFxuICAgICdQb2x5Z29uJzogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGF0aDtcbiAgICAgIHRoaXMuc2V0UGF0aCA9IChwb2x5UGF0aCkgPT4ge1xuICAgICAgICBwYXRoID0gcG9seVBhdGg7XG4gICAgICB9XG4gICAgICB0aGlzLmdldFBhdGggPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2V0QXJyYXk6ICgpID0+IHBhdGhcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdQb2x5bGluZSc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBhdGggPSBbXTtcbiAgICAgIHRoaXMuc2V0UGF0aCA9IChwb2x5UGF0aCkgPT4ge1xuICAgICAgICBwYXRoID0gcG9seVBhdGg7XG4gICAgICB9XG4gICAgICB0aGlzLmdldFBhdGggPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgZ2V0QXJyYXk6ICgpID0+IHBhdGhcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdSZWN0YW5nbGUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTY2FsZUNvbnRyb2xTdHlsZSc6IHtcbiAgICAgICdERUZBVUxUJzogMFxuICAgIH0sXG4gICAgJ1NpemUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJva2VQb3NpdGlvbic6IHtcbiAgICAgICdDRU5URVInOiAwLFxuICAgICAgJ0lOU0lERSc6IDEsXG4gICAgICAnT1VUU0lERSc6IDJcbiAgICB9LFxuICAgICdTeW1ib2xQYXRoJzoge1xuICAgICAgJ0NJUkNMRSc6IDAsXG4gICAgICAnRk9SV0FSRF9DTE9TRURfQVJST1cnOiAxLFxuICAgICAgJ0ZPUldBUkRfT1BFTl9BUlJPVyc6IDIsXG4gICAgICAnQkFDS1dBUkRfQ0xPU0VEX0FSUk9XJzogMyxcbiAgICAgICdCQUNLV0FSRF9PUEVOX0FSUk9XJzogNFxuICAgIH0sXG4gICAgJ1pvb21Db250cm9sU3R5bGUnOiB7XG4gICAgICAnREVGQVVMVCc6IDAsXG4gICAgICAnU01BTEwnOiAxLFxuICAgICAgJ0xBUkdFJzogMixcbiAgICAgICdYbSc6IDNcbiAgICB9LFxuICAgICdldmVudCc6IHtcbiAgICAgICdSZSc6IGZhbHNlLFxuICAgICAgJ1pkJzoge30sXG4gICAgICAnYWRkTGlzdGVuZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ3lmJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdyZW1vdmVMaXN0ZW5lcic6IGZ1bmN0aW9uKCkge30sXG4gICAgICAnY2xlYXJMaXN0ZW5lcnMnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2NsZWFySW5zdGFuY2VMaXN0ZW5lcnMnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ3RyaWdnZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2FkZERvbUxpc3RlbmVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdhZGREb21MaXN0ZW5lck9uY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2NhJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdiaW5kJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdhZGRMaXN0ZW5lck9uY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2ZvcndhcmQnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ1VhJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdiaSc6IGZ1bmN0aW9uKCkge30sXG4gICAgICAnUWonOiBmdW5jdGlvbigpIHt9XG4gICAgfSxcbiAgICAnQmljeWNsaW5nTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXJlY3Rpb25zUmVuZGVyZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXJlY3Rpb25zU2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0RpcmVjdGlvbnNTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ1VOS05PV05fRVJST1InOiAnVU5LTk9XTl9FUlJPUicsXG4gICAgICAnT1ZFUl9RVUVSWV9MSU1JVCc6ICdPVkVSX1FVRVJZX0xJTUlUJyxcbiAgICAgICdSRVFVRVNUX0RFTklFRCc6ICdSRVFVRVNUX0RFTklFRCcsXG4gICAgICAnSU5WQUxJRF9SRVFVRVNUJzogJ0lOVkFMSURfUkVRVUVTVCcsXG4gICAgICAnWkVST19SRVNVTFRTJzogJ1pFUk9fUkVTVUxUUycsXG4gICAgICAnTUFYX1dBWVBPSU5UU19FWENFRURFRCc6ICdNQVhfV0FZUE9JTlRTX0VYQ0VFREVEJyxcbiAgICAgICdOT1RfRk9VTkQnOiAnTk9UX0ZPVU5EJ1xuICAgIH0sXG4gICAgJ0RpcmVjdGlvbnNUcmF2ZWxNb2RlJzoge1xuICAgICAgJ0RSSVZJTkcnOiAnRFJJVklORycsXG4gICAgICAnV0FMS0lORyc6ICdXQUxLSU5HJyxcbiAgICAgICdCSUNZQ0xJTkcnOiAnQklDWUNMSU5HJyxcbiAgICAgICdUUkFOU0lUJzogJ1RSQU5TSVQnXG4gICAgfSxcbiAgICAnRGlyZWN0aW9uc1VuaXRTeXN0ZW0nOiB7XG4gICAgICAnTUVUUklDJzogMCxcbiAgICAgICdJTVBFUklBTCc6IDFcbiAgICB9LFxuICAgICdEaXN0YW5jZU1hdHJpeFNlcnZpY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXN0YW5jZU1hdHJpeFN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnSU5WQUxJRF9SRVFVRVNUJzogJ0lOVkFMSURfUkVRVUVTVCcsXG4gICAgICAnT1ZFUl9RVUVSWV9MSU1JVCc6ICdPVkVSX1FVRVJZX0xJTUlUJyxcbiAgICAgICdSRVFVRVNUX0RFTklFRCc6ICdSRVFVRVNUX0RFTklFRCcsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdNQVhfRUxFTUVOVFNfRVhDRUVERUQnOiAnTUFYX0VMRU1FTlRTX0VYQ0VFREVEJyxcbiAgICAgICdNQVhfRElNRU5TSU9OU19FWENFRURFRCc6ICdNQVhfRElNRU5TSU9OU19FWENFRURFRCdcbiAgICB9LFxuICAgICdEaXN0YW5jZU1hdHJpeEVsZW1lbnRTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ05PVF9GT1VORCc6ICdOT1RfRk9VTkQnLFxuICAgICAgJ1pFUk9fUkVTVUxUUyc6ICdaRVJPX1JFU1VMVFMnXG4gICAgfSxcbiAgICAnRWxldmF0aW9uU2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0VsZXZhdGlvblN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdPVkVSX1FVRVJZX0xJTUlUJzogJ09WRVJfUVVFUllfTElNSVQnLFxuICAgICAgJ1JFUVVFU1RfREVOSUVEJzogJ1JFUVVFU1RfREVOSUVEJyxcbiAgICAgICdJTlZBTElEX1JFUVVFU1QnOiAnSU5WQUxJRF9SRVFVRVNUJyxcbiAgICAgICdCbic6ICdEQVRBX05PVF9BVkFJTEFCTEUnXG4gICAgfSxcbiAgICAnRnVzaW9uVGFibGVzTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdHZW9jb2Rlcic6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0dlb2NvZGVyTG9jYXRpb25UeXBlJzoge1xuICAgICAgJ1JPT0ZUT1AnOiAnUk9PRlRPUCcsXG4gICAgICAnUkFOR0VfSU5URVJQT0xBVEVEJzogJ1JBTkdFX0lOVEVSUE9MQVRFRCcsXG4gICAgICAnR0VPTUVUUklDX0NFTlRFUic6ICdHRU9NRVRSSUNfQ0VOVEVSJyxcbiAgICAgICdBUFBST1hJTUFURSc6ICdBUFBST1hJTUFURSdcbiAgICB9LFxuICAgICdHZW9jb2RlclN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdPVkVSX1FVRVJZX0xJTUlUJzogJ09WRVJfUVVFUllfTElNSVQnLFxuICAgICAgJ1JFUVVFU1RfREVOSUVEJzogJ1JFUVVFU1RfREVOSUVEJyxcbiAgICAgICdJTlZBTElEX1JFUVVFU1QnOiAnSU5WQUxJRF9SRVFVRVNUJyxcbiAgICAgICdaRVJPX1JFU1VMVFMnOiAnWkVST19SRVNVTFRTJyxcbiAgICAgICdFUlJPUic6ICdFUlJPUidcbiAgICB9LFxuICAgICdLbWxMYXllcic6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0ttbExheWVyU3RhdHVzJzoge1xuICAgICAgJ1VOS05PV04nOiAnVU5LTk9XTicsXG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ0lOVkFMSURfUkVRVUVTVCc6ICdJTlZBTElEX1JFUVVFU1QnLFxuICAgICAgJ0RPQ1VNRU5UX05PVF9GT1VORCc6ICdET0NVTUVOVF9OT1RfRk9VTkQnLFxuICAgICAgJ0ZFVENIX0VSUk9SJzogJ0ZFVENIX0VSUk9SJyxcbiAgICAgICdJTlZBTElEX0RPQ1VNRU5UJzogJ0lOVkFMSURfRE9DVU1FTlQnLFxuICAgICAgJ0RPQ1VNRU5UX1RPT19MQVJHRSc6ICdET0NVTUVOVF9UT09fTEFSR0UnLFxuICAgICAgJ0xJTUlUU19FWENFRURFRCc6ICdMSU1JVFNfRVhFQ0VFREVEJyxcbiAgICAgICdUSU1FRF9PVVQnOiAnVElNRURfT1VUJ1xuICAgIH0sXG4gICAgJ01heFpvb21TZXJ2aWNlJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWF4Wm9vbVN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnRVJST1InOiAnRVJST1InXG4gICAgfSxcbiAgICAnU3RyZWV0Vmlld0NvdmVyYWdlTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJlZXRWaWV3UGFub3JhbWEnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJlZXRWaWV3U2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ1N0cmVldFZpZXdTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ1VOS05PV05fRVJST1InOiAnVU5LTk9XTl9FUlJPUicsXG4gICAgICAnWkVST19SRVNVTFRTJzogJ1pFUk9fUkVTVUxUUydcbiAgICB9LFxuICAgICdTdHlsZWRNYXBUeXBlJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhZmZpY0xheWVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhbnNpdExheWVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhdmVsTW9kZSc6IHtcbiAgICAgICdEUklWSU5HJzogJ0RSSVZJTkcnLFxuICAgICAgJ1dBTEtJTkcnOiAnV0FMS0lORycsXG4gICAgICAnQklDWUNMSU5HJzogJ0JJQ1lDTElORycsXG4gICAgICAnVFJBTlNJVCc6ICdUUkFOU0lUJ1xuICAgIH0sXG4gICAgJ1VuaXRTeXN0ZW0nOiB7XG4gICAgICAnTUVUUklDJzogMCxcbiAgICAgICdJTVBFUklBTCc6IDFcbiAgICB9LFxuICAgICd2ZXJzaW9uJzogJzMuMTYuOCcsXG4gICAgJ21hcCc6IHt9XG4gIH07XG5cbiAgYmVmb3JlRWFjaChtb2R1bGUoJ2JuZHJ5LmRyYXdpbmcnLCBmdW5jdGlvbigkcHJvdmlkZSkge1xuICAgICRwcm92aWRlLnZhbHVlKCdEaXJlY3Rpb25zU3ZjJywgbmV3IE1vY2tEaXJlY3Rpb25zU3ZjKCkpO1xuICAgICRwcm92aWRlLnZhbHVlKCdNYXBTdmMnLCBNb2NrTWFwU3ZjKTtcbiAgfSkpO1xuXG4gIGJlZm9yZUVhY2goaW5qZWN0KGZ1bmN0aW9uKF8kdGltZW91dF8sIF8kcV8pIHtcbiAgICAkcSA9IF8kcV87XG4gICAgJHRpbWVvdXQgPSBfJHRpbWVvdXRfO1xuICB9KSk7XG5cbiAgYmVmb3JlRWFjaChpbmplY3QoZnVuY3Rpb24oX0RyYXdpbmdTdmNfKSB7XG4gICAgRHJhd2luZ1N2YyA9IF9EcmF3aW5nU3ZjXztcbiAgfSkpO1xuXG4gIGRlc2NyaWJlKCdTcGxpY2UgdGVzdHMgwrcnLCBmdW5jdGlvbigpIHtcbiAgICBkZXNjcmliZSgnRmxleGlibGUgcGF0aHMgwrcnLCBmdW5jdGlvbigpIHtcbiAgICAgIGl0KCdDcmVhdGVzIGEgcGF0aCB3aXRoIGEgc2luZ2xlIHBvaW50JywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCBmYWxzZSk7XG4gICAgICAgIHZhciBub2RlID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSk7XG4gICAgICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMSk7XG4gICAgICAgICAgXG4gICAgICAgICAgICBleHBlY3Qobm9kZS5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUubGF0KTtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUubG5nKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICBcbiAgICBcbiAgICAgIGl0KCdBcHBlbmRzIGEgcGF0aCB0byBhIHNpbmdsZSBwb2ludCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgZmFsc2UpO1xuICAgICAgICB2YXIgbm9kZTAgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKSxcbiAgICAgICAgICBub2RlMSA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMSwgMSkpO1xuICAgICAgXG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAxLCBub2RlMSlcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgxMCk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMC5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSg5KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICBcbiAgICBcbiAgICAgIGl0KCdBcHBlbmRzIGEgcGF0aCB0byBhIHBhdGgnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIGZhbHNlKTtcbiAgICAgICAgdmFyIG5vZGUwID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSksXG4gICAgICAgICAgbm9kZTEgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpKSxcbiAgICAgICAgICBub2RlMiA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMiwgMikpO1xuICAgICAgXG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZXNUb0RyYXdpbmcoZHJhd2luZywgMCwgW25vZGUwLCBub2RlMV0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMiwgbm9kZTIpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMTkpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoOSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTIuaW5kZXgpLnRvQmUoMTgpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzE4XS5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzE4XS5sbmcoKSkudG9CZShub2RlMi5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG5cblxuICAgICAgaXQoJ0luc2VydHMgYSBwYXRoIGludG8gYSBwYXRoJywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCBmYWxzZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIG5vZGUxID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygxLCAxKSksXG4gICAgICAgICAgbm9kZTIgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDIsIDIpKTtcbiAgICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTFdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIDEsIG5vZGUyKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDE5KTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUxLmluZGV4KS50b0JlKDE4KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxOF0ubG5nKCkpLnRvQmUobm9kZTEubG5nKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDkpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuXG5cbiAgICAgIGl0KCdQcmVwZW5kcyBhIHBhdGggdG8gYSBzaW5nbGUgcG9pbnQnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIGZhbHNlKTtcbiAgICAgICAgdmFyIG5vZGUwID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSksXG4gICAgICAgICAgbm9kZTEgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpKTtcbiAgICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZTApXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZTEpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMTApO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoOSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbOV0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgXG4gICAgXG4gICAgICBpdCgnUHJlcGVuZHMgYSBwYXRoIHRvIGEgcGF0aCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgZmFsc2UpO1xuICAgICAgICB2YXIgbm9kZTAgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKSxcbiAgICAgICAgICBub2RlMSA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMSwgMSkpLFxuICAgICAgICAgIG5vZGUyID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygyLCAyKSk7XG4gICAgICBcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlMilcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgxOSk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMC5pbmRleCkudG9CZSg5KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFs5XS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzldLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSgxOCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMThdLmxhdCgpKS50b0JlKG5vZGUxLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMThdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMi5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMi5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUyLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICBcbiAgICBcbiAgICBkZXNjcmliZSgnUmlnaWQgcGF0aHMgwrcnLCBmdW5jdGlvbigpIHtcbiAgICAgIGl0KCdDcmVhdGVzIGEgcGF0aCB3aXRoIGEgc2luZ2xlIHBvaW50JywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCB0cnVlKTtcbiAgICAgICAgdmFyIG5vZGUgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKTtcbiAgICAgICAgXG4gICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAwLCBub2RlKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgxKTtcbiAgICAgICAgICBcbiAgICAgICAgICAgIGV4cGVjdChub2RlLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZS5sYXQpO1xuICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZS5sbmcpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuICAgIFxuICAgIFxuICAgICAgaXQoJ0FwcGVuZHMgYSBwYXRoIHRvIGEgc2luZ2xlIHBvaW50JywgZnVuY3Rpb24oZG9uZSkge1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5tYWtlRHJhd2luZygwLCB0cnVlKTtcbiAgICAgICAgdmFyIG5vZGUwID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygwLCAwKSksXG4gICAgICAgICAgbm9kZTEgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDEsIDEpKTtcbiAgICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMCwgbm9kZTApXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVUb0RyYXdpbmcoZHJhd2luZywgMSwgbm9kZTEpXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHBhdGgpIHtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aC5sZW5ndGgpLnRvQmUoMik7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMC5pbmRleCkudG9CZSgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sYXQoKSkudG9CZShub2RlMC5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxuZygpKS50b0JlKG5vZGUwLmxuZyk7XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGV4cGVjdChub2RlMS5pbmRleCkudG9CZSgxKTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sYXQoKSkudG9CZShub2RlMS5sYXQpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxuZygpKS50b0JlKG5vZGUxLmxuZyk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIC5maW5hbGx5KGRvbmUpO1xuICAgICAgICAgIH0pO1xuICAgICAgXG4gICAgICAgICR0aW1lb3V0LmZsdXNoKCk7XG4gICAgICB9KTtcbiAgICBcbiAgICBcbiAgICAgIGl0KCdBcHBlbmRzIGEgcGF0aCB0byBhIHBhdGgnLCBmdW5jdGlvbihkb25lKSB7XG4gICAgICAgIGRyYXdpbmcgPSBEcmF3aW5nU3ZjLm1ha2VEcmF3aW5nKDAsIHRydWUpO1xuICAgICAgICB2YXIgbm9kZTAgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDAsIDApKSxcbiAgICAgICAgICBub2RlMSA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMSwgMSkpLFxuICAgICAgICAgIG5vZGUyID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygyLCAyKSk7XG4gICAgICBcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2Rlc1RvRHJhd2luZyhkcmF3aW5nLCAwLCBbbm9kZTAsIG5vZGUxXSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIERyYXdpbmdTdmMuYWRkTm9kZVRvRHJhd2luZyhkcmF3aW5nLCAyLCBub2RlMilcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocGF0aCkge1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoLmxlbmd0aCkudG9CZSgzKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUwLmluZGV4KS50b0JlKDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzBdLmxhdCgpKS50b0JlKG5vZGUwLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubG5nKCkpLnRvQmUobm9kZTAubG5nKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUxLmluZGV4KS50b0JlKDEpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzFdLmxhdCgpKS50b0JlKG5vZGUxLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubG5nKCkpLnRvQmUobm9kZTEubG5nKTtcbiAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZXhwZWN0KG5vZGUyLmluZGV4KS50b0JlKDIpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChwYXRoWzJdLmxhdCgpKS50b0JlKG5vZGUyLmxhdCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMl0ubG5nKCkpLnRvQmUobm9kZTIubG5nKTtcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgLmZpbmFsbHkoZG9uZSk7XG4gICAgICAgICAgfSk7XG4gICAgICBcbiAgICAgICAgJHRpbWVvdXQuZmx1c2goKTtcbiAgICAgIH0pO1xuXG5cbiAgICAgIGl0KCdJbnNlcnRzIGEgcGF0aCBpbnRvIGEgcGF0aCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgdHJ1ZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIG5vZGUxID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygxLCAxKSksXG4gICAgICAgICAgbm9kZTIgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDIsIDIpKTtcbiAgICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTFdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIDEsIG5vZGUyKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDMpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMl0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsyXS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTIuaW5kZXgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubGF0KCkpLnRvQmUobm9kZTIubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sbmcoKSkudG9CZShub2RlMi5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG5cblxuICAgICAgaXQoJ1ByZXBlbmRzIGEgcGF0aCB0byBhIHNpbmdsZSBwb2ludCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgdHJ1ZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIG5vZGUxID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygxLCAxKSk7XG4gICAgICBcbiAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIDAsIG5vZGUwKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIDAsIG5vZGUxKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDIpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgXG4gICAgXG4gICAgICBpdCgnUHJlcGVuZHMgYSBwYXRoIHRvIGEgcGF0aCcsIGZ1bmN0aW9uKGRvbmUpIHtcbiAgICAgICAgZHJhd2luZyA9IERyYXdpbmdTdmMubWFrZURyYXdpbmcoMCwgdHJ1ZSk7XG4gICAgICAgIHZhciBub2RlMCA9IERyYXdpbmdTdmMubWFrZU5vZGUoMCwgbmV3IE1hcFN2Yy5MYXRMbmcoMCwgMCkpLFxuICAgICAgICAgIG5vZGUxID0gRHJhd2luZ1N2Yy5tYWtlTm9kZSgwLCBuZXcgTWFwU3ZjLkxhdExuZygxLCAxKSksXG4gICAgICAgICAgbm9kZTIgPSBEcmF3aW5nU3ZjLm1ha2VOb2RlKDAsIG5ldyBNYXBTdmMuTGF0TG5nKDIsIDIpKTtcbiAgICAgIFxuICAgICAgICBEcmF3aW5nU3ZjLmFkZE5vZGVzVG9EcmF3aW5nKGRyYXdpbmcsIDAsIFtub2RlMCwgbm9kZTFdKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgRHJhd2luZ1N2Yy5hZGROb2RlVG9EcmF3aW5nKGRyYXdpbmcsIDAsIG5vZGUyKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihwYXRoKSB7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGgubGVuZ3RoKS50b0JlKDMpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTAuaW5kZXgpLnRvQmUoMSk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMV0ubGF0KCkpLnRvQmUobm9kZTAubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsxXS5sbmcoKSkudG9CZShub2RlMC5sbmcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTEuaW5kZXgpLnRvQmUoMik7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMl0ubGF0KCkpLnRvQmUobm9kZTEubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFsyXS5sbmcoKSkudG9CZShub2RlMS5sbmcpO1xuICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBleHBlY3Qobm9kZTIuaW5kZXgpLnRvQmUoMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBhdGhbMF0ubGF0KCkpLnRvQmUobm9kZTIubGF0KTtcbiAgICAgICAgICAgICAgICBleHBlY3QocGF0aFswXS5sbmcoKSkudG9CZShub2RlMi5sbmcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAuZmluYWxseShkb25lKTtcbiAgICAgICAgICB9KTtcbiAgICAgIFxuICAgICAgICAkdGltZW91dC5mbHVzaCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=