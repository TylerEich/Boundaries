/*
Copyright (c) 2010,2011,2012,2013,2014 Morgan Roderick http://roderick.dk
License: MIT - http://mrgnrdrck.mit-license.org

https://github.com/mroderick/PubSubJS
*/

// Adapted for use in ES6 module by Tyler Eich

/*jslint white:true, plusplus:true, stupid:true*/
/*global
  setTimeout,
  module,
  exports,
  define,
  require,
  window
*/

'use strict';

var messages = {},
  lastUid = -1;

function hasKeys(obj){
  var key;

  for (key in obj){
    if ( obj.hasOwnProperty(key) ){
      return true;
    }
  }
  return false;
}

/**
 *  Returns a function that throws the passed exception, for use as argument for setTimeout
 *  @param { Object } ex An Error object
 */
function throwException( ex ){
  return function reThrowException(){
    throw ex;
  };
}

function callSubscriberWithDelayedExceptions( subscriber, message, data ){
  try {
    subscriber( message, data );
  } catch( ex ){
    setTimeout( throwException( ex ), 0);
  }
}

function callSubscriberWithImmediateExceptions( subscriber, message, data ){
  subscriber( message, data );
}

function deliverMessage( originalMessage, matchedMessage, data, immediateExceptions ){
  var subscribers = messages[matchedMessage],
    callSubscriber = immediateExceptions ? callSubscriberWithImmediateExceptions : callSubscriberWithDelayedExceptions,
    s;

  if ( !messages.hasOwnProperty( matchedMessage ) ) {
    return;
  }

  for (s in subscribers){
    if ( subscribers.hasOwnProperty(s)){
      callSubscriber( subscribers[s], originalMessage, data );
    }
  }
}

function createDeliveryFunction( message, data, immediateExceptions ){
  return function deliverNamespaced(){
    var topic = String( message ),
      position = topic.lastIndexOf( '.' );

    // deliver the message as it is now
    deliverMessage(message, message, data, immediateExceptions);

    // trim the hierarchy and deliver message to each level
    while( position !== -1 ){
      topic = topic.substr( 0, position );
      position = topic.lastIndexOf('.');
      deliverMessage( message, topic, data );
    }
  };
}

function messageHasSubscribers( message ){
  var topic = String( message ),
    found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic])),
    position = topic.lastIndexOf( '.' );

  while ( !found && position !== -1 ){
    topic = topic.substr( 0, position );
    position = topic.lastIndexOf( '.' );
    found = Boolean(messages.hasOwnProperty( topic ) && hasKeys(messages[topic]));
  }

  return found;
}

function publish( message, data, sync, immediateExceptions ){
  var deliver = createDeliveryFunction( message, data, immediateExceptions ),
    hasSubscribers = messageHasSubscribers( message );

  if ( !hasSubscribers ){
    return false;
  }

  if ( sync === true ){
    deliver();
  } else {
    setTimeout( deliver, 0 );
  }
  return true;
}


const PubSub = {
  /**
   *  PubSub.publish( message[, data] ) -> Boolean
   *  - message (String): The message to publish
   *  - data: The data to pass to subscribers
   *  Publishes the the message, passing the data to it's subscribers
  **/
  publish( message, data ) {
    return publish( message, data, false, PubSub.immediateExceptions );
  },

  /**
   *  PubSub.publishSync( message[, data] ) -> Boolean
   *  - message (String): The message to publish
   *  - data: The data to pass to subscribers
   *  Publishes the the message synchronously, passing the data to it's subscribers
  **/
  publishSync( message, data ) {
    return publish( message, data, true, PubSub.immediateExceptions );
  },

  /**
   *  PubSub.subscribe( message, func ) -> String
   *  - message (String): The message to subscribe to
   *  - func (Function): The function to call when a new message is published
   *  Subscribes the passed function to the passed message. Every returned token is unique and should be stored if
   *  you need to unsubscribe
  **/
  subscribe( message, func ){
    if ( typeof func !== 'function'){
      return false;
    }

    // message is not registered yet
    if ( !messages.hasOwnProperty( message ) ){
      messages[message] = {};
    }

    // forcing token as String, to allow for future expansions without breaking usage
    // and allow for easy use as key names for the 'messages' object
    var token = 'uid_' + String(++lastUid);
    messages[message][token] = func;

    // return token for unsubscribing
    return token;
  },

  /* Public: Clears all subscriptions
   */
  clearAllSubscriptions() {
    messages = {};
  },

  /* Public: removes subscriptions.
   * When passed a token, removes a specific subscription.
   * When passed a function, removes all subscriptions for that function
   * When passed a topic, removes all subscriptions for that topic (hierarchy)
   *
   * value - A token, function or topic to unsubscribe.
   *
   * Examples
   *
   *    // Example 1 - unsubscribing with a token
   *    var token = PubSub.subscribe('mytopic', myFunc);
   *    PubSub.unsubscribe(token);
   *
   *    // Example 2 - unsubscribing with a function
   *    PubSub.unsubscribe(myFunc);
   *
   *    // Example 3 - unsubscribing a topic
   *    PubSub.unsubscribe('mytopic');
   */
  unsubscribe( value ){
    var isTopic    = typeof value === 'string' && messages.hasOwnProperty(value),
      isToken    = !isTopic && typeof value === 'string',
      isFunction = typeof value === 'function',
      result = false,
      m, message, t, token;

    if (isTopic){
      delete messages[value];
      return;
    }

    for ( m in messages ){
      if ( messages.hasOwnProperty( m ) ){
        message = messages[m];

        if ( isToken && message[value] ){
          delete message[value];
          result = value;
          // tokens are unique, so we can just stop here
          break;
        } else if (isFunction) {
          for ( t in message ){
            if (message.hasOwnProperty(t) && message[t] === value){
              delete message[t];
              result = true;
            }
          }
        }
      }
    }
  }
};

export PubSub;
