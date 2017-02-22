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
  it('handles numbers', () => {
    const tests = [
      {input: '1', expected: 1},
      {input: '5', expected: 5},
      {input: '1.234', expected: 1.234},
    ];

    runTests(tests);
  });

  it('handles strings', () => {
    const tests = [
      {input: '\'eve\'', expected: 'eve'},
      {input: '\'hello, world\'', expected: 'hello, world'},
    ];

    runTests(tests);
  });

  it('handles booleans', () => {
    const tests = [
      {input: 'true', expected: true},
      {input: 'false', expected: false},
    ];

    runTests(tests);
  });

  it('handles null', () => {
    const tests = [
      {input: 'null', expected: null},
    ];

    runTests(tests);
  });

  describe('expressions', () => {
    it('handles bangs operators', () => {
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

    it('handles minus operators', () => {
      const tests = [
        {input: '1', expected: 1},
        {input: '10', expected: 10},
        {input: '-1', expected: -1},
        {input: '-10', expected: -10},
      ];

      runTests(tests);
    });
  });
});
