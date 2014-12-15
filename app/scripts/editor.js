import { on, off } from 'hub';
import { Q } from 'Q';
import { Drawing, Node } from './modules/drawing';
import { Color } from './modules/color';


const drawings = new DrawingCollection();
let shouldCreateNewDrawing = false;


on( MapView.event.click, ( data ) => {

});


on( DrawingCollection.event.DRAWING_ADDED, () => {

});


on( Drawing.event.COLOR_CHANGED, () => {
  // Send MapView index of changed object and color
});

on( Drawing.event )
