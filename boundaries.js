var boundaries = angular.module('boundaries', []);

boundaries.service('Store', function () {
	
});

function MapCtrl($scope) {
	var status = google.maps.places.PlacesServiceStatus;
	var autocomplete = google.maps.places.AutocompleteService();
	
	// Search suggestion functions
	function UpdateSuggestions(suggestions, requestStatus) {
		switch (requestStatus) {
		case status.INVALID_REQUEST:
			suggestions = {
				description: 'Invalid Request',
				error: true
			};
			break;
		case status.OVER_QUERY_LIMIT:
			suggestions = {
				description: 'Over Query Limit',
				error: true
			};
			break;
		case status.REQUEST_DENIED:
			suggestions = {
				description: 'Request Denied',
				error: true
			};
			break;
		case status.UNKNOWN_ERROR:
			suggestions = {
				description: 'An Unknown Error Occurred',
				error: true
			};
			break;
		case status.ZERO_RESULTS:
			suggestions = {
				description: 'No Results',
				error: true
			};
			break;
		}
		$scope.suggestions = suggestions;
	}
	$scope.Suggest = function (search) {
		$scope.autocomplete.getPlacePredictions({
			bounds: $scope.map.getBounds(),
			input: search
		}, UpdateSuggestions);
	};
	// Geolocation fallback when no location is saved
	function Locate() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition( function (position) {
				$scope.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			}, function() {
				$scope
			});
				$scope.center = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			});
		} else
	}
	
	// Map variables
	$scope.styles = [{
		feature: 'administrative.poi',
		element: 'road'
	}];
	$scope.center = localStorage.center ? JSON.parse(localStorage.center) : Locate();
}

function ColorCtrl($scope) {
	// Funcitons for converting color formats
	$scope.Hex = function (rgba, alpha) {
		function ChanHex (chanVal) {
			chanVal *= 255;
			var hex = chanVal.toString(16);
			hex = (hex.length > 1) ? hex : '0' + hex;
			return hex;
		}
		
		var hex = '';
		for (chan in rgba) {
			switch (chan) {
			case 'r':
			case 'g':
			case 'b':
				hex += ChanHex(rgba[chan]);
				break;
				
			case 'a':
				hex += (alpha) ? ChanHex(rgba[chan]) : '';
				break;
			}
		}
		return hex;
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
	var activeColor = localStorage.activeColor ? localStorage.activeColor : '1';
	$scope.activeColor = {
		index: activeColor
	};
	$scope.colors = JSON.parse(localStorage.colors) ? JSON.parse(localStorage.colors) : [{
		/*active: true,*/
		name: 'Red',
		rgba: {
			r: 1,
			g: 0,
			b: 0,
			a: 0.125
		}
	}, {
		/*active: false,*/
		name: 'Green',
		rgba: {
			r: 0,
			g: 1,
			b: 0,
			a: 0.125
		}
	}, {
		/*active: false,*/
		name: 'Blue',
		rgba: {
			r: 0,
			g: 0,
			b: 1,
			a: 0.125
		}
	}];
	
	// Watch variables; save on change
	$scope.$watch('activeColor.index', function() {
		localStorage.activeColor = $scope.activeColor.index;
	});
	$scope.$watch('colors', function() {
		localStorage.colors = JSON.stringify($scope.colors);
	});
}

function ModeCtrl($scope) {
	$scope.activeMode = localStorage.activeMode ? localStorage.activeMode : '0';
	
	$scope.$watch('activeMode', function() {
		localStorage.activeMode = $scope.activeMode;
	});
}

function FunctionCtrl($scope) {
	$scope.connect = localStorage.connect ? JSON.parse(localStorage.connect) : true;
	
	// Save values on change
	$scope.$watch('connect', function() {
		localStorage.connect = JSON.stringify($scope.connect);
	});
}

function ImageCtrl($scope) {
	$scope.PxSize = function() {
		var ratio = $scope.width / $scope.height;
		return {
			ratio: ratio,
			width: (ratio >= 1) ? 640 : Math.round(ratio * 640),
			height: (ratio < 1) ? 640 : Math.round(1 / ratio * 640)
		}
	};
	
	// Load variables from localStorage, or load defaults
	$scope.width = Number(localStorage.width) ? Number(localStorage.width) : 5;
	$scope.height = Number(localStorage.height) ? Number(localStorage.height) : 3.5;
	$scope.format = localStorage.format ? localStorage.format : 'png';
	$scope.rotate = localStorage.rotate ? localStorage.rotate : 'auto';
	
	// Watch variables; save to localStorage on change
	$scope.$watch('width', function() {
		localStorage['width'] = $scope.width;
	});
	$scope.$watch('height', function() {
		localStorage['height'] = $scope.height;
	});
	$scope.$watch('format', function() {
		localStorage['format'] = $scope.format;
	});
	$scope.$watch('rotate', function() {
		localStorage['rotate'] = $scope.rotate;
	});
}

function DrawingCtrl($scope) {
	
}



/* 
*** MIGRATE TO ANGULAR ***
*/
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

function throb(state) {
	window.clearInterval(throbberTimeout);
	if (state) {
		if ($('#throbber')
			.length > 0) return;
		$(document.body)
			.prepend(throbber);
		//throbberTimeout = window.setTimeout(function(){$('#throbber').css('opacity',1);},1);
	} else {
		$('#throbber')
			.css('opacity', 0);
		throbberTimeout = window.setTimeout(function() {
			$('#throbber')
				.remove();
		}, 1000);
	}
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

				function setDirections(theY) {
					service.route(request, function(result, status) {
						if (status == GMap.DirectionsStatus.OK) {
							console.log('Directions will be set now');
							nodes[theY].object.setDirections(result);
							console.log('nodes after setDirections() execution: ', nodes);
						}
					});
				}
				setDirections(y);
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