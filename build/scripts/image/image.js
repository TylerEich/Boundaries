"use strict";
'use strict';
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
      if (drawing.polygon) {
        urlPath.push('fillcolor:' + hex);
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
    var data = {
      serif: true,
      locality: locality,
      notes: "See attached form for Do Not Calls.\nAdd new Do Not Calls as you find them.",
      legend: [],
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
  $scope.downloadPdf = ImageSvc.generatePdf.bind(ImageSvc, $scope.locality, $scope.number);
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UvaW1hZ2UuanMiLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJpbWFnZS9pbWFnZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbmFuZ3VsYXIubW9kdWxlKCdibmRyeS5pbWFnZScsIFsnbmdTdG9yYWdlJywgJ2JuZHJ5Lm1hcCcsICdibmRyeS5kcmF3aW5nJywgJ2JuZHJ5LmNvbG9yJ10pXG4gIC5zZXJ2aWNlKCdJbWFnZVN2YycsIGZ1bmN0aW9uKCRodHRwLCAkZG9jdW1lbnQsICRsb2NhbFN0b3JhZ2UsIE1hcFN2YywgRHJhd2luZ1N2YywgQ29sb3JTdmMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXG4gICAgc2VsZi5weFNpemUgPSBmdW5jdGlvbihtYXhXaWR0aCwgbWF4SGVpZ2h0KSB7XG4gICAgICAvLyB2YXIgcmF0aW8gPSAkbG9jYWxTdG9yYWdlLndpZHRoIC8gJGxvY2FsU3RvcmFnZS5oZWlnaHQ7XG4gICAgICB2YXIgcmF0aW8gPSAzLjUgLyA1O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmF0aW86IHJhdGlvLFxuICAgICAgICB3aWR0aDogKHJhdGlvID49IDEpID8gbWF4V2lkdGggOiBNYXRoLnJvdW5kKHJhdGlvICogbWF4V2lkdGgpLFxuICAgICAgICBoZWlnaHQ6IChyYXRpbyA8IDEpID8gbWF4SGVpZ2h0IDogTWF0aC5yb3VuZCgxIC8gcmF0aW8gKiBtYXhIZWlnaHQpXG4gICAgICB9O1xuICAgIH07XG4gICAgc2VsZi5nZW5lcmF0ZVVybCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFEcmF3aW5nU3ZjLmRyYXdpbmdzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHBhdGggPSAnaHR0cHM6Ly9tYXBzLmdvb2dsZWFwaXMuY29tL21hcHMvYXBpL3N0YXRpY21hcCc7XG5cbiAgICAgIHZhciBwYXJhbXMgPSBbXTtcblxuICAgICAgdmFyIHB4U2l6ZSA9IHNlbGYucHhTaXplKDY0MCwgNjQwKTtcblxuICAgICAgLy8gR2VuZXJhdGUgc3R5bGUgZnJvbSBtYXAgc3R5bGluZyBhbmQgZHJhd2luZ3NcbiAgICAgIHZhciBpLCBqO1xuICAgICAgdmFyIHJ1bGUsIHVybFJ1bGUsIHN0eWxlciwga2V5LCB2YWx1ZTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCAkbG9jYWxTdG9yYWdlLnN0eWxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHJ1bGUgPSAkbG9jYWxTdG9yYWdlLnN0eWxlW2ldO1xuICAgICAgICB1cmxSdWxlID0gW107XG5cbiAgICAgICAgLy8gQWRkIHNlbGVjdG9ycyB0byB1cmxSdWxlXG4gICAgICAgIGlmICgnZmVhdHVyZVR5cGUnIGluIHJ1bGUgJiYgcnVsZS5mZWF0dXJlVHlwZSAhPT0gJ2FsbCcpIHtcbiAgICAgICAgICB1cmxSdWxlLnB1c2goJ2ZlYXR1cmU6JyArIHJ1bGUuZmVhdHVyZVR5cGUpO1xuICAgICAgICB9XG4gICAgICAgIGlmICgnZWxlbWVudFR5cGUnIGluIHJ1bGUgJiYgcnVsZS5lbGVtZW50VHlwZSAhPT0gJ2FsbCcpIHtcbiAgICAgICAgICB1cmxSdWxlLnB1c2goJ2VsZW1lbnQ6JyArIHJ1bGUuZWxlbWVudFR5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGV2ZXJ5IHN0eWxlciwgYWRkIHRvIHVybFJ1bGVcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHJ1bGUuc3R5bGVycy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIHN0eWxlciA9IHJ1bGUuc3R5bGVyc1tqXTtcblxuICAgICAgICAgIGZvciAoa2V5IGluIHN0eWxlcikge1xuICAgICAgICAgICAgdmFsdWUgPSBzdHlsZXJba2V5XTtcblxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2NvbG9yJykge1xuICAgICAgICAgICAgICB2YWx1ZSA9ICcweCcgKyB2YWx1ZS5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHVybFJ1bGUucHVzaChrZXkgKyAnOicgKyB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdXJsUnVsZSA9IHVybFJ1bGUuam9pbignfCcpO1xuXG4gICAgICAgIC8vIEFkZCB1cmxSdWxlIHRvIHBhcmFtcyBpZiBub3QgZW1wdHkgc3RyaW5nXG4gICAgICAgIGlmICh1cmxSdWxlICE9PSAnJykge1xuICAgICAgICAgIHBhcmFtcy5wdXNoKCdzdHlsZT0nICsgdXJsUnVsZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gR2VuZXJhdGUgcGF0aHMgZnJvbSBkcmF3aW5nc1xuICAgICAgdmFyIGRyYXdpbmcsIHVybFBhdGgsIHBvbHlQYXRoLCBlbmNvZGVkUGF0aCwgY29sb3IsIGhleDtcbiAgICAgIHZhciBib3VuZHMgPSBuZXcgTWFwU3ZjLkxhdExuZ0JvdW5kcygpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IERyYXdpbmdTdmMuZHJhd2luZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdXJsUGF0aCA9IFtdO1xuICAgICAgICBkcmF3aW5nID0gRHJhd2luZ1N2Yy5kcmF3aW5nc1tpXTtcbiAgICAgICAgcG9seVBhdGggPSBkcmF3aW5nLl9wb2x5LmdldFBhdGgoKS5nZXRBcnJheSgpO1xuXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBwb2x5UGF0aC5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGJvdW5kcy5leHRlbmQocG9seVBhdGhbal0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZW5jb2RlZFBhdGggPSBNYXBTdmMuZ2VvbWV0cnkuZW5jb2RpbmcuZW5jb2RlUGF0aChwb2x5UGF0aCk7XG4gICAgICAgIGNvbG9yID0gJGxvY2FsU3RvcmFnZS5jb2xvcnNbZHJhd2luZy5jb2xvckluZGV4XTtcbiAgICAgICAgZGVidWdnZXI7XG4gICAgICAgIGhleCA9ICcweCcgKyBDb2xvclN2Yy5jb252ZXJ0LnJnYmEoY29sb3IpLnRvLmhleDMyKCk7XG5cbiAgICAgICAgLy8gSWYgZHJhd2luZyBpcyBwb2x5Z29uLCB1c2UgJ2ZpbGxjb2xvcidcbiAgICAgICAgaWYgKGRyYXdpbmcucG9seWdvbikge1xuICAgICAgICAgIHVybFBhdGgucHVzaCgnZmlsbGNvbG9yOicgKyBoZXgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVybFBhdGgucHVzaCgnY29sb3I6JyArIGhleCk7XG4gICAgICAgICAgdXJsUGF0aC5wdXNoKCd3ZWlnaHQ6JyArIGNvbG9yLndlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgdXJsUGF0aC5wdXNoKCdlbmM6JyArIGVuY29kZWRQYXRoKTtcblxuICAgICAgICB1cmxQYXRoID0gdXJsUGF0aC5qb2luKCd8Jyk7XG5cbiAgICAgICAgLy8gQWRkIHVybFBhdGggdG8gcGFyYW1zIGlmIG5vdCBlbXB0eSBzdHJpbmdcbiAgICAgICAgaWYgKHVybFBhdGgpIHtcbiAgICAgICAgICBwYXJhbXMucHVzaCgncGF0aD0nICsgdXJsUGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIG5vcnRoRWFzdCA9IGJvdW5kcy5nZXROb3J0aEVhc3QoKTtcbiAgICAgIHZhciBzb3V0aFdlc3QgPSBib3VuZHMuZ2V0U291dGhXZXN0KCk7XG4gICAgICB2YXIgY29tcHV0ZUhlYWRpbmcgPSBNYXBTdmMuZ2VvbWV0cnkuc3BoZXJpY2FsLmNvbXB1dGVIZWFkaW5nO1xuICAgICAgdmFyIGhlYWRpbmcgPSBNYXRoLmFicyhjb21wdXRlSGVhZGluZyhub3J0aEVhc3QsIHNvdXRoV2VzdCkgKyBjb21wdXRlSGVhZGluZyhzb3V0aFdlc3QsIG5vcnRoRWFzdCkpIC8gMjtcblxuICAgICAgLy8gQ2hlY2sgb3JpZW50YXRpb25cbiAgICAgIGlmICgoNDUgPD0gaGVhZGluZyAmJiBoZWFkaW5nIDwgMTM1KSA9PT0gKHB4U2l6ZS5yYXRpbyA+PSAxKSkge1xuICAgICAgICAvLyBMYW5kc2NhcGVcbiAgICAgICAgcGFyYW1zLnB1c2goJ3NpemU9JyArIHB4U2l6ZS5oZWlnaHQgKyAneCcgKyBweFNpemUud2lkdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gUG9ydHJhaXRcbiAgICAgICAgcGFyYW1zLnB1c2goJ3NpemU9JyArIHB4U2l6ZS53aWR0aCArICd4JyArIHB4U2l6ZS5oZWlnaHQpO1xuICAgICAgfVxuXG4gICAgICBwYXJhbXMucHVzaCgnZm9ybWF0PWpwZycpO1xuICAgICAgcGFyYW1zLnB1c2goJ3NjYWxlPTInKTtcbiAgICAgIHBhcmFtcy5wdXNoKCdzZW5zb3I9dHJ1ZScpO1xuXG4gICAgICByZXR1cm4gZW5jb2RlVVJJKHBhdGggKyAnPycgKyBwYXJhbXMuam9pbignJicpKTtcbiAgICB9O1xuICAgIHNlbGYuZ2VuZXJhdGVQZGYgPSBmdW5jdGlvbihsb2NhbGl0eSwgbnVtYmVyLCBpbWFnZVVybCkge1xuICAgICAgaWYgKCFpbWFnZVVybCkge1xuICAgICAgICBpbWFnZVVybCA9IHNlbGYuZ2VuZXJhdGVVcmwoKTtcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUuaW5mbyhpbWFnZVVybCk7XG4gICAgICBcbiAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICBzZXJpZjogdHJ1ZSxcbiAgICAgICAgbG9jYWxpdHk6IGxvY2FsaXR5LFxuICAgICAgICBub3RlczogXCJTZWUgYXR0YWNoZWQgZm9ybSBmb3IgRG8gTm90IENhbGxzLlxcbkFkZCBuZXcgRG8gTm90IENhbGxzIGFzIHlvdSBmaW5kIHRoZW0uXCIsXG4gICAgICAgIGxlZ2VuZDogW10sXG4gICAgICAgIG51bWJlcjogbnVtYmVyLFxuICAgICAgICBpbWFnZTogaW1hZ2VVcmxcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gVWdseSBoYWNrIHRvIGZvcmNlIGJyb3dzZXIgdG8gZG93bmxvYWQgZmlsZVxuICAgICAgdmFyIGZvcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb3JtJyk7XG4gICAgICBmb3JtLnN0eWxlID0gJ2Rpc3BsYXk6IG5vbmU7J1xuICAgICAgZm9ybS5lbmN0eXBlID0gJ3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc7XG4gICAgICBmb3JtLmFjdGlvbiA9ICdodHRwOi8vYm91bmRhcmllc2FwcC5oZXJva3VhcHAuY29tL3BkZic7XG4gICAgICBmb3JtLm1ldGhvZCA9ICdQT1NUJztcbiAgICAgIFxuICAgICAgXG4gICAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpbnB1dCcpO1xuICAgICAgaW5wdXQubmFtZSA9ICdqc29uJztcbiAgICAgIGlucHV0LnR5cGUgPSAndGV4dCc7XG4gICAgICBpbnB1dC52YWx1ZSA9IGFuZ3VsYXIudG9Kc29uKGRhdGEpO1xuICAgICAgXG4gICAgICBmb3JtLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICAgIFxuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmb3JtKTtcbiAgICAgIGZvcm0uc3VibWl0KCk7XG4gICAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGZvcm0pO1xuICAgIH1cbiAgfSlcbiAgLmNvbnRyb2xsZXIoJ0ltYWdlQ3RybCcsIGZ1bmN0aW9uKCRzY29wZSwgSW1hZ2VTdmMpIHtcbiAgICAkc2NvcGUubG9jYWxpdHkgPSAnJztcbiAgICAkc2NvcGUubnVtYmVyID0gJyc7XG4gICAgXG4gICAgJHNjb3BlLmRvd25sb2FkUGRmID0gSW1hZ2VTdmMuZ2VuZXJhdGVQZGYuYmluZChJbWFnZVN2YywgJHNjb3BlLmxvY2FsaXR5LCAkc2NvcGUubnVtYmVyKTtcbiAgfSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=