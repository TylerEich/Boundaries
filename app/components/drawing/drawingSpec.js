'use strict';

function makeLatLng(lat, lng) {
    return {
        lat: (function(lat) {
            return function() {
                return lat;
            };
        }),
        lng: (function(lng) {
            return function() {
                return lng;
            };
        })
    }
}

describe('Drawing Service', function() {
    var $q, DrawingService, mockDirectionsService = {};
    
    beforeEach(module('boundaries.drawing', function($provide) {
        mockDirectionsService.route = function(locations) {
            var deferred = $q.defer();
            
            var path = [];
    
            for (var i = 0; i < locations.length; i++) {
                if (i !== 0) path.push(locations[i]);
        
                if (i == locations.length - 1) break;
        
                var pathLength = Math.round(10 + 10 * Math.random());
                var lat, lng;
        
                for (var j = 0; j < pathLength; j++) {
                    lat = -90 + 180 * Math.random();
                    lng = -180 + 360 * Math.random();
                    path.push(makeLatLng(lat, lng));
                }
            }
    
            deferred.resolve(path);
    
            return deferred.promise;
        };
        
        $provide.value('DirectionsService', mockDirectionsService);
    }));
    
    beforeEach(function() {
        inject(function(_$q_, _DrawingService_) {
            $q = _$q_;
            DrawingService = _DrawingService_;
        });
    });
    
    it('makes rigid paths', function() {
        var start = makeLatLng(0, 40),
        end = makeLatLng(40, 0),
        rigidPath;
        
        DrawingService.makePath([start, end], true).then(function(path) {
            expect(path.length).toEqual(2);
            expect(path[0]).toEqual(start);
            expect(path[1]).toEqual(end);
        }); 
    });
    describe('splice tests', function() {
        var points = [makeLatLng(0, 10), makeLatLng(0, 20), makeLatLng(0, 30)];
        
        it('prepends one path to another', function() {
            DrawingService.makePath(points, false).then(function(path) {
                var pathLength = path.length;
                DrawingService.splicePath(path, 0, 0, points);
                expect(path.length).toBe(pathLength + points.length);
            });
        });
        it('splices one path midway of another', function() {
            DrawingService.makePath(points, false).then(function(path) {
                DrawingService.makePath(points, false).then(function(newPath) {
                    var pathLength = path.length;
                    DrawingService.splicePath(path, 5, 4, newPath);
                    expect(path.length).toBe(pathLength + newPath.length - 4);
                });
            });
        });
        it('appends one path to another', function() {
            DrawingService.makePath(points, false).then(function(path) {
                var pathLength = path.length;
                DrawingService.splicePath(path, pathLength, 0, points);
                expect(path.length).toBe(pathLength + points.length);
            });
        });
    });
});