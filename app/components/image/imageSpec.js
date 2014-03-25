ddescribe('Image', function() {
    var ImageService;
    
    beforeEach(function() {
        module('boundaries.image');
        inject(function(_ImageService_) {
            ImageService = _ImageService_;
        });
    });
    
    it('generates valid URLs', function() {
        expect(ImageService).toBeTruthy();
    });
})