"use strict";
angular.module('bndry.image', ['ngStorage', 'bndry.map', 'bndry.drawing', 'bndry.color']).service('ImageSvc', function($http, $document, $localStorage, MapSvc, DrawingSvc, ColorSvc) {
  var self = this;
  self.pxSize = function(maxWidth, maxHeight) {
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
    var i,
        j;
    var rule,
        urlRule,
        styler,
        key,
        value;
    for (i = 0; i < $localStorage.style.length; i++) {
      rule = $localStorage.style[i];
      urlRule = [];
      if ('featureType' in rule && rule.featureType !== 'all') {
        urlRule.push('feature:' + rule.featureType);
      }
      if ('elementType' in rule && rule.elementType !== 'all') {
        urlRule.push('element:' + rule.elementType);
      }
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
      if (urlRule !== '') {
        params.push('style=' + urlRule);
      }
    }
    var drawing,
        urlPath,
        polyPath,
        encodedPath,
        color,
        hex;
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
      if (drawing.fill) {
        urlPath.push('fillcolor:' + hex);
        urlPath.push('weight:0');
      } else {
        urlPath.push('color:' + hex);
        urlPath.push('weight:' + color.weight);
      }
      urlPath.push('enc:' + encodedPath);
      urlPath = urlPath.join('|');
      if (urlPath) {
        params.push('path=' + urlPath);
      }
    }
    var northEast = bounds.getNorthEast();
    var southWest = bounds.getSouthWest();
    var computeHeading = MapSvc.geometry.spherical.computeHeading;
    var heading = Math.abs(computeHeading(northEast, southWest) + computeHeading(southWest, northEast)) / 2;
    if ((45 <= heading && heading < 135) === (pxSize.ratio >= 1)) {
      params.push('size=' + pxSize.height + 'x' + pxSize.width);
    } else {
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
    var legend = [];
    for (var $__0 = ColorSvc.colors[Symbol.iterator](),
        $__1; !($__1 = $__0.next()).done; ) {
      var color = $__1.value;
      {
        var entry = {
          name: color.name,
          label: color.label,
          color: ("#" + ColorSvc.convert.rgba(color).to.hex24())
        };
        legend.push(entry);
      }
    }
    var data = {
      serif: true,
      locality: locality,
      notes: "See attached form for Do Not Calls.\nAdd new Do Not Calls as you find them.",
      legend: legend,
      number: number,
      image: imageUrl
    };
    var form = document.createElement('form');
    form.style = 'display: none;';
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
  };
}).controller('ImageCtrl', function($scope, ImageSvc) {
  $scope.locality = '';
  $scope.number = '';
  $scope.downloadPdf = (function() {
    var locality = prompt('Locality (for example, the name of the city)', '');
    if (locality === null) {
      return;
    }
    var number = prompt('Territory number (for example, MR-1056)', '');
    if (number === null) {
      return;
    }
    ImageSvc.generatePdf(locality, number, ImageSvc.generateUrl());
  });
});

//# sourceMappingURL=../../sourcemaps/image/image.js.map