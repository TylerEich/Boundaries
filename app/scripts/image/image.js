angular.module('bndry.image', ['ngStorage', 'bndry.map', 'bndry.drawing', 'bndry.color'])
  .service('ImageSvc', function($rootScope, $http, $document, $localStorage, MapSvc, DrawingSvc, ColorSvc) {
    var self = this;
    
    self.pxSize = function(maxWidth, maxHeight, ratio) {
      return {
        ratio: ratio,
        width: (ratio >= 1) ? maxWidth : Math.round(ratio * maxWidth),
        height: (ratio < 1) ? maxHeight : Math.round(1 / ratio * maxHeight)
      };
    };
    self.generateUrl = function() {
      if (!DrawingSvc.drawings) {
        return;
      }

      var path = 'https://maps.googleapis.com/maps/api/staticmap';

      var params = [];

      // Generate style from map styling and drawings
      for (var rule in $localStorage.style) {
        var urlRule = [];

        // Add selectors to urlRule
        if ('featureType' in rule && rule.featureType !== 'all') {
          urlRule.push('feature:' + rule.featureType);
        }
        if ('elementType' in rule && rule.elementType !== 'all') {
          urlRule.push('element:' + rule.elementType);
        }

        // Loop through every styler, add to urlRule
        for (var styler in rule.stylers) {
          for (var key in styler) {
            var value = styler[key];

            if (key === 'color') {
              value = '0x' + value.substring(1);
            }

            urlRule.push(key + ':' + value);
          }
        }

        var urlParamText = urlRule.join('|');

        // Add urlParamText to params if not empty string
        if (urlParamText !== '') {
          params.push('style=' + urlParamText);
        }
      }

      // Generate paths from drawings
      var drawing, urlPath, polyPath, encodedPath, color, hex;
      var bounds = new MapSvc.LatLngBounds();
      for (i = 0; i < DrawingSvc.drawings.length; i++) {
        urlPath = [];
        drawing = DrawingSvc.drawings[i];
        polyPath = drawing._poly.getPath().getArray();

        for (j = 0; j < polyPath.length; j++) {
          bounds.extend(polyPath[j]);
        }

        encodedPath = MapSvc.geometry.encoding.encodePath(polyPath);
        color = $localStorage.colors[drawing.colorIndex];
        hex = '0x' + ColorSvc.convert.rgba(color).to.hex32();

        // If drawing is polygon, use 'fillcolor'
        if (drawing.fill) {
          urlPath.push('fillcolor:' + hex);
          urlPath.push('weight:0');
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
      var computeHeading = MapSvc.geometry.spherical.computeHeading;
      var heading = Math.abs(computeHeading(northEast, southWest) + computeHeading(southWest, northEast)) / 2;

			var ratio = (45 <= heading && heading < 135) ? 3.5/5 : 5/3.5;
			var pxSize = self.pxSize(640, 640, ratio);
			
      // Landscape
      params.push('size=' + pxSize.height + 'x' + pxSize.width);

      params.push('format=jpg');
      params.push('scale=2');
      params.push('sensor=true');

      return encodeURI(path + '?' + params.join('&'));
    };
    self.generatePdf = function(locality, number, imageUrl) {
      if (!imageUrl) {
        imageUrl = self.generateUrl();
      }
      
      var legend = [];
      for (var color of ColorSvc.colors) {
        var entry = {
          name: color.name,
          label: color.label,
          color: `#${ColorSvc.convert.rgba(color).to.hex24()}`
        };
        legend.push(entry);
      }
      var data = {
        serif: true,
        locality: locality,
        notes: "See attached form for Do Not Calls.\nAdd new Do Not Calls as you find them.",
        legend: legend,
        number: number,
        image: imageUrl
      }
      
      // Ugly hack to force browser to download file
      var form = document.createElement('form');
      form.style = 'display: none;'
      form.enctype = 'x-www-form-urlencoded';
      form.action = 'http://boundariesapp.herokuapp.com/pdf';
      form.method = 'POST';
      
      var input = document.createElement('input');
      input.name = 'json';
      input.type = 'text';
      input.value = angular.toJson(data);
      
      form.appendChild(input);
      
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
			
			$rootScope.$emit('territory:save', {
				locality: locality,
				number: number,
				drawings: DrawingSvc.drawingsToGeoJson(DrawingSvc.drawings)
			});
    }
  })
  .controller('ImageCtrl', function($scope, ImageSvc) {
    $scope.data = {
			locality: '',
			number: ''
		};
    
    $scope.downloadPdf = () => {
      var locality = prompt('Locality (for example, the name of the city)', '');
      if (locality === null) {
        return;
      }
      var number = prompt('Territory number (for example, MR-1056)', '');
      if (number === null) {
        return;
      }

			ImageSvc.generatePdf(locality, number, ImageSvc.generateUrl());
    };
  });
