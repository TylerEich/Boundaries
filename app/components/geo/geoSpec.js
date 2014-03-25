describe('Geo', function() {
    var GeolocationService, GeocodeService;
    
    beforeEach(function() {
        module('boundaries.geo');
        inject(function(_GeocodeService_, _GeolocationService_) {
            GeocodeService = _GeocodeService_;
            GeolocationService = _GeolocationService_;
        });
    });
    
    it('loaded', function() {
        expect(GeolocationService).toBeTruthy();
        expect(GeocodeService).toBeTruthy();
    });
})