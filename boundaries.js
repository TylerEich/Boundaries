"use strict";
/*Array.prototype.diff = function(a) {
    return this.filter(function(i) {
		return !(a.indexOf(i) > -1);
	});
};*/
// The MVCArrayBinder contstructor allows MVC binding between and array and an object
function MVCArrayBinder(mvcArray) {
	this.array_ = mvcArray;
}
MVCArrayBinder.prototype = new google.maps.MVCObject();
MVCArrayBinder.prototype.get = function(key) {
	if (!isNaN(parseInt(key))) {
		return this.array_.getAt(parseInt(key));
	} else {
		this.array_.get(key);
	}
};

MVCArrayBinder.prototype.set = function(key, val) {
	if (!isNaN(parseInt(key))) {
		this.array_.setAt(parseInt(key), val);
	} else {
		this.array_.set(key, val);
	}
};

// TODO: Add ui and map as dependencies
// TODO: Privacy Policy and Terms of Service (https://developers.google.com/places/policies)
var boundaries = angular.module('boundaries', ['ui.map', 'ui.event']);
angular.bootstrap(document.querySelector('#map_canvas'), ['boundaries']);
// Register all factories
// boundaries.factory('MapFactory', ['$rootScope', MapFactory]);

// Register all services
// boundaries.service('MapService', ['$rootScope', MapService]);
boundaries.service('SettingService', SettingService);
boundaries.service('UtilityService', ['$rootScope', '$q', '$http', UtilityService]);
boundaries.service('VariableService', VariableService);
boundaries.service('HistoryService', HistoryService);

// Register all controllers
boundaries.controller('ColorController', ['$scope', 'SettingService', 'UtilityService', ColorController]);
boundaries.controller('ModeController', ['$scope', 'SettingService', ModeController]);
boundaries.controller('ActionController', ['$scope', 'SettingService', ActionController]);
boundaries.controller('MapController', ['$scope', 'SettingService', 'UtilityService', 'VariableService', MapController]);
boundaries.controller('ImageController', ['$scope', 'SettingService', ImageController]);
boundaries.controller('DrawingController', ['$scope', 'SettingService', DrawingController]);
boundaries.controller('SearchController', ['$scope', '$sce', 'SettingService', 'UtilityService', 'VariableService', SearchController]);
boundaries.controller('ThrobController', ['$scope', 'VariableService', ThrobController]);

// Services
function HistoryService() {
	
}

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
			nodes: [],
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
		mode: 'flex',
		action: {
			connect: true
		}
		// More defaults...
	};
	try {
		this.settings = JSON.parse(localStorage.settings);
		this.settings = this.defaults;
	} catch (e) {
		this.settings = this.defaults;
		// this.Save();
		console.log('Default settings loaded');
	}
	// Keep saved object keys aligned with default object keys (while preserving values). If a key is missing, it will be added. If an extra key is found, it will be removed.
	function SyncProperties(master, check, secondStep) {
		//console.log('Master:', master, 'Check:', check, 'Second Step:', secondStep);
		if (typeof master != 'object' || typeof check != 'object') return;
		if (!secondStep) {
			var masterKeys = Object.keys(master).sort(); // Pull keys from master as array
			for (var i = 0; i < masterKeys.length; i++) {
				if (!check.hasOwnProperty(masterKeys[i])) {
					check[masterKeys[i]] = master[masterKeys[i]];
				} else {
					SyncProperties(master[masterKeys[i]], check[masterKeys[i]]);
				}
			}
		}
		var checkKeys = Object.keys(check).sort(); // Pull keys from check as array
		for (var i = 0; i < checkKeys.length; i++) {
			if (!master.hasOwnProperty(checkKeys[i])) {
				delete check[checkKeys[i]];
			} else {
				SyncProperties(master[checkKeys[i]], check[checkKeys[i]], true);
			}
		}
	}
	
	SyncProperties(this.defaults, this.settings);
	this.Save = function() {
		localStorage.settings = JSON.stringify(this.settings);
		//console.timeEnd('Save');
	};
}
// Useful functions used by multiple controllers
function UtilityService($rootScope, $q, $http) {
	var autocomplete = new google.maps.places.AutocompleteService();
	var placeService = new google.maps.places.PlacesService(document.querySelector('#places_attributions'));
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
		suggestions: function(input, map) {
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
		loadPlace: function(map, reference) {
			if (map === undefined || reference === undefined) return;
			function revealOnMap(place, status) {
				if (place === undefined || status === undefined) return;
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
	this.location = function() {
		var deferred = $q.defer();
		if ('geolocation' in navigator) {
			navigator.geolocation.getCurrentPosition(deferred.resolve, deferred.reject);
			return deferred.promise;
		} else {
			return $http.get('https://freegeoip.net/json/', {cache: true});
		}
	};
	this.throb = {
		on: function() {
			console.log('Throb on');
			$rootScope.$broadcast('throb', true);
		},
		off: function() {
			console.log('Throb off');
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

function MapController($scope, SettingService, UtilityService, VariableService) {
	// Functions
	function makeHexColor(node, alpha) {
		var color = SettingService.settings.color.choices[node.color_i];
		return UtilityService.color.toHex(color.rgba, alpha);
	}
	function makeLatLng(node) {
		return new google.maps.LatLng(node.lat, node.lng);
	}
	function makeIcon(node) {
		var color = makeHexColor(node, false);
		return {
			fillColor: color,
			fillOpacity: 0.5,
			path: google.maps.SymbolPath.CIRCLE,
			scale: 10,
			strokeColor: color,
			strokeOpacity: 1,
			strokeWeight: 2.5
		};
	}
	function makeMarkerOptions(node) {
		return {
			clickable: true,
			crossOnDrag: true,
			cursor: 'pointer',
			draggable: true,
			flat: true,
			icon: makeIcon(node),
			map: $scope.map,
			position: makeLatLng(node)
		};
	}
	function makePolylineOptions(node) {
		var color = SettingService.settings.color.choices[node.color_i];
		return {
			clickable: true,
			draggable: false,
			editable: false,
			strokeColor: makeHexColor(node, alpha),
			strokeOpacity: color.rgba.a,
			strokeWeight: color.weight,
			map: $scope.map
		};
	}
	function makePolygonOptions(node) {
		var color = SettingService.settings.color.choices[node.color_i];
		return {
			clickable: true,
			draggable: false,
			editable: false,
			fillColor: makeHexColor(node, alpha),
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
	
	function addNode(node) {
		var marker = makeMarker(node);
		$scope.markers.push(marker);
		if ($scope.nodes.length == 0 || SettingService.settings.connect == false || $scope.nodes[$scope.nodes.length - 1].color_i != SettingService.settings.color.active) {
			console.log('Creating New Line');
			var polyline = makePolyline(node);
			// The MVCArrayBinder contstructor allows MVC binding between and array and an object
			polyline.pathBinder = new MVCArrayBinder(polyline.getPath());
			$scope.drawings.push(polyline);
		}
		var drawing = $scope.drawings[$scope.drawings.length - 1];
		drawing.getPath().push(makeLatLng(node));
		marker.bindTo('position', drawing.pathBinder, (drawing.getPath().getLength() - 1).toString());
		$scope.nodes.push(node);
	}
	function changeNode(i, node, refresh)  {
		for (var key in node) {
			if (node.hasOwnProperty(key)) {
				$scope.nodes[i][key] = node[key];
			}
		}
		$scope.nodes[i] = node;
		
		if (refresh) {
			var isLat = (node.lat != undefined);
			var isLng = (node.lng != undefined);
			var isColorI = (node.color_i != undefined);
			var isMode = (node.mode != undefined);
			var markerLatLng = $scope.markers[i].getPosition();
			if (isLat || isLng) {
				var lat = markerLatLng.lat();
				var lng = markerLatLng.lng();
				$scope.markers[i].setPosition(new google.maps.LatLng(isLat ? node.lat : lat, isLng ? node.lng : lng));
			}
			if (isColorI) {
				var icon = makeIcon(node);
			}
		}
	}
	// TODO: deleteNode()
	function updateStyle() {
		$scope.map.mapTypes.set('custom', new google.maps.StyledMapType($scope.style, {
			name: 'Customized'
		}));
	}
	function panToCurrentLocation() {
		UtilityService.throb.on();
		UtilityService.location().then(function(position) {
			console.log(position);
			if (!position) return;
			var location, zoom;
			if (position.coords) {
				location = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
				zoom = 10;
			} else if (position.data) {
				location = new google.maps.LatLng(position.data.latitude, position.coords.longitude);
				zoom = 7;
			}
			$scope.map.panTo(location);
			$scope.map.setZoom(zoom);
		}, function(failure) {
			SettingService.settings.search.show = true;
		}).finally(function() {
			UtilityService.throb.off();
		});
	}
	// Event binders
	$scope.map_click = function(e) {
		addNode($scope.map, {
			lat: e.latLng.lat(),
			lng: e.latLng.lng(),
			color_i: SettingService.settings.color.active,
			mode: SettingService.settings.mode
		});
	};
	$scope.map_center_changed = function() {
		var center = $scope.map.getCenter();
		$scope.lat = center.lat();
		$scope.lng = center.lng();
	};
	$scope.map_zoom_changed = function() {
		$scope.zoom = $scope.map.getZoom();
	};
	$scope.marker_drag = function(e, i) {
		changeNode(i, {
			lat: e.latLng.lat(),
			lng: e.latLng.lng()
		}, false);
		$scope.nodes[i].lat = e.latLng.lat();
		$scope.nodes[i].lng = e.latLng.lng();
	};
	$scope.marker_click = function(i) {
		var markerPosition = $scope.markers[i].getPosition();
		addNode($scope.map, {
			lat: markerPosition.lat(),
			lng: markerPosition.lng(),
			color_i: SettingService.settings.color.active,
			mode: SettingService.settings.mode
		});
	};
	$scope.marker_rightclick = function(i) {
		console.log('Marker rightclicked: ', i);
		deleteNode(i);
		console.log($scope.nodes);
	};
	$scope.zoom_out = function() {
		var zoom = $scope.map.getZoom() - 1;
		$scope.map.setZoom(zoom);
	};
	// Variables
	var lat = SettingService.settings.map.lat;
	var lng = SettingService.settings.map.lng;
	var center = new google.maps.LatLng($scope.lat, $scope.lng);
	var zoom = SettingService.settings.map.zoom;
	// TODO: Styled map code. Use callback to load styles onto map
	$scope.style = SettingService.settings.map.style;
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
		zoom: zoom,
		zoomControl: true,
		zoomControlOptions: {
			position: google.maps.ControlPosition.RIGHT_CENTER,
			style: google.maps.ZoomControlStyle.SMALL
		}
	};
	$scope.nodes = SettingService.settings.map.nodes;
	$scope.markers = [];
	$scope.drawings = [];
	
	// Watchers
	$scope.$watch('map', function() {
		VariableService.map = $scope.map;
	});
	// Listen once; when the map is defined, load its watchers
	var unbindWatcher = $scope.$watch('map', function() {
		if ($scope.map == undefined) return;
		updateStyle();
		if ($scope.lat == undefined || $scope.lng == undefined) {
			panToCurrentLocation();
			console.log('Location Retrieved');
		}
		$scope.$watch('map.getZoom()', function() {
			SettingService.settings.map.zoom = $scope.map.getZoom();
		});
		$scope.$watch('map.getCenter()', function() {
			var center = $scope.map.getCenter();
			SettingService.settings.map.lat = center.lat();
			SettingService.settings.map.lng = center.lng();
			SettingService.Save();
		});
		for (var i = 0; i < $scope.nodes.length; i++) {
			var node = $scope.nodes[i];
			// TODO: this function pushes to markerData. Decide how best to prevent duplication
			addNode($scope.map, node.lat, node.lng, node.color_i, node.mode);
		}
		unbindWatcher();
	});
}

function ActionController($scope, SettingService) {
	$scope.clearAll = function() {
		
	};
	$scope.connect = SettingService.settings.action.connect;
	// Save values on change
	$scope.$watch('connect', function() {
		SettingService.settings.action.connect = $scope.connect;
		SettingService.Save();
	});
}

function ImageController($scope, SettingService, VariableService) {
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

function ThrobController($scope, VariableService) {
	$scope.count = 0;
	$scope.$on('throb', function(event, count) {
		console.log('ThrobController ', count);
		if (count == true) $scope.count++;
		if (count == false) $scope.count--;
	});
}

function SearchController($scope, $sce, SettingService, UtilityService, VariableService) {
	$scope.loadPlace = function(reference) {
		UtilityService.throb.on();
		UtilityService.map.loadPlace(VariableService.map, reference);
		UtilityService.throb.off();
	};
	$scope.keydown = function(e) {
		var enter, up, down;
		enter = (e.which == 13);
		up = (e.which == 38);
		down = (e.which == 40);
		if (enter || up || down) {
			e.preventDefault();
		}
		if (enter) {
			if ($scope.active == -1) {
				$scope.loadPlace($scope.suggestions[0].reference);
			} else {
				$scope.loadPlace($scope.suggestions[$scope.active].reference);
			}
		} else if (up && $scope.active > -1) {
			$scope.active--;
		} else if (down && $scope.active < $scope.suggestions.length - 1) {
			$scope.active++;
		}
	}
	$scope.show = SettingService.settings.search.show;
	$scope.query = SettingService.settings.search.query;
	$scope.suggestions = [];
	$scope.active = -1;
	
	function formatSuggestions(suggestions) {
		for (var i = 0; i < suggestions.length; i++) {
			var desc = suggestions[i].description;
			suggestions[i].description = '';
			var index = 0;
			for (var j = 0; j < suggestions[i].matched_substrings.length; j++) {
				var offset = suggestions[i].matched_substrings[j].offset;
				var length = suggestions[i].matched_substrings[j].length;
				suggestions[i].description += desc.slice(index, offset) + '<b>' + desc.substr(offset, length) + '</b>';
				index += offset + length;
			}
			suggestions[i].description += desc.slice(index);
			suggestions[i].description = $sce.trustAsHtml(suggestions[i].description);
		}
		return suggestions;
	}
	function errorMessage(message) {
		if (typeof message == 'string') return [{description: $sce.trustAsHtml('<i>' + message + '</i>'), error: true}]
	}
	
	$scope.$watch('query', function() {
		UtilityService.map.suggestions($scope.query, VariableService.map).then(function(suggestions) {
			// console.time('Suggestions');
			$scope.suggestions = formatSuggestions(suggestions);
			// console.timeEnd('Suggestions');
		}, function(message) {
			$scope.suggestions = errorMessage(message);
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
function bezel(svg) {
	window.clearInterval(bezelTimeout);
	$('#bezel')
		.remove();
	$(document.body)
		.prepend('<div id="bezel"></div>');
	svg.clone()
		.appendTo('#bezel');
	bezelTimeout = window.setTimeout(function() {
		$('#bezel')
			.remove();
	}, 1000);
}

function addNode(point) {
	var x = nodes.length;
	switch (mode) {
	case 'flexibleLine':
		nodes.push({
			mode: mode,
			color: color,
			connect: undefined,
			object: undefined,
			marker: undefined
		});
		nodes[x].connect = setConnect(x);
		nodes[x].marker = addMarker(point, x);
		nodes[x].object = addDirections(point, x);
		break;
	case 'rigidLine':
		nodes.push({
			'mode': mode,
			'color': color,
			'connect': undefined,
			'object': undefined,
			'marker': undefined
		});
		nodes[x].connect = setConnect(x);
		nodes[x].marker = addMarker(point, x);
		nodes[x].object = addLine(point, x);
		break;
	case 'polygon':
		nodes.push({
			'mode': mode,
			'color': color,
			'connect': undefined,
			'object': undefined,
			'marker': undefined
		});
		nodes[x].connect = setConnect(x);
		nodes[x].marker = addMarker(point, x);
		nodes[x].object = addPolygon(point, x);
		break;
	}
}

function setConnect(x) {
	if (!($('#connect')
		.prop('checked'))) {
		console.log('#connect is unchecked; connect: ', false);
		return false;
	}
	if (nodes[x - 1] == undefined) {
		console.log('The previous node is undefined; connect: ', null);
		return null;
	}
	if (nodes[x].color == nodes[x - 1].color) { //if the colors are the same
		if ((nodes[x].mode == 'polygon') == (nodes[x - 1].mode == 'polygon')) { //if mode & previous mode are functionally the same (e.g. both polygons; flexibleLine, rigidLine), treat it as a whole
			console.log('Colors are the same, Functions are the same; connect: ', null);
			return null;
		} else { //if they aren't functionally the same, disconnect them
			console.log('Colors are the same, Functions are different; connect: ', false);
			return false;
		}
	} else if ((nodes[x].mode == 'polygon') == (nodes[x - 1].mode == 'polygon')) { //if mode & previous mode are functionally the same, connect them (because they aren't the same color)
		console.log('Colors are different, Functions are the same; connect: ', true);
		return true;
	} else { //if they aren't functionally the same or the same color, disconnect them
		console.log('Colors are different, Functions are different; connect: ', false);
		return false;
	}
}

function addMarker(point, x) {
	marker = new GMap.Marker({
		position: point,
		zIndex: x,
		icon: {
			path: GMap.SymbolPath.CIRCLE,
			fillColor: color,
			fillOpacity: .25,
			strokeColor: color,
			strokeOpacity: .125,
			strokeWeight: 1,
			scale: 10
		},
		clickable: true,
		draggable: true,
		map: map
	});

	function addListener(thisMarker) {
		GMap.event.addListener(thisMarker, 'click', function() {
			markerClick(x);
		});
		GMap.event.addListener(thisMarker, 'dragend', function() {
			markerDrag(x);
		});
	};
	addListener(marker);
	return marker;
}

function markerClick(x) {
	var point = nodes[x].marker.getPosition();
	addNode(point);
}

function markerDrag(x) {
	var move0, move1, move2;
	console.log('x == ', x);
	for (i = 0; i < 2; i++) {
		var w = x + (i - 1);
		var y = x + i;
		/*if(nodes[h]){
			prevPoint = nodes[x + h]
		}*/
		try {
			switch (nodes[y].mode) {
			case 'flexibleLine':
				var request = {
					origin: nodes[w].marker.getPosition(),
					destination: nodes[y].marker.getPosition(),
					travelMode: GMap.TravelMode.DRIVING
				};

				/*function setDirections(theY) {
					service.route(request, function(result, status) {
						if (status == GMap.DirectionsStatus.OK) {
							console.log('Directions will be set now');
							nodes[theY].object.setDirections(result);
							console.log('nodes after setDirections() execution: ', nodes);
						}
					});
				}
				setDirections(y);*/
				break;
			case 'rigidLine':

				nodes[y].object.getPath();
				break;
			case 'polygon':
				var request = {
					origin: nodes[h],
					destination: point1,
					travelMode: GMap.TravelMode.DRIVING
				};
				service.route(request, function(result, status) {
					if (status == GMap.DirectionsStatus.OK) {
						nodes[x + i].object.setDirections(result);
					}
				});
				break;
			}
		} catch (err) {
			console.warn(err);
		}
	}
	console.log('markerDrag() executed');
}

function addDirections(thisPoint, x) {
	if (nodes[x].connect == false) return null;
	var start, end;
	if (nodes[x - 1] && nodes[x]) {
		start = nodes[x - 1].marker.getPosition();
		end = nodes[x].marker.getPosition();
	} else if (nodes[x]) {
		start = nodes[x].marker.getPosition();
		end = nodes[x].marker.getPosition();
	}
	var renderer = new GMap.DirectionsRenderer({
		map: map,
		polylineOptions: {
			map: map,
			editable: false,
			clickable: false,
			strokeColor: nodes[x].color,
			strokeOpacity: 0.125,
			strokeWeight: 10
		},
		preserveViewport: true,
		suppressMarkers: true,
		suppressInfoWindows: true
	});
	var request = {
		origin: start,
		destination: end,
		travelMode: GMap.TravelMode.DRIVING
	};
	throb(true);
	service.route(request, function(result, status) {
		if (status == GMap.DirectionsStatus.OK) {
			renderer.setDirections(result);
		} else {
			alert('The line did not load');
		}
		throb(false);
	});
	console.log('Directions added');
	return renderer;
}

function addLine(thisPoint, x) {
	if (nodes[x].connect == false) return new GMap.Polyline({
		map: map,
		editable: false,
		clickable: false,
		strokeColor: nodes[x].color,
		strokeOpacity: 0.125,
		strokeWeight: 10,
		path: [thisPoint]
	});
	var line, path = [];
	if (!nodes[x - 1]) {
		line = new GMap.Polyline({
			map: map,
			editable: false,
			clickable: false,
			strokeColor: nodes[x].color,
			strokeOpacity: 0.125,
			strokeWeight: 10
		});
	} else if (nodes[x].connect == null) {
		if (nodes[x - 1].mode != 'rigidLine') {
			line = new GMap.Polyline({
				map: map,
				editable: false,
				clickable: false,
				strokeColor: nodes[x].color,
				strokeOpacity: 0.125,
				strokeWeight: 10,
				path: [nodes[x - 1].marker.getPosition()]
			});
		} else line = nodes[x - 1].object;
		path = line.getPath();
	} else if (nodes[x].connect == true) {
		path.push(nodes[x - 1].marker.getPosition());
		line = new GMap.Polyline({
			map: map,
			editable: false,
			clickable: false,
			strokeColor: nodes[x].color,
			strokeOpacity: 0.125,
			strokeWeight: 10
		});
	}
	path.push(thisPoint);
	line.setPath(path);
	console.log('Line added');
	return line;
}

function addPolygon(thisPoint, x) {
	if (nodes[x].connect == false) return new GMap.Polygon({
		map: map,
		editable: false,
		clickable: false,
		fillColor: nodes[x].color,
		fillOpacity: 0.25,
		strokeWeight: 0,
		path: [thisPoint]
	});
	var polygon, path = [];
	if (!nodes[x - 1]) {
		polygon = new GMap.Polygon({
			map: map,
			editable: false,
			clickable: false,
			fillColor: nodes[x].color,
			fillOpacity: 0.25,
			strokeWeight: 0
		});
	} else if (nodes[x].connect == null) {
		polygon = nodes[x - 1].object;
		path = polygon.getPath();
	} else if (nodes[x].connect == true) {
		path.push(nodes[x - 1].marker.getPosition());
		polygon = new GMap.Polygon({
			map: map,
			editable: false,
			clickable: false,
			fillColor: nodes[x].color,
			fillOpacity: 0.25,
			strokeWeight: 0
		});
	}
	path.push(thisPoint);
	polygon.setPath(path);
	console.log('Polygon added');
	return polygon;
}

function undo() {
	try {
		nodes[nodes.length - 1].marker.setMap(null);
		//nodes[nodes.length-1].marker.clearListeners();
		nodes[nodes.length - 1].object.setMap(null);
	} catch (err) {}
	nodes.pop();
	return;
}

function clearAll() {
	for (var i = 0; i < nodes.length; i++) {
		try {
			nodes[i].marker.setMap(null);
			nodes[i].object.setMap(null);
		} catch (e) {}
	}
	nodes = [];
	console.log('Cleared all');
	return;
}

function changeMode(thisMode) {
	mode = thisMode;
	console.log('Mode changed to: ' + mode);
}

function changeColor(thisColor) {
	color = thisColor;
	console.log('Color changed to: ' + color);
}

function refresh() {
	throb(true);
	if (nodes.length == 0) {
		alert('An image was generated, but it has nothing on it');
	}
	var urlPaths = [];
	var connectedPaths = [];
	var connectedPath = [];

	function connectPath(thisNode) {
		switch (thisNode.mode) { // Attaches current object's path to the array
		case 'flexibleLine':
			connectedPath = connectedPath.concat(thisNode.object.getDirections()
				.routes[0].overview_path);
			break;
		case 'rigidLine':
			connectedPath = connectedPath.concat(thisNode.object.getPath()
				.getArray());
			break;
		case 'polygon':
			connectedPath = connectedPath.concat(thisNode.object.getPath()
				.getArray());
			break;
		}
		console.log('connectedPath:', connectedPath);
	}
	console.log('Connection logic...');
	for (var i = 0; i < nodes.length; i++) {
		var h = i - 1;
		if (nodes[i].connect == true) {
			//console.log('connect == ', true);
			//console.log('mode:', nodes[i].mode, '| color:', nodes[i].color);
			connectedPaths.push({
				'path': connectedPath,
				'mode': nodes[h].mode,
				'color': nodes[h].color
			});
			//console.log('connectedPath:', connectedPath, 'connectedPaths:', connectedPaths);
			connectedPath = [];
			connectPath(nodes[i]);
		} else if (nodes[i].connect == false) {
			//console.log('connect == ', false);
			connectedPaths.push({
				'path': connectedPath,
				'mode': nodes[h].mode,
				'color': nodes[h].color
			});
			//console.log('connectedPath:', connectedPath, 'connectedPaths:', connectedPaths);
			connectedPath = [];
		} else if (nodes[i].connect == null) {
			//console.log('connect == ', null);
			connectPath(nodes[i]);
		}
		/*if(i==nodes.length-1){
			console.log('This is the last item in the array');
			connectedPaths.push({
				'path':connectedPath,
				'mode':nodes[i].mode,
				'color':nodes[i].color
			});
			connectedPath = [];
			console.log('End of iteration. i:',i,'| connectedPath:',connectedPath,'| connectedPaths:',connectedPaths);
		}*/
	}
	console.log('...Connection logic')
	if (nodes != []) {
		connectedPaths.push({
			'path': connectedPath,
			'mode': nodes[nodes.length - 1].mode,
			'color': nodes[nodes.length - 1].color
		});
	}
	console.log('connectedPaths:', connectedPaths);
	console.log('URL Processing...');
	for (var i = 0; i < connectedPaths.length; i++) {
		var encodedPath = GMap.geometry.encoding.encodePath(connectedPaths[i].path);
		console.log(encodedPath);
		var hex = connectedPaths[i].color.replace('#', '0x') + '40';
		if (connectedPaths[i].mode == 'polygon') {
			var urlPath = '&path=weight:0%7Cfillcolor:' + hex + '%7Cenc:' + encodedPath;
			urlPaths.push(urlPath);
		} else {
			var urlPath = '&path=weight:10|color:' + hex + '|enc:' + encodedPath;
			urlPaths.push(urlPath);
		}
	}
	var mapX, mapY;
	ratio = Number(localStorage.ratio);
	if (ratio <= 1) {
		mapX = ratio * 640;
		mapY = 640;
	} else {
		mapX = 640;
		mapY = 1 / ratio * 640
	}
	var urlBase = getBaseUrl(mapX, mapY);
	var urlFinal = urlBase + urlPaths.join('&');
	console.log(urlFinal);
	var staticMap = $('#static_map');
	if (staticMap.prop('src') != urlFinal) {
		staticMap.prop('src', urlFinal);
		staticMap.css('cursor', 'move');
		staticMap.load(function() {
			staticMap.css('opacity', 1);
			throb(false);
		});
	}
	
	//console.log('Refreshed');
}

function rotate() {
	ratio = 1 / ratio;
	localStorage.ratio = ratio;
	refresh();
	//console.log('Rotated');
}

function fade(element, state) {
	if (state == true) {
		element.fadeIn(250);
	} else if (state == true) {
		element.fadeOut(250);
	} else {
		element.fadeToggle(250);
	}
	console.log('Visibility toggled');
}

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