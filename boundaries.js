"use strict";
// TODO: Add ui and map as dependencies
// TODO: Privacy Policy and Terms of Service (https://developers.google.com/places/policies)
var boundaries = angular.module('boundaries', []);

// Register all factories
// boundaries.factory('MapFactory', ['$rootScope', MapFactory]);

// Register all services
boundaries.service('MapService', ['$rootScope', MapService]);
boundaries.service('SettingService', SettingService);
boundaries.service('HistoryService', HistoryService);

// Register all controllers
boundaries.controller('ColorController', ['$scope', 'SettingService', ColorController]);
boundaries.controller('ModeController', ['$scope', 'SettingService', ModeController]);
boundaries.controller('ActionController', ['$scope', 'SettingService', ActionController]);
boundaries.controller('MapController', ['$scope', 'SettingService', MapController]);
boundaries.controller('ImageController', ['$scope', 'SettingService', ImageController]);
boundaries.controller('DrawingController', ['$scope', 'SettingService', 'MapService', DrawingController]);
boundaries.controller('SearchController', ['$scope', 'SettingService', 'MapService', SearchController]);
boundaries.controller('ThrobController', ['$scope', 'SettingService', ThrobController]);

// Services
function HistoryService() {
	
}

function MapService($rootScope) {
	// Uses DOM manipulation to initialize the map
	var map = new google.maps.Map(document.getElementById('map_canvas'));
	var autocomplete = new google.maps.places.AutocompleteService();
	var placeService = new google.maps.places.PlacesService(map);
	this.GetSuggestions = function(search) {
		$rootScope.$broadcast('throb.on');
		autocomplete.getPlacePredictions({
			bounds: map.getBounds(),
			input: search
		}, this.ReturnSuggestions);
	};
	this.ReturnSuggestions = function(suggestions, status) {
		$rootScope.$broadcast('throb.off');
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			$rootScope.$broadcast('suggestions.ok', suggestions);
		} else if (status == google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
			$rootScope.$broadcast('suggestions.no_result');
		} else {
			$rootScope.$broadcast('suggestions.error');
		}
	};
	this.GetDetails = function(reference) {
		if (reference) placeService.getDetails({reference: reference}, this.LoadPlace);
	}
	this.LoadPlace = function(place, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			console.log(place.geometry);
			if (place.geometry.viewport) {
				map.fitBounds(place.geometry.viewport);
			} else if (place.geometry.location) {
				map.panTo(place.geometry.location);
			}
		}
	}
}

function SettingService() {
	// Functions
	// Load defaults or load saved values
	
	this.defaults = {
		map: {
			lat: 0,
			lng: 0,
			zoom: 5
		},
		image: {
			width: 5,
			height: 3.5,
			format: 'jpg',
			show: true,
			rotate: false
		},
		colors: [{
			name: 'Red',
			rgba: {
				r: 255,
				g: 0,
				b: 0,
				a: 32
			}
		}, {
			name: 'Green',
			rgba: {
				r: 0,
				g: 255,
				b: 0,
				a: 32
			}
		}, {
			name: 'Blue',
			rgba: {
				r: 0,
				g: 0,
				b: 255,
				a: 32
			}
		}],
		search: {
			query: '',
			show: true
		},
		mode: 'flex',
		action: {
			connect: true
		}
		// More defaults...
	};
	try {
		this.settings = JSON.parse(LocalStorage.settings);
	} catch (e) {
		this.settings = this.defaults;
		console.log('Default settings loaded');
	}
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
	};
}

// Controllers
function ColorController($scope, SettingService) {
	// Functions for converting color formats
	$scope.Hex = function (rgba, alpha) {
		if (alpha) return ((255 << 32) | (128 << 16) | (128)).toString(16);
		return ((rgba.r << 16) | (rgba.g << 8) | rgba.b).toString(16);
	}
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
	}
	
	// Load saved colors or defaults
	/*var activeColor = SettingService.settings.colors.activeColor;
	$scope.activeColor = {
		index: activeColor
	};*/
}

function ModeController($scope, SettingService) {
	$scope.mode = SettingService.settings.mode;
	
	$scope.$watch('mode', function(){SettingService.Save();});
}

function MapController($scope, SettingService) {
	
}

function ActionController($scope, SettingService) {
	$scope.connect = SettingService.settings.action.connect;
	
	// Save values on change
	$scope.$watch('connect', function(){SettingService.Save();});
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
	
	// Load variables from localStorage, or load defaults
	$scope.width = SettingService.settings.image.width;
	$scope.height = SettingService.settings.image.height;
	$scope.show = SettingService.settings.image.show;
	$scope.format = SettingService.settings.image.format;
	$scope.rotate = SettingService.settings.image.rotate;
	
	$scope.$watch('[width, height, show, format, rotate]', function(){SettingService.Save();}, true);
}

function DrawingController($scope, SettingService, MapService) {
	
}

function ThrobController($scope, SettingService) {
	$scope.count = 0;
	
	// Events
	$scope.$on('throb.on', function () {
		$scope.count++;
	});
	$scope.$on('throb.off', function () {
		$scope.count--;
		if(!$scope.$$phase) {
			$scope.$apply();
		}
	});
	$scope.$watch();
}

function SearchController($scope, SettingService, MapService) {
	function checkApply() {
		if (!$scope.$$phase) {
			$scope.$apply();
		}
	}
	$scope.LoadPlace = function(reference) {
		MapService.GetDetails(reference);
	};
	$scope.show = SettingService.settings.search.show;
	$scope.query = SettingService.settings.search.query;
	$scope.suggestions = [];
	
	function boldMatches(suggestions) {
		for (var i = 0; i < suggestions.length; i++) {
			var desc = suggestions[i].description;
			//console.group('Original Description: \'%s\'', desc);
			suggestions[i].description = '';
			var index = 0;
			for (var j = 0; j < suggestions[i].matched_substrings.length; j++) {
				var offset = suggestions[i].matched_substrings[j].offset;
				var length = suggestions[i].matched_substrings[j].length;
				suggestions[i].description += desc.slice(index, offset) + '<b>' + desc.substr(offset, length) + '</b>';
				index += offset + length;
				//console.log('Offset: %i; Length: %i; Index: %i', offset, length, index);
				//console.log('Description: %s', suggestions[i].description);
			}
			suggestions[i].description += desc.slice(index);
			//console.log('Final Description: \'%s\'', suggestions[i].description);
			//console.groupEnd();
		}
		return suggestions;
	}
	$scope.$on('suggestions.ok', function(e, suggestions) {
		$scope.suggestions = boldMatches(suggestions);
		checkApply();
	});
	$scope.$on('suggestions.no_result', function(e, suggestions) {
		
		$scope.suggestions = [{description: 'No Results'}];
		checkApply();
	});
	
	$scope.$watch('[query, show]',  function(){SettingService.Save();}, true);
	$scope.$watch('query', function() {
		if ($scope.query.length > 0) {
			MapService.GetSuggestions($scope.query);
		}
	});
}


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