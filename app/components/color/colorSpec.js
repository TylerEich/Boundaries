'use strict';

describe('Color', function() {
    beforeEach(function() {
        jasmine.addMatchers({
            toAlmostEqual: function() {
                return {
                    compare: function(actual, expected) {
                        return {
                            pass: (actual >= expected - .003921569 && expected + .003921569 >= actual),
                            message: 'Expected ' + actual + ' to be within .003921569 of ' + expected + '.'
                        };
                    }
                };
            }
        });
    });
    describe('Conversions', function() {
        function conversions(ColorService) {
            var data = {
                rgba: {
                    r: 0.5,
                    g: 0.25,
                    b: 0.75,
                    a: 1
                },
                hsla: {
                    h: 0.75,
                    s: 0.50,
                    l: 0.50,
                    a: 1
                },
                hex24: '8040bf',
                hex32: '8040bfff'
            }
            var converts = ColorService.convert;
            var tos = ColorService.to;

            for (var convert in converts) {
                for (var to in tos) {
                    (function(convert, to) {
                        it('Converts ' + convert + ' to ' + to, function() {
                            var expectedValue = data[to];
                            var actualValue = ColorService
                            .convert[convert](data[convert])
                            .to[to]();
                            
                            if (typeof expectedValue === 'object') {
                                for (var key in expectedValue) {
                                    expect(actualValue[key])
                                    .toAlmostEqual(expectedValue[key]);
                                }
                            } else {
                                expect(actualValue).toEqual(expectedValue);
                            }
                        });
                    })(convert, to);
                }
            }
        }
        
        conversions.$inject = ['ColorService'];
        var injector = angular.injector(['boundaries.color']);
        injector.invoke(conversions);
    });
});