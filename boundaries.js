"use strict";

// TODO: Privacy Policy and Terms of Service (https://developers.google.com/places/policies)
var boundaries = angular.module('boundaries', ['ngStorage', 'ngRoute', 'ui.map', 'ui.event']);

angular.bootstrap(document.querySelector('#map_canvas'), ['boundaries']);

// Register all services
boundaries.service('settingService', settingService);
boundaries.service('utilityService', ['$rootScope', '$q', '$http', utilityService]);

// Register all controllers
// Every controller that needs to communicate gets $rootScope
boundaries.controller('ColorController', ['$scope', 'settingService', 'utilityService', ColorController]);
boundaries.controller('ModeController', ['$scope', 'settingService', ModeController]);
boundaries.controller('ActionController', ['$scope', '$rootScope', '$localStorage', ActionController]);
boundaries.controller('MapController', ['$scope', '$rootScope', '$location', 'settingService', 'utilityService', MapController]);
boundaries.controller('ImageController', ['$scope', 'settingService', ImageController]);
boundaries.controller('DrawingController', ['$scope', '$rootScope', '$location', '$localStorage', 'utilityService', DrawingController]);
boundaries.controller('SearchController', ['$scope', '$sce', '$location', 'settingService', 'utilityService', SearchController]);
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
// Used to store settings and share between controllers

function settingService() {
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

function utilityService($rootScope, $q, $http) {
    var directions = new google.maps.DirectionsService();
    var autocomplete = new google.maps.places.AutocompleteService();
    var placeService = new google.maps.places.PlacesService(document.querySelector('#places_attributions'));
    var map;
    $rootScope.$on('map', function(event, param) {
        console.log('utilityService: map');
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
                var request = {
                    input: input
                };
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

            if (reference) placeService.getDetails({
                reference: reference
            }, revealOnMap);
        },
        directions: function(start, end) {
            var deferred = $q.defer();
            
            // Get the directions. The callback returns a promise, which can be handled synchronously.
            directions.route({
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            }, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    // Resolve with path
                    var path = result.routes[0].overview_path;
                    deferred.resolve(path);
                } else {
                    // Reject with status
                    deferred.reject(status);
                }
                return deferred.promise;
            });
            
            return deferred.promise;
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
            var promise = $http.get('https://freegeoip.net/json/', {
                cache: true
            });
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

function ColorController($scope, settingService, utilityService) {
    // Functions for converting color formats
    $scope.Hex = function(rgba) {
        return utilityService.color.toHex(rgba, false);
    };
    $scope.HSL = function(rgba) {
        var r, g, b, a;
        var h, s, l;
        var min, max;

        r = rgba.r;
        g = rgba.g;
        b = rgba.b;
        a = rgba.a;
        max = Math.max(r, g, b);
        min = Math.min(r, g, b);
        h = s = l = (max + min) / 2;
        if (max == min) {
            h = s = 0;
        } else {
            d = max - min;
            s = (l > 0.5) ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
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
    $scope.active = settingService.settings.color.active;
    $scope.choices = settingService.settings.color.choices;
    // Load saved colors or defaults
    $scope.$watch('[active, choices]', function() {
        settingService.settings.color.active = $scope.active;
        settingService.settings.color.choices = $scope.choices;
        settingService.Save();
    }, true);
}

function ModeController($scope, settingService) {
    $scope.mode = settingService.settings.mode;

    $scope.$watch('mode', function() {
        settingService.settings.mode = $scope.mode;
        settingService.Save();
    });
}

function MapController($scope, $rootScope, $location, $localStorage, utilityService) {
    function updateStyle() {
        $scope.map.mapTypes.set('custom', new google.maps.StyledMapType($scope.style, {
            name: 'Customized'
        }));
    }

    function syncUrl() {
        if ($location.search()) {
            if ('lat' in $location.search() && 'lng' in $location.search()) {
                $scope.map.setCenter(new google.maps.LatLng(Number($location.search().lat), Number($location.search().lng)));
            }
            if ('zoom' in $location.search()) $scope.map.setZoom(Number($location.search().zoom));
        }
    }

    function panToCurrentLocation() {
        var location;
        if (useExact === undefined || useExact === false) {
            utilityService.throb.on();
            utilityService.location.approximate().then(function(position) {
                if (!position) return;
                if (position.data) {
                    location = new google.maps.LatLng(position.data.latitude, position.data.longitude);
                }
                // Check if exact location is already in use
                if (!useExact) {
                    $scope.map.setCenter(location);
                    $scope.map.setZoom(8);
                }
            }).
            finally(function() {
                utilityService.throb.off();
            });
        }
        if (useExact === undefined || useExact === true) {
            utilityService.throb.on();
            utilityService.location.exact().then(function(position) {
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
                settingService.settings.search.show = true;
            }).
            finally(function() {
                utilityService.throb.off();
            });
        }
    }

    // Event binders
    $scope.$storage = $localStorage;

    $scope.map_click = function($param) {
        $scope.$broadcast('map.click', $param);
    };
    $scope.map_center_changed = function() {
        var center = $scope.map.getCenter();
        $scope.$storage.lat = center.lat();
        $scope.$storage.lng = center.lng();
    };
    $scope.map_zoom_changed = function() {
        $scope.$storage.zoom = $scope.map.getZoom();
    };
    $scope.map_idle = function() {
        $location.search('lat', $scope.$storage.lat);
        $location.search('lng', $scope.$storage.lng);
        $location.search('zoom', $scope.$storage.zoom);
    };
    // Map controls
    $scope.$storage.zoom_in = function() {
        var zoom = $scope.map.getZoom() + 1;
        $scope.map.setZoom(zoom);
    };
    $scope.$storage.zoom_out = function() {
        var zoom = $scope.map.getZoom() - 1;
        $scope.map.setZoom(zoom);
    };

    // Variables
    var useExact;
    $scope.location = $location;
    $scope.options = {
        center: new google.maps.LatLng($scope.$storage.lat || 0, $scope.$storage.lng || 0),
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
        zoom: $scope.$storage.zoom || 8,
        zoomControl: true,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
            style: google.maps.ZoomControlStyle.SMALL
        }
    };

    // Listen once; when the map is defined, load its watchers
    var unbindWatcher = $scope.$watch('map', function() {
        if ($scope.map == undefined) return;
        $rootScope.$broadcast('map', $scope.map);
        updateStyle();

        $scope.$watch('location.url()', syncUrl);
        syncUrl();

        if (!$scope.$storage.lat || !$scope.$storage.lng) panToCurrentLocation();
        unbindWatcher();
    });
}

function DrawingController($scope, $rootScope, $location, $localStorage, utilityService) {
    $scope.$storage = $localStorage.$default({
        drawings: [],
        new: true
    });

    function makeHexColor(alpha) {
        var color = $scope.colors[$scope.activeColor];
        return utilityService.color.toHex(color.rgba, alpha);
    }
    function makeIcon() {
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            strokeColor: makeHexColor(false),
            strokeOpacity: 1,
            strokeWeight: 2.5
        };
    }
    function makeLatLng(node) {
        console.log('makeLatLng: node ->', node);
        return new google.maps.LatLng(node.lat, node.lng);
    }
    function makeMarkerOptions(node) {
        return {
            clickable: true,
            crossOnDrag: false,
            cursor: 'pointer',
            draggable: true,
            flat: true,
            icon: makeIcon(),
            map: $scope.map,
            position: makeLatLng(node)
        };
    }
    function makeMarker(node) {
        return new google.maps.Marker(makeMarkerOptions(node));
    }
    function makePolylineOptions() {
        var color = $scope.colors[$scope.activeColor];
        return {
            clickable: true,
            draggable: false,
            editable: false,
            strokeColor: '#' + makeHexColor(false),
            strokeOpacity: color.rgba.a,
            strokeWeight: color.weight,
            map: $scope.map
        };
    }
    function makePolygonOptions() {
        var color = $scope.colors[$scope.activeColor];
        return {
            clickable: true,
            draggable: false,
            editable: false,
            fillColor: '#' + makeHexColor(false),
            fillOpacity: color.rgba.a,
            map: $scope.map
        };
    }
    function makePolyline() {
        return new google.maps.Polyline(makePolylineOptions());
    }
    function makePolygon() {
        return new google.maps.Polygon(makePolygonOptions(node));
    }
    function makePoly() {
        if ($scope.polygon) return makePolygon();
        else return makePolyline();
    }
    function makePath(start, end, rigid) {
        var path;
        if (rigid) {
            path = [start, end];
        } else {
            // Get the directions path, use it
            utilityService.map.directions(start, end).then(function(resultPath) {
                // Success
                path = resultPath;
            }, function(status) {
                // Failure
                console.error('The directions request failed. Status:', status);
            });
        }
        return path;
    }

    function spliceDrawing(drawingIndex, removeLength, newDrawing) {
        if (newDrawing !== undefined) $scope.drawings.splice(drawingIndex, removeLength, newDrawing);
        else $scope.drawings.splice(drawingIndex, removeLength);
    }
    function splicePolyPath(drawingIndex, nodeIndex, removeLength, newPath) {
        console.log(drawingIndex, nodeIndex, removeLength, newPath);
        
        if (nodeIndex == -1) nodeIndex = $scope.drawings[drawingIndex].nodes.length - 1;
        
        var path = $scope.drawings[drawingIndex]._poly.getPath();
        var index = $scope.drawings[drawingIndex].nodes[nodeIndex].index;

        // Remove all elements between index and index + removeLength
        for (var i = 0; i < removeLength; i++) { // TODO: < or <=
            path.removeAt(index + i);
        }

        // Insert all elements from newPath into path
        for (var i = 0; i < newPath.length; i++) {
            path.insertAt(index + i, newPath[i]);
        }
        
        //$scope.drawings[drawingIndex]._poly.setPath(path);
    }
    function spliceNode(drawingIndex, nodeIndex, removeLength, newNode) {
        if (drawingIndex > $scope.drawings.length) {
            console.error('drawingIndex > $scope.drawings.length');
            return;
        }
        /*// If this is a new drawing...
        if (drawingIndex == $scope.drawings.length || drawingIndex == -1) {
            // ...then nodeIndex must be the end of the path
            if (nodeIndex > 0 || nodeIndex < -1) {
                console.error('nodeIndex > 0 || nodeIndex < -1');
                return;
            }
        }*/
        var drawing = $scope.drawings[drawingIndex];
        
        drawing.nodes.splice(nodeIndex, removeLength, newNode);
        
        // Add the new node to the existing nodes
        if (typeof newNode !== 'object') console.error('newNode is not an object');

        var path = [];
        
        // Create a marker at the specified location
        newNode._marker = makeMarker(newNode);
        
        // Generate polyline to be spliced later
        console.log('spliceNode, calling makePath with nodeIndex:', nodeIndex);
        if (drawing.nodes.length > 1) {
            path = makePath(makeLatLng(drawing.nodes[nodeIndex - 1]), makeLatLng(drawing.nodes[nodeIndex]), newNode.rigid);
        }

        // Add all previous indicies to find current index
        var pathIndex = 0;
        for (var i = 0; i < nodeIndex; i++) {
            pathIndex += drawing.nodes[i].index;
        }
        // Add length of new path to index
        pathIndex += path.length;
        $scope.drawings[drawingIndex].nodes[nodeIndex].index = pathIndex;
        
        // Update the poly
        splicePolyPath(drawingIndex, nodeIndex, 0, path);
    }
    
    function map_click($event, $param) {
        var newNode = {
            lat: $param[0].latLng.lat(),
            lng: $param[0].latLng.lng(),
            rigid: $scope.rigid
        };
        
        var drawingIndex = $scope.drawings.length;
        
        if ($scope.$storage.new) {
            // Add a new drawing
            spliceDrawing(drawingIndex, 0, {
                polygon: $scope.polygon,
                activeColor: $scope.activeColor,
                _poly: makePoly(newNode,
                                $scope.polygon),
                nodes: []
            });
        } else {
            // Set to length - 1 for last drawing
            drawingIndex--;
        }
        
        // Get the index for the new node
        var nodeIndex = $scope.drawings[drawingIndex].nodes.length;
        
        // Add node to end of current drawing
        spliceNode(drawingIndex, nodeIndex, 0, newNode);
        
        $scope.$storage.new = false;
    }
    $scope.marker_click = function($event) {

    }

    function clear() {
        for (var drawingIndex = 0; drawingIndex < $scope.drawings.length; drawingIndex++) {
            $scope.drawings[drawingIndex]._poly.setMap(null);

            for (var nodeIndex = 0; nodeIndex < $scope.drawings[drawingIndex].nodes.length; nodeIndex++) {
                $scope.drawings[drawingIndex].nodes[nodeIndex]._marker.setMap(null);
            }
        }
        $scope.drawings = [];
        
    }
    function undo() {
        
    }

    var map;
    $scope.drawings = [];
    $scope.colors = [{
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
    }];
    $scope.activeColor = 1;
    $scope.rigid = true;
    
    // When MapController emits the value of map, capture it.
    $scope.$on('map', function($event, $param) {
        map = $param;
    });
    $scope.$on('map.click', map_click);
    $scope.$on('drawing.clear', clear);
    $scope.$on('drawing.undo', undo);
    
    $scope.$watch('drawings.length', function() {
        if ($scope.drawings.length === 0) $scope.$storage.new = true;
    });
    $scope.marker_dragstart = function(drawingIndex, nodeIndex) {
        console.log('dragstart:', drawingIndex, nodeIndex);

        // Watch the position of the marker, update the path
        $scope.drawings[drawingIndex].nodes[nodeIndex]._unbind = $scope.$watch('drawings[' + drawingIndex + '].nodes[' + nodeIndex + ']._marker.getPosition()', function(oldVal, newVal) {
            
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
            activeColor: settingService.settings.color.active,
            lat: markerPosition.lat(),
            lng: markerPosition.lng(),
            rigid: settingService.settings.mode.rigid
        });
    };
}

function ActionController($scope, $rootScope, $localStorage) {
    $scope.$storage = $localStorage;
    
    $scope.$watch('$storage.new', function() {
        console.log('ActionController:', $scope.$storage.new);
    });
    $scope.undo = function() {
        $rootScope.$broadcast('drawing.undo');
    };
    $scope.clear = function() {
        $rootScope.$broadcast('drawing.clear');
    };
}

function ImageController($scope, settingService) {
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
    // Load variables from settingService
    $scope.width = settingService.settings.image.width;
    $scope.height = settingService.settings.image.height;
    $scope.show = settingService.settings.image.show;
    $scope.format = settingService.settings.image.format;
    $scope.rotate = settingService.settings.image.rotate;

    $scope.$watch('[width, height, show, format, rotate]', function() {
        settingService.settings.image.width = $scope.width;
        settingService.settings.image.height = $scope.height;
        settingService.settings.image.show = $scope.show;
        settingService.settings.image.format = $scope.format;
        settingService.settings.image.rotate = $scope.rotate;
        settingService.Save();
    }, true);
}

// function DrawingController($scope, settingService) {
// 
// }

function ThrobController($scope, $rootScope, $location, $routeParams) {
    $scope.count = 0;
    $rootScope.$on('throb', function(event, count) {
        if (count === true) $scope.count++;
        if (count === false) $scope.count--;
    });
}

function SearchController($scope, $sce, $location, settingService, utilityService) {
    $scope.loadPlace = function(reference) {
        utilityService.throb.on();
        utilityService.map.loadPlace(reference);
        utilityService.throb.off();
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
    $scope.show = false;
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
        if (typeof message == 'string') return [{
            description: $sce.trustAsHtml('<i>' + message + '</i>'),
            error: true
        }]
    }

    // Get suggestions when query changes
    $scope.$watch('query', function() {
        utilityService.map.suggestions($scope.query).then(function(suggestions) {
            $scope.suggestions = formatSuggestions(suggestions);
            $scope.active = 0;
        }, function(message) {
            $scope.suggestions = errorMessage(message);
            $scope.active = -1;
        });
    });
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
