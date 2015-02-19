const [ emit, on, off ] = [
  PubSub.publishSync.bind( PubSub ),
  PubSub.subscribe.bind( PubSub ),
  PubSub.unsubscribe.bind( PubSub )
];

export { emit, on, off };