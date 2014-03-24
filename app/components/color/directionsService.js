// 'use strict';
// 
// angular.module('boundaries.drawing', [])
// 
// .service('DirectionsService', ['$q', function($q) {
//     var directions = new google.maps.DirectionsService();
//     
//     this.route = function(locations) {
//         if (locations.length >= 2 && locations.length <= 10) {
//             var start = locations.shift();
//             var end = locations.pop();
//             
//             for (var i; i < locations.length; i++) {
//                 // Put remaining locations in waypoint format
//                 locations[i] = {
//                     location: locations[i]
//                 };
//             }
//         } else {
//             console.error('Length of locations is not between 2 and 10');
//             deferred.reject();
//             return deferred.promise;
//         }
//         directions.route({
//             origin: start,
//             destination: end,
//             waypoints: locations,
//             travelMode: google.maps.TravelMode.DRIVING
//         }, function(result, status) {
//             if (status == google.maps.DirectionsStatus.OK) {
//                 overview_path = result.routes[0].overview_path;
//                 overview_path.shift();
//                 
//                 // Resolve with path
//                 deferred.resolve(overview_path);
//             } else {
//                 // Reject with status
//                 deferred.reject(status);
//             }
//         }, function() {
//             deferred.reject();
//         });
//         
//         return deferred.promise;
//     }
// }]);