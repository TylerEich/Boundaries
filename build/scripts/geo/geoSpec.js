"use strict";
'use strict';
describe('Geo', function() {
  var $timeout,
      GeolocationSvc,
      GeocodeSvc;
  var MockMapSvc = {
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
    'LatLng': function() {},
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
    'Marker': function() {},
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
    'Polygon': function() {},
    'Polyline': function() {},
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
  beforeEach(module('bndry.geo', function($provide) {
    $provide.value('MapSvc', MockMapSvc);
  }));
  beforeEach(inject(function(_$timeout_, _GeocodeSvc_, _GeolocationSvc_) {
    $timeout = _$timeout_;
    GeocodeSvc = _GeocodeSvc_;
    GeolocationSvc = _GeolocationSvc_;
  }));
  it('Returns location data', function() {
    GeolocationSvc.getLocation().then(function(value) {
      expect(typeof value).toBe('object');
      expect(value).toBeTruthy();
    });
  });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvL2dlb1NwZWMuanMiLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJnZW8vZ2VvU3BlYy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdHZW8nLCBmdW5jdGlvbigpIHtcbiAgdmFyICR0aW1lb3V0LCBHZW9sb2NhdGlvblN2YywgR2VvY29kZVN2YztcblxuICB2YXIgTW9ja01hcFN2YyA9IHtcbiAgICAnX19nanNsb2FkX18nOiBmdW5jdGlvbigpIHt9LFxuICAgICdBbmltYXRpb24nOiB7XG4gICAgICAnQk9VTkNFJzogMSxcbiAgICAgICdEUk9QJzogMixcbiAgICAgICdrJzogMyxcbiAgICAgICdqJzogNFxuICAgIH0sXG4gICAgJ0NpcmNsZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0NvbnRyb2xQb3NpdGlvbic6IHtcbiAgICAgICdUT1BfTEVGVCc6IDEsXG4gICAgICAnVE9QX0NFTlRFUic6IDIsXG4gICAgICAnVE9QJzogMixcbiAgICAgICdUT1BfUklHSFQnOiAzLFxuICAgICAgJ0xFRlRfQ0VOVEVSJzogNCxcbiAgICAgICdMRUZUX1RPUCc6IDUsXG4gICAgICAnTEVGVCc6IDUsXG4gICAgICAnTEVGVF9CT1RUT00nOiA2LFxuICAgICAgJ1JJR0hUX1RPUCc6IDcsXG4gICAgICAnUklHSFQnOiA3LFxuICAgICAgJ1JJR0hUX0NFTlRFUic6IDgsXG4gICAgICAnUklHSFRfQk9UVE9NJzogOSxcbiAgICAgICdCT1RUT01fTEVGVCc6IDEwLFxuICAgICAgJ0JPVFRPTV9DRU5URVInOiAxMSxcbiAgICAgICdCT1RUT00nOiAxMSxcbiAgICAgICdCT1RUT01fUklHSFQnOiAxMixcbiAgICAgICdDRU5URVInOiAxM1xuICAgIH0sXG4gICAgJ0RhdGEnOiBmdW5jdGlvbigpIHt9LFxuICAgICdHcm91bmRPdmVybGF5JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnSW1hZ2VNYXBUeXBlJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnSW5mb1dpbmRvdyc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0xhdExuZyc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0xhdExuZ0JvdW5kcyc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ01WQ0FycmF5JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTVZDT2JqZWN0JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWFwJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWFwVHlwZUNvbnRyb2xTdHlsZSc6IHtcbiAgICAgICdERUZBVUxUJzogMCxcbiAgICAgICdIT1JJWk9OVEFMX0JBUic6IDEsXG4gICAgICAnRFJPUERPV05fTUVOVSc6IDJcbiAgICB9LFxuICAgICdNYXBUeXBlSWQnOiB7XG4gICAgICAnUk9BRE1BUCc6ICdyb2FkbWFwJyxcbiAgICAgICdTQVRFTExJVEUnOiAnc2F0ZWxsaXRlJyxcbiAgICAgICdIWUJSSUQnOiAnaHlicmlkJyxcbiAgICAgICdURVJSQUlOJzogJ3RlcnJhaW4nXG4gICAgfSxcbiAgICAnTWFwVHlwZVJlZ2lzdHJ5JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWFya2VyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWFya2VySW1hZ2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICdOYXZpZ2F0aW9uQ29udHJvbFN0eWxlJzoge1xuICAgICAgJ0RFRkFVTFQnOiAwLFxuICAgICAgJ1NNQUxMJzogMSxcbiAgICAgICdBTkRST0lEJzogMixcbiAgICAgICdaT09NX1BBTic6IDMsXG4gICAgICAnRG4nOiA0LFxuICAgICAgJ1htJzogNVxuICAgIH0sXG4gICAgJ092ZXJsYXlWaWV3JzogZnVuY3Rpb24oKSB7fSxcbiAgICAnUG9pbnQnOiBmdW5jdGlvbigpIHt9LFxuICAgICdQb2x5Z29uJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnUG9seWxpbmUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdSZWN0YW5nbGUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTY2FsZUNvbnRyb2xTdHlsZSc6IHtcbiAgICAgICdERUZBVUxUJzogMFxuICAgIH0sXG4gICAgJ1NpemUnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJva2VQb3NpdGlvbic6IHtcbiAgICAgICdDRU5URVInOiAwLFxuICAgICAgJ0lOU0lERSc6IDEsXG4gICAgICAnT1VUU0lERSc6IDJcbiAgICB9LFxuICAgICdTeW1ib2xQYXRoJzoge1xuICAgICAgJ0NJUkNMRSc6IDAsXG4gICAgICAnRk9SV0FSRF9DTE9TRURfQVJST1cnOiAxLFxuICAgICAgJ0ZPUldBUkRfT1BFTl9BUlJPVyc6IDIsXG4gICAgICAnQkFDS1dBUkRfQ0xPU0VEX0FSUk9XJzogMyxcbiAgICAgICdCQUNLV0FSRF9PUEVOX0FSUk9XJzogNFxuICAgIH0sXG4gICAgJ1pvb21Db250cm9sU3R5bGUnOiB7XG4gICAgICAnREVGQVVMVCc6IDAsXG4gICAgICAnU01BTEwnOiAxLFxuICAgICAgJ0xBUkdFJzogMixcbiAgICAgICdYbSc6IDNcbiAgICB9LFxuICAgICdldmVudCc6IHtcbiAgICAgICdSZSc6IGZhbHNlLFxuICAgICAgJ1pkJzoge30sXG4gICAgICAnYWRkTGlzdGVuZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ3lmJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdyZW1vdmVMaXN0ZW5lcic6IGZ1bmN0aW9uKCkge30sXG4gICAgICAnY2xlYXJMaXN0ZW5lcnMnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2NsZWFySW5zdGFuY2VMaXN0ZW5lcnMnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ3RyaWdnZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2FkZERvbUxpc3RlbmVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdhZGREb21MaXN0ZW5lck9uY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2NhJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdiaW5kJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdhZGRMaXN0ZW5lck9uY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ2ZvcndhcmQnOiBmdW5jdGlvbigpIHt9LFxuICAgICAgJ1VhJzogZnVuY3Rpb24oKSB7fSxcbiAgICAgICdiaSc6IGZ1bmN0aW9uKCkge30sXG4gICAgICAnUWonOiBmdW5jdGlvbigpIHt9XG4gICAgfSxcbiAgICAnQmljeWNsaW5nTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXJlY3Rpb25zUmVuZGVyZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXJlY3Rpb25zU2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0RpcmVjdGlvbnNTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ1VOS05PV05fRVJST1InOiAnVU5LTk9XTl9FUlJPUicsXG4gICAgICAnT1ZFUl9RVUVSWV9MSU1JVCc6ICdPVkVSX1FVRVJZX0xJTUlUJyxcbiAgICAgICdSRVFVRVNUX0RFTklFRCc6ICdSRVFVRVNUX0RFTklFRCcsXG4gICAgICAnSU5WQUxJRF9SRVFVRVNUJzogJ0lOVkFMSURfUkVRVUVTVCcsXG4gICAgICAnWkVST19SRVNVTFRTJzogJ1pFUk9fUkVTVUxUUycsXG4gICAgICAnTUFYX1dBWVBPSU5UU19FWENFRURFRCc6ICdNQVhfV0FZUE9JTlRTX0VYQ0VFREVEJyxcbiAgICAgICdOT1RfRk9VTkQnOiAnTk9UX0ZPVU5EJ1xuICAgIH0sXG4gICAgJ0RpcmVjdGlvbnNUcmF2ZWxNb2RlJzoge1xuICAgICAgJ0RSSVZJTkcnOiAnRFJJVklORycsXG4gICAgICAnV0FMS0lORyc6ICdXQUxLSU5HJyxcbiAgICAgICdCSUNZQ0xJTkcnOiAnQklDWUNMSU5HJyxcbiAgICAgICdUUkFOU0lUJzogJ1RSQU5TSVQnXG4gICAgfSxcbiAgICAnRGlyZWN0aW9uc1VuaXRTeXN0ZW0nOiB7XG4gICAgICAnTUVUUklDJzogMCxcbiAgICAgICdJTVBFUklBTCc6IDFcbiAgICB9LFxuICAgICdEaXN0YW5jZU1hdHJpeFNlcnZpY2UnOiBmdW5jdGlvbigpIHt9LFxuICAgICdEaXN0YW5jZU1hdHJpeFN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnSU5WQUxJRF9SRVFVRVNUJzogJ0lOVkFMSURfUkVRVUVTVCcsXG4gICAgICAnT1ZFUl9RVUVSWV9MSU1JVCc6ICdPVkVSX1FVRVJZX0xJTUlUJyxcbiAgICAgICdSRVFVRVNUX0RFTklFRCc6ICdSRVFVRVNUX0RFTklFRCcsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdNQVhfRUxFTUVOVFNfRVhDRUVERUQnOiAnTUFYX0VMRU1FTlRTX0VYQ0VFREVEJyxcbiAgICAgICdNQVhfRElNRU5TSU9OU19FWENFRURFRCc6ICdNQVhfRElNRU5TSU9OU19FWENFRURFRCdcbiAgICB9LFxuICAgICdEaXN0YW5jZU1hdHJpeEVsZW1lbnRTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ05PVF9GT1VORCc6ICdOT1RfRk9VTkQnLFxuICAgICAgJ1pFUk9fUkVTVUxUUyc6ICdaRVJPX1JFU1VMVFMnXG4gICAgfSxcbiAgICAnRWxldmF0aW9uU2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0VsZXZhdGlvblN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdPVkVSX1FVRVJZX0xJTUlUJzogJ09WRVJfUVVFUllfTElNSVQnLFxuICAgICAgJ1JFUVVFU1RfREVOSUVEJzogJ1JFUVVFU1RfREVOSUVEJyxcbiAgICAgICdJTlZBTElEX1JFUVVFU1QnOiAnSU5WQUxJRF9SRVFVRVNUJyxcbiAgICAgICdCbic6ICdEQVRBX05PVF9BVkFJTEFCTEUnXG4gICAgfSxcbiAgICAnRnVzaW9uVGFibGVzTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdHZW9jb2Rlcic6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0dlb2NvZGVyTG9jYXRpb25UeXBlJzoge1xuICAgICAgJ1JPT0ZUT1AnOiAnUk9PRlRPUCcsXG4gICAgICAnUkFOR0VfSU5URVJQT0xBVEVEJzogJ1JBTkdFX0lOVEVSUE9MQVRFRCcsXG4gICAgICAnR0VPTUVUUklDX0NFTlRFUic6ICdHRU9NRVRSSUNfQ0VOVEVSJyxcbiAgICAgICdBUFBST1hJTUFURSc6ICdBUFBST1hJTUFURSdcbiAgICB9LFxuICAgICdHZW9jb2RlclN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnVU5LTk9XTl9FUlJPUic6ICdVTktOT1dOX0VSUk9SJyxcbiAgICAgICdPVkVSX1FVRVJZX0xJTUlUJzogJ09WRVJfUVVFUllfTElNSVQnLFxuICAgICAgJ1JFUVVFU1RfREVOSUVEJzogJ1JFUVVFU1RfREVOSUVEJyxcbiAgICAgICdJTlZBTElEX1JFUVVFU1QnOiAnSU5WQUxJRF9SRVFVRVNUJyxcbiAgICAgICdaRVJPX1JFU1VMVFMnOiAnWkVST19SRVNVTFRTJyxcbiAgICAgICdFUlJPUic6ICdFUlJPUidcbiAgICB9LFxuICAgICdLbWxMYXllcic6IGZ1bmN0aW9uKCkge30sXG4gICAgJ0ttbExheWVyU3RhdHVzJzoge1xuICAgICAgJ1VOS05PV04nOiAnVU5LTk9XTicsXG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ0lOVkFMSURfUkVRVUVTVCc6ICdJTlZBTElEX1JFUVVFU1QnLFxuICAgICAgJ0RPQ1VNRU5UX05PVF9GT1VORCc6ICdET0NVTUVOVF9OT1RfRk9VTkQnLFxuICAgICAgJ0ZFVENIX0VSUk9SJzogJ0ZFVENIX0VSUk9SJyxcbiAgICAgICdJTlZBTElEX0RPQ1VNRU5UJzogJ0lOVkFMSURfRE9DVU1FTlQnLFxuICAgICAgJ0RPQ1VNRU5UX1RPT19MQVJHRSc6ICdET0NVTUVOVF9UT09fTEFSR0UnLFxuICAgICAgJ0xJTUlUU19FWENFRURFRCc6ICdMSU1JVFNfRVhFQ0VFREVEJyxcbiAgICAgICdUSU1FRF9PVVQnOiAnVElNRURfT1VUJ1xuICAgIH0sXG4gICAgJ01heFpvb21TZXJ2aWNlJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnTWF4Wm9vbVN0YXR1cyc6IHtcbiAgICAgICdPSyc6ICdPSycsXG4gICAgICAnRVJST1InOiAnRVJST1InXG4gICAgfSxcbiAgICAnU3RyZWV0Vmlld0NvdmVyYWdlTGF5ZXInOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJlZXRWaWV3UGFub3JhbWEnOiBmdW5jdGlvbigpIHt9LFxuICAgICdTdHJlZXRWaWV3U2VydmljZSc6IGZ1bmN0aW9uKCkge30sXG4gICAgJ1N0cmVldFZpZXdTdGF0dXMnOiB7XG4gICAgICAnT0snOiAnT0snLFxuICAgICAgJ1VOS05PV05fRVJST1InOiAnVU5LTk9XTl9FUlJPUicsXG4gICAgICAnWkVST19SRVNVTFRTJzogJ1pFUk9fUkVTVUxUUydcbiAgICB9LFxuICAgICdTdHlsZWRNYXBUeXBlJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhZmZpY0xheWVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhbnNpdExheWVyJzogZnVuY3Rpb24oKSB7fSxcbiAgICAnVHJhdmVsTW9kZSc6IHtcbiAgICAgICdEUklWSU5HJzogJ0RSSVZJTkcnLFxuICAgICAgJ1dBTEtJTkcnOiAnV0FMS0lORycsXG4gICAgICAnQklDWUNMSU5HJzogJ0JJQ1lDTElORycsXG4gICAgICAnVFJBTlNJVCc6ICdUUkFOU0lUJ1xuICAgIH0sXG4gICAgJ1VuaXRTeXN0ZW0nOiB7XG4gICAgICAnTUVUUklDJzogMCxcbiAgICAgICdJTVBFUklBTCc6IDFcbiAgICB9LFxuICAgICd2ZXJzaW9uJzogJzMuMTYuOCcsXG4gICAgJ21hcCc6IHt9XG4gIH07XG5cbiAgYmVmb3JlRWFjaChtb2R1bGUoJ2JuZHJ5LmdlbycsIGZ1bmN0aW9uKCRwcm92aWRlKSB7XG4gICAgJHByb3ZpZGUudmFsdWUoJ01hcFN2YycsIE1vY2tNYXBTdmMpO1xuICB9KSk7XG4gIGJlZm9yZUVhY2goaW5qZWN0KGZ1bmN0aW9uKF8kdGltZW91dF8sIF9HZW9jb2RlU3ZjXywgX0dlb2xvY2F0aW9uU3ZjXykge1xuICAgICR0aW1lb3V0ID0gXyR0aW1lb3V0XztcbiAgICBHZW9jb2RlU3ZjID0gX0dlb2NvZGVTdmNfO1xuICAgIEdlb2xvY2F0aW9uU3ZjID0gX0dlb2xvY2F0aW9uU3ZjXztcbiAgfSkpO1xuXG4gIGl0KCdSZXR1cm5zIGxvY2F0aW9uIGRhdGEnLCBmdW5jdGlvbigpIHtcbiAgICBHZW9sb2NhdGlvblN2Yy5nZXRMb2NhdGlvbigpXG4gICAgICAudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICBleHBlY3QodHlwZW9mIHZhbHVlKS50b0JlKCdvYmplY3QnKTtcbiAgICAgICAgZXhwZWN0KHZhbHVlKS50b0JlVHJ1dGh5KCk7XG4gICAgICB9KTtcbiAgfSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==