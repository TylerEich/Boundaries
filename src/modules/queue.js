export default class Queue {
  constructor() {
    this._q = Promise.resolve( true );
  }

  add( cb ) {
    this._q = this._q.then( cb );

    return this;
  }
}