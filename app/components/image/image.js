'use strict';

angular.module('boundaries.image', ['ngStorage', 'boundaries.drawing'])
.service('ImageService', ['$localStorage', function($localStorage) {
    this.pxSize = function(maxWidth, maxHeight) {
        var ratio = $localStorage.width / $localStorage.height;
        return {
            ratio: ratio,
            width: (ratio >= 1) ? maxWidth : Math.round(ratio * maxWidth),
            height: (ratio < 1) ? maxHeight : Math.round(1 / ratio * maxHeight)
        }
    };
    this.generateUrl = function() {
        if (!drawings) return;

        var path = 'https://maps.googleapis.com/maps/api/staticmap';

        var params = [];

        var pxSize = utilityService.image.pxSize(640, 640);

        // Generate style from map styling and drawings
        var i, j;
        var rule, urlRule, styler, key, value;
        for (i = 0; i < $localStorage.style.length; i++) {
            rule = $localStorage.style[i];
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
            if (urlRule != '') {
                params.push('style=' + urlRule);
            }
        }

        // Generate paths from drawings
        var drawing, urlPath, polyPath, encodedPath, color, hex;
        var bounds = new google.maps.LatLngBounds();
        for (i = 0; i < DrawingService.drawings.length; i++) {
            urlPath = [];
            drawing = DrawingService.drawings[i];
            polyPath = drawing._poly.getPath().getArray();
    
            for (j = 0; j < polyPath.length; j++) bounds.extend(polyPath[j]);
    
            encodedPath = google.maps.geometry.encoding.encodePath(polyPath);
            color = $scope.$storage.colors[drawing.activeColor];
            hex = '0x' + ColorService.convert.hex24().toHex(color.rgba);
    
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
}]);