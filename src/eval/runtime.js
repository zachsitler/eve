/**
 * The foundation of the interpreter. Everything is an object in some form or
 * another. Even if it does not inherit from `Object`, it at least follows
 * the same interface.
 *
 * Each object must have a `type` and implement an `inspect` function.
 */
export class EveObject {
  constructor(type, value) {
    this.type = type
    this.value = value
  }

  inspect() {
    return this.value && this.value.toString()
  }
}

/**
 * Helper for the `null` type. A null is anything that does not
 * have a value. This is returned by out of bounds accesses, or newly
 * defined variables for example.
 */
export class Null extends EveObject {
  constructor() {
    super('Null', null)
  }
}

/**
 * Helper for the `boolean` type. A `boolean` represents a true or
 * false value. Internally it is just stored as a JS boolean.
 */
export class Boolean extends EveObject {
  constructor(value) {
    super('Boolean', value)
  }
}

/**
 * Helper for the `number` type. Supports negative, positive, and decimal
 * numbers. Special cases like scientific notation are not supported by the
 * parser.
 */
export class Number extends EveObject {
  constructor(value) {
    super('Number', value)
  }
}

/**
 * Helper for the `string` type. Just good ol' fashioned strings man.
 */
export class String extends EveObject {
  constructor(value) {
    super('String', value)
  }
}

/**
 * Represents a return statement. A return statement has the same behavior
 * as in JS.
 */
export class Return extends EveObject {
  constructor(value) {
    super('Return', value)
  }
}

/**
 * Helper for the `array` type. The elements can be of any type and since
 * it is a dynamic language, the length is not bound either.
 */
export class Array {
  constructor(elements = []) {
    this.type = 'Array'
    this.elements = elements
  }

  inspect() {
    return `[${this.elements.map(elem => elem.inspect()).join(',')}]`
  }
}

/**
 * Helper for the `error` type. This also enforces consistent formatting
 * of error messages.
 */
export class Error {
  constructor(message) {
    this.type = 'Error'
    this.message = message
  }

  inspect() {
    return `ERROR: ${this.message}`
  }
}

/**
 * An `EveHash` is an object literal with behavior similar to JS. However, it
 * can be defined in slightly different ways.
 *
 * Examples:
 *   {'foo': 'bar'}, obj.foo ==> 'bar'
 *   {1 + 2: '3'}, obj['3'] ==> '3'
 *
 * The biggest distinction is that keys can be defined with expressions. JS
 * does have support for this is in es2015 with the EveObject initialiazer spec,
 * e.g. {[1 + 2]: '3'}.
 */
export class Hash {
  constructor(pairs) {
    this.type = 'Hash'
    this.pairs = pairs
  }

  inspect() {
    const pairs = Object.keys(this.pairs)
      .map(key => {
        const val = this.pairs[key]
        return `${key}: ${val.inspect()}`
      })
      .join(',')

    return `{${pairs}}`
  }
}

/**
 * An `EveFunction` respresents a function declaration. Functions are similar
 * to JS with one difference and less functionality.
 *
 * Example:
 *   let sum = fn(x, y) { return x + y };
 *   sum(1, 2); ==> 3
 *
 *   // Without a return statement.
 *   let sum = fn(x, y) { x + y };
 *   sum(1, 2); ==> 3
 *
 *  Just like coffeescript, the last value of the last statement will be
 *  returned.
 */
export class Function extends EveObject {
  constructor(params, body, env) {
    super()
    this.params = params
    this.body = body
    this.env = env
    this.type = 'Function'
  }

  inspect() {
    return `fn${this.params.toString()} ${this.body.toString()}`
  }
}

export class Static extends EveObject {
  constructor(fn) {
    super()
    this.fn = fn;
    this.type = 'Static'
  }

  inspect() {
    return this.fn.toString();
  }
}
