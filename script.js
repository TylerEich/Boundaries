"use strict";

// TODO: Privacy Policy and Terms of Service (https://developers.google.com/places/policies)
var boundaries = angular.module('boundaries', ['ngTouch', 'ngAnimate', 'ngStorage', 'ngRoute', 'ui.map', 'ui.event']);

angular.bootstrap(document.querySelector('#map_canvas'), ['boundaries']);

// Directives
boundaries.directive('bndTouch', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            if ('ontouchstart' in document.documentElement) {
                element.addClass('touch');
            } else {
                element.addClass('no-touch');
            }
        }
    }
});
boundaries.directive('bndError', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            var errorHandler = $parse(attr.bndError);
            element.on('error', function() {
                scope.$apply(function() {
                    errorHandler(scope);
                });
            });
        }
    }
}]);
boundaries.directive('bndLoad', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
            var loadHandler = $parse(attr.bndLoad);
            element.on('load', function() {
                scope.$apply(function() {
                    loadHandler(scope);
                });
            });
        }
    };
}]);
boundaries.directive('bndHotkey', function() {
    return {
        restrict: 'E',
        scope: {
            key: '@',
            keycode: '@',
            
            ctrl: '&',
            alt: '&',
            meta: '&',
            shift: '&',
            
            action: '&'
        },
        link: function(scope, element, attr) {
            var isMac = (navigator.platform.lastIndexOf('Mac') === 0);
            element.on('keypress');
            // console.log(scope.key.charCodeAt(0));
        }
    }
});

// Register all services
boundaries.service('utilityService', ['$rootScope', '$localStorage', '$q', '$http', utilityService]);

// Register all controllers
// Every controller that needs to communicate gets $rootScope
boundaries.controller('SettingController', ['$scope', '$localStorage', 'utilityService', SettingController]);
boundaries.controller('ColorController', ['$scope', '$localStorage', 'utilityService', ColorController]);
boundaries.controller('ModeController', ['$scope', '$localStorage', ModeController]);
boundaries.controller('ActionController', ['$scope', '$rootScope', '$localStorage', ActionController]);
boundaries.controller('MapController', ['$scope', '$rootScope', '$location', '$localStorage', '$timeout', 'utilityService', MapController]);
boundaries.controller('MapControlsController', ['$scope', '$rootScope', '$localStorage', MapControlsController]);
boundaries.controller('ImageController', ['$scope', '$rootScope', '$localStorage', '$timeout', 'utilityService', ImageController]);
boundaries.controller('LightboxController', ['$scope', '$localStorage', LightboxController]);
boundaries.controller('DrawingController', ['$scope', '$rootScope', '$location', '$localStorage', '$q', 'utilityService', DrawingController]);
boundaries.controller('SearchController', ['$scope', '$sce', '$timeout', 'utilityService', SearchController]);
boundaries.controller('ThrobController', ['$scope', '$rootScope', '$localStorage', ThrobController]);

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

// Useful functions available to multiple controllers
function utilityService($rootScope, $localStorage, $q, $http) {
    var directions = new google.maps.DirectionsService();
    var autocomplete = new google.maps.places.AutocompleteService();
    var placeService;
    var map;
    $rootScope.$storage = $localStorage;
    
    $rootScope.$on('map', function(event, param) {
        map = param;
        placeService = new google.maps.places.PlacesService(map);
    });
    
    this.throb = {
        on: function() {
            $rootScope.$broadcast('throb', true);
        },
        off: function() {
            if ($rootScope.$storage.mapThrobCounter <= 0) return;
            $rootScope.$broadcast('throb', false);
        }
    };
    this.color = {
        toHex: function(rgba, alpha) {
            var rgba255 = {};
            var keys = Object.keys(rgba);
            
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                rgba255[key] = Math.round(rgba[key] * 255);
            }
            
            var hex = ((1 << 24) | (rgba255.r << 16) | (rgba255.g << 8) | rgba255.b).toString(16).substring(1);
            if (alpha === true || (alpha === undefined && rgba255.a !== 255)) {
                var a = ((1 << 8) | rgba255.a).toString(16).substring(1);
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
        makePath: function(start, end, rigid) {
            var deferred = $q.defer();
            if (rigid) {
                deferred.resolve([start, end]);
            } else {
                directions.route({
                    origin: start,
                    destination: end,
                    travelMode: google.maps.TravelMode.DRIVING
                }, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        // Resolve with path
                        deferred.resolve(result.routes[0].overview_path);
                    } else {
                        // Reject with status
                        deferred.reject(status);
                    }
                }, function() {
                    deferred.reject();
                });
            }
            return deferred.promise;
        }
    };
    this.image = {
        pxSize: function(maxWidth, maxHeight) {
            var ratio = $localStorage.width / $localStorage.height;
            return {
                ratio: ratio,
                width: (ratio >= 1) ? maxWidth : Math.round(ratio * maxWidth),
                height: (ratio < 1) ? maxHeight : Math.round(1 / ratio * maxHeight)
            }
        }
    }
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
    };
}

// Controllers
function SettingController($scope, $localStorage, utilityService) {
    console.log('storage');
    $scope.$storage = $localStorage.$default({
        activeColor: 1,
        compressedDrawings: '',
        colors: [{
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
                r: 0.5,
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
        }],
        format: 'jpg',
        fullscreen: false,
        height: 3.5,
        new: true,
        polygon: false,
        rigid: false,
        style: [{
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "landscape",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#ffffff"
            }]
        }, {
            "featureType": "road",
            "stylers": [{
                "visibility": "on"
            }]
        }, {
            "elementType": "geometry.fill",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{
                "color": "#808080"
            }]
        }, {
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "elementType": "labels.text.fill",
            "stylers": [{
                "color": "#000000"
            }]
        }, {
            "featureType": "water",
            "stylers": [{
                "visibility": "on"
            }, {
                "color": "#40bfbf"
            }]
        }, {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [{
                "color": "#ffffff"
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry",
            "stylers": [{
                "color": "#dfdfdf"
            }]
        }, {
            "featureType": "road.local",
            "elementType": "geometry.stroke",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "landscape.man_made",
            "stylers": [{
                "visibility": "off"
            }]
        }],

        width: 5
    });

    $scope.pxSize = utilityService.image.pxSize;
}

function ColorController($scope, $localStorage, utilityService) {
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
    
    $scope.$storage = $localStorage;
}

function ModeController($scope, $localStorage) {
    $scope.$storage = $localStorage;
}

function MapController($scope, $rootScope, $location, $localStorage, $timeout, utilityService) {
    function updateStyle() {
        $scope.map.mapTypes.set('custom', new google.maps.StyledMapType($scope.$storage.style, {
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
                $localStorage.settings.search.show = true;
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
    $scope.map_idle = function() {
        var center = $scope.map.getCenter();
        
        $scope.$storage.lat = center.lat();
        $scope.$storage.lng = center.lng();
        $scope.$storage.zoom = $scope.map.getZoom();
        
        $location.search('lat', $scope.$storage.lat);
        $location.search('lng', $scope.$storage.lng);
        $location.search('zoom', $scope.$storage.zoom);
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
    $scope.options = {
        center: new google.maps.LatLng($scope.$storage.lat || 0, $scope.$storage.lng || 0),
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        draggableCursor: 'crosshair',
        draggingCursor: 'move',
        mapTypeControl: false,
        /*mapTypeControlOptions: {
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
        zoomControl: false,
        zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
            style: google.maps.ZoomControlStyle.SMALL
        }
    };
    $scope.flash = false;
    
    function flash() {
        // Use timeouts to allow digest cycles
        $timeout(function() {
            $scope.flash = true;
        });
        $timeout(function() {
            $scope.flash = false;
        });
    }
    $scope.$on('image.flash', flash);
    
    // Listen once; when the map is defined, load its watchers
    var unbindMap = $scope.$watch('map', function() {
        if ($scope.map == undefined) return;
        
        google.maps.event.addListenerOnce($scope.map, 'idle', function() {
            google.maps.event.trigger($scope.map, 'resize');
        });
        $rootScope.$broadcast('map', $scope.map);
        updateStyle();

        $scope.$watch('location.url()', syncUrl);
        syncUrl();

        if (!$scope.$storage.lat || !$scope.$storage.lng) panToCurrentLocation();
        unbindMap();
    });
}

function MapControlsController($scope, $rootScope, $localStorage) {
    $scope.$storage = $localStorage;
    
    var map;
    var drawings;
    
    // Catch values from other controllers
    var unbindMap = $scope.$on('map', function($event, $param) {
        map = $param;
        unbindMap();
    });
    var unbindDrawings = $scope.$on('drawings', function($event, $param) {
        drawings = $param;
        unbindDrawings();
    });
    
    $scope.getMapTypeId = function() {
        if (!map) return;
        return map.getMapTypeId();
    };
    $scope.setMapTypeId = function(mapType) {
        if (!map) return;
        map.setMapTypeId(mapType);
    };
    // Zoom functions
    $scope.zoomIn = function() {
        if (!map) return;
        console.log('zoom in');
        map.setZoom(++$scope.$storage.zoom);
    };
    $scope.zoomOut = function() {
        if (!map) return;
        console.log('zoom out');
        map.setZoom(--$scope.$storage.zoom);
    };
    
    // Make map contain drawings
    $scope.fitDrawings = function() {
        if (drawings === undefined && map === undefined) return;
        
        var bounds = new google.maps.LatLngBounds();
        
        var drawing, polyPath;
        for (var i = 0; i < drawings.length; i++) {
            drawing = drawings[i];
            polyPath = drawing._poly.getPath().getArray();
            
            for (var j = 0; j < polyPath.length; j++) {
                bounds.extend(polyPath[j]);
            }
            
            map.fitBounds(bounds);
        }
    };
}

function DrawingController($scope, $rootScope, $location, $localStorage, $q, utilityService) {
    console.log('DrawingsController');
    $scope.$storage = $localStorage;

    function makeHexColor(drawing, alpha) {
        var color = $scope.$storage.colors[drawing.activeColor];
        return utilityService.color.toHex(color.rgba, alpha);
    }
    function makeIcon(drawing, isNodeMarker, hide) {
        var scale;
        
        if (hide) {
            return {
                path: google.maps.SymbolPath.CIRCLE,
                strokeOpacity: 0,
                strokeWeight: 0
            }
        }
        
        if (isNodeMarker) {
            scale = 20;
        } else {
            scale = 10;
        }
        
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: scale,
            strokeColor: makeHexColor(drawing, false),
            strokeOpacity: 1,
            strokeWeight: 2.5
        };
    }
    function makeLatLng(node) {
        return new google.maps.LatLng(node.lat, node.lng);
    }
    function makeMarkerOptions(drawing, node, isNodeMarker) {
        var clickable, cursor, draggable;
        
        if (isNodeMarker) {
            clickable = false;
            cursor = 'none';
            draggable = false;
        } else {
            clickable = true;
            cursor = 'pointer';
            draggable = false;
        }
        
        return {
            clickable: clickable,
            crossOnDrag: false,
            cursor: cursor,
            draggable: draggable,
            flat: true,
            icon: makeIcon(drawing, isNodeMarker),
            map: map,
            position: makeLatLng(node)
        };
    }
    function makeMarker(drawing, node, isNodeMarker) {
        return new google.maps.Marker(makeMarkerOptions(drawing, node, isNodeMarker));
    }
    function makePolylineOptions(drawing) {
        var color = $scope.$storage.colors[drawing.activeColor];
        return {
            clickable: true,
            draggable: false,
            editable: false,
            strokeColor: '#' + makeHexColor(drawing, false),
            strokeOpacity: color.rgba.a,
            strokeWeight: color.weight,
            map: map
        };
    }
    function makePolygonOptions(drawing) {
        var color = $scope.$storage.colors[drawing.activeColor];
        return {
            clickable: false,
            draggable: false,
            editable: false,
            fillColor: '#' + makeHexColor(drawing, false),
            fillOpacity: color.rgba.a,
            map: $scope.map,
            strokeWeight: 0
        };
    }
    function makePolyline(drawing) {
        return new google.maps.Polyline(makePolylineOptions(drawing));
    }
    function makePolygon(drawing) {
        return new google.maps.Polygon(makePolygonOptions(drawing));
    }
    function makePoly(drawing) {
        if (drawing.polygon) return makePolygon(drawing);
        else return makePolyline(drawing);
    }
    function makePath(start, end, rigid) {
        var deferred;
        if (rigid) {
            path = [start, end];
        } else {
            // Get the directions path, use it
            utilityService.map.directions(start, end).then(function(resultPath) {
                // Success
                path = resultPath;
                console.log('makePath success:', path);
            }, function(status) {
                // Failure
                console.error('The directions request failed. Status:', status);
            });
        }
        console.log('makePath:', path);
        return path;
    }

    function spliceDrawing(drawingIndex, removeLength, newDrawing) {
        if (newDrawing !== undefined) $scope.drawings.splice(drawingIndex, removeLength, newDrawing);
        else $scope.drawings.splice(drawingIndex, removeLength);
    }
    function splicePolyPath(drawingIndex, nodeIndex, removeLength, newPath) {
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

        var drawing = $scope.drawings[drawingIndex];
        
        drawing.nodes.splice(nodeIndex, removeLength, newNode);
        
        // Add the new node to the existing nodes
        if (typeof newNode !== 'object') console.error('newNode is not an object');

        var path = [];
        
        // Create a marker at the specified location
        if (!drawing.nodes[nodeIndex]._marker) drawing.nodes[nodeIndex]._marker = makeMarker(drawing, newNode);
        
        // If there are at least two points...
        if (drawing.nodes.length > 1) {
            // Let user know something's going on
            utilityService.throb.on();
            
            // Generate polyline, act when resolved
            utilityService.map.makePath(makeLatLng(drawing.nodes[nodeIndex - 1]), makeLatLng(drawing.nodes[nodeIndex]), drawing.nodes[nodeIndex].rigid)
            .then(function(path) {
                // Add all previous indicies to find current index
                var pathIndex = 0;
                for (var i = 0; i < nodeIndex; i++) {
                    pathIndex += drawing.nodes[i].index;
                }
                
                // Add length of new path to index
                pathIndex += path.length;
                drawing.nodes[nodeIndex].index = pathIndex;
        
                // Update the poly
                splicePolyPath(drawingIndex, nodeIndex, 0, path);
                
                // Move marker to end of poly; keeps on shape. Also mark using last argument 'true'
                updateNodeLatLng(drawingIndex, nodeIndex, path[path.length - 1], true);
                
                if (drawing.nodes.length == 2) {
                    updateNodeLatLng(drawingIndex, 0, path[0]);
                }
            })
            .finally(utilityService.throb.off);
        } else { // Otherwise, put a inital index of 0
            drawing.nodes[nodeIndex].index = 0;
        }
    }
    
    function updateNodeLatLng(drawingIndex, nodeIndex, latLng, mark) {
        var node = $scope.drawings[drawingIndex].nodes[nodeIndex];
        
        node._marker.setPosition(latLng);
        node.lat = latLng.lat();
        node.lng = latLng.lng();
        
        if (mark) markNode(drawingIndex, nodeIndex);
    }
    function pushNode(newNode) {
        var drawingIndex = $scope.drawings.length;
        console.log($scope.$storage.new);
        if ($scope.$storage.new) {
            // Add a new drawing
            var drawing = {
                polygon: $scope.$storage.polygon,
                activeColor: $scope.$storage.activeColor,
                nodes: []
            }
            drawing._poly = makePoly(drawing);
            spliceDrawing(drawingIndex, 0, drawing);
        } else {
            // Set to length - 1 for last drawing
            drawingIndex--;
        }
        
        // Get the index for the new node
        var nodeIndex = $scope.drawings[drawingIndex].nodes.length;
        
        // Add node to end of current drawing
        spliceNode(drawingIndex, nodeIndex, 0, newNode);
        
        // Identify the latest node
        markNode(drawingIndex, nodeIndex);
    }
    
    function markNode(drawingIndex, nodeIndex, hide) {
        if (typeof drawingIndex === 'number' && typeof nodeIndex === 'number') {
            var drawing = $scope.drawings[drawingIndex];
            var node = drawing.nodes[nodeIndex];
        }
        var icon = makeIcon(drawing, true, hide);
        
        if (!hide) {
            nodeMarker.setPosition(makeLatLng(node));
        }
        nodeMarker.setIcon(icon);
    }
    
    function map_click($event, $params) {
        var newNode = {
            lat: $params[0].latLng.lat(),
            lng: $params[0].latLng.lng(),
            rigid: $scope.$storage.rigid
        };
        
        pushNode(newNode);
    }
    $scope.marker_click = function(drawingIndexOfMarker, nodeIndexOfMarker) {
        var node = $scope.drawings[drawingIndexOfMarker].nodes[nodeIndexOfMarker];
        
        var newNode = {
            lat: node._marker.getPosition().lat(),
            lng: node._marker.getPosition().lng(),
            rigid: $scope.$storage.rigid
        };
        
        pushNode(newNode);
    };
    $scope.polyline_click = function($params) {
        var newNode = {
            lat: $params[0].latLng.lat(),
            lng: $params[0].latLng.lng(),
            rigid: $scope.$storage.rigid
        };
        
        pushNode(newNode)
    };

    function clear() {
        // Hide nodeMarker
        markNode(null, null, true);
        
        // Remove every poly, marker from map
        for (var drawingIndex = 0; drawingIndex < $scope.drawings.length; drawingIndex++) {
            $scope.drawings[drawingIndex]._poly.setMap(null);

            for (var nodeIndex = 0; nodeIndex < $scope.drawings[drawingIndex].nodes.length; nodeIndex++) {
                $scope.drawings[drawingIndex].nodes[nodeIndex]._marker.setMap(null);
            }
        }
        
        // Empty drawings while preserving the reference
        $scope.drawings.length = 0;
    }
    function undo() {
        
    }

    var map;
    var nodeMarker;
    $scope.drawings = [];
        
    // When MapController emits the value of map, capture it.
    var unbindMap = $scope.$on('map', function($event, $param) {
        map = $param;
        nodeMarker = makeMarker({
            activeColor: $scope.$storage.activeColor
        }, {
            lat: 0,
            lng: 0
        }, true);
        
        unbindMap();
    });
    $scope.$on('map.click', map_click);
    $scope.$on('drawing.clear', clear);
    $scope.$on('drawing.undo', undo);
    
    $scope.$storage.override = false;
    var drawingsLength;
    function updateNew() {
        // Check for drawings
        if (!$scope.drawings) return;
        
        // If drawings is empty, new is true
        if ($scope.drawings.length === 0) {
            $scope.$storage.new = true;
            return;
        }
        
        // Define latest indicies of drawings
        var drawingIndex = $scope.drawings.length - 1;
        var nodeIndex = $scope.drawings[drawingIndex].nodes.length - 1;
        
        // drawingLength is undefined unless override is true
        if (drawingsLength === undefined) {
            // Automatically set value of new
            $scope.$storage.new = ($scope.drawings.length === 0 ||
                $scope.$storage.activeColor !== $scope.drawings[drawingIndex].activeColor ||
                $scope.drawings[drawingIndex].nodes.length === 0);
        }
        
        // If override is true, new is true
        if ($scope.$storage.override) {
            // If drawings length or color changed, cancel
            if ((drawingsLength !== undefined &&
                drawingsLength !== $scope.drawings.length) ||
                $scope.$storage.activeColor !== $scope.drawings[drawingIndex].activeColor) {
                $scope.$storage.override = false;
            } else {
                $scope.$storage.new = true;
            }
            
            // Capture drawings length
            drawingsLength = $scope.drawings.length;
        } else {
            // If override was just disabled, automatically determine value of new
            if (drawingsLength !== undefined) {
                $scope.$storage.new = ($scope.drawings.length === 0 ||
                    $scope.$storage.activeColor !== $scope.drawings[drawingIndex].activeColor ||
                    $scope.drawings[drawingIndex].nodes.length === 0);
            }
            drawingsLength = undefined;
        }
        
        // If new is true, override is false
        if ($scope.$storage.new) {
            // Hide node marker
            markNode(null, null, true);
        } else {
            // Sync node marker
            markNode(drawingIndex, nodeIndex);
        }
        
        /*var drawing = $scope.drawings[$scope.drawings.length - 1];
        if ($scope.$storage.override &&
            $scope.$storage.activeColor === drawing.activeColor) {
                if (drawingsLength === undefined) {
                    drawingsLength = $scope.drawings.length;
                    $scope.$storage.new = true;
                }
                if (drawingsLength !== $scope.drawings.length) {
                    $scope.$storage.override = false;
                    drawingsLength = undefined;
                }
            }
        
        if (!$scope.$storage.override) $scope.$storage.new = ($scope.drawings.length === 0 ||
            $scope.$storage.activeColor !== drawing.activeColor ||
            drawing.nodes.length === 0);
        
        if ($scope.$storage.new) markNode(null, null, true);
        else {
            
            markNode(drawingIndex, nodeIndex);
        }*/
    }
    var unbindDrawings = $scope.$watch('drawings', function() {
        if ($scope.drawings === undefined) return;
        console.log('drawings created');
        $rootScope.$broadcast('drawings', $scope.drawings);
        unbindDrawings();
    });
    
    // Keep 'new' up to date
    $scope.$watch(updateNew);
    $scope.$watch('$storage.new');
    
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
}

function ActionController($scope, $rootScope, $localStorage) {
    $scope.$storage = $localStorage;
    
    $scope.undo = function() {
        $rootScope.$broadcast('drawing.undo');
    };
    $scope.clear = function() {
        $rootScope.$broadcast('drawing.clear');
    };
}

function ImageController($scope, $rootScope, $localStorage, $timeout, utilityService) {
    $scope.$storage = $localStorage;
    
    $scope.$storage.imageUrl = '';
    $scope.$storage.imageThrob = false;
    $scope.loadImage = function() {
        var imageUrl = createUrl();
        if (!imageUrl) return;

        if (imageUrl.length <= 2048) {
            if ($scope.$storage.imageUrl !== imageUrl) {
                $rootScope.$broadcast('image.flash');
                $scope.$storage.imageThrob = true;
                $scope.$storage.imageUrl = imageUrl;
            }
        } else {
            window.alert('Your image is too complex!');
        }
    };
    $scope.fullscreen = function() {
        $scope.$storage.fullscreen = true;
        $scope.loadImage();
    }
    
    var drawings;
    $scope.$on('drawings', function($event, $param) {
        console.log('drawing');
        drawings = $param;
        $scope.loadImage();
    });
    
    var computeHeading = google.maps.geometry.spherical.computeHeading;
    
    // Prevents serialization of hidden properties (AngularJS = '$', Boundaries = '_')
    function censor(key, value) {
        if (typeof key == 'string') var substring = key.substring(0, 1);
        if (substring && (substring == '_' || substring == '$')) return undefined;
        return value;
    }
    function stripDrawings() {
        return JSON.stringify(drawings, censor);
    }
    
    // Create URL from style and drawing
    function createUrl() {
        if (!drawings) return;
        
        var path = 'https://maps.googleapis.com/maps/api/staticmap';
        
        var params = [];
        
        var pxSize = utilityService.image.pxSize(640, 640);
        
        // Generate style from map styling and drawings
        var i, j;
        var rule, urlRule, styler, key, value;
        for (i = 0; i < $scope.$storage.style.length; i++) {
            rule = $scope.$storage.style[i];
            urlRule = [];
             
            // Add selectors to urlRule
            if ('featureType' in rule && rule.featureType !== 'all') urlRule.push('feature:' + rule.featureType);
            if ('elementType' in rule && rule.elementType !== 'all') urlRule.push('element:' + rule.elementType);
            
            // Loop through every styler, add to urlRule
            for (j = 0; j < rule.stylers.length; j++) {
                styler = rule.stylers[j];
                
                for (key in styler) {
                    value = styler[key];
                    
                    if (key === 'color') value = '0x' + value.substring(1);
                    
                    urlRule.push(key + ':' + value);
                }
            }
            
            urlRule = urlRule.join('|');
            
            // Add urlRule to params if not empty string
            if (urlRule) {
                params.push('style=' + urlRule);
            }
        }
        
        // Generate paths from drawings
        var drawing, urlPath, polyPath, encodedPath, color, hex;
        var bounds = new google.maps.LatLngBounds();
        for (i = 0; i < drawings.length; i++) {
            urlPath = [];
            drawing = drawings[i];
            polyPath = drawing._poly.getPath().getArray();
            
            for (j = 0; j < polyPath.length; j++) {
                bounds.extend(polyPath[j]);
            }
            
            encodedPath = google.maps.geometry.encoding.encodePath(polyPath);
            color = $scope.$storage.colors[drawing.activeColor];
            hex = '0x' + utilityService.color.toHex(color.rgba);
            
            // If drawing is polygon, use 'fillcolor'
            if (drawing.polygon) {
                urlPath.push('color:0x00000000');
                urlPath.push('fillcolor:' + hex);
            } else {
                urlPath.push('color:' + hex);
                urlPath.push('weight:' + color.weight);
            }
            urlPath.push('enc:' + encodedPath);
            
            urlPath = urlPath.join('|');
            
            // Add urlPath to params if not empty string
            if (urlPath) {
                params.push('path=' + urlPath);
            }
        }
        
        var northEast = bounds.getNorthEast();
        var southWest = bounds.getSouthWest();
        
        var heading = Math.abs(computeHeading(northEast, southWest) + computeHeading(southWest, northEast)) / 2;
        
        // Check orientation
        if ((45 <= heading && heading < 135) == (pxSize.ratio >= 1)) {
            // Landscape
            params.push('size=' + pxSize.height + 'x' + pxSize.width);
        } else {
            // Portrait
            params.push('size=' + pxSize.width + 'x' + pxSize.height);
        }
        
        params.push('format=' + $scope.$storage.format);
        params.push('scale=2');
        params.push('sensor=true');
        
        return encodeURI(path + '?' + params.join('&'));
    }
    
    $scope.$watch(stripDrawings, function() {
        var url = createUrl();
        if (!url) return;
    });
}

function LightboxController($scope, $localStorage) {
    $scope.$storage = $localStorage;
}

function ThrobController($scope, $localStorage) {
    $scope.$storage = $localStorage;
    
    $scope.$storage.mapThrobCounter = 0;
    $scope.$on('throb', function(event, count) {
        if (count === true) $scope.$storage.mapThrobCounter++;
        if (count === false) $scope.$storage.mapThrobCounter--;
    });
}

function SearchController($scope, $sce, $timeout, utilityService) {
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
            $scope.active = 0;
            return;
        }
        
        if ($scope.suggestions[$scope.active]) {
            if (enter) {
                $scope.loadPlace($scope.suggestions[$scope.active].reference);
            } else if (up && $scope.active > -1) {
                $scope.active--;
            } else if (down && $scope.active < $scope.suggestions.length - 1) {
                $scope.active++;
            }
        }
    };
    
    $scope.query = '';
    $scope.suggestions = [];
    $scope.active = -1;
    
    $scope.$watch('query', function(newVal) {
        utilityService.map.suggestions($scope.query).then(formatSuggestions, errorMessage);
        if (newVal !== $scope.query) $timeout($scope.$apply);
    });
    function refreshResults() {
        $scope.$apply();
    }
    // Bolds matched substrings
    function formatSuggestions(suggestions) {
        for (var i = 0; i < suggestions.length; i++) {
            var desc = suggestions[i].description;
            console.log(angular.copy(suggestions[i]));
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
        $scope.suggestions = suggestions;
    }
    // Notifies user that no results were found
    function errorMessage(message) {
        if (typeof message == 'string') $scope.suggestions = [{
            description: $sce.trustAsHtml('<i>' + message + '</i>'),
            error: true
        }];
    }
}
