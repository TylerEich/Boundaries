'use strict';

angular.module('boundaries.drawing', [])
.service('DirectionsService', ['$q', function($q) {
    var directions = new google.maps.DirectionsService();
    
    this.route = function(locations) {
        var deferred = $q.defer();
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
                overview_path = result.routes[0].overview_path;
                overview_path.shift();
                
                // Resolve with path
                deferred.resolve(overview_path);
            } else {
                // Reject with status
                deferred.reject(status);
            }
        }, function() {
            deferred.reject();
        });
        
        return deferred.promise;
    }
}])
.service('DrawingService', ['$q', 'DirectionsService', function($q, DirectionsService) {
    function isSameLatLng(latLng1, latLng2) {
        return (latLng1.lat() == latLng2.lat() && latLng1.lng() == latLng2.lng());
    }
    this.makePath = function(locations, rigid) {
        var deferred = $q.defer();
        if (rigid) {
            deferred.resolve(locations);
        } else {
            DirectionsService.route(locations).then(function(result) {
                deferred.resolve(result);
            });
        }
        return deferred.promise;
    };
    this.splicePath = function(originalPath, index, removeLength, path) {
        originalPath.splice(index, removeLength);
        
        var args = path;
        args.unshift(index, removeLength);
        
        originalPath.splice.apply(this, args);
        // for (var i = 0; i < path.length; i++) {
        //     originalPath.splice.apply
        // }
    };
}]);