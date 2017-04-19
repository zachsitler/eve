class EveObject {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  inspect() {
    return this.value && this.value.toString();
  }
}

class EveNull extends EveObject {
  constructor() {
    super('Null', null);
  }
}

class EveBoolean extends EveObject {
  constructor(value) {
    super('Boolean', value);
  }
}

class EveNumber extends EveObject {
  constructor(value) {
    super('Number', value);
  }
}

class EveString extends EveObject {
  constructor(value) {
    super('String', value);
  }
}

class EveReturn extends EveObject {
  constructor(value) {
    super('Return', value);
  }
}

class EveArray {
  constructor(elements) {
    this.type = 'Array';
    this.elements = elements;
  }

  inspect() {
    return `[${this.elements.map(elem => elem.inspect()).join(',')}]`;
  }
}

class EveError {
  constructor(message) {
    this.type = 'Error';
    this.message = message;
  }

  inspect() {
    return `ERROR: ${this.message}`;
  }
}

class EveHash {
  constructor(pairs) {
    this.type = 'Hash';
    this.pairs = pairs;
  }

  inspect() {
    const pairs = Object.keys(this.pairs)
      .map(key => {
        const val = this.pairs[key];
        return `${key}: ${val.inspect()}`;
      })
      .join(',');

    return `{${pairs}}`;
  }
}

class EveFunction extends EveObject {
  constructor(params, body, env) {
    super();
    this.params = params;
    this.body = body;
    this.env = env;
    this.type = 'Function';
  }

  inspect() {
    return `fn${this.params.toString()} ${this.body.toString()}`;
  }
}

module.exports = {
  Object: EveObject,
  Error: EveError,
  Null: EveNull,
  Boolean: EveBoolean,
  String: EveString,
  Number: EveNumber,
  Return: EveReturn,
  Array: EveArray,
  Hash: EveHash,
  Function: EveFunction,
};
