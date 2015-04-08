var scope = {},
	HistorySvc = {},
	rootScope = {};

beforeEach(angular.mock.module('bndry.action'));

describe('ActionCtrl', function() {
	beforeEach(inject(function($controller) {
		$controller('ActionCtrl', {$scope: scope, HistorySvc: HistorySvc, $rootScope: rootScope});
		
		HistorySvc.hasUndo = function() {};
		HistorySvc.undo = function() {};
		HistorySvc.hasRedo = function() {};
		HistorySvc.redo = function() {};
		HistorySvc.clear = function() {};
		spyOn(HistorySvc, 'undo');
		spyOn(HistorySvc, 'redo');
		spyOn(HistorySvc, 'clear');
		
		rootScope.$broadcast = function() {};
		spyOn(rootScope, '$broadcast');
	}));
			
	it('Does not undo if hasUndo() is false', function() {
		spyOn(HistorySvc, 'hasUndo').and.returnValue(false);
		
		scope.undo();
		
		expect(HistorySvc.hasUndo).toHaveBeenCalled();
		expect(HistorySvc.undo).not.toHaveBeenCalled();
	});
	
	it('Does undo if hasUndo() is true', function() {
		spyOn(HistorySvc, 'hasUndo').and.returnValue(true);
		
		scope.undo();
				
		expect(HistorySvc.hasUndo).toHaveBeenCalled();
		expect(HistorySvc.undo).toHaveBeenCalled();
	});
	
	it('Does not redo if hasRedo() is false', function() {
		spyOn(HistorySvc, 'hasRedo').and.returnValue(false);
		
		scope.redo();
		
		expect(HistorySvc.hasRedo).toHaveBeenCalled();
		expect(HistorySvc.redo).not.toHaveBeenCalled();
	});

	it('Does redo if hasRedo() is true', function() {
		spyOn(HistorySvc, 'hasRedo').and.returnValue(true);
		
		scope.redo();
		
		expect(HistorySvc.hasRedo).toHaveBeenCalled();
		expect(HistorySvc.redo).toHaveBeenCalled();
	});
	
	it('Clears', function() {
		scope.clear();
		
		expect(HistorySvc.clear).toHaveBeenCalled();
		expect(rootScope.$broadcast).toHaveBeenCalled();
	});
});