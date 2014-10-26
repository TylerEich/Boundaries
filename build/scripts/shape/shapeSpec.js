"use strict";
describe('ShapeCtrl', function() {
  var ShapeCtrl,
      scope;
  beforeEach(module('bndry.shape'));
  beforeEach(inject(function($rootScope, $controller) {
    scope = $rootScope.$new();
    ShapeCtrl = $controller('ShapeCtrl', {'$scope': scope});
  }));
  it('Toggles between rigid and flexible lines', function() {
    expect(scope.$storage.rigid).toBe(false);
    scope.$storage.rigid = true;
    expect(scope.$storage.rigid).toBe(true);
  });
  it('Toggles value of fill', function() {
    expect(scope.$storage.fill).toBe(false);
    scope.$storage.fill = true;
    expect(scope.$storage.fill).toBe(true);
  });
});

//# sourceMappingURL=../../sourcemaps/shape/shapeSpec.js.map