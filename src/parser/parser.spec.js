const Parser = require('./parser');
const { Scanner } = require('../scanner');

describe('Parser', () => {
  describe('parseIfStatement()', () => {
    it('works', () => {
      const scanner = new Scanner(`
        if (x >= 0)
          return true;
        else
          return false;
      `);
      const parser = new Parser(scanner);
      const actual = parser.parseIfStatement();
      expect(actual.type).toBe('IfStatement');
      expect(actual.toString().replace(/\s/g, '')).toBe(`
        if ((x >= 0))
          return true;
        else
          return false;
      `.replace(/\s/g, ''));
    });

    it('handles nested blocks', () => {
      const scanner = new Scanner(`
        if (x >= 0)
          if (y >= 0)
            if (z >= 0)
              return true;
      `);
      const parser = new Parser(scanner);
      const actual = parser.parseIfStatement();
      expect(actual.type).toBe('IfStatement');
      expect(actual.toString().replace(/\s/g, '')).toBe(`
        if ((x >= 0))
          if ((y >= 0))
            if ((z >= 0))
              return true;
      `.replace(/\s/g, ''));
    });
  });

  describe('parseBlockStatement()', () => {
    it('works', () => {
      const scanner = new Scanner(`
        {
          let language = 'eve';
          let version = 1.2;
          return language + '@' + version;
        }
      `);
      const parser = new Parser(scanner);
      const actual = parser.parseBlockStatement();
      expect(actual.type).toBe('BlockStatement');
      expect(actual.toString().replace(/\s/g, '')).toBe(`
        {
          let language = 'eve';
          let version = 1.2;
          return ((language + '@') + version);
        }
      `.replace(/\s/g, ''));
    });

    it('handles nested statements', () => {
      const scanner = new Scanner(`
        {{return language + '@' + version;}}
      `);
      const parser = new Parser(scanner);
      const actual = parser.parseBlockStatement();
      expect(actual.type).toBe('BlockStatement');
      expect(actual.toString().replace(/\s/g, '')).toBe(`
        {{return ((language + '@') + version);}}
      `.replace(/\s/g, ''));
    });
  });

  describe('parseLetStatement()', () => {
    it('works', () => {
      const scanner = new Scanner('let a = 1;');
      const parser = new Parser(scanner);
      const actual = parser.parseLetStatement();
      expect(actual.type).toBe('LetStatement');
      expect(actual.toString()).toBe('let a = 1;');
    });

    it('declarations', () => {
      const scanner = new Scanner('let a;');
      const parser = new Parser(scanner);
      const actual = parser.parseLetStatement();
      expect(actual.type).toBe('LetStatement');
      expect(actual.toString()).toBe('let a;');
    });
  });

  describe('parseReturnStatement()', () => {
    it('works', () => {
      const scanner = new Scanner('return foo + bar;');
      const parser = new Parser(scanner);
      const actual = parser.parseReturnStatement();
      expect(actual.type).toBe('ReturnStatement');
      expect(actual.toString()).toBe('return (foo + bar);');
    });
  });

  describe('parseExpressionStatement()', () => {
    it('works', () => {
      const scanner = new Scanner('a = 1 + 2 + 3;');
      const parser = new Parser(scanner);
      const actual = parser.parseExpressionStatement();
      expect(actual.type).toBe('ExpressionStatement');
      expect(actual.toString()).toBe('(a = ((1 + 2) + 3));');
    });
  });

  describe('parseIdentifier()', () => {
    it('parses \'a\' correctly', () => {
      const scanner = new Scanner('a');
      const parser = new Parser(scanner);
      const actual = parser.parseIdentifier();
      expect(actual.type).toBe('Identifier');
      expect(actual.value).toBe('a');
    });

    it('parses \'_a123\' correctly', () => {
      const scanner = new Scanner('_a123');
      const parser = new Parser(scanner);
      const actual = parser.parseIdentifier();
      expect(actual.type).toBe('Identifier');
      expect(actual.value).toBe('_a123');
    });
  });

  describe('parsePrefixExpression()', () => {
    it('parses \'-a\' correctly', () => {
      const scanner = new Scanner('-a');
      const parser = new Parser(scanner);
      const actual = parser.parseExpression();
      expect(actual.toString()).toBe('(-a)');
    });

    it('parses \'---a\' correctly', () => {
      const scanner = new Scanner('---a');
      const parser = new Parser(scanner);
      const actual = parser.parseExpression();
      expect(actual.toString()).toBe('(-(-(-a)))');
    });

    it('parses \'!a\' correctly', () => {
      const scanner = new Scanner('!a');
      const parser = new Parser(scanner);
      const actual = parser.parseExpression();
      expect(actual.toString()).toBe('(!a)');
    });
  });

  describe('parseInfixExpression()', () => {
    it('works', () => {
      const tests = [
        { input: 'a + b', expected: '(a + b)' },
        { input: 'a + b + c', expected: '((a + b) + c)' },
        { input: 'a + b * c', expected: '(a + (b * c))' },
        { input: 'a / b * c', expected: '((a / b) * c)' },
        { input: 'a * b + c / d', expected: '((a * b) + (c / d))' },
        { input: 'a < b', expected: '(a < b)' },
        { input: 'a > b', expected: '(a > b)' },
        { input: 'a > b >= 0', expected: '((a > b) >= 0)' },
        { input: 'a < b <= 0', expected: '((a < b) <= 0)' },
        { input: 'a == b', expected: '(a == b)' },
        { input: 'a != b', expected: '(a != b)' },
        { input: 'a == b != c', expected: '((a == b) != c)' },
      ];

      tests.forEach(({ input, expected }) => {
        const scanner = new Scanner(input);
        const parser = new Parser(scanner);
        const actual = parser.parseExpression();
        expect(actual.toString()).toBe(expected);
      });
    });
  });

  describe('parseAssignmentExpression()', () => {
    it('works', () => {
      const tests = [
        { input: 'a = b', expected: '(a = b)' },
        { input: 'a = a + 1', expected: '(a = (a + 1))' },
        { input: 'a = b = c', expected: '(a = (b = c))' },
      ];

      tests.forEach(({ input, expected }) => {
        const scanner = new Scanner(input);
        const parser = new Parser(scanner);
        const actual = parser.parseExpression();
        expect(actual.toString()).toBe(expected);
      });
    });
  });

  describe('parseGroupExpression()', () => {
    it('works', () => {
      const tests = [
        { input: '(a + b) * c', expected: '((a + b) * c)' },
        { input: '(a * (b + c) / d)', expected: '((a * (b + c)) / d)' },
        { input: '(((a)))', expected: 'a' },
      ];

      tests.forEach(({ input, expected }) => {
        const scanner = new Scanner(input);
        const parser = new Parser(scanner);
        const actual = parser.parseExpression();
        expect(actual.toString()).toBe(expected);
      });
    });
  });

  describe('parseFunction()', () => {
    it('works', () => {
      const scanner = new Scanner('fn(x) { return x * x }');
      const parser = new Parser(scanner);
      const actual = parser.parseFunction();
      expect(actual.type).toBe('Function');
      expect(actual.toString()).toBe('fn(x) { return (x * x); }');
    });

    it('multiple params', () => {
      const scanner = new Scanner('fn(x, y, z) { return x * x }');
      const parser = new Parser(scanner);
      const actual = parser.parseFunction();
      expect(actual.type).toBe('Function');
      expect(actual.toString()).toBe('fn(x, y, z) { return (x * x); }');
    });
  });

  describe('parseNumber()', () => {
    it('parses \'1\' correctly', () => {
      const scanner = new Scanner('1');
      const parser = new Parser(scanner);
      const actual = parser.parseNumber();
      expect(actual.type).toBe('Number');
      expect(actual.value).toBe('1');
    });

    it('parses \'1.2345\' correctly', () => {
      const scanner = new Scanner('1.2345');
      const parser = new Parser(scanner);
      const actual = parser.parseNumber();
      expect(actual.type).toBe('Number');
      expect(actual.value).toBe('1.2345');
    });
  });

  describe('parseString()', () => {
    it('parses \'abc\' correctly', () => {
      const scanner = new Scanner('\'abc\'');
      const parser = new Parser(scanner);
      const actual = parser.parseString();
      expect(actual.type).toBe('String');
      expect(actual.value).toBe('abc');
    });
  });
});
