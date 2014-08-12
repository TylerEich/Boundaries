'use strict';

angular.module('bndry.image', ['ngStorage', 'bndry.map', 'bndry.drawing', 'bndry.color'])
  .service('ImageSvc', function($http, $document, $localStorage, MapSvc, DrawingSvc, ColorSvc) {
    var self = this;
    
    self.pxSize = function(maxWidth, maxHeight) {
      // var ratio = $localStorage.width / $localStorage.height;
      var ratio = 3.5 / 5;
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

      var pxSize = self.pxSize(640, 640);

      // Generate style from map styling and drawings
      var i, j;
      var rule, urlRule, styler, key, value;
      for (i = 0; i < $localStorage.style.length; i++) {
        rule = $localStorage.style[i];
        urlRule = [];

        // Add selectors to urlRule
        if ('featureType' in rule && rule.featureType !== 'all') {
          urlRule.push('feature:' + rule.featureType);
        }
        if ('elementType' in rule && rule.elementType !== 'all') {
          urlRule.push('element:' + rule.elementType);
        }

        // Loop through every styler, add to urlRule
        for (j = 0; j < rule.stylers.length; j++) {
          styler = rule.stylers[j];

          for (key in styler) {
            value = styler[key];

            if (key === 'color') {
              value = '0x' + value.substring(1);
            }

            urlRule.push(key + ':' + value);
          }
        }

        urlRule = urlRule.join('|');

        // Add urlRule to params if not empty string
        if (urlRule !== '') {
          params.push('style=' + urlRule);
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
        debugger;
        hex = '0x' + ColorSvc.convert.rgba(color).to.hex32();

        // If drawing is polygon, use 'fillcolor'
        if (drawing.polygon) {
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
      var computeHeading = MapSvc.geometry.spherical.computeHeading;
      var heading = Math.abs(computeHeading(northEast, southWest) + computeHeading(southWest, northEast)) / 2;

      // Check orientation
      if ((45 <= heading && heading < 135) === (pxSize.ratio >= 1)) {
        // Landscape
        params.push('size=' + pxSize.height + 'x' + pxSize.width);
      } else {
        // Portrait
        params.push('size=' + pxSize.width + 'x' + pxSize.height);
      }

      params.push('format=jpg');
      params.push('scale=2');
      params.push('sensor=true');

      return encodeURI(path + '?' + params.join('&'));
    };
    self.generatePdf = function(locality, number, imageUrl) {
      if (!imageUrl) {
        imageUrl = self.generateUrl();
      }
      console.info(imageUrl);
      
      var data = {
        serif: true,
        locality: locality,
        notes: "See attached form for Do Not Calls.\nAdd new Do Not Calls as you find them.",
        legend: [],
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
    }
  })
  .controller('ImageCtrl', function($scope, ImageSvc) {
    $scope.locality = '';
    $scope.number = '';
    
    $scope.downloadPdf = ImageSvc.generatePdf.bind(ImageSvc, $scope.locality, $scope.number);
  });
