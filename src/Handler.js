'use strict';


function Handler(listener, oneTime) {
  if (!listener) {
    throw new Error('Can\'t create a handler without a listener');
  }

  this.active = true;
  this.oneTime = !!oneTime;
  this.listener = listener;
}

module.exports = Handler;
Handler.prototype.constructor = Handler;


Handler.prototype.apply = function apply(context, args) {
  if (!this.active) {
    throw new Error('Can\'t apply an inactive handler');
  }

  if (this.oneTime) {
    this.active = false;
  }

  if (!args || args.length === 0) {
    return this.listener.call(context);
  }

  // .call() is much faster than .apply()
  switch (args.length) {
    case 1: return this.listener.call(context, args[0]);
    case 2: return this.listener.call(context, args[0], args[1]);
    case 3: return this.listener.call(context, args[0], args[1], args[2]);
    case 4: return this.listener.call(context, args[0], args[1], args[2], args[3]);
    case 5: return this.listener.call(context, args[0], args[1], args[2], args[3], args[4]);
  }

  return this.listener.apply(context, args);
};


Handler.prototype.is = function is(listener) {
  return (listener === this || this.listener === listener);
};
