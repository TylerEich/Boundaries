const hub = {};

export function emit({ eventName, data }) {
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