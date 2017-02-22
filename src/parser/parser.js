const { Scanner } = require('../scanner');
const { Token, TokenType } = require('../token');

// Precedences.
const LOWEST = 0; // a, 'foo', 1
const ASSIGNMENT = 1; // a = b
const CONDITIONAL = 2; // >, <, ==, ..
const SUM = 3; // +, -
const PRODUCT = 4; // *, /
const PREFIX = 5; // -a, !a

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
    this.registerInfix(TokenType.EQUAL, this.parseAssignmentExpression);

    this.prefix(TokenType.MINUS);
    this.prefix(TokenType.PLUS);
    this.prefix(TokenType.BANG);

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
      let stmt = this.parseStatement();
      if (stmt) ast.statements.push(stmt)
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
        str += ` ${this.thenArm.toString()}`
        if (this.elseArm) str += ` else ${this.elseArm.toString()}`
        return str;
      }
    };

    // consume )
    if (this.tok.type === TokenType.RIGHT_PAREN) {
      this.nextToken();
    }

    ifStatement.thenArm = this.parseStatement();

    if (this.tok.type === TokenType.ELSE) {
      // consume else
      this.nextToken();
      ifStatement.elseArm = this.parseStatement();
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
      }
    };

    while (this.tok.type !== TokenType.RIGHT_BRACE) {
      const statement = this.parseStatement();
      if (statement) blockStatement.statements.push(statement)
    }

    // consume closing }
    this.nextToken();

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
      }
    };

    if (this.isPeekToken(TokenType.EQUAL)) {
      // consume ident
      this.nextToken();

      // consume equals
      this.nextToken();
      statement.value = this.parseExpression();
    }

    this.nextToken();
    if (this.isCurToken(TokenType.SEMICOLON)) {
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
        return `return ${this.expression.toString()};`
      }
    };

    this.nextToken();
    if (this.isCurToken(TokenType.SEMICOLON)) {
      this.nextToken();
    }

    return statement;
  }

  parseExpressionStatement() {
    const statement = {
      type: 'ExpressionStatement',
      expression: this.parseExpression(),
      toString() {
        return `${this.expression.toString()};`
      }
    };

    this.nextToken();
    if (this.isCurToken(TokenType.SEMICOLON)) {
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

    while (precedence < this.peekPrecedence()) {
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
    const expression = {
      type: 'AssignmentExpression',
      op: this.tok.literal,
      left,
      toString() {
        return `(${this.left.toString()} ${this.op} ${this.right.toString()})`;
      },
    };

    this.nextToken();
    expression.right = this.parseExpression();

    return expression;
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
      }
    }

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

  getPrecedence(): number {
    const precedence = precedences[this.tok.type];
    if (precedence) return precedence;

    return LOWEST;
  }
};
