angular.module('bndry.territory', ['ngStorage', 'bndry.map'])
.service('TerritorySvc', function($rootScope, $localStorage, MapSvc, DrawingSvc, ColorSvc) {
	$localStorage.$default({
		territories: [],
		territoryBounds: []
	});
	
	
	MapSvc.map.data.addListener('mouseover', function(event) {
	   MapSvc.map.data.overrideStyle(event.feature, {strokeOpacity: 1, strokeWeight: 20});
	});
	MapSvc.map.data.addListener('mouseout', function(event) {
	   MapSvc.map.data.revertStyle(/*event.feature*/);
	});
	
	$rootScope.$on('territory:save', function(e, data) {
		console.log(data);
		$localStorage.territories.push(data);
		
		var features = MapSvc.map.data.addGeoJson(JSON.parse(data.drawings));
		
		// for (var feature of features) {
		// 	feature.toGeoJson(function(json) {
		//
		// 	});
		// }
	});
})
.controller('TerritoryCtrl', function(TerritorySvc) {
	
});