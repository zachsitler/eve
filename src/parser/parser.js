const { TokenType } = require('../token');

// Precedences.
const LOWEST = 0; // a, 'foo', 1
const ASSIGNMENT = 1; // a = b
const CONDITIONAL = 2; // >, <, ==, ..
const SUM = 3; // +, -
const PRODUCT = 4; // *, /
const PREFIX = 5; // -a, !a
const CALL = 6; // -a, !a
const INDEX = 7; // array[1]

// TODO: Use the precedence values above.
const precedences = {
  [TokenType.MINUS]: SUM,
  [TokenType.PLUS]: SUM,
  [TokenType.SLASH]: PRODUCT,
  [TokenType.STAR]: PRODUCT,
  [TokenType.LESS]: CONDITIONAL,
  [TokenType.LESS_EQUAL]: CONDITIONAL,
  [TokenType.GREATER]: CONDITIONAL,
  [TokenType.GREATER_EQUAL]: CONDITIONAL,
  [TokenType.EQUAL_EQUAL]: CONDITIONAL,
  [TokenType.BANG_EQUAL]: CONDITIONAL,
  [TokenType.EQUAL]: ASSIGNMENT,
  [TokenType.LEFT_PAREN]: CALL,
  [TokenType.LEFT_BRACKET]: INDEX,
};

module.exports = class Parser {
  constructor(scanner) {
    this.scanner = scanner;

    // Set tok/peek tokens
    this.nextToken();
    this.nextToken();

    this.prefixParsers = {};
    this.infixParsers = {};

    this.register(TokenType.IDENTIFIER, this.parseIdentifier);
    this.register(TokenType.NUMBER, this.parseNumber);
    this.register(TokenType.STRING, this.parseString);
    this.register(TokenType.TRUE, this.parseBoolean);
    this.register(TokenType.FALSE, this.parseBoolean);
    this.register(TokenType.NULL, this.parseNull);
    this.register(TokenType.LEFT_PAREN, this.parseGroupExpression);
    this.register(TokenType.FN, this.parseFunction);
    this.register(TokenType.LEFT_BRACKET, this.parseArray);
    this.register(TokenType.LEFT_BRACE, this.parseMap);
    this.registerInfix(TokenType.EQUAL, this.parseAssignmentExpression);
    this.registerInfix(TokenType.LEFT_PAREN, this.parseCallExpression);
    this.registerInfix(TokenType.LEFT_BRACKET, this.parseIndexExpression);

    this.prefix(TokenType.MINUS);
    this.prefix(TokenType.PLUS);
    this.prefix(TokenType.BANG);

    this.infix(TokenType.MINUS);
    this.infix(TokenType.PLUS);
    this.infix(TokenType.STAR);
    this.infix(TokenType.SLASH);
    this.infix(TokenType.LESS);
    this.infix(TokenType.LESS_EQUAL);
    this.infix(TokenType.GREATER);
    this.infix(TokenType.GREATER_EQUAL);
    this.infix(TokenType.EQUAL_EQUAL);
    this.infix(TokenType.BANG_EQUAL);
  }

  register(type, parser) {
    this.prefixParsers[type] = parser.bind(this);
  }

  registerInfix(type, parser) {
    this.infixParsers[type] = parser.bind(this);
  }

  prefix(type) {
    this.register(type, this.parsePrefixExpression);
  }

  infix(type) {
    this.infixParsers[type] = this.parseInfixExpression.bind(this);
  }

  parseProgram() {
    const ast = {
      type: 'Program',
      statements: [],
    };

    while (this.tok.type !== TokenType.EOF) {
      const stmt = this.parseStatement();
      if (stmt) ast.statements.push(stmt);
      this.nextToken();
    }

    return ast;
  }

  parseStatement() {
    switch (this.tok.type) {
      case TokenType.IF:
        return this.parseIfStatement();
      case TokenType.LET:
        return this.parseLetStatement();
      case TokenType.RETURN:
        return this.parseReturnStatement();
      case TokenType.LEFT_BRACE:
        return this.parseBlockStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  parseIfStatement() {
    // consume if
    this.nextToken();

    const ifStatement = {
      type: 'IfStatement',
      condition: this.parseExpression(),
      toString() {
        let str = `if (${this.condition.toString()})`;
        str += ` ${this.thenArm.toString()}`;
        if (this.elseArm) str += ` else ${this.elseArm.toString()}`;
        return str;
      },
    };

    if (!this.match(TokenType.RIGHT_PAREN)) {
      return null;
    }

    ifStatement.thenArm = this.parseStatement();

    if (this.expect(TokenType.ELSE)) {
      this.nextToken();
      ifStatement.elseArm = this.parseStatement();
      this.match(TokenType.RIGHT_BRACE);
    }

    return ifStatement;
  }

  parseBlockStatement() {
    // consume {
    this.nextToken();

    const blockStatement = {
      type: 'BlockStatement',
      statements: [],
      toString() {
        return `{ ${this.statements.map(stmt => stmt.toString()).join('')} }`;
      },
    };

    while (this.tok.type !== TokenType.RIGHT_BRACE) {
      const statement = this.parseStatement();
      if (statement) blockStatement.statements.push(statement);
      this.nextToken();
    }

    return blockStatement;
  }

  parseLetStatement() {
    // consume let
    this.nextToken();

    const statement = {
      type: 'LetStatement',
      name: this.parseIdentifier(),
      toString() {
        let str = `let ${this.name.toString()}`;
        if (this.value) str += ` = ${this.value.toString()}`;
        return `${str};`;
      },
    };

    if (this.isPeekToken(TokenType.EQUAL)) {
      // consume ident
      this.nextToken();

      // consume equals
      this.nextToken();
      statement.value = this.parseExpression();
    }

    if (this.isPeekToken(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  parseReturnStatement() {
    this.nextToken();

    const statement = {
      type: 'ReturnStatement',
      expression: this.parseExpression(),
      toString() {
        return `return ${this.expression.toString()};`;
      },
    };

    if (this.isPeekToken(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  parseExpressionStatement() {
    const statement = {
      type: 'ExpressionStatement',
      expression: this.parseExpression(),
      toString() {
        return `${this.expression.toString()};`;
      },
    };

    if (this.isPeekToken(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  parseExpression(precedence = LOWEST) {
    const prefix = this.prefixParsers[this.tok.type];

    if (!prefix) {
      throw new Error(`Syntax error: unexpected token ${this.tok.literal}`);
    }

    let left = prefix();

    while (
      !this.isPeekToken(TokenType.SEMI_COLON) &&
      precedence < this.peekPrecedence()
    ) {
      const infix = this.infixParsers[this.peek.type];
      if (!infix) return left;

      this.nextToken();
      left = infix(left);
    }

    return left;
  }

  parsePrefixExpression() {
    const expression = {
      type: 'PrefixExpression',
      op: this.tok.literal,
      toString() {
        return `(${this.op}${this.right.toString()})`;
      },
    };

    // Advance past the operator.
    this.nextToken();

    expression.right = this.parseExpression(PREFIX);

    return expression;
  }

  parseInfixExpression(left) {
    const expression = {
      type: 'InfixExpression',
      op: this.tok.literal,
      left,
      toString() {
        return `(${this.left.toString()} ${this.op} ${this.right.toString()})`;
      },
    };

    const precedence = this.getPrecedence();
    this.nextToken();
    expression.right = this.parseExpression(precedence);

    return expression;
  }

  parseAssignmentExpression(left) {
    const expr = {
      type: 'AssignmentExpression',
      op: this.tok.literal,
      left,
      toString() {
        return `(${this.left.toString()} ${this.op} ${this.right.toString()})`;
      },
    };

    this.nextToken();
    expr.right = this.parseExpression();

    return expr;
  }

  parseIndexExpression(left) {
    const expr = {
      type: 'IndexExpression',
      left,
      toString() {
        return `${this.left.toString()}[${this.index.toString()}]`;
      },
    };

    this.nextToken();

    expr.index = this.parseExpression();

    if (!this.expect(TokenType.RIGHT_BRACKET)) {
      return null;
    }

    return expr;
  }

  parseCallExpression(fn) {
    return {
      type: 'CallExpression',
      fn,
      args: this.parseExpressionList(TokenType.RIGHT_PAREN),
      toString() {
        return `${this.fn}(${this.args.map(arg => arg.toString()).join(', ')})`;
      },
    };
  }

  parseExpressionList(end) {
    const args = [];

    if (this.isPeekToken(end)) {
      this.nextToken();
      return args;
    }

    this.nextToken();
    args.push(this.parseExpression());

    while (this.isPeekToken(TokenType.COMMA)) {
      this.nextToken();
      this.nextToken();
      args.push(this.parseExpression());
    }

    if (!this.isPeekToken(end)) {
      return null;
    }

    this.nextToken();

    return args;
  }

  parseGroupExpression() {
    // Consume opening '('.
    this.nextToken();

    const expression = this.parseExpression();

    if (this.isPeekToken(TokenType.RIGHT_PAREN)) {
      this.nextToken();
    }

    return expression;
  }

  parseParameterList() {
    // consume (
    this.nextToken();

    const parameters = {
      type: 'Parameters',
      body: [],
      toString() {
        return `(${this.body.map(ident => ident.toString()).join(', ')})`;
      },
    };

    while (this.tok.type !== TokenType.RIGHT_PAREN) {
      parameters.body.push(this.parseIdentifier());
      this.nextToken();

      if (this.tok.type === TokenType.COMMA) {
        // consume ','
        this.nextToken();
      }
    }

    // consume trailing )
    this.nextToken();

    return parameters;
  }

  parseFunction() {
    // consume fn
    this.nextToken();

    const fn = {
      type: 'Function',
      params: this.parseParameterList(),
      toString() {
        return `fn${this.params.toString()} ${this.body.toString()}`;
      },
    };

    fn.body = this.parseBlockStatement();

    return fn;
  }

  parseMap() {
    const map = {
      type: 'map',
      pairs: [],
      toString() {
        const keys = this.pairs
          .map(([key, val]) => `${key.toString()}: ${val.toString()}`)
          .join(', ');

        return `{${keys}}`;
      }
    };

    let pairIndex = 0;

    while (!this.isPeekToken(TokenType.RIGHT_BRACE)) {
      this.nextToken();
      const key = this.parseExpression();

      if (!this.expect(TokenType.COLON)) {
        return null;
      }

      this.nextToken();
      map.pairs[pairIndex] = [key, this.parseExpression()];
      pairIndex += 1;

      if (!this.isPeekToken(TokenType.RIGHT_BRACE) && !this.expect(TokenType.COMMA)) {
        return null;
      }
    }

    return map;
  }

  parseArray() {
    const array = {
      type: 'Array',
      elements: this.parseExpressionList(TokenType.RIGHT_BRACKET),
      toString() {
        return `[${this.elements.map(elem => elem.toString()).join(', ')}]`;
      },
    };

    return array;
  }

  parseIdentifier() {
    return {
      type: 'Identifier',
      value: this.tok.literal,
      toString() {
        return this.value;
      },
    };
  }

  parseNull() {
    return {
      type: 'Null',
      value: this.tok.literal,
      toString() {
        return this.value;
      },
    };
  }

  parseBoolean() {
    return {
      type: 'Boolean',
      value: this.tok.literal,
      toString() {
        return this.value;
      },
    };
  }

  parseNumber() {
    return {
      type: 'Number',
      value: this.tok.literal,
      toString() {
        return this.value;
      },
    };
  }

  parseString() {
    return {
      type: 'String',
      value: this.tok.literal,
      toString() {
        return `'${this.value}'`;
      },
    };
  }

  match(type) {
    if (this.isCurToken(type)) {
      this.nextToken();
      return true;
    }
    return false;
  }

  expect(type) {
    if (this.isPeekToken(type)) {
      this.nextToken();
      return true;
    }
    return false;
  }

  isPeekToken(type) {
    return this.peek.type === type;
  }

  isCurToken(type) {
    return this.tok.type === type;
  }

  nextToken() {
    this.tok = this.peek;
    this.peek = this.scanner.scanToken();
  }

  peekPrecedence() {
    const precedence = precedences[this.peek.type];
    if (precedence) return precedence;

    return LOWEST;
  }

  getPrecedence() {
    const precedence = precedences[this.tok.type];
    if (precedence) return precedence;

    return LOWEST;
  }
};
