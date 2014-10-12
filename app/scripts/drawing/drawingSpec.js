describe('DrawingSvc', function() {
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
      var path = [], lat, lng;

      path.push(locations[0]);
      if (
        !(locations[0].lat() === locations[1].lat() &&
        locations[0].lng() === locations[1].lng())
      ) {
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
      this.lat = () => lat;
      this.lng = () => lng;
      this.equals = (latLng) => {
        return (this.lat() === latLng.lat() &&
          this.lng() === latLng.lng());
      }
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
      this.setPosition = () => {};
      this.setMap = () => {};
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
      this.setPath = (polyPath) => {
        path = polyPath;
      }
      this.getPath = () => {
        return {
          getArray: () => path
        };
      }
    },
    'Polyline': function() {
      var path = [];
      this.setPath = (polyPath) => {
        path = polyPath;
      }
      this.getPath = () => {
        return {
          getArray: () => path
        };
      }
    },
    'Rectangle': function() {},
    'ScaleControlStyle': {
      'DEFAULT': 0
    },
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

  describe('Flexible paths', function() {
    describe('Addition', function() {
      it('Creates a path with a single point', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0));
      
        DrawingSvc.addNodeToDrawing(drawing, 0, node)
          .then(function(path) {
            expect(path.length).toBe(1);
        
            expect(node.index).toBe(0);
            expect(path[0].lat()).toBe(node.lat);
            expect(path[0].lng()).toBe(node.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
  
  
      it('Creates a path with multiple points', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(2, new MapSvc.LatLng(2, 2));
      
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2])
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });
  
  
      it('Appends a path to a single point', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1));
    
        DrawingSvc.addNodeToDrawing(drawing, 0, node0);
        DrawingSvc.addNodeToDrawing(drawing, 1, node1)
          .then(function(path) {
            expect(path.length).toBe(10);
        
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
        
            expect(node1.index).toBe(9);
            expect(path[9].lat()).toBe(node1.lat);
            expect(path[9].lng()).toBe(node1.lng);
          })
          .finally(done);
        $timeout.flush();
      });
  
  
      it('Appends a path to a path', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
    
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]);
        DrawingSvc.addNodeToDrawing(drawing, 2, node2)
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });


      it('Inserts a path into a path', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
    
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]);
        DrawingSvc.addNodeToDrawing(drawing, 1, node2)
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });


      it('Prepends a path to a single point', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1));
    
        DrawingSvc.addNodeToDrawing(drawing, 0, node0);
        DrawingSvc.addNodeToDrawing(drawing, 0, node1)
          .then(function(path) {
            expect(path.length).toBe(10);
        
            expect(node0.index).toBe(9);
            expect(path[9].lat()).toBe(node0.lat);
            expect(path[9].lng()).toBe(node0.lng);
        
            expect(node1.index).toBe(0);
            expect(path[0].lat()).toBe(node1.lat);
            expect(path[0].lng()).toBe(node1.lng);
          })
          .finally(done);
          
        $timeout.flush();
      });
  
  
      it('Prepends a path to a path', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
    
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]);
        DrawingSvc.addNodeToDrawing(drawing, 0, node2)
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });
    });
    
    describe('Change existing', function() {
      it('Moves orphan node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          latLng = new MapSvc.LatLng(1, 1);
    
        DrawingSvc.addNodeToDrawing(drawing, 0, node0);
        DrawingSvc.changeNodeOfDrawing(drawing, 0, {
          lat: latLng.lat(),
          lng: latLng.lng()
        })
          .then(function(path) {
            expect(path.length).toBe(1);
        
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(latLng.lat()).toBe(node0.lat);
            expect(latLng.lng()).toBe(node0.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
    
    
      it('Moves last node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2)),
          latLng = new MapSvc.LatLng(3, 3);
    
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.changeNodeOfDrawing(drawing, 2, {
          lat: latLng.lat(),
          lng: latLng.lng()
        })
          .then(function(path) {
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
            expect(latLng.lat()).toBe(node2.lat);
            expect(latLng.lng()).toBe(node2.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
    
    
      it('Moves first node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2)),
          latLng = new MapSvc.LatLng(3, 3);
    
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.changeNodeOfDrawing(drawing, 0, {
          lat: latLng.lat(),
          lng: latLng.lng()
        })
          .then(function(path) {
            expect(path.length).toBe(19);
        
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
          })
          .finally(done);
    
        $timeout.flush();
      });


      it('Moves middle node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2)),
          latLng = new MapSvc.LatLng(3, 3);
          
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2])
        DrawingSvc.changeNodeOfDrawing(drawing, 1, {
          lat: latLng.lat(),
          lng: latLng.lng()
        })
          .then(function(path) {
            expect(path.length).toBe(19);
        
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            
            expect(node1.index).toBe(9);
            expect(path[9].lat()).toBe(node1.lat);
            expect(path[9].lng()).toBe(node1.lng);
            expect(latLng.lat()).toBe(node1.lat);
            expect(latLng.lng()).toBe(node1.lng);
        
            expect(node2.index).toBe(18);
            expect(path[18].lat()).toBe(node2.lat);
            expect(path[18].lng()).toBe(node2.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
    });
    
    describe('Removal', function() {
      it('Removes orphan node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          latLng = new MapSvc.LatLng(1, 1);
    
        DrawingSvc.addNodeToDrawing(drawing, 0, node0);
        DrawingSvc.removeNodeFromDrawing(drawing, 0, 1)
          .then(function(path) {
            expect(path.length).toBe(0);
            expect(drawing.nodes.length).toBe(0);
          })
          .finally(done);
    
        $timeout.flush();
      });
    
    
      it('Removes last node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
    
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.removeNodeFromDrawing(drawing, 2, 1)
          .then(function(path) {
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
          })
          .finally(done);
        $timeout.flush();
      });
    
    
      it('Removes first node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
    
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.removeNodeFromDrawing(drawing, 0, 1)
          .then(function(path) {
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
          })
          .finally(done);
          
        $timeout.flush();
      });


      it('Removes middle node', function(done) {
        drawing = DrawingSvc.makeDrawing(0, false);
        var node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0)),
          node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1)),
          node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
                
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.removeNodeFromDrawing(drawing, 1, 1)
          .then(function(path) {
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
          })
          .finally(done);
        $timeout.flush();
      });
    });
  });
  
  
  describe('Rigid paths', function() {
    beforeEach(() => {
      drawing = DrawingSvc.makeDrawing(0, true);
      node0 = DrawingSvc.makeNode(0, new MapSvc.LatLng(0, 0));
      node1 = DrawingSvc.makeNode(0, new MapSvc.LatLng(1, 1));
      node2 = DrawingSvc.makeNode(0, new MapSvc.LatLng(2, 2));
      latLng = new MapSvc.LatLng(3, 3);
    })
    describe('Addition', function() {
      it('Creates a path with a single point', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0)
          .then(function(path) {
            expect(path.length).toBe(1);
        
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
  
  
      it('Creates a path with multiple points', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2])
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });
  
  
      it('Appends a path to a single point', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0);
        DrawingSvc.addNodeToDrawing(drawing, 1, node1)
          .then(function(path) {
            expect(path.length).toBe(2);
        
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
        
            expect(node1.index).toBe(1);
            expect(path[1].lat()).toBe(node1.lat);
            expect(path[1].lng()).toBe(node1.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
  
  
      it('Appends a path to a path', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]);
        DrawingSvc.addNodeToDrawing(drawing, 2, node2)
          .then(function(path) {
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
          })
          .finally(done);

        $timeout.flush();
      });


      it('Inserts a path into a path', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]);
        DrawingSvc.addNodeToDrawing(drawing, 1, node2)
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });


      it('Prepends a path to a single point', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0);
        DrawingSvc.addNodeToDrawing(drawing, 0, node1)
          .then(function(path) {
            expect(path.length).toBe(2);
        
            expect(node0.index).toBe(1);
            expect(path[1].lat()).toBe(node0.lat);
            expect(path[1].lng()).toBe(node0.lng);
        
            expect(node1.index).toBe(0);
            expect(path[0].lat()).toBe(node1.lat);
            expect(path[0].lng()).toBe(node1.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
  
  
      it('Prepends a path to a path', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1]);
        DrawingSvc.addNodeToDrawing(drawing, 0, node2)
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });
    });
    
    describe('Change existing', function() {
      it('Moves orphan node', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0);
        DrawingSvc.changeNodeOfDrawing(drawing, 0, {
          lat: latLng.lat(),
          lng: latLng.lng()
        })
          .then(function(path) {
            expect(path.length).toBe(1);
        
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            expect(latLng.lat()).toBe(node0.lat);
            expect(latLng.lng()).toBe(node0.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
    
    
      it('Moves last node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.changeNodeOfDrawing(drawing, 2, {
          lat: latLng.lat(),
          lng: latLng.lng()
        })
          .then(function(path) {
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
            expect(latLng.lat()).toBe(node2.lat);
            expect(latLng.lng()).toBe(node2.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
    
    
      it('Moves first node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.changeNodeOfDrawing(drawing, 0, {
          lat: latLng.lat(),
          lng: latLng.lng()
        })
          .then(function(path) {
            expect(path.length).toBe(3);
        
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
          })
          .finally(done);
    
        $timeout.flush();
      });


      it('Moves middle node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2])
        DrawingSvc.changeNodeOfDrawing(drawing, 1, {
          lat: latLng.lat(),
          lng: latLng.lng()
        })
          .then(function(path) {
            expect(path.length).toBe(3);
        
            expect(node0.index).toBe(0);
            expect(path[0].lat()).toBe(node0.lat);
            expect(path[0].lng()).toBe(node0.lng);
            
            expect(node1.index).toBe(1);
            expect(path[1].lat()).toBe(node1.lat);
            expect(path[1].lng()).toBe(node1.lng);
            expect(latLng.lat()).toBe(node1.lat);
            expect(latLng.lng()).toBe(node1.lng);
        
            expect(node2.index).toBe(2);
            expect(path[2].lat()).toBe(node2.lat);
            expect(path[2].lng()).toBe(node2.lng);
          })
          .finally(done);
    
        $timeout.flush();
      });
    });
    
    describe('Removal', function() {
      it('Removes orphan node', function(done) {
        DrawingSvc.addNodeToDrawing(drawing, 0, node0);
        DrawingSvc.removeNodeFromDrawing(drawing, 0, 1)
          .then(function(path) {
            expect(path.length).toBe(0);
            expect(drawing.nodes.length).toBe(0);
          })
          .finally(done);
    
        $timeout.flush();
      });
    
    
      it('Removes first node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.removeNodeFromDrawing(drawing, 0, 1)
          .then(function(path) {
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
          })
          .finally(done);

        $timeout.flush();
      });


      it('Removes middle node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.removeNodeFromDrawing(drawing, 1, 1)
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });


      it('Removes last node', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.removeNodeFromDrawing(drawing, 2, 1)
          .then(function(path) {
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
          })
          .finally(done);
    
        $timeout.flush();
      });
      
      
      it('Removes all nodes', function(done) {
        DrawingSvc.addNodesToDrawing(drawing, 0, [node0, node1, node2]);
        DrawingSvc.removeNodesFromDrawing(drawing, 0, 3)
          .then(function(path) {
            expect(path.length).toBe(0);
        
            expect(drawing.nodes.length).toBe(0);
          })
          .finally(done);
    
        $timeout.flush();
      });
      
    });
  });
});
