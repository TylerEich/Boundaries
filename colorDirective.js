angular.module('color', []).directive('ngColor', function() {
	return {
		restrict: 'A',
		// template: '</>',
		scope: {
			color: '=',
			opacity: '@'
		},
		link: function($scope, $element, $attributes) {
			console.log('link function recognized');
			var updateColor = function() {
				console.log('updateColor called');
			};
			
			$scope.$watch('color', function(oldVal, newVal) {
				if(newVal) {
					updateColor();
				}
			})
		}
	}
});