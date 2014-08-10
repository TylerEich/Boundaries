"use strict";
'use strict';
angular.module('bndry.map', ['ngStorage']).service('MapSvc', function($rootScope) {
  function makeIcon(color) {
    return {
      path: self.SymbolPath.CIRCLE,
      scale: 10,
      strokeColor: color,
      strokeOpacity: 1,
      strokeWeight: 2.5
    };
  }
  function makeMarkerOptions(lat, lng, color) {
    var clickable = false,
        cursor = 'pointer',
        draggable = false;
    return {
      clickable: clickable,
      crossOnDrag: false,
      cursor: cursor,
      draggable: draggable,
      flat: true,
      icon: makeIcon(color),
      map: self.map,
      position: new self.LatLng(lat, lng)
    };
  }
  function addListener(eventName) {
    self.map.addListener(eventName, function(mouseEvent) {
      $rootScope.$broadcast('map:' + eventName, mouseEvent);
    });
  }
  var self = this;
  angular.extend(self, google.maps);
  self.map = new self.Map(document.getElementById('map_canvas'));
  self.placesSvc = new self.places.PlacesService(self.map);
  self.autocompleteSvc = new self.places.AutocompleteService();
  var events = ['bounds_changed', 'center_changed', 'click', 'dblclick', 'drag', 'dragend', 'dragstart', 'heading_changed', 'idle', 'maptypeid_changed', 'mousemove', 'mouseout', 'mouseover', 'projection_changed', 'resize', 'rightclick', 'tilesloaded', 'tilt_changed', 'zoom_changed'];
  events.forEach(addListener);
}).controller('MapCtrl', function($scope, $rootScope, $localStorage, MapSvc) {
  $localStorage.$default({
    lat: 0,
    lng: 0,
    zoom: 10,
    mapTypeId: MapSvc.MapTypeId.ROADMAP,
    style: [{'stylers': [{'visibility': 'off'}]}, {
      'featureType': 'landscape',
      'stylers': [{'visibility': 'on'}, {'color': '#ffffff'}]
    }, {
      'featureType': 'road',
      'stylers': [{'visibility': 'on'}]
    }, {
      'elementType': 'geometry.fill',
      'stylers': [{'color': '#ffffff'}]
    }, {
      'featureType': 'road',
      'elementType': 'geometry.stroke',
      'stylers': [{'color': '#808080'}]
    }, {
      'elementType': 'labels.text.stroke',
      'stylers': [{'color': '#ffffff'}]
    }, {
      'elementType': 'labels.text.fill',
      'stylers': [{'color': '#000000'}]
    }, {
      'featureType': 'water',
      'stylers': [{'visibility': 'on'}, {'color': '#40bfbf'}]
    }, {
      'featureType': 'water',
      'elementType': 'labels.text.stroke',
      'stylers': [{'color': '#ffffff'}]
    }, {
      'featureType': 'road.local',
      'elementType': 'geometry',
      'stylers': [{'color': '#dfdfdf'}]
    }, {
      'featureType': 'road.local',
      'elementType': 'geometry.stroke',
      'stylers': [{'visibility': 'off'}]
    }, {
      'featureType': 'landscape.man_made',
      'stylers': [{'visibility': 'off'}]
    }]
  });
  $scope.$on('map:idle', function() {
    var center = MapSvc.map.getCenter();
    var zoom = MapSvc.map.getZoom();
    $localStorage.lat = center.lat();
    $localStorage.lng = center.lng();
    $localStorage.zoom = zoom;
  });
  $scope.$on('map:maptypeid_changed', function() {
    var mapTypeId = MapSvc.map.getMapTypeId();
    $localStorage.mapTypeId = mapTypeId;
  });
  var options = {
    center: new MapSvc.LatLng($localStorage.lat, $localStorage.lng),
    disableDefaultUI: true,
    disableDoubleClickZoom: true,
    draggableCursor: 'crosshair',
    draggingCursor: 'move',
    mapTypeId: $localStorage.mapTypeId,
    mapTypeControl: true,
    mapTypeControlOptions: {mapTypeIds: [MapSvc.MapTypeId.ROADMAP, MapSvc.MapTypeId.HYBRID, 'custom']},
    scaleControl: true,
    zoom: $localStorage.zoom
  };
  MapSvc.map.setOptions(options);
  var customMapStyle = new MapSvc.StyledMapType($localStorage.style, {name: 'Custom'});
  MapSvc.map.mapTypes.set('custom', customMapStyle);
}).controller('MapActionCtrl', function($scope, MapSvc) {
  $scope.setMapTypeId = function(mapTypeId) {
    if (mapTypeId in MapSvc.MapTypeId) {
      console.log(mapTypeId, 'in MapSvc.mapTypeId');
      mapTypeId = MapSvc.MapTypeId[mapTypeId];
    }
    MapSvc.map.setMapTypeId(mapTypeId);
  };
});
