const { Scanner } = require('../scanner');
const { Parser } = require('../parser');
const { Eval, Environment } = require('./index');

const runTests = tests => {
  tests.forEach(t => {
    const scanner = new Scanner(t.input);
    const parser = new Parser(scanner);
    const program = parser.parseProgram();
    const actual = Eval(program, new Environment());

    if (actual.type === 'Error') {
      expect(actual.message).toBe(t.expected);
    } else {
      expect(actual.value).toBe(t.expected);
    }
  });
};

describe('Eval', () => {
  test('numbers', () => {
    const tests = [
      { input: '1', expected: 1 },
      { input: '5', expected: 5 },
      { input: '1.234', expected: 1.234 },
    ];

    runTests(tests);
  });

  test('strings', () => {
    const tests = [
      { input: "'eve'", expected: 'eve' },
      { input: "'hello, world'", expected: 'hello, world' },
      { input: "'foo' + 'bar'", expected: 'foobar' },
    ];

    runTests(tests);
  });

  test('booleans', () => {
    const tests = [
      { input: 'true', expected: true },
      { input: 'false', expected: false },
    ];

    runTests(tests);
  });

  test('null', () => {
    const tests = [{ input: 'null', expected: null }];

    runTests(tests);
  });

  test('prefix expressions', () => {
    const tests = [
      { input: '!true', expected: false },
      { input: '!false', expected: true },
      { input: '!2', expected: false },
      { input: '!!true', expected: true },
      { input: '!!false', expected: false },
      { input: '!!2', expected: true },
      { input: '1', expected: 1 },
      { input: '10', expected: 10 },
      { input: '-1', expected: -1 },
      { input: '-10', expected: -10 },
    ];

    runTests(tests);
  });

  test('infix expressions', () => {
    const tests = [
      { input: '1 + 1 + 1 + 1 - 2', expected: 2 },
      { input: '10 * 10 * 10 * 10 * 10', expected: 100000 },
      { input: '1000 / 10 / 10', expected: 10 },
      { input: '1 + -1', expected: 0 },
      { input: '1 * 5 + 10', expected: 15 },
      { input: '5 * (1 + 1)', expected: 10 },
      { input: '-5 + -5 + -5 + -5', expected: -20 },
      { input: '1 < 2', expected: true },
      { input: '1 > 2', expected: false },
      { input: '1 <= 1', expected: true },
      { input: '1 >= 1', expected: true },
      { input: '1 == 1', expected: true },
      { input: '1 == 2', expected: false },
      { input: '1 != 1', expected: false },
      { input: '1 != 0', expected: true },
    ];

    runTests(tests);
  });

  test('conditionals', () => {
    const tests = [
      { input: 'if (true) { 1; }', expected: 1 },
      { input: 'if (false) { 1; }', expected: null },
      { input: 'if (!true) { 1; } else { 0 }', expected: 0 },
      { input: 'if (null) { 1; } else { 0 }', expected: 0 },
      // TODO(zach): Implement truthiness for strings/arrays/objects
      // {input: `if ('') { 1; } else { 0 }`, expected: 0},
    ];

    runTests(tests);
  });

  test('return statements', () => {
    const tests = [
      { input: 'return 1;', expected: 1 },
      { input: '10; return 1; 10;', expected: 1 },
      { input: 'if (true) { if (true) { return 1; } } 10;', expected: 1 },
    ];

    runTests(tests);
  });

  test('error handling', () => {
    const tests = [
      { input: '5 + true', expected: 'type mismatch: Number + Boolean' },
      { input: '5 + true; 5;', expected: 'type mismatch: Number + Boolean' },
      { input: '-true', expected: 'unknown operator: -Boolean' },
      {
        input: 'true + false',
        expected: 'unknown operator: Boolean + Boolean',
      },
      {
        input: '5; true + false; 5',
        expected: 'unknown operator: Boolean + Boolean',
      },
      {
        input: 'if (true) { true + false }',
        expected: 'unknown operator: Boolean + Boolean',
      },
      { input: 'foo', expected: 'foo is not defined' },
      { input: 'let foo = 1; foo = bar;', expected: 'bar is not defined' },
      {
        input: "'hello' - 'world'",
        expected: 'unknown operator: String - String',
      },
    ];

    runTests(tests);
  });

  test('let statements', () => {
    const tests = [
      { input: 'let foo = 1; foo;', expected: 1 },
      { input: 'let foo = 1 * 10; foo;', expected: 10 },
      { input: 'let foo = 1; let bar = foo; bar;', expected: 1 },
      {
        input: 'let foo = 1; let bar = foo; let baz = foo + bar + 1; baz;',
        expected: 3,
      },
    ];

    runTests(tests);
  });

  test('assignment expressions', () => {
    const tests = [
      { input: 'let foo = 1; foo = 2;', expected: 2 },
      { input: 'let foo = 2; foo = foo * foo', expected: 4 },
      { input: 'let foo = 1; if (foo > 0) { return foo = 0; }', expected: 0 },
    ];

    runTests(tests);
  });

  test('index expressions', () => {
    const tests = [
      { input: '[1, 2, 3][0]', expected: 1 },
      { input: '[1, 2, 3][1]', expected: 2 },
      { input: 'let i = 0; [1][i]', expected: 1 },
      { input: 'let array = [1, 2, 3]; array[1]', expected: 2 },
      { input: 'let array = [1, 2, 3]; array[1]', expected: 2 },
      { input: '(fn(x) { return [x * x] })(2)[0]', expected: 4 },
      { input: '[1, 2, 3][3]', expected: null },
      { input: '[1, 2, 3][-1]', expected: null },
      { input: `let obj = {'foo': 'bar'}; obj['foo'];`, expected: 'bar' },
      { input: `let obj = {1 + 2: 3}; obj[1 + 2];`, expected: 3 },
      {
        input: `let obj = {true: 'foo'}; obj[(fn() { return true})()];`,
        expected: 'foo',
      },
    ];

    runTests(tests);
  });

  test('property access', () => {
    const tests = [
      { input: `let obj = {'foo': 'bar'}; obj.foo`, expected: 'bar' },
      { input: `let obj = {'foo' + 'bar': true}; obj.foobar`, expected: true },
      { input: `let obj = {'size': fn() { return 1 }}; obj.size()`, expected: 1 },
    ];

    runTests(tests);
  });

  test('function statements', () => {
    const tests = [
      {
        input: 'let identity = fn(x) { return x; }; identity(5);',
        expected: 5,
      },
      {
        input: 'let square = fn(x) { return x * x; }; square(5);',
        expected: 25,
      },
      {
        input: 'let add = fn(x, y, z) { return x + y + z; }; add(1, 2, 3);',
        expected: 6,
      },
    ];

    runTests(tests);
  });

  test('arrays', () => {
    const scanner = new Scanner('[1, 2 * 2, 9]');
    const parser = new Parser(scanner);
    const program = parser.parseProgram();
    const actual = Eval(program, new Environment());

    expect(actual.elements.length).toBe(3);
    expect(actual.elements[0].value).toBe(1);
    expect(actual.elements[1].value).toBe(4);
    expect(actual.elements[2].value).toBe(9);
  });

  test('objects', () => {
    const scanner = new Scanner(
      `{'foo': 'bar', (1 + 2): '3', true: [1, 2, 3]}`
    );
    const parser = new Parser(scanner);
    const program = parser.parseProgram();
    const actual = Eval(program, new Environment());

    expect(actual.pairs['foo'].value).toBe('bar');
    expect(actual.pairs['3'].value).toBe('3');
    expect(actual.pairs['true'].inspect()).toBe('[1,2,3]');
  });

  test('.length', () => {
    const tests = [
      { input: `'foo'.length`, expected: 3 },
      { input: `''.length`, expected: 0 },
      { input: `[1, 2, 3].length`, expected: 3 },
      { input: `[].length`, expected: 0 },
      { input: `{}.length`, expected: null },
    ];

    runTests(tests);
  });
});
