"use strict";
'use strict';
describe('ModeCtrl', function() {
  var ModeCtrl,
      scope;
  beforeEach(module('bndry.mode'));
  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    ModeCtrl = $controller('ModeCtrl', {'$scope': scope});
  }));
  it('Toggles between rigid and flexible lines', function() {
    expect(scope.rigid).toBe(false);
    scope.rigid = true;
    expect(scope.rigid).toBe(true);
  });
  it('Toggles between polygon and polyline mode', function() {
    expect(scope.polygon).toBe(false);
    scope.polygon = true;
    expect(scope.polygon).toBe(true);
  });
});

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kZS9tb2RlU3BlYy5qcyIsIm5hbWVzIjpbXSwibWFwcGluZ3MiOiIiLCJzb3VyY2VzIjpbIm1vZGUvbW9kZVNwZWMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnTW9kZUN0cmwnLCBmdW5jdGlvbigpIHtcbiAgdmFyIE1vZGVDdHJsLCBzY29wZTtcblxuICBiZWZvcmVFYWNoKG1vZHVsZSgnYm5kcnkubW9kZScpKTtcbiAgYmVmb3JlRWFjaChpbmplY3QoZnVuY3Rpb24oJHJvb3RTY29wZSwgJGNvbnRyb2xsZXIpIHtcbiAgICBzY29wZSA9ICRyb290U2NvcGUuJG5ldygpO1xuICAgIE1vZGVDdHJsID0gJGNvbnRyb2xsZXIoJ01vZGVDdHJsJywge1xuICAgICAgJyRzY29wZSc6IHNjb3BlXG4gICAgfSk7XG4gIH0pKTtcblxuICBpdCgnVG9nZ2xlcyBiZXR3ZWVuIHJpZ2lkIGFuZCBmbGV4aWJsZSBsaW5lcycsIGZ1bmN0aW9uKCkge1xuICAgIGV4cGVjdChzY29wZS5yaWdpZCkudG9CZShmYWxzZSk7XG4gICAgc2NvcGUucmlnaWQgPSB0cnVlO1xuICAgIGV4cGVjdChzY29wZS5yaWdpZCkudG9CZSh0cnVlKTtcbiAgfSk7XG4gIGl0KCdUb2dnbGVzIGJldHdlZW4gcG9seWdvbiBhbmQgcG9seWxpbmUgbW9kZScsIGZ1bmN0aW9uKCkge1xuICAgIGV4cGVjdChzY29wZS5wb2x5Z29uKS50b0JlKGZhbHNlKTtcbiAgICBzY29wZS5wb2x5Z29uID0gdHJ1ZTtcbiAgICBleHBlY3Qoc2NvcGUucG9seWdvbikudG9CZSh0cnVlKTtcbiAgfSk7XG59KTtcbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==