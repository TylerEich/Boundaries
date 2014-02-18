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
boundaries.directive('bndHotkey', ['$document', '$rootScope', function($document, $rootScope) {
    return {
        restrict: 'E',
        scope: {
            keycode: '&',
            
            local: '&',
            
            ctrlKey: '&ctrl',
            altKey: '&alt',
            metaKey: '&meta',
            shiftKey: '&shift',
            
            action: '&'
        },
        link: function(scope, element, attr) {
            // console.log('Linking hotkey');
            function handleKeydown($event) {
                if (!'keycode' in scope) {
                    console.error('Missing "keycode" attribute for', element);
                    return;
                }
                if (scope.keycode() != $event.which) return;
                
                var matchCtrl = ($event.ctrlKey == Boolean(scope.ctrlKey()));
                var matchAlt = ($event.altKey == Boolean(scope.altKey()));
                var matchMeta = ($event.metaKey == Boolean(scope.metaKey()));
                var matchShift = ($event.shiftKey == Boolean(scope.shiftKey()));
                
                var matchKeycode = ($event.keyCode == scope.keycode());
                
                // console.log(
                //     "matchCtrl:", matchCtrl,
                //     "matchAlt:", matchAlt,
                //     "matchMeta:", matchMeta,
                //     "matchShift:", matchShift,
                //     "matchKeycode", matchKeycode
                // );
                if (matchCtrl && matchAlt && matchMeta && matchShift && matchKeycode) {
                    $event.stopPropagation();
                    $event.preventDefault();
                    scope.$apply(scope.action);
                }
            }
            
            if (scope.local()) {
                element.on('keydown', handleKeydown);
            } else {
                $document.on('keydown', handleKeydown);
            }
        }
    }
}]);

// Register all services
boundaries.service('utilityService', ['$rootScope', '$localStorage', '$q', '$http', utilityService]);

// Register all controllers
// Every controller that needs to communicate gets $rootScope
boundaries.controller('DescriptionController', ['$scope', '$sce', DescriptionController]);
boundaries.controller('HotkeyController', ['$scope', HotkeyController]);
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
    var geocoder = new google.maps.Geocoder();
    var placeService;
    var map;
    $rootScope.$storage = $localStorage;
    
    $rootScope.$on('map', function(event, param) {
        map = param;
        placeService = new google.maps.places.PlacesService(map);
    });
    
    this.throb = {
        on: function() {
            $rootScope.$storage.mapThrobCounter++;
            // $rootScope.$apply();
        },
        off: function() {
            if ($rootScope.$storage.mapThrobCounter <= 0) return;
            $rootScope.$storage.mapThrobCounter--;
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
        geocode: function(request) {
            function load(results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    deferred.resolve(results);
                } else {
                    deferred.reject();
                }
                $rootScope.$apply();
            }
            
            var deferred = $q.defer();
            geocoder.geocode(request, load);
            
            return deferred.promise;
        },
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
        makePath: function(locations, rigid) {
            var deferred = $q.defer();
            if (rigid) {
                deferred.resolve(locations);
            } else {
                if (locations.length >= 2 && locations.length <= 10) {
                    var start = locations.shift();
                    var end = locations.pop();
                    
                    for (var i; i < locations.length; i++) {
                        // Put remaining locations in waypoint format
                        locations[i] = {
                            location: locations[i]
                        };
                    }
                } else {
                    console.error('Length of locations is not between 2 and 10');
                    deferred.reject();
                    return deferred.promise;
                }
                directions.route({
                    origin: start,
                    destination: end,
                    waypoints: locations,
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
function HotkeyController($scope) {
    $scope.isMac = (navigator.platform.lastIndexOf('Mac') === 0);
    
    if ($scope.isMac) {
        $scope.metaString = "⌘";
        $scope.altString = "⌥";
        $scope.ctrlString = "⌃";
        $scope.shiftString = "⇧";
    } else {
        $scope.metaString = "Win+";
        $scope.altString = "Alt+";
        $scope.ctrlString = "Ctrl+";
        $scope.shiftString = "Shift+";
    }
}

function DescriptionController($scope, $sce) {
    var location = [];
    $scope.title = function() {
        if (location.length > 0) {
            return $sce.trustAsHtml(location.join(', ') + ' | Boundaries');
        }
        return $sce.trustAsHtml('Boundaries');
    };
    $scope.locality = function() {
        return $sce.trustAsHtml(location.join(', '));
    };
    $scope.$on('geocode.result', function($event, $param) {
        // If $param is empty
        if (!$param) {
            location = ['Unknown Locality'];
        }
        
        var city, locality; // 'state' can be any area larger than city
        var localityCheck = 0;
        var i, j;
        
        var components = $param[0].address_components;
        for (i = 0; i < components.length; i++) {
            // If this is locality (city)
            if (components[i].types.indexOf('locality') > -1) {
                city = components[i].long_name;
                break;
            }
        }
        
        var localityOptions = [
        'administrative_area_level_1',
        'administrative_area_level_2',
        'administrative_area_level_3',
        'country'
        ];
        for (i = 0; i < 4; i++) {
            // Get any available adminstrative area
            for (j = 0; j < components.length; j++) {
                // console.log(localityCheck === i, j);
                // console.log(components[j], localityOptions[j]);
                if (components[j].types.indexOf(localityOptions[i]) > -1) {
                    locality = components[j].short_name;
                }
                if (locality) break;
            }
            if (locality) break;
        }
        
        location = [city, locality];
    });
}

function SettingController($scope, $localStorage, utilityService) {
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
        mapTypeId: 'custom',
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
    
    $scope.show = false;
    $scope.pxSize = utilityService.image.pxSize;
    $scope.$on('settings', function() {
        $scope.show = !$scope.show;
        // $scope.$apply();
    });
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
    
    var useExact;
    function panToCurrentLocation() {
        var location;
        if (useExact === undefined || useExact === false) {
            $rootScope.$broadcast('map.throb', true);
            $rootScope.$broadcast('currentLocation.throb', true);
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
                $rootScope.$broadcast('map.throb', false);
                $rootScope.$broadcast('currentLocation.throb', false);
            });
        }
        if (useExact === undefined || useExact === true) {
            $rootScope.$broadcast('map.throb', true);
            $rootScope.$broadcast('currentLocation.throb', true);
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
                        useExact = false;
                        break;
                }
                $localStorage.settings.search.show = true;
            }).
            finally(function() {
                $rootScope.$broadcast('map.throb', false);
                $rootScope.$broadcast('currentLocation.throb', false);
            });
        }
    }
    $scope.$on('map.currentLocation', function() {
        useExact = true;
        panToCurrentLocation();
    });
    
    $scope.$on('map.throb', function($event, $param) {
        if ($param) $scope.throbCount++;
        if (!$param && $scope.throbCount > 0) $scope.throbCount--;
    });
    $scope.$on('map.throb.wait', function($event, $param) {
        $scope.throbWait = $param;
    });
    
    // Event binders
    $scope.$storage = $localStorage;
    
    $scope.map_click = function($param) {
        $scope.$broadcast('map.click', $param);
    };
    $scope.map_idle = function() {
        // Update URL
        var center = $scope.map.getCenter();
        
        $scope.$storage.lat = center.lat();
        $scope.$storage.lng = center.lng();
        $scope.$storage.zoom = $scope.map.getZoom();
        
        $location.search('lat', $scope.$storage.lat);
        $location.search('lng', $scope.$storage.lng);
        $location.search('zoom', $scope.$storage.zoom);
        
        // Update City
        utilityService.map.geocode({
            location: $scope.map.getCenter()
        })
        .then(function(results) {
            $rootScope.$broadcast('geocode.result', results);
        }, function() {
            $rootScope.$broadcast('geocode.result');
        });
    };
    $scope.map_maptypeid_changed = function() {
        $scope.$storage.mapTypeId = $scope.map.getMapTypeId();
    }
    
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
    
    // Flash animation
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
        
        $scope.map.setMapTypeId($scope.$storage.mapTypeId);
        
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
    
    $scope.$on('currentLocation.throb', function($event, $param) {
        $scope.locationThrob = $param;
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
        map.setZoom(++$scope.$storage.zoom);
    };
    $scope.zoomOut = function() {
        if (!map) return;
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
    
    // Current location
    $scope.currentLocation = function() {
        $rootScope.$broadcast('map.currentLocation');
    }
}

function DrawingController($scope, $rootScope, $location, $localStorage, $q, utilityService) {
    $scope.$storage = $localStorage;
    var pathPromises = [];
    
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
    function makeMarkerOptions(drawing, node, isNodeMarker, hide) {
        var clickable, cursor, draggable;
        
        if (isNodeMarker) {
            clickable = false;
            cursor = 'none';
            draggable = false;
        } else {
            clickable = true;
            cursor = 'pointer';
            draggable = true;
        }
        
        return {
            clickable: clickable,
            crossOnDrag: false,
            cursor: cursor,
            draggable: draggable,
            flat: true,
            icon: makeIcon(drawing, isNodeMarker, hide),
            map: map,
            position: makeLatLng(node)
        };
    }
    function makeMarker(drawing, node, isNodeMarker, hide) {
        return new google.maps.Marker(makeMarkerOptions(drawing, node, isNodeMarker, hide));
    }
    function makePolylineOptions(drawing) {
        var color = $scope.$storage.colors[drawing.activeColor];
        return {
            clickable: true,
            draggable: false,
            editable: true,
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
    
    // function trimPathEnd(drawingIndex, nodeIndex, path) {
    //     var drawing = $scope.drawings[drawingIndex];
    //     var polyPath = drawing._poly.getPath();
    //     var index = drawing.nodes[nodeIndex + 1].index;
    //     
    //     return path;
    // }
    function isSameLatLng(latLng1, latLng2) {
        return (latLng1.lat() == latLng2.lat() && latLng1.lng() == latLng2.lng());
    }
    function spliceDrawing(drawingIndex, removeLength, newDrawing) {
        if (newDrawing !== undefined) $scope.drawings.splice(drawingIndex, removeLength, newDrawing);
        else $scope.drawings.splice(drawingIndex, removeLength);
    }
    function splicePolyPath(drawingIndex, nodeIndex, newPath) {
        // if (!removeLength) removeLength = 0;
        
        var drawing = $scope.drawings[drawingIndex];
        var path = drawing._poly.getPath().getArray();
        var index = drawing.nodes[nodeIndex].index;
        
        console.log('nodeIndex:', nodeIndex);
        if (isNaN(index)) {
            if (path.length == 0) index = 0;
            else index = path.length - 1;
        }
        
        var i, latLng1, latLng2;
        
        // If not first node
        // if (nodeIndex > 0) {
//             // Get index of previous node
//             var nextIndex = drawing.nodes[nodeIndex - 1].index;
//             // console.log(nextIndex);
//             
//             // If no index, default start of path
//             if (isNaN(nextIndex)) {
//                 nextIndex = 0;
//             }
//             console.log('Previous Node:', nextIndex);
//             
//             // Assign latLng values
//             latLng1 = newPath[0];
//             latLng2 = path[nextIndex];
//             
//             if (isSameLatLng(latLng1, latLng2)) {
//                 newPath.splice(0, 1);
//                 // removeLength--;
//             }
//         }
        
        for (i = 0; i < newPath.length - 1; i++) {
            latLng1 = newPath[i];
            latLng2 = newPath[i + 1];
            
            if (isSameLatLng(latLng1, latLng2)) {
                // Remove the second point
                newPath.splice(i, 1);
                
                // Decrement removeLength
                // removeLength--;
            }
        }
        
        // If not last node
        if (nodeIndex < drawing.nodes.length - 1) {
            // Get index of next node
            var nextIndex = drawing.nodes[nodeIndex + 1].index;
            
            // If no index, default end of path
            if (isNaN(nextIndex)) {
                if (path.length == 0) nextIndex = 0;
                else nextIndex = path.length - 1;
            }
            console.log('Next Node:', nextIndex);
            
            // Assign latLng values
            latLng1 = newPath[i]; // No +1: i already incremented by for loop above
            latLng2 = path[nextIndex];
            
            if (isSameLatLng(latLng1, latLng2)) {
                newPath.splice(i, 1);
                // removeLength--;
            }
        }
        
        var removeLength;
        if (nodeIndex < drawing.nodes.length - 1) {
            removeLength = drawing.nodes[nodeIndex + 1].index - drawing.nodes[nodeIndex].index;
        } else {
            removeLength = 1;
        }
        
        // If not first node
        // if (nodeIndex > 0) {
        //     // Get index of previous node
        //     var nextIndex = drawing.nodes[nodeIndex - 1].index;
        //     
        //     // If no index, default start of path
        // 
        //     console.log('Previous Node:', nextIndex);
        //     
        //     // Assign latLng values
        //     latLng1 = newPath[0];
        //     latLng2 = path[nextIndex];
        //     
        //     if (isSameLatLng(latLng1, latLng2)) {
        //         removeLength++;
        //         // removeLength--;
        //     }
        // }

        console.log('newPath:', newPath);
        
        console.log('Before removal:', path);
        // Remove specified items
        path.splice(index, removeLength);
        console.log('After removal:', path);
        
        // Inject newPath
        for (i = 0; i < newPath.length; i++) {
            path.splice(index + i, 0, newPath[i]);
        }
        console.log('After injection:', path);
        
        // Put manipulated path into poly
        drawing._poly.setPath(path);
        
        // Update indicies of nodes
        for (i = nodeIndex; i < drawing.nodes.length; i++) {
            // If no index, set to last index
            if (isNaN(drawing.nodes[i].index)) {
                if (path.length == 0) drawing.nodes[i].index = 0;
                else drawing.nodes[i].index = path.length - 1;
            } else {
                drawing.nodes[i].index += newPath.length;
            }
        }
    }
    function spliceNode(drawingIndex, nodeIndex, removeLength, newNode) {
        if (drawingIndex > $scope.drawings.length) {
            console.error('drawingIndex > $scope.drawings.length');
            return;
        }

        var drawing = $scope.drawings[drawingIndex];
        
        drawing.nodes.splice(nodeIndex, removeLength, newNode);

        var path = [];
        
        // Create a marker at the specified location
        if (!('_marker' in drawing.nodes[nodeIndex])) drawing.nodes[nodeIndex]._marker = makeMarker(drawing, newNode);
        
        updateNodePath(drawingIndex, nodeIndex);
    }
    
    function updateDrawingPoly(drawingIndex, isPolygon) {
        if ($scope.$storage.new === true) return;
        if (typeof drawingIndex !== 'number') {
            console.error('drawingIndex is not a number');
            return;
        }
        
        var drawing = $scope.drawings[drawingIndex];
        var path;
        
        // Only polygons have getPaths method
        var drawingIsPolygon = ('getPaths' in drawing._poly);
        
        // Check if desired poly is different than current poly
        if (isPolygon !== drawingIsPolygon) {
            path = drawing._poly.getPath();
            drawing.polygon = isPolygon;
            
            drawing._poly.setMap(null);
            drawing._poly = makePoly(drawing);
            drawing._poly.setPath(path);
        }
    }
    function updateNodeLatLng(drawingIndex, nodeIndex, latLng, mark) {
        var node = $scope.drawings[drawingIndex].nodes[nodeIndex];
        // console.log(node, $scope.drawings);
        node._marker.setPosition(latLng);
        node.lat = latLng.lat();
        node.lng = latLng.lng();
        
        if (mark) markNode(drawingIndex, nodeIndex);
    }
    function updateNodePath(drawingIndex, nodeIndex) {
        var drawing = $scope.drawings[drawingIndex];
        var node1 = drawing.nodes[nodeIndex - 1];
        var node2 = drawing.nodes[nodeIndex];
        
        if (!node1 && node2) {
            node1 = node2;
        }
        if (!node2) {
            console.error('node2 is incorrect');
            return;
        }
        
        // console.log(node1, node2);
        // Capture index
        // var index1 = node1.index;
        // var index2 = node2.index;
        
        // Create array of locations
        var locations = [];
        
        locations.push(node1._marker.getPosition());
        locations.push(node2._marker.getPosition());
        
        // Let user know something's going on
        if (!node2.rigid) $rootScope.$broadcast('map.throb', true);
        
        // Make path
        utilityService.map.makePath(locations, node2.rigid)
        .then(function(path) {
            console.log('makePath:', path);
            
            if (!drawing || !node1 || !node2) return;
            
            var isLatestNode = isNaN(node2.index);
            
            splicePolyPath(drawingIndex, nodeIndex, path);
            
            updateNodeLatLng(drawingIndex, nodeIndex, path[0]);
            console.log('Drawing Path:', drawing._poly.getPath().getLength(), drawing._poly.getPath().getArray());
            console.log('Drawing Nodes:', drawing.nodes[drawing.nodes.length - 1].index, drawing.nodes);
            if (isLatestNode && drawing.nodes.length > 1) updateNodeLatLng(drawingIndex, nodeIndex, path[path.length - 1]);
        })
        .finally(function() {
            if (!node2.rigid) $rootScope.$broadcast('map.throb', false);
        });
    }
    function pushNode(newNode) {
        var drawingIndex = $scope.drawings.length;
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
        
        pushNode(newNode);
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
        }, true, true);
        
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
    }
    var unbindDrawings = $scope.$watch('drawings', function() {
        if ($scope.drawings === undefined) return;
        $rootScope.$broadcast('drawings', $scope.drawings);
        unbindDrawings();
    });
    
    // Keep new up to date
    $scope.$watch(updateNew);
    $scope.$watch('$storage.new');
    
    // Watch polygon, update current poly to reflect state
    $scope.$watch('$storage.polygon', function() {
        if ($scope.drawings.length < 1) return;
        updateDrawingPoly($scope.drawings.length - 1, $scope.$storage.polygon);
    });
    
    $scope.marker_dragstart = function(drawingIndex, nodeIndex) {
        console.log('Drag Start:', drawingIndex, nodeIndex);
        // If line is flexible
        if (!$scope.drawings[drawingIndex].nodes[nodeIndex].rigid) {
            $rootScope.$broadcast('map.throb.wait', true);
        }
    };
    $scope.marker_drag = function(drawingIndex, nodeIndex) {
        var location = $scope.drawings[drawingIndex].nodes[nodeIndex]._marker.getPosition();
        updateNodeLatLng(drawingIndex, nodeIndex, location);
        
        if ($scope.drawings[drawingIndex].nodes[nodeIndex].rigid) updateNodePath(drawingIndex, nodeIndex);
    }
    $scope.marker_dragend = function(drawingIndex, nodeIndex) {
        console.log('Drag End:', drawingIndex, nodeIndex);
        // If line is flexible
        if (!$scope.drawings[drawingIndex].nodes[nodeIndex].rigid) {
            // console.log('Is Flexible');
            $rootScope.$broadcast('map.throb.wait', false);
            updateNodePath(drawingIndex, nodeIndex);
        }
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
    $scope.hotkeyFullscreen = function() {
        $scope.$storage.fullscreen = !$scope.$storage.fullscreen;
        if ($scope.$storage.fullscreen) $scope.loadImage();
    }
    $scope.settings = function() {
        $rootScope.$broadcast('settings');
        $scope.showSettings = !$scope.showSettings;
    }
    
    var drawings;
    $scope.$on('drawings', function($event, $param) {
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
        // console.log(drawings);
        if (drawings && drawings.length > 0) {
            var path = drawings[0]._poly.getPath().getArray();
            
            for (var i = 0; i < path.length; i++) {
                // console.log()
            }
        }
    });
}

function LightboxController($scope, $localStorage) {
    $scope.$storage = $localStorage;
}

function ThrobController($scope, $localStorage) {
    $scope.$storage = $localStorage;
    
    $scope.$storage.mapThrobCounter = 0;
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
