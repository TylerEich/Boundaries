var GMap;
if(google.maps){
	GMap = google.maps;
} else {
	alert("Google Maps didn't load!");
}
var service = new GMap.DirectionsService();
var bezelTimeout, throbberTimeout;
var isMac = Boolean(navigator.platform.match("Mac"));
var modifierKey;
if (isMac) {
	modifierKey = "⌘";
} else {
	modifierKey = "Ctrl-";
}
var map;
var marker;
var polylineOptions = {
	map: map,
	clickable:false,
	strokeColor:"#7fff00",
	strokeOpacity:0.125,
	strokeWeight:10
};
var polygonOptions = {
	map: map,
	clickable:false,
	fillColor:"#7fff00",
	fillOpacity:0.125
};
var color;
var mode;
var mapStyle;
if(!localStorage.mapStyle) localStorage.mapStyle = '[{"stylers":[{"visibility":"off"}]},{"featureType":"road","stylers":[{"visibility":"on"}]},{"elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"road","elementType":"geometry.stroke","stylers":[{"color":"#808080"}]},{"elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"elementType":"labels.text.fill","stylers":[{"color":"#000000"}]}]';
if (!(localStorage.ratio)) localStorage.ratio = 1;
var ratio = Number(localStorage.ratio);
var nodes = [];
//var throbber = '<div id="throbber"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 48 12.75"><path id="dot1" d="m 41.625372,12.24628 c -3.243029,0 -5.875053,-2.6311667 -5.875053,-5.8731395 0,-3.2419738 2.632024,-5.87314081 5.875053,-5.87314081 3.243029,0 5.875053,2.63116701 5.875053,5.87314081 0,3.2419728 -2.632024,5.8731395 -5.875053,5.8731395 z"><animate attributeType="CSS" attributeName="opacity" begin="0s" from="1" to="0" dur="1.5s" repeatCount="indefinite"/></path><path id="dot2" d="m 24.000213,12.24628 c -3.24303,0 -5.875054,-2.6311667 -5.875054,-5.8731395 0,-3.2419738 2.632024,-5.87314081 5.875054,-5.87314081 3.243029,0 5.875053,2.63116701 5.875053,5.87314081 0,3.2419728 -2.632024,5.8731395 -5.875053,5.8731395 z"><animate attributeType="CSS" attributeName="opacity" begin="-.5s" from="1" to="0" dur="1.5s" repeatCount="indefinite"/></path><path id="dot3" d="m 6.3750531,12.24628 c -3.2430293,0 -5.87505307,-2.6311667 -5.87505307,-5.8731395 0,-3.2419738 2.63202377,-5.87314081 5.87505307,-5.87314081 3.2430294,0 5.8750529,2.63116701 5.8750529,5.87314081 0,3.2419728 -2.6320235,5.8731395 -5.8750529,5.8731395 z"><animate attributeType="CSS" attributeName="opacity" begin="-1s" from="1" to="0" dur="1.5s" repeatCount="indefinite"/></path></svg></div>';
var throbber = '<div id="throbber"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 48 12.75"><path id="dot1" d="m 41.625372,12.24628 c -3.243029,0 -5.875053,-2.6311667 -5.875053,-5.8731395 0,-3.2419738 2.632024,-5.87314081 5.875053,-5.87314081 3.243029,0 5.875053,2.63116701 5.875053,5.87314081 0,3.2419728 -2.632024,5.8731395 -5.875053,5.8731395 z"></path><path id="dot2" d="m 24.000213,12.24628 c -3.24303,0 -5.875054,-2.6311667 -5.875054,-5.8731395 0,-3.2419738 2.632024,-5.87314081 5.875054,-5.87314081 3.243029,0 5.875053,2.63116701 5.875053,5.87314081 0,3.2419728 -2.632024,5.8731395 -5.875053,5.8731395 z"></path><path id="dot3" d="m 6.3750531,12.24628 c -3.2430293,0 -5.87505307,-2.6311667 -5.87505307,-5.8731395 0,-3.2419738 2.63202377,-5.87314081 5.87505307,-5.87314081 3.2430294,0 5.8750529,2.63116701 5.8750529,5.87314081 0,3.2419728 -2.6320235,5.8731395 -5.8750529,5.8731395 z"></path></svg></div>';
$(function() {
	console.log("DOM loaded; initializing...");
	//$(document.body).prepend(throbber);
	// Interface listeners
	$("label")
		.each(function() {
		$(this)
			.attr("title", ($(this)
			.attr("title")
			.replace("[meta]", modifierKey)));
	});
	$("#search_button")
		.click(function() {
		//window.setTimeout(function() {
			toggleVisibility($("#search_box"), $("#search_button").prop("checked"));
			//}, 1);
	});
	$("#red")
		.click(function() {
		changeColor("#ff0000");
	});
	$("#green")
		.click(function() {
		changeColor("#7fff00");
	});
	$("#blue")
		.click(function() {
		changeColor("#0000ff");
	});
	$("#flexible_line")
		.click(function() {
		changeMode("flexibleLine");
	});
	$("#rigid_line")
		.click(function() {
		changeMode("rigidLine");
	});
	$("#polygon")
		.click(function() {
		changeMode("polygon");
	});
	$("#undo")
		.click(function() {
		undo();
	});
	$("#clear")
		.click(function() {
		clearAll();
	});
	$("#image")
		.click(function() {
		//window.setTimeout(function() {
			toggleVisibility($("#static_map"), $("#image").prop("checked"));
			toggleVisibility($("#image_functions"), $("#image").prop("checked"));
			//}, 1);
	});
	$("img#static_map")
		.click(function() {
		refresh();
	});
	$("#refresh")
		.click(function() {
		refresh();
	});
	$("#rotate")
		.click(function() {
		rotate();
	});
	$("#settings")
		.click(function(){
		window.setTimeout(function(){
			toggleVisibility($("#settings_dialog"),$("#settings").prop("checked"));
		}, 1);
	});
	$("input#width").change(function() {
		settings(null);
	});
	$("input#height")
		.change(function() {
		settings(null);
	});
	$("#yes")
		.click(function() {
		settings(true);
	});
	$("#no")
		.click(function() {
		settings(false);
	});
	$(window)
		.keydown(function(e) {
		var key = String.fromCharCode(e.which);
		var label = $("label[title*='" + modifierKey + key + "']");
		var input = $("input#" + label.attr("for"));
		if (label.length == 0) {
			console.log("No element");
			return;
		}
		if (isMac && e.metaKey && !e.altKey) {
			console.log("Metakey not pressed");
		} else if (!isMac && e.ctrlKey && !e.altKey) {
			console.log("Control key not pressed");
		} else return;
		e.preventDefault();
		console.log("Default prevented");
		input.click();
		bezel(label.children("svg:first-child"));
	});
	$("input#search_box").keydown(function(e){
		if(e.which == 13 && $(".pac-selected .pac-hover").length == 0) {
			window.setTimeout(function(){
				$(".pac-item").click();
			},1);
		}
	});
	$("#green")
		.click();
	$("#flexible_line")
		.click();
	mapStyle = JSON.parse(localStorage.mapStyle);
	if (!localStorage.lat || !localStorage.lng || !localStorage.zoom) {
		localStorage.lat = new GMap.LatLng(41.12452911, - 84.86471285)
			.lat();
		localStorage.lng = new GMap.LatLng(41.12452911, - 84.86471285)
			.lng();
		localStorage.zoom = 17;
	}
	// Add the Territory Style to the map
	var styles = new GMap.StyledMapType(mapStyle, {
		name: "Territory"
	});
	var mapOptions = {
		zoom: Number(localStorage.zoom),
		center: new GMap.LatLng(Number(localStorage.lat), Number(localStorage.lng)),
		backgroundColor: "#fff",
		draggableCursor: "crosshair",
		disableDoubleClickZoom: true,
		streetViewControl: false,
		zoomControl: true,
		zoomControlOptions: {
			style: GMap.ZoomControlStyle.DEFAULT,
			position: GMap.ControlPosition.RIGHT_CENTER
		},
		panControl: true,
		panControlOptions: {
			position: GMap.ControlPosition.RIGHT_TOP
		},
		mapTypeControl: true,
		mapTypeControlOptions: {
			position: GMap.ControlPosition.TOP_RIGHT,
			mapTypeIds: ["territory_style", GMap.MapTypeId.ROADMAP, GMap.MapTypeId.HYBRID]
		},
		scaleControl: true,
		scaleControlOptions: {
			style: GMap.ScaleControlStyle.DEFAULT,
			position: GMap.ControlPosition.RIGHT_BOTTOM
		}
	};
	map = new GMap.Map(document.querySelector("#map_canvas"), mapOptions);
	map.mapTypes.set("territory_style", styles);
	map.setMapTypeId("territory_style");
	GMap.event.addListener(map, "click", function(event) {
		addNode(event.latLng);
	});
	GMap.event.addListener(map, "center_changed", function() {
		localStorage.lat = map.getCenter()
			.lat();
		localStorage.lng = map.getCenter()
			.lng();
	});
	GMap.event.addListener(map, "zoom_changed", function() {
		localStorage.zoom = map.getZoom();
	});
	var input = document.querySelector("#search_box");
	var search = new GMap.places.Autocomplete(input);
	search.bindTo("bounds", map);
	GMap.event.addListener(search, "place_changed", function() {
		input.className = "";
		var place = search.getPlace();
		if (!place.geometry) {
			input.className = "notfound";
			return;
		}
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(17);
		}
		var address = "";
		if (place.address_components) {
			address = [
			(place.address_components[0] && place.address_components[0].short_name || ""), (place.address_components[1] && place.address_components[1].short_name || ""), (place.address_components[2] && place.address_components[2].short_name || "")].join(" ");
		}
	});
	console.log("...Initialized");
});

function bezel(svg) {
	window.clearInterval(bezelTimeout);
	$("#bezel")
		.remove();
	$(document.body)
		.prepend('<div id="bezel"></div>');
	svg.clone()
		.appendTo("#bezel");
	bezelTimeout = window.setTimeout(function() {
		$("#bezel")
			.remove();
	}, 1000);
}

function throb(state){
	window.clearInterval(throbberTimeout);
	if(state){
		if($("#throbber").length > 0) return;
		$(document.body).prepend(throbber);
		//throbberTimeout = window.setTimeout(function(){$("#throbber").css("opacity",1);},1);
	} else {
		$("#throbber").css("opacity",0);
		throbberTimeout = window.setTimeout(function(){$("#throbber").remove();}, 1000);
	}
}

function addNode(point) {
	var x = nodes.length;
	switch (mode) {
	case "flexibleLine":
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
	case "rigidLine":
		nodes.push({
			"mode": mode,
			"color": color,
			"connect": undefined,
			"object": undefined,
			"marker": undefined
		});
		nodes[x].connect = setConnect(x);
		nodes[x].marker = addMarker(point, x);
		nodes[x].object = addLine(point, x);
		break;
	case "polygon":
		nodes.push({
			"mode": mode,
			"color": color,
			"connect": undefined,
			"object": undefined,
			"marker": undefined
		});
		nodes[x].connect = setConnect(x);
		nodes[x].marker = addMarker(point, x);
		nodes[x].object = addPolygon(point, x);
		break;
	}
}

function setConnect(x) {
	if (!($("#connect").prop("checked"))) {
		console.log("#connect is unchecked; connect: ", false);
		return false;
	}
	if (nodes[x - 1] == undefined) {
		console.log("The previous node is undefined; connect: ", null);
		return null;
	}
	if (nodes[x].color == nodes[x - 1].color) { //if the colors are the same
		if ((nodes[x].mode == "polygon") == (nodes[x - 1].mode == "polygon")) { //if mode & previous mode are functionally the same (e.g. both polygons; flexibleLine, rigidLine), treat it as a whole
			console.log("Colors are the same, Functions are the same; connect: ", null);
			return null;
		} else { //if they aren't functionally the same, disconnect them
			console.log("Colors are the same, Functions are different; connect: ", false);
			return false;
		}
	} else if ((nodes[x].mode == "polygon") == (nodes[x - 1].mode == "polygon")) { //if mode & previous mode are functionally the same, connect them (because they aren't the same color)
		console.log("Colors are different, Functions are the same; connect: ", true);
		return true;
	} else { //if they aren't functionally the same or the same color, disconnect them
		console.log("Colors are different, Functions are different; connect: ", false);
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
		GMap.event.addListener(thisMarker, "click", function() {
			markerClick(x);
		});
		GMap.event.addListener(thisMarker, "dragend", function() {
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
	console.log("x == ",x);
	for (i=0; i<2; i++){
		var w = x+(i-1);
		var y = x+i;
		/*if(nodes[h]){
			prevPoint = nodes[x + h]
		}*/
		try{
			switch(nodes[y].mode){
				case "flexibleLine":
				var request = {
					origin: nodes[w].marker.getPosition(),
					destination: nodes[y].marker.getPosition(),
					travelMode: GMap.TravelMode.DRIVING
				};
				function setDirections(theY){
					service.route(request, function(result, status){
						if (status == GMap.DirectionsStatus.OK) {
							console.log("Directions will be set now");
							nodes[theY].object.setDirections(result);
							console.log("nodes after setDirections() execution: ",nodes);
						}
					});
				}
				setDirections(y);
				break;
				case "rigidLine":

				nodes[y].object.getPath();
				break;
				case "polygon":
					var request = {
					origin: nodes[h],
					destination: point1,
					travelMode: GMap.TravelMode.DRIVING
				};
					service.route(request, function(result, status){
					if (status == GMap.DirectionsStatus.OK) {
						nodes[x + i].object.setDirections(result);
					}
				});
				break;
			}
		}catch(err){
			console.warn(err);
		}
	}
	console.log("markerDrag() executed");
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
			map:map,
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
			alert("The line did not load");
		}
		throb(false);
	});
	console.log("Directions added");
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
		if (nodes[x - 1].mode != "rigidLine") {
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
	console.log("Line added");
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
	console.log("Polygon added");
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
	console.log("Cleared all");
	return;
}

function changeMode(thisMode) {
	mode = thisMode;
	console.log("Mode changed to: " + mode);
}

function changeColor(thisColor) {
	color = thisColor;
	console.log("Color changed to: " + color);
}

function refresh() {
	throb(true);
	if (nodes.length == 0) {
		alert("An image was generated, but it has nothing on it");
	}
	var urlPaths = [];
	var connectedPaths = [];
	var connectedPath = [];
	function connectPath(thisNode) {
		switch (thisNode.mode) { // Attaches current object's path to the array
		case "flexibleLine":
			connectedPath = connectedPath.concat(thisNode.object.getDirections()
				.routes[0].overview_path);
			break;
		case "rigidLine":
			connectedPath = connectedPath.concat(thisNode.object.getPath()
				.getArray());
			break;
		case "polygon":
			connectedPath = connectedPath.concat(thisNode.object.getPath()
				.getArray());
			break;
		}
		console.log("connectedPath:", connectedPath);
	}
	console.log("Connection logic...");
	for (var i = 0; i < nodes.length; i++) {
		var h = i - 1;
		if (nodes[i].connect == true) {
			console.log("connect == ", true);
			console.log("mode:", nodes[i].mode, "| color:", nodes[i].color);
			connectedPaths.push({
				"path": connectedPath,
				"mode": nodes[h].mode,
				"color": nodes[h].color
			});
			console.log("connectedPath:", connectedPath, "connectedPaths:", connectedPaths);
			connectedPath = [];
			connectPath(nodes[i]);
		} else if (nodes[i].connect == false) {
			console.log("connect == ", false);
			connectedPaths.push({
				"path": connectedPath,
				"mode": nodes[h].mode,
				"color": nodes[h].color
			});
			console.log("connectedPath:", connectedPath, "connectedPaths:", connectedPaths);
			connectedPath = [];
		} else if (nodes[i].connect == null) {
			console.log("connect == ", null);
			connectPath(nodes[i]);
		}
		/*if(i==nodes.length-1){
			console.log("This is the last item in the array");
			connectedPaths.push({
				"path":connectedPath,
				"mode":nodes[i].mode,
				"color":nodes[i].color
			});
			connectedPath = [];
			console.log("End of iteration. i:",i,"| connectedPath:",connectedPath,"| connectedPaths:",connectedPaths);
		}*/
	}
	console.log("...Connection logic")
	if (nodes != []) {
		connectedPaths.push({
			"path": connectedPath,
			"mode": nodes[nodes.length - 1].mode,
			"color": nodes[nodes.length - 1].color
		});
	}
	console.log("connectedPaths:", connectedPaths);
	console.log("URL Processing...");
	for (var i = 0; i < connectedPaths.length; i++) {
		var encodedPath = GMap.geometry.encoding.encodePath(connectedPaths[i].path);
		console.log(encodedPath);
		var hex = connectedPaths[i].color.replace("#", "0x") + "40";
		if (connectedPaths[i].mode == "polygon") {
			var urlPath = "&path=weight:0%7Cfillcolor:" + hex + "%7Cenc:" + encodedPath;
			urlPaths.push(urlPath);
		} else {
			var urlPath = "&path=weight:10|color:" + hex + "|enc:" + encodedPath;
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
	var urlBase = getBaseUrl(mapX,mapY);
	var urlFinal = urlBase + urlPaths.join("&");
	console.log(urlFinal);
	var staticMap = $("#static_map");
	if (staticMap.prop("src") != urlFinal) {
		staticMap.prop("src", urlFinal);
		staticMap.css("cursor", "move");
		staticMap.load(function() {
			staticMap.css("opacity", 1);
			throb(false);
		});
	}
	staticMap.error(function() {
		alert("The image could not be loaded.");
		throb(false);
	});
	console.log("Refreshed");
}

function rotate() {
	ratio = 1 / ratio;
	localStorage.ratio = ratio;
	refresh();
	console.log("Rotated");
}

function toggleVisibility(element, state) {
	if(state == true){
		element.fadeIn(250);
	}else if(state == true){
		element.fadeOut(250);
	}else{
		element.fadeToggle(250);
	}
	console.log("Visibility toggled");
}

function settings(accept) {
	var x = $("input#width")
		.val();
	var y = $("input#height")
		.val();
	var ratio = x / y;
	var actualX, actualY;
	if (!isNaN(x) && !isNaN(y)) {
		if (ratio <= 1) {
			actualX = Math.floor(ratio * 1280);
			actualY = 1280;
		} else {
			actualX = 1280;
			actualY = Math.floor(1 / ratio * 1280);
		}
		$("#actual_size")
			.text(actualX + " × " + actualY);
	} else {
		$("#actual_size")
			.text("Invalid expression");
	}
	if (accept == true) {
		$("#settings")
			.click();
		localStorage.ratio = ratio;
		return;
	} else if (accept == false) {
		$("#settings")
			.click();
		return;
	}
}

function getBaseUrl(mapX, mapY) {
	var url = 'http://maps.googleapis.com/maps/api/staticmap?';
	var params = [];
	params.push('sensor=false');
	params.push('size=' + mapX + "x" + mapY);
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

//toHex() is for converting alpha floats from spectrum
function toHex(a){
	var rgbv = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
	a = Math.round(a * 256 - 1);
	var hex = rgbv[Math.floor(a/16)];
	hex += rgbv[Math.floor(a%16)];
	return hex;
}