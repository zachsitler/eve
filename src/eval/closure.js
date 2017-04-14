const Environment = require('./environment');

/**
 * A closure is just an extension of Environment that accepts an outer
 * scope. Look up order is defined by first looking in the current
 * scope and then checking the outer scope if necessary.
 */
class Closure extends Environment {
  constructor(outerEnv) {
    super();
    this.outer = outerEnv;
  }

  get(name) {
    let obj = this.store[name];

    // Check the outer scope for its existence.
    if (!obj && this.outer) {
      obj = this.outer.get(name);
    }

    return obj;
  }
}

module.exports = Closure;
