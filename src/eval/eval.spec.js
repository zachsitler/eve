const { Scanner } = require('../scanner');
const { Parser } = require('../parser');
const Eval = require('./eval');

const runTests = (tests) => {
  tests.forEach(t => {
    const scanner = new Scanner(t.input);
    const parser = new Parser(scanner);
    const program = parser.parseProgram();
    const actual = Eval(program);
    expect(actual.value).toBe(t.expected);
  });
}

describe('Eval', () => {
  test('numbers', () => {
    const tests = [
      {input: '1', expected: 1},
      {input: '5', expected: 5},
      {input: '1.234', expected: 1.234},
    ];

    runTests(tests);
  });

  test('strings', () => {
    const tests = [
      {input: '\'eve\'', expected: 'eve'},
      {input: '\'hello, world\'', expected: 'hello, world'},
    ];

    runTests(tests);
  });

  test('booleans', () => {
    const tests = [
      {input: 'true', expected: true},
      {input: 'false', expected: false},
    ];

    runTests(tests);
  });

  test('null', () => {
    const tests = [
      {input: 'null', expected: null},
    ];

    runTests(tests);
  });

  test('bang op', () => {
    const tests = [
      {input: '!true', expected: false},
      {input: '!false', expected: true},
      {input: '!2', expected: false},
      {input: '!!true', expected: true},
      {input: '!!false', expected: false},
      {input: '!!2', expected: true},
    ];

    runTests(tests);
  });

  test('prefix minus op', () => {
    const tests = [
      {input: '1', expected: 1},
      {input: '10', expected: 10},
      {input: '-1', expected: -1},
      {input: '-10', expected: -10},
    ];

    runTests(tests);
  });
});
