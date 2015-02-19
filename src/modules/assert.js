export default function assert( condition, message = 'Assertion failed' ) {
  if ( !condition ) {
    debugger;
    
    if ( typeof Error !== "undefined" ) {
      throw new Error( message );
    }
    throw message; // Fallback
  }
}