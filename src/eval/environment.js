/**
 * The environment is what we use to keep track of values by associating
 * them with a name. At its core, its just a light wrapper around an
 * object.
 */
class Environment {
  constructor() {
    this.store = {};
  }

  get(name) {
    return this.store[name];
  }

  set(name, obj) {
    return (this.store[name] = obj);
  }
}

module.exports = Environment;
