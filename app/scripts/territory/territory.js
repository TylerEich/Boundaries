angular.module('bndry.territory', ['ngStorage', 'bndry.map'])
.service('TerritorySvc', function($rootScope, $localStorage, MapSvc, DrawingSvc, ColorSvc) {
	$localStorage.$default({
		territories: [],
		territoryBounds: []
	});
	
	MapSvc.map.data.setStyle(function(feature) {
		var colorIndex = feature.getProperty('colorIndex');
		
		var color = ColorSvc.colors[colorIndex];
		var hex = ColorSvc.convert.rgba(color).to.hex24();
		
		console.log(colorIndex, hex);
		
		return {
			strokeColor: hex,
			strokeOpacity: 0.5,
			strokeWeight: 5
		}
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