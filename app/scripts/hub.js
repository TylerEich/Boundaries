const HUB = {};

export function emit( eventName, { data }) {
  if ( HUB.hasOwnProperty( eventName ) ) {
    let handlers = HUB[ eventName ];
    for ( let handler of handlers ) {
      handler.bind( context, data );
    }
  }
  var handlers = hub[eventName];

  if ( handlers !== undefined ) {
    for ( let handler of handlers ) {
      handler( data );
    }
  }
}

export function on({ eventName, handler }) {
  let handlerArray;

  if ( !Array.isArray( handler ) ) {
    handlerArray = [ handler ];
  } else {
    handlerArray = handler;
  }

  hub[eventName] = handlerArray;
}

export function off() {

}