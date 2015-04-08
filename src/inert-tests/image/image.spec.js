describe('Image', function() {
  var ImageSvc, MapSvc;

  var MockMapSvc = MapSvc = {
		'geometry': {
			encoding: {
				encodePath: () => Math.random().toString(36)
			},
			spherical: {
				computeHeading: () => (Math.random() * 360 - 180)
			}
		},
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
      this.lat = function() {
        return lat;
      };
      this.lng = function() {
        return lng;
      };
      this.equals = function(latLng) {
        return (this.lat() === latLng.lat() &&
          this.lng() === latLng.lng());
      }.bind(this)
    },
    'LatLngBounds': function() {
    	this.extend = () => {};
			this.getNorthEast = () => Math.random();
			this.getSouthWest = () => Math.random();
    },
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
      this.setPosition = function() {};
      this.setMap = function() {};
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
      this.setPath = function(polyPath) {
        path = polyPath;
      }
      this.getPath = function() {
        return {
          getArray: function() {
            return path;
          }
        };
      }
    },
    'Polyline': function() {
      var path = [];
      this.setPath = function(polyPath) {
        path = polyPath;
      }
      this.getPath = function() {
        return {
          getArray: function() {
            return path;
          }
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


  beforeEach(angular.mock.module('bndry.drawing', function($provide) {
    $provide.value('MapSvc', MockMapSvc);
  }));
  beforeEach(angular.mock.module('bndry.image', function($provide) {
    $provide.value('MapSvc', MockMapSvc);
  }));
  
  beforeEach(inject(function(_ImageSvc_, $rootScope, $localStorage, DrawingSvc) {
    ImageSvc = _ImageSvc_;
		spyOn($rootScope, '$broadcast');
		
		$localStorage.$default({
			style: [{
	      'stylers': [{
	        'visibility': 'off'
	      }]
	    }, {
	      'featureType': 'landscape',
	      'stylers': [{
	        'visibility': 'on'
	      }, {
	        'color': '#ffffff'
	      }]
	    }, {
	      'featureType': 'road',
	      'stylers': [{
	        'visibility': 'on'
	      }]
	    }, {
	      'elementType': 'geometry.fill',
	      'stylers': [{
	        'color': '#ffffff'
	      }]
	    }, {
	      'featureType': 'road',
	      'elementType': 'geometry.stroke',
	      'stylers': [{
	        'color': '#808080'
	      }]
	    }, {
	      'elementType': 'labels.text.stroke',
	      'stylers': [{
	        'color': '#ffffff'
	      }]
	    }, {
	      'elementType': 'labels.text.fill',
	      'stylers': [{
	        'color': '#000000'
	      }]
	    }, {
	      'featureType': 'water',
	      'stylers': [{
	        'visibility': 'on'
	      }, {
	        'color': '#40bfbf'
	      }]
	    }, {
	      'featureType': 'water',
	      'elementType': 'labels.text.stroke',
	      'stylers': [{
	        'color': '#ffffff'
	      }]
	    }, {
	      'featureType': 'road.local',
	      'elementType': 'geometry',
	      'stylers': [{
	        'color': '#dfdfdf'
	      }]
	    }, {
	      'featureType': 'road.local',
	      'elementType': 'geometry.stroke',
	      'stylers': [{
	        'visibility': 'off'
	      }]
	    }, {
	      'featureType': 'landscape.man_made',
	      'stylers': [{
	        'visibility': 'off'
	      }]
	    }]
		});
		
		DrawingSvc.drawings = DrawingSvc.geoJsonToDrawings('{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"LineString","coordinates":[[0, 1],[1, 0],[0, 1],[1, 0],[0, 1],[1, 0],[0, 1],[1, 0],[0, 1],[1, 0],[0, 1],[1, 0],[0, 1],[1, 0]]},"properties":{"colorIndex":1,"rigid":false,"fill":false,"nodes":[{"lat":0,"lng":1,"index":0},{"lat":1,"lng":0,"index":13}]}}]}');
  }));

	describe('Pixel dimensions', function() {
	  it('Portrait', function() {
	    expect(ImageSvc.pxSize(640, 640, 3.5/5)).toEqual({
	    	ratio: 3.5/5,
				width: 448,
				height: 640
	    });
	  });
		
	  it('Landscape', function() {
	    expect(ImageSvc.pxSize(640, 640, 5/3.5)).toEqual({
	    	ratio: 5/3.5,
				width: 640,
				height: 448
	    });
	  });
	});
	
	describe('URLs', function() {
		it('Generates valid URLs', function() {
			expect(ImageSvc.generateUrl()).toMatch(/(([\w-]+:\/\/?|www[.])[^\s()<>]+(?:\([\w\d]+\)|([^[:punct:]\s]|\/)))/);
		});
	});
});
