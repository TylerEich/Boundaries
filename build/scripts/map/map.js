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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFwL21hcC5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbIm1hcC9tYXAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIGdvb2dsZSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdibmRyeS5tYXAnLCBbJ25nU3RvcmFnZSddKVxuXG4vLyBNYXBTdmMgZW5jYXBzdWxhdGVzIGdvb2dsZS5tYXBzLCBtYWtpbmcgaXQgZWFzaWVyIHRvIG1vY2sgZm9yIHRlc3RzLlxuLnNlcnZpY2UoJ01hcFN2YycsIGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcbiAgZnVuY3Rpb24gbWFrZUljb24oY29sb3IpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0aDogc2VsZi5TeW1ib2xQYXRoLkNJUkNMRSxcbiAgICAgIHNjYWxlOiAxMCxcbiAgICAgIHN0cm9rZUNvbG9yOiBjb2xvcixcbiAgICAgIHN0cm9rZU9wYWNpdHk6IDEsXG4gICAgICBzdHJva2VXZWlnaHQ6IDIuNVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBtYWtlTWFya2VyT3B0aW9ucyhsYXQsIGxuZywgY29sb3IpIHtcbiAgICB2YXIgY2xpY2thYmxlID0gZmFsc2UsXG4gICAgICBjdXJzb3IgPSAncG9pbnRlcicsXG4gICAgICBkcmFnZ2FibGUgPSBmYWxzZTtcbiAgICByZXR1cm4ge1xuICAgICAgY2xpY2thYmxlOiBjbGlja2FibGUsXG4gICAgICBjcm9zc09uRHJhZzogZmFsc2UsXG4gICAgICBjdXJzb3I6IGN1cnNvcixcbiAgICAgIGRyYWdnYWJsZTogZHJhZ2dhYmxlLFxuICAgICAgZmxhdDogdHJ1ZSxcbiAgICAgIGljb246IG1ha2VJY29uKGNvbG9yKSxcbiAgICAgIG1hcDogc2VsZi5tYXAsXG4gICAgICBwb3NpdGlvbjogbmV3IHNlbGYuTGF0TG5nKGxhdCwgbG5nKVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihldmVudE5hbWUpIHtcbiAgICBzZWxmLm1hcC5hZGRMaXN0ZW5lcihldmVudE5hbWUsIGZ1bmN0aW9uKG1vdXNlRXZlbnQpIHtcbiAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnbWFwOicgKyBldmVudE5hbWUsIG1vdXNlRXZlbnQpO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGFuZ3VsYXIuZXh0ZW5kKHNlbGYsIGdvb2dsZS5tYXBzKTtcbiAgc2VsZi5tYXAgPSBuZXcgc2VsZi5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21hcF9jYW52YXMnKSk7XG4gIHNlbGYucGxhY2VzU3ZjID0gbmV3IHNlbGYucGxhY2VzLlBsYWNlc1NlcnZpY2Uoc2VsZi5tYXApO1xuICBzZWxmLmF1dG9jb21wbGV0ZVN2YyA9IG5ldyBzZWxmLnBsYWNlcy5BdXRvY29tcGxldGVTZXJ2aWNlKCk7XG5cbiAgdmFyIGV2ZW50cyA9IFsnYm91bmRzX2NoYW5nZWQnLCAnY2VudGVyX2NoYW5nZWQnLCAnY2xpY2snLCAnZGJsY2xpY2snLCAnZHJhZycsICdkcmFnZW5kJywgJ2RyYWdzdGFydCcsICdoZWFkaW5nX2NoYW5nZWQnLCAnaWRsZScsICdtYXB0eXBlaWRfY2hhbmdlZCcsICdtb3VzZW1vdmUnLCAnbW91c2VvdXQnLCAnbW91c2VvdmVyJywgJ3Byb2plY3Rpb25fY2hhbmdlZCcsICdyZXNpemUnLCAncmlnaHRjbGljaycsICd0aWxlc2xvYWRlZCcsICd0aWx0X2NoYW5nZWQnLCAnem9vbV9jaGFuZ2VkJ107XG5cbiAgZXZlbnRzLmZvckVhY2goYWRkTGlzdGVuZXIpO1xufSlcblxuLy8gTWFwIGNvbnRyb2xsZXIsIG1haW5seSBmb3IgZXZlbnQgaGFuZGxpbmdcbi5jb250cm9sbGVyKCdNYXBDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkbG9jYWxTdG9yYWdlLCBNYXBTdmMpIHtcbiAgLy8gRGVmYXVsdCB2YWx1ZXMgZm9yIGxhdCwgbG5nLCB6b29tXG4gICRsb2NhbFN0b3JhZ2UuJGRlZmF1bHQoe1xuICAgIGxhdDogMCxcbiAgICBsbmc6IDAsXG4gICAgem9vbTogMTAsXG4gICAgbWFwVHlwZUlkOiBNYXBTdmMuTWFwVHlwZUlkLlJPQURNQVAsXG4gICAgc3R5bGU6IFt7XG4gICAgICAnc3R5bGVycyc6IFt7XG4gICAgICAgICd2aXNpYmlsaXR5JzogJ29mZidcbiAgICAgIH1dXG4gICAgfSwge1xuICAgICAgJ2ZlYXR1cmVUeXBlJzogJ2xhbmRzY2FwZScsXG4gICAgICAnc3R5bGVycyc6IFt7XG4gICAgICAgICd2aXNpYmlsaXR5JzogJ29uJ1xuICAgICAgfSwge1xuICAgICAgICAnY29sb3InOiAnI2ZmZmZmZidcbiAgICAgIH1dXG4gICAgfSwge1xuICAgICAgJ2ZlYXR1cmVUeXBlJzogJ3JvYWQnLFxuICAgICAgJ3N0eWxlcnMnOiBbe1xuICAgICAgICAndmlzaWJpbGl0eSc6ICdvbidcbiAgICAgIH1dXG4gICAgfSwge1xuICAgICAgJ2VsZW1lbnRUeXBlJzogJ2dlb21ldHJ5LmZpbGwnLFxuICAgICAgJ3N0eWxlcnMnOiBbe1xuICAgICAgICAnY29sb3InOiAnI2ZmZmZmZidcbiAgICAgIH1dXG4gICAgfSwge1xuICAgICAgJ2ZlYXR1cmVUeXBlJzogJ3JvYWQnLFxuICAgICAgJ2VsZW1lbnRUeXBlJzogJ2dlb21ldHJ5LnN0cm9rZScsXG4gICAgICAnc3R5bGVycyc6IFt7XG4gICAgICAgICdjb2xvcic6ICcjODA4MDgwJ1xuICAgICAgfV1cbiAgICB9LCB7XG4gICAgICAnZWxlbWVudFR5cGUnOiAnbGFiZWxzLnRleHQuc3Ryb2tlJyxcbiAgICAgICdzdHlsZXJzJzogW3tcbiAgICAgICAgJ2NvbG9yJzogJyNmZmZmZmYnXG4gICAgICB9XVxuICAgIH0sIHtcbiAgICAgICdlbGVtZW50VHlwZSc6ICdsYWJlbHMudGV4dC5maWxsJyxcbiAgICAgICdzdHlsZXJzJzogW3tcbiAgICAgICAgJ2NvbG9yJzogJyMwMDAwMDAnXG4gICAgICB9XVxuICAgIH0sIHtcbiAgICAgICdmZWF0dXJlVHlwZSc6ICd3YXRlcicsXG4gICAgICAnc3R5bGVycyc6IFt7XG4gICAgICAgICd2aXNpYmlsaXR5JzogJ29uJ1xuICAgICAgfSwge1xuICAgICAgICAnY29sb3InOiAnIzQwYmZiZidcbiAgICAgIH1dXG4gICAgfSwge1xuICAgICAgJ2ZlYXR1cmVUeXBlJzogJ3dhdGVyJyxcbiAgICAgICdlbGVtZW50VHlwZSc6ICdsYWJlbHMudGV4dC5zdHJva2UnLFxuICAgICAgJ3N0eWxlcnMnOiBbe1xuICAgICAgICAnY29sb3InOiAnI2ZmZmZmZidcbiAgICAgIH1dXG4gICAgfSwge1xuICAgICAgJ2ZlYXR1cmVUeXBlJzogJ3JvYWQubG9jYWwnLFxuICAgICAgJ2VsZW1lbnRUeXBlJzogJ2dlb21ldHJ5JyxcbiAgICAgICdzdHlsZXJzJzogW3tcbiAgICAgICAgJ2NvbG9yJzogJyNkZmRmZGYnXG4gICAgICB9XVxuICAgIH0sIHtcbiAgICAgICdmZWF0dXJlVHlwZSc6ICdyb2FkLmxvY2FsJyxcbiAgICAgICdlbGVtZW50VHlwZSc6ICdnZW9tZXRyeS5zdHJva2UnLFxuICAgICAgJ3N0eWxlcnMnOiBbe1xuICAgICAgICAndmlzaWJpbGl0eSc6ICdvZmYnXG4gICAgICB9XVxuICAgIH0sIHtcbiAgICAgICdmZWF0dXJlVHlwZSc6ICdsYW5kc2NhcGUubWFuX21hZGUnLFxuICAgICAgJ3N0eWxlcnMnOiBbe1xuICAgICAgICAndmlzaWJpbGl0eSc6ICdvZmYnXG4gICAgICB9XVxuICAgIH1dXG4gIH0pO1xuICBcbiAgJHNjb3BlLiRvbignbWFwOmlkbGUnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2VudGVyID0gTWFwU3ZjLm1hcC5nZXRDZW50ZXIoKTtcbiAgICB2YXIgem9vbSA9IE1hcFN2Yy5tYXAuZ2V0Wm9vbSgpO1xuXG4gICAgJGxvY2FsU3RvcmFnZS5sYXQgPSBjZW50ZXIubGF0KCk7XG4gICAgJGxvY2FsU3RvcmFnZS5sbmcgPSBjZW50ZXIubG5nKCk7XG4gICAgJGxvY2FsU3RvcmFnZS56b29tID0gem9vbTtcbiAgfSk7XG4gICRzY29wZS4kb24oJ21hcDptYXB0eXBlaWRfY2hhbmdlZCcsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYXBUeXBlSWQgPSBNYXBTdmMubWFwLmdldE1hcFR5cGVJZCgpO1xuXG4gICAgJGxvY2FsU3RvcmFnZS5tYXBUeXBlSWQgPSBtYXBUeXBlSWQ7XG4gIH0pO1xuXG4gIC8vIEluaXRpYWxpemUgbWFwXG4gIHZhciBvcHRpb25zID0ge1xuICAgIGNlbnRlcjogbmV3IE1hcFN2Yy5MYXRMbmcoJGxvY2FsU3RvcmFnZS5sYXQsICRsb2NhbFN0b3JhZ2UubG5nKSxcbiAgICBkaXNhYmxlRGVmYXVsdFVJOiB0cnVlLFxuICAgIGRpc2FibGVEb3VibGVDbGlja1pvb206IHRydWUsXG4gICAgZHJhZ2dhYmxlQ3Vyc29yOiAnY3Jvc3NoYWlyJyxcbiAgICBkcmFnZ2luZ0N1cnNvcjogJ21vdmUnLFxuICAgIG1hcFR5cGVJZDogJGxvY2FsU3RvcmFnZS5tYXBUeXBlSWQsXG4gICAgbWFwVHlwZUNvbnRyb2w6IHRydWUsXG4gICAgbWFwVHlwZUNvbnRyb2xPcHRpb25zOiB7XG4gICAgICBtYXBUeXBlSWRzOiBbTWFwU3ZjLk1hcFR5cGVJZC5ST0FETUFQLCBNYXBTdmMuTWFwVHlwZUlkLkhZQlJJRCwgJ2N1c3RvbSddXG4gICAgfSxcbiAgICBzY2FsZUNvbnRyb2w6IHRydWUsXG4gICAgem9vbTogJGxvY2FsU3RvcmFnZS56b29tXG4gIH07XG5cbiAgTWFwU3ZjLm1hcC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICBcbiAgdmFyIGN1c3RvbU1hcFN0eWxlID0gbmV3IE1hcFN2Yy5TdHlsZWRNYXBUeXBlKCRsb2NhbFN0b3JhZ2Uuc3R5bGUsIHtcbiAgICBuYW1lOiAnQ3VzdG9tJ1xuICB9KTtcbiAgTWFwU3ZjLm1hcC5tYXBUeXBlcy5zZXQoJ2N1c3RvbScsIGN1c3RvbU1hcFN0eWxlKTtcbn0pXG4gIC5jb250cm9sbGVyKCdNYXBBY3Rpb25DdHJsJywgZnVuY3Rpb24oJHNjb3BlLCBNYXBTdmMpIHtcbiAgICAkc2NvcGUuc2V0TWFwVHlwZUlkID0gZnVuY3Rpb24obWFwVHlwZUlkKSB7XG4gICAgICBpZiAobWFwVHlwZUlkIGluIE1hcFN2Yy5NYXBUeXBlSWQpIHtcbiAgICAgICAgY29uc29sZS5sb2cobWFwVHlwZUlkLCAnaW4gTWFwU3ZjLm1hcFR5cGVJZCcpO1xuICAgICAgICBtYXBUeXBlSWQgPSBNYXBTdmMuTWFwVHlwZUlkW21hcFR5cGVJZF07XG4gICAgICB9XG4gICAgICBcbiAgICAgIE1hcFN2Yy5tYXAuc2V0TWFwVHlwZUlkKG1hcFR5cGVJZCk7XG4gICAgfTtcbiAgfSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=