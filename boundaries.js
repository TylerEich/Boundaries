"use strict";

// TODO: Privacy Policy and Terms of Service (https://developers.google.com/places/policies)
var boundaries = angular.module('boundaries', ['ngRoute', 'ui.map', 'ui.event']);

angular.bootstrap(document.querySelector('#map_canvas'), ['boundaries']);

// Register all services
boundaries.service('SettingService', SettingService);
boundaries.service('UtilityService', ['$rootScope', '$q', '$http', UtilityService]);

// Register all controllers
// Every controller that needs to communicate gets $rootScope
boundaries.controller('ColorController', ['$scope', 'SettingService', 'UtilityService', ColorController]);
boundaries.controller('ModeController', ['$scope', 'SettingService', ModeController]);
boundaries.controller('ActionController', ['$scope', 'SettingService', ActionController]);
boundaries.controller('MapController', ['$scope', '$rootScope', '$location', 'SettingService', 'UtilityService', MapController]);
boundaries.controller('ImageController', ['$scope', 'SettingService', ImageController]);
boundaries.controller('DrawingController', ['$scope', 'SettingService', DrawingController]);
boundaries.controller('SearchController', ['$scope', '$sce', '$routeParams', '$location', 'SettingService', 'UtilityService', SearchController]);
boundaries.controller('ThrobController', ['$scope', '$rootScope', '$location', ThrobController]);

// Configure deep-linking for Boundaries
boundaries.config(function($locationProvider, $routeProvider) {
	$locationProvider.html5Mode(true);
	$routeProvider.when('/zoom/:zoom', {
		controller: 'MapController'
	})
	.when('/lat/:lat', {
		controller: 'MapController'
	})
	.when('/lng/:lng', {
		controller: 'MapController'
	})
	.when('/drawing/:drawing', {
		controller: 'DrawingController'
	})
	.when('/style/:style', {
		controller: 'StyleController'
	})
	.when('/colors/:colors', {
		controller: 'ColorController'
	});
});
// Services
// Used to share temporary variables between controllers
function VariableService() {
	this.map = {};
}
// Used to store settings and share between controllers
function SettingService() {
	// Defaults also serve as an object specification
	this.defaults = {
		map: {
			lat: undefined,
			lng: undefined,
			zoom: 5,
			drawings: [],
			style: [{
				stylers: [{
					color: "#ffffff"
				}]
			}, {
				elementType: "geometry.stroke",
				featureType: "road",
				stylers: [{
					color: "#808080"
				}]
			}, {
				elementType: "labels.text.fill",
				stylers: [{
					color: "#000000"
				}]
			}]
		},
		image: {
			width: 5,
			height: 3.5,
			format: 'jpg',
			show: true,
			rotate: false
		},
		color: {
			active: 1,
			choices: [{
				name: 'Red',
				rgba: {
					r: 1,
					g: 0,
					b: 0,
					a: 0.25
				},
				weight: 10
			}, {
				name: 'Green',
				rgba: {
					r: 0,
					g: 1,
					b: 0,
					a: 0.25
				},
				weight: 10
			}, {
				name: 'Blue',
				rgba: {
					r: 0,
					g: 0,
					b: 1,
					a: 0.25
				},
				weight: 10
			}]
		},
		search: {
			query: '',
			show: false
		},
		mode: {
			polygon: false,
			rigid: false
		}
		// More defaults...
	};
	try {
		this.settings = JSON.parse(localStorage.settings);
		console.log(localStorage.settings);
		//this.settings = this.defaults; // TODO: Remove. This is for testing only
	} catch (e) {
		this.settings = this.defaults;
		// this.Save();
		console.log('Default settings loaded');
	}
	
	// Keep saved object keys aligned with default object keys (while preserving values). If a key is missing, it will be added. If an extra key is found, it will be removed.
	function syncProperties(master, check, deleteFromCheck) {
		if (typeof master != 'object' || typeof check != 'object') return;
		if (!deleteFromCheck) {
			var masterKeys = Object.keys(master).sort(); // Pull keys from master as array
			for (var i = 0; i < masterKeys.length; i++) {
				if (!check.hasOwnProperty(masterKeys[i])) {
					check[masterKeys[i]] = master[masterKeys[i]];
				} else {
					syncProperties(master[masterKeys[i]], check[masterKeys[i]]);
				}
			}
		}
		var checkKeys = Object.keys(check).sort(); // Pull keys from check as array
		for (var i = 0; i < checkKeys.length; i++) {
			if (!master.hasOwnProperty(checkKeys[i])) {
				delete check[checkKeys[i]];
			} else {
				syncProperties(master[checkKeys[i]], check[checkKeys[i]], true);
			}
		}
	}
	syncProperties(this.defaults, this.settings);
	function censor(key, value) {
		if (typeof key == 'string') var substring = key.substring(0, 1);
		if (substring && (substring == '_' || substring == '$')) return undefined;
		return value;
	}
	this.Save = function() {
		localStorage.settings = JSON.stringify(this.settings, censor);
	};
}
// Useful functions available to multiple controllers
function UtilityService($rootScope, $q, $http) {
	var autocomplete = new google.maps.places.AutocompleteService();
	var placeService = new google.maps.places.PlacesService(document.querySelector('#places_attributions'));
	var map;
	$rootScope.$on('map', function(event, param) {
		map = param;
	});
	this.color = {
		toHex: function(rgba, alpha) {
			var rgba = angular.copy(rgba);
			var keys = Object.keys(rgba);
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				rgba[key] = Math.round(rgba[key] * 255);
			}
			var hex = ((1 << 24) | (rgba.r << 16) | (rgba.g << 8) | rgba.b).toString(16).substring(1);
			
			if (alpha === true || (alpha === undefined && rgba.a !== 255)) {
				var a = ((1 << 8) | rgba.a).toString(16).substring(1);
				return hex + a;
			} else {
				return hex;
			}
		}
	};
	this.map = {
		suggestions: function(input) {
			function load(suggestions, status) {
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					deferred.resolve(suggestions);
				} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
					deferred.reject('No Results');
				} else {
					deferred.reject('An Error Occurred');
				}
				$rootScope.$apply();
			}
			
			var deferred = $q.defer();
			if (input.length <= 0) {
				deferred.resolve([]);
			} else {
				var request = {input: input};
				if (map && map.getBounds) request.bounds = map.getBounds();
				autocomplete.getPlacePredictions(request, load);
			}
			return deferred.promise;
		},
		loadPlace: function(reference) {
			if (reference === undefined) console.error('loadPlace() requires map and reference');
			function revealOnMap(place, status) {
				if (place === undefined || status === undefined) console.error('revealOnMap() requires place and status');
				if (status == google.maps.places.PlacesServiceStatus.OK) {
					if (place.geometry.viewport) {
						map.fitBounds(place.geometry.viewport); // fitBounds because panToBounds does not zoom out to show the entire bounding box
					} else if (place.geometry.location) {
						map.panTo(place.geometry.location);
					}
				}
			}
			
			if (reference) placeService.getDetails({reference: reference}, revealOnMap);
		}
	};
	// Interface for the HTML5 Geolocation API
	this.location = {
		exact: function() {
			console.log('Exact location requested...');
			var deferred = $q.defer();
			if ('geolocation' in navigator) {
				navigator.geolocation.getCurrentPosition(function(position) {
					$rootScope.$apply(function() {
						deferred.resolve(position);
					});
				}, function(error) {
					$rootScope.$apply(function() {
						deferred.reject(error);
					});
				});
			} else {
				$rootScope.$apply(function() {
					deferred.reject(false);
				});
			}
			return deferred.promise;
		},
		approximate: function() {
			var promise = $http.get('https://freegeoip.net/json/', {cache: true});
			return promise;
		}
	},
	this.throb = {
		on: function() {
			$rootScope.$broadcast('throb', true);
		},
		off: function() {
			if (VariableService.throb <= 0) return;
			$rootScope.$broadcast('throb', false);
		}
	};
}

// Controllers
function ColorController($scope, SettingService, UtilityService) {
	// Functions for converting color formats
	$scope.Hex = function(rgba) {
		return UtilityService.color.toHex(rgba, false);
	};
	$scope.HSL = function (rgba) {
		var r, g, b, a;
		var h, s, l;
		var min, max;
		
		r = rgba.r;
		g = rgba.g;
		b = rgba.b;
		a = rgba.a;
		max = Math.max(r,g,b);
		min = Math.min(r,g,b);
		h = s = l = (max + min) / 2;
		if (max == min) {
			h = s = 0;
		} else {
			d = max - min;
			s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return {
			h: h,
			s: s,
			l: l,
			a: a
		}
	};
	$scope.active = SettingService.settings.color.active;
	$scope.choices = SettingService.settings.color.choices;
	// Load saved colors or defaults
	$scope.$watch('[active, choices]', function() {
		SettingService.settings.color.active = $scope.active;
		SettingService.settings.color.choices = $scope.choices;
		SettingService.Save();
	}, true);
}

function ModeController($scope, SettingService) {
	$scope.mode = SettingService.settings.mode;
	
	$scope.$watch('mode', function() {
		SettingService.settings.mode = $scope.mode;
		SettingService.Save();
	});
}

function MapController($scope, $rootScope, $location, SettingService, UtilityService) {	
	function updateStyle() {
		$scope.map.mapTypes.set('custom', new google.maps.StyledMapType($scope.style, {
			name: 'Customized'
		}));
	}
	function panToCurrentLocation() {
		var location;
		if (useExact === undefined || useExact === false) {
			UtilityService.throb.on();
			UtilityService.location.approximate().then(function(position) {
				if (!position) return;
				if (position.data) {
					location = new google.maps.LatLng(position.data.latitude, position.data.longitude);
				}
				// Check if exact location is already in use
				if (useExact === undefined || useExact === false) {
					$scope.map.setCenter(location);
					$scope.map.setZoom(8);
				}
			}).finally(function() {
				UtilityService.throb.off();
			});
		}
		if (useExact === undefined || useExact === true) {
			UtilityService.throb.on();
			UtilityService.location.exact().then(function(position) {
				useExact = true;
				if (!position) return;
				if (position.coords) {
					location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				}
				$scope.map.setCenter(location);
				$scope.map.setZoom(15);
			}, function(error) {
				switch (error.code) {
				case error.PERMISSION_DENIED:
				case error.POSITION_UNAVAILABLE:
					useExact = false;
					break;
				}
				SettingService.settings.search.show = true;
			}).finally(function() {
				UtilityService.throb.off();
			});
		}
	}
	
	// Event binders
	$scope.map_click = function($param) {
		$rootScope.$emit('map.click', $param);
	};
	$scope.map_center_changed = function() {
		var center = $scope.map.getCenter();
		$scope.lat = center.lat();
		$scope.lng = center.lng();
	};
	$scope.map_zoom_changed = function() {
		$scope.zoom = $scope.map.getZoom();
	};
	$scope.map_idle = function() {
		$location.search('lat', $scope.lat);
		$location.search('lng', $scope.lng);
		$location.search('zoom', $scope.zoom);
	};
	// Map controls
	$scope.zoom_in = function() {
		var zoom = $scope.map.getZoom() + 1;
		$scope.map.setZoom(zoom);
	};
	$scope.zoom_out = function() {
		var zoom = $scope.map.getZoom() - 1;
		$scope.map.setZoom(zoom);
	};
	
	
	// Variables
	var useExact;
	$scope.location = $location;
	// $scope.lat = SettingService.settings.map.lat;
// 	$scope.lng = SettingService.settings.map.lng;
// 	$scope.zoom = SettingService.settings.map.zoom;
	$scope.lat = Number($location.search().lat);
	$scope.lng = Number($location.search().lng);
	$scope.zoom = Number($location.search().zoom);
	$scope.options = {
		center: new google.maps.LatLng($scope.lat ? $scope.lat : 0, $scope.lng ? $scope.lng : 0),
		disableDefaultUI: true,
		disableDoubleClickZoom: true,
		draggableCursor: 'crosshair',
		draggingCursor: 'move',
		mapTypeControl: true,
		mapTypeControlOptions: {
			mapTypeIds: ['custom', google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID],
			position: google.maps.ControlPosition.TOP_RIGHT,
			style: google.maps.MapTypeControlStyle.DEFAULT
		},
		/*panControl: true,
		panControlOptions: {
			position: google.maps.ControlPosition.RIGHT_CENTER
		},*/
		scaleControl: true,
		zoom: $scope.zoom,
		zoomControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_CENTER,
			style: google.maps.ZoomControlStyle.SMALL
		}
	};
	
	$scope.$watch('location.search()', function() {
		var search = $scope.location.search();
		$scope.lat = Number(search.lat);
		$scope.lng = Number(search.lng);
		$scope.zoom = Number(search.zoom);
	});
	
	// Listen once; when the map is defined, load its watchers
	var unbindWatcher = $scope.$watch('map', function() {
		if ($scope.map == undefined) return;
		$rootScope.$emit('map', $scope.map);
		updateStyle();
		if ($scope.lat == undefined || $scope.lng == undefined) panToCurrentLocation();
		$scope.$watch('[lat, lng, zoom]', function() {
			SettingService.settings.map.lat = $scope.lat;
			SettingService.settings.map.lng = $scope.lng;
			SettingService.settings.map.zoom = $scope.zoom;
			SettingService.Save();
		}, true);
		unbindWatcher();
	});
}

function DrawingController($scope, $rootScope, $location) {
	function makeHexColor(node, alpha) {
		var color = SettingService.settings.color.choices[node.activeColor];
		return UtilityService.color.toHex(color.rgba, alpha);
	}
	function makeLatLng(node) {
		return new google.maps.LatLng(node.lat, node.lng);
	}
	function makeIcon(node) {
		var hex = makeHexColor(node, false);
		return {
			path: google.maps.SymbolPath.CIRCLE,
			scale: 10,
			strokeColor: hex,
			strokeOpacity: 1,
			strokeWeight: 2.5
		};
	}
	function makeMarkerOptions(node) {
		return {
			clickable: true,
			crossOnDrag: false,
			cursor: 'pointer',
			draggable: true,
			flat: true,
			icon: makeIcon(node),
			map: $scope.map,
			position: makeLatLng(node)
		};
	}
	function makePolylineOptions(node) {
		var color = SettingService.settings.color.choices[node.activeColor];
		return {
			clickable: true,
			draggable: false,
			editable: false,
			strokeColor: '#' + makeHexColor(node, false),
			strokeOpacity: color.rgba.a,
			strokeWeight: color.weight,
			map: $scope.map
		};
	}
	function makePolygonOptions(node) {
		var color = SettingService.settings.color.choices[node.activeColor];
		return {
			clickable: true,
			draggable: false,
			editable: false,
			fillColor: '#' + makeHexColor(node, alpha),
			fillOpacity: color.rgba.a,
			map: $scope.map
		};
	}
	function makeMarker(node) {
		return new google.maps.Marker(makeMarkerOptions(node));
	}
	function makePolyline(node) {
		return new google.maps.Polyline(makePolylineOptions(node));
	}
	function makePolygon(node) {
		return new google.maps.Polygon(makePolygonOptions(node));
	}
	function makePoly(node, polygon) {
		if (polygon) {
			return makePolygon(node);
		} else {
			var polyline = makePolyline(node);
			return makePolyline(node);
		}
	}
	
	function splicePolyPath(drawingIndex, nodeIndex, removeLength, newPath) {
		$scope.drawings[drawingIndex]._poly.getPath().getArray().splice();
	}
	function spliceDrawing(drawingIndex, removeLength, newDrawing) {
		$scope.drawings.splice(drawingIndex, removeLength, newDrawing);
	}
	function spliceNode(drawingIndex, nodeIndex, removeLength, newNode) {
		if ($scope.drawings.length <= drawingIndex) spliceDrawing(-1, 0, {});
		$scope.drawings[drawingIndex].nodes[nodeIndex].index;
	}
	
	var map;
	$rootScope.$on('map', function($event, $param) {
		map = $param;
	});
	$rootScope.$on('map.click', function($event, $param) {
		spliceNode(-1, -1, 0, {
			lat: $param[0].latLng.lat(),
			lng: $param[0].latLng.lng(),
			rigid: $scope.rigid
		});
	});
	
	$scope.drawings = SettingService.settings.map.drawings;
	$scope.markers = [];
	$scope.polys = [];
	
	$scope.marker_dragstart = function(drawingIndex, nodeIndex) {
		console.log('dragstart:', drawingIndex, nodeIndex);
		$scope.drawings[drawingIndex].nodes[nodeIndex]._unbind = $scope.$watch('drawings[' + drawingIndex + '].nodes[' + nodeIndex + ']._marker.getPosition()', function(oldVal, newVal) {
			spliceNode
		});
	};
	$scope.marker_dragend = function(drawingIndex, nodeIndex) {
		$scope.drawings[drawingIndex].nodes[nodeIndex]._unbind();
		delete $scope.drawings[drawingIndex].nodes[nodeIndex]._unbind;
	};
	/*$scope.marker_drag = function(node, drawingIndex, nodeIndex) {
		changeNode(node, drawingIndex, nodeIndex, false);
	};*/
	$scope.marker_click = function(drawingIndex, nodeIndex) {
		console.log('marker click');
		var markerPosition = $scope.drawings[drawingIndex].nodes[nodeIndex]._marker.getPosition();
		addNode({
			activeColor: SettingService.settings.color.active,
			lat: markerPosition.lat(),
			lng: markerPosition.lng(),
			rigid: SettingService.settings.mode.rigid
		});
	};
	$scope.marker_rightclick = function(drawingIndex, nodeIndex) {
		deleteNode(drawingIndex, nodeIndex);
	};
	
	$scope.new = function() {
		
	};
	$scope.undo = function() {
		
	};
	$scope.clear = function() {
		for (var drawingIndex = 0; drawingIndex < $scope.drawings.length; drawingIndex++) {
			$scope.drawings[drawingIndex]._poly.setMap(null);
			
			for (var nodeIndex = 0; nodeIndex < $scope.drawings[drawingIndex].nodes.length; nodeIndex++) {
				$scope.drawings[drawingIndex].nodes[nodeIndex]._marker.setMap(null);
			}
		}
		$scope.drawings = [];
	};
}

function ActionController($scope, VariableService) {
	
}

function ImageController($scope, SettingService) {
	$scope.PxSize = function() {
		var ratio = $scope.width / $scope.height;
		return {
			ratio: ratio,
			width: (ratio >= 1) ? 640 : Math.round(ratio * 640),
			height: (ratio < 1) ? 640 : Math.round(1 / ratio * 640)
		}
	};
	// Image orientation logic
	/*var drawingBounds = new google.maps.LatLngBounds();
	for (var i = 0; i < VariableService.drawing.length; i++) {
		var marker = VariableService.markers[i];
		
	}
	var northEast = VariableService.markers.get
	var heading = Math.abs(google.maps.geometry.spherical.computeHeading(latLng1, latLng2));
	if (45 <= heading || heading < 135) {
		console.log('Landscape');
	} else {
		console.log('Portrait');
	}
	*/
	// Load variables from SettingService
	$scope.width = SettingService.settings.image.width;
	$scope.height = SettingService.settings.image.height;
	$scope.show = SettingService.settings.image.show;
	$scope.format = SettingService.settings.image.format;
	$scope.rotate = SettingService.settings.image.rotate;
	
	$scope.$watch('[width, height, show, format, rotate]', function() {
		SettingService.settings.image.width = $scope.width;
		SettingService.settings.image.height = $scope.height;
		SettingService.settings.image.show = $scope.show;
		SettingService.settings.image.format = $scope.format;
		SettingService.settings.image.rotate = $scope.rotate;
		SettingService.Save();
	}, true);
}

function DrawingController($scope, SettingService) {
	
}

function ThrobController($scope, $rootScope, $location, $routeParams) {
	$scope.count = 0;
	$rootScope.$on('throb', function(event, count) {
		if (count === true) $scope.count++;
		if (count === false) $scope.count--;
	});
}

function SearchController($scope, $sce, $routeParams, $location, SettingService, UtilityService) {
	$scope.loadPlace = function(reference) {
		UtilityService.throb.on();
		UtilityService.map.loadPlace(reference);
		UtilityService.throb.off();
	};
	$scope.keydown = function(e) {
		var enter, up, down;
		enter = (e.which == 13);
		up = (e.which == 38);
		down = (e.which == 40);
		if (enter || up || down) {
			e.preventDefault();
		} else {
			return;
		}
		if (enter) {
			$scope.loadPlace($scope.suggestions[$scope.active].reference);
		} else if (up && $scope.active > -1) {
			$scope.active--;
		} else if (down && $scope.active < $scope.suggestions.length - 1) {
			$scope.active++;
		}
	}
	$scope.show = SettingService.settings.search.show;
	$scope.query = '';
	$scope.suggestions = [];
	$scope.active = 0;
	
	// Bolds matched substrings
	function formatSuggestions(suggestions) {
		for (var i = 0; i < suggestions.length; i++) {
			var desc = suggestions[i].description;
			suggestions[i].description = '';
			var index = 0;
			for (var j = 0; j < suggestions[i].matched_substrings.length; j++) {
				var offset = suggestions[i].matched_substrings[j].offset;
				var length = suggestions[i].matched_substrings[j].length;
				suggestions[i].description += desc.slice(index, offset) + '<b>' + desc.substr(offset, length) + '</b>';
				index = offset + length;
			}
			suggestions[i].description += desc.slice(index);
			suggestions[i].description = '<span>' + suggestions[i].description + '</span>';
			suggestions[i].description = $sce.trustAsHtml(suggestions[i].description);
		}
		return suggestions;
	}
	// Notifies user that no results were found
	function errorMessage(message) {
		if (typeof message == 'string') return [{description: $sce.trustAsHtml('<i>' + message + '</i>'), error: true}]
	}
	
	$scope.$watch('query', function() {
		UtilityService.map.suggestions($scope.query).then(function(suggestions) {
			$scope.suggestions = formatSuggestions(suggestions);
			$scope.active = 0;
		}, function(message) {
			$scope.suggestions = errorMessage(message);
			$scope.active = -1;
		});
	});
	$scope.$watch('[query, show]',  function() {
		SettingService.settings.search.query = $scope.query;
		SettingService.settings.search.show = $scope.show;
		SettingService.Save();
	}, true);
}










/* 
-------------------------DEPRECATED CODE-------------------------
*/
// TODO: Migrate logic from the following functions into AngularJS controllers and/or services
function getBaseUrl(mapX, mapY) {
	var url = 'http://maps.googleapis.com/maps/api/staticmap?';
	var params = [];
	params.push('sensor=false');
	params.push('size=' + mapX + 'x' + mapY);
	params.push('scale=2');
	for (var i = 0; i < mapStyle.length; i++) {
		var mapStyleRule = [];
		if (mapStyle[i].featureType != undefined && mapStyle[i].featureType != 'all') {
			mapStyleRule.push('feature:' + mapStyle[i].featureType);
		}
		if (mapStyle[i].elementType != undefined && mapStyle[i].elementType != 'all') {
			mapStyleRule.push('element:' + mapStyle[i].elementType)
		}
		for (var j = 0; j < mapStyle[i].stylers.length; j++) {
			for (var p in mapStyle[i].stylers[j]) {
				var ruleArg = mapStyle[i].stylers[j][p];
				if (p == 'hue' || p == 'color') {
					ruleArg = '0x' + ruleArg.substring(1);
				}
				mapStyleRule.push(p + ':' + ruleArg);
			}
		}
		var rule = mapStyleRule.join('|');
		if (rule != '') {
			params.push('style=' + rule);
		}
	}
	return (url + params.join('&'));
}