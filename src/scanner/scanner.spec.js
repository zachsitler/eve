const Scanner = require('./scanner');
const { TokenType } = require('../token');

describe('Scanner', () => {
  describe('identifiers', () => {
    it("tokenizes 'foo' correctly", () => {
      const token = new Scanner('foo').scanToken();
      expect(token.type).toBe(TokenType.IDENTIFIER);
      expect(token.literal).toBe('foo');
    });

    it("tokenizes 'foo1234' correctly", () => {
      const token = new Scanner('foo1234').scanToken();
      expect(token.type).toBe(TokenType.IDENTIFIER);
      expect(token.literal).toBe('foo1234');
    });

    it("tokenizes '_foo1234' correctly", () => {
      const token = new Scanner('_foo1234').scanToken();
      expect(token.type).toBe(TokenType.IDENTIFIER);
      expect(token.literal).toBe('_foo1234');
    });

    it("tokenizes '_foo_1234_' correctly", () => {
      const token = new Scanner('_foo_1234_').scanToken();
      expect(token.type).toBe(TokenType.IDENTIFIER);
      expect(token.literal).toBe('_foo_1234_');
    });

    it("does not tokenize '1234a'", () => {
      const token = new Scanner('1234a').scanToken();
      expect(token.type).toBe(TokenType.NUMBER);
      expect(token.literal).toBe('1234');
    });
  });

  describe('numbers', () => {
    it("tokenizes '1234' correctly", () => {
      const token = new Scanner('1234').scanToken();
      expect(token.type).toBe(TokenType.NUMBER);
      expect(token.literal).toBe('1234');
    });

    it("tokenizes '1234.56789' correctly", () => {
      const token = new Scanner('1234.56789').scanToken();
      expect(token.type).toBe(TokenType.NUMBER);
      expect(token.literal).toBe('1234.56789');
    });
  });

  describe('strings', () => {
    it("tokenizes 'abc123!@#$' correctly", () => {
      const token = new Scanner("'abc1234!@#$'").scanToken();
      expect(token.type).toBe(TokenType.STRING);
      expect(token.literal).toBe('abc1234!@#$');
    });
  });

  describe('scanToken', () => {
    it('tokenizes punctuators correctly', () => {
      const tests = [
        { input: '+', expected: { type: TokenType.PLUS, literal: '+' } },
        { input: '-', expected: { type: TokenType.MINUS, literal: '-' } },
        { input: '/', expected: { type: TokenType.SLASH, literal: '/' } },
        { input: '*', expected: { type: TokenType.STAR, literal: '*' } },
        { input: ';', expected: { type: TokenType.SEMICOLON, literal: ';' } },
        { input: ':', expected: { type: TokenType.COLON, literal: ':' } },
        { input: ',', expected: { type: TokenType.COMMA, literal: ',' } },
        { input: '.', expected: { type: TokenType.PERIOD, literal: '.' } },
        { input: '(', expected: { type: TokenType.LEFT_PAREN, literal: '(' } },
        { input: ')', expected: { type: TokenType.RIGHT_PAREN, literal: ')' } },
        {
          input: '[',
          expected: { type: TokenType.LEFT_BRACKET, literal: '[' },
        },
        {
          input: ']',
          expected: { type: TokenType.RIGHT_BRACKET, literal: ']' },
        },
        { input: '{', expected: { type: TokenType.LEFT_BRACE, literal: '{' } },
        { input: '}', expected: { type: TokenType.RIGHT_BRACE, literal: '}' } },
        { input: ':', expected: { type: TokenType.COLON, literal: ':' } },
        { input: '=', expected: { type: TokenType.EQUAL, literal: '=' } },
        {
          input: '==',
          expected: { type: TokenType.EQUAL_EQUAL, literal: '==' },
        },
        { input: '!', expected: { type: TokenType.BANG, literal: '!' } },
        {
          input: '!=',
          expected: { type: TokenType.BANG_EQUAL, literal: '!=' },
        },
        { input: '<', expected: { type: TokenType.LESS, literal: '<' } },
        {
          input: '<=',
          expected: { type: TokenType.LESS_EQUAL, literal: '<=' },
        },
        { input: '>', expected: { type: TokenType.GREATER, literal: '>' } },
        {
          input: '>=',
          expected: { type: TokenType.GREATER_EQUAL, literal: '>=' },
        },
      ];

      tests.forEach(({ input, expected }) => {
        const actual = new Scanner(input).scanToken();
        expect(actual.type).toBe(expected.type);
        expect(actual.literal).toBe(expected.literal);
      });
    });

    it('tokenizes reserved words correctly', () => {
      const tests = [
        { input: 'let', expected: { type: TokenType.LET, literal: 'let' } },
        { input: 'if', expected: { type: TokenType.IF, literal: 'if' } },
        { input: 'else', expected: { type: TokenType.ELSE, literal: 'else' } },
        {
          input: 'return',
          expected: { type: TokenType.RETURN, literal: 'return' },
        },
        { input: 'fn', expected: { type: TokenType.FN, literal: 'fn' } },
        {
          input: 'while',
          expected: { type: TokenType.WHILE, literal: 'while' },
        },
        { input: 'true', expected: { type: TokenType.TRUE, literal: 'true' } },
        {
          input: 'false',
          expected: { type: TokenType.FALSE, literal: 'false' },
        },
        { input: 'null', expected: { type: TokenType.NULL, literal: 'null' } },
      ];

      tests.forEach(({ input, expected }) => {
        const actual = new Scanner(input).scanToken();
        expect(actual.type).toBe(expected.type);
        expect(actual.literal).toBe(expected.literal);
      });
    });

    it('trims whitespace', () => {
      const token = new Scanner('   1   ').scanToken();
      expect(token.type).toBe(TokenType.NUMBER);
      expect(token.literal).toBe('1');
    });

    it('skips comments', () => {
      const scanner = new Scanner('1 // some amazing comment');
      const number = scanner.scanToken();
      const eof = scanner.scanToken();
      expect(number.type).toBe(TokenType.NUMBER);
      expect(number.literal).toBe('1');
      expect(eof.type).toBe(TokenType.EOF);
      expect(eof.literal).toBe('\0');
    });
  });
});
