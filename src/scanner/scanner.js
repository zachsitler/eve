const { TokenType, Token } = require('../token');

/*
 * The Scanner is responsible for taking a string and tokenizing
 * it.
 *
 * For example, consider the string below and it's tokenized output:
 *   let language = 'eve'; -> [LET, IDENTIFIER, EQUAL, STRING, SEMICOLON]
 *
 */
module.exports = class Scanner {
  static isDigit(ch) {
    return ch >= '0' && ch <= '9';
  }

  static isLetter(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
  }

  static reservedWords = {
    let: TokenType.LET,
    if: TokenType.IF,
    else: TokenType.ELSE,
    return: TokenType.RETURN,
    fn: TokenType.FN,
    while: TokenType.WHILE,
    true: TokenType.TRUE,
    false: TokenType.FALSE,
    null: TokenType.NULL,
  };

  constructor(input) {
    this.input = input;
    this.current = 0;
  }

  /*
   * Utility function for returning all the tokens in a string.
   * Small note: This is not actually used in the parser. It
   * explicity calls `scanToken()`.
   */
  scanTokens() {
    const tokens = [];

    while (!this.isAtEnd()) {
      tokens.push(this.scanToken());
    }

    return tokens;
  }

  /*
   * Returns the next token from the input. It skips any and all
   * whitespace characters. Futhermore, any illegal tokens will be explicity
   * thrown.
   */
  scanToken() {
    // Reset the read pointer.
    this.start = this.current;

    while (!this.isAtEnd()) {
      const ch = this.consume();

      switch (ch) {
        case '+':
          return this.addToken(TokenType.PLUS);
        case '-':
          return this.addToken(TokenType.MINUS);
        case '*':
          return this.addToken(TokenType.STAR);
        case ';':
          return this.addToken(TokenType.SEMICOLON);
        case ':':
          return this.addToken(TokenType.COLON);
        case '.':
          return this.addToken(TokenType.PERIOD);
        case ',':
          return this.addToken(TokenType.COMMA);
        case '[':
          return this.addToken(TokenType.LEFT_BRACKET);
        case ']':
          return this.addToken(TokenType.RIGHT_BRACKET);
        case '{':
          return this.addToken(TokenType.LEFT_BRACE);
        case '}':
          return this.addToken(TokenType.RIGHT_BRACE);
        case '(':
          return this.addToken(TokenType.LEFT_PAREN);
        case ')':
          return this.addToken(TokenType.RIGHT_PAREN);
        case '=':
          if (this.match('=')) {
            return this.addToken(TokenType.EQUAL_EQUAL);
          }
          return this.addToken(TokenType.EQUAL);

        case '!':
          if (this.match('=')) {
            return this.addToken(TokenType.BANG_EQUAL);
          }
          return this.addToken(TokenType.BANG);

        case '<':
          if (this.match('=')) {
            return this.addToken(TokenType.LESS_EQUAL);
          }
          return this.addToken(TokenType.LESS);

        case '>':
          if (this.match('=')) {
            return this.addToken(TokenType.GREATER_EQUAL);
          }
          return this.addToken(TokenType.GREATER);

        case "'":
          return this.scanString();
        // Skip whitespace.
        case ' ':
        case '\n':
        case '\t':
        case '\r':
          this.start = this.current;
          break;

        case '/':
          if (this.match('/')) {
            this.skipComment();
            break;
          } else {
            return this.addToken(TokenType.SLASH);
          }

        default:
          if (Scanner.isDigit(ch)) {
            return this.scanNumber();
          } else if (Scanner.isLetter(ch)) {
            return this.scanIdentifier();
          }
          throw new Error(`Syntax error: unrecognized token "${ch}"`);
      }
    }

    return new Token(TokenType.EOF, '\0');
  }

  /*
   * Tokenizes a number.
   *
   * Examples of valid numbers:
   *   `123`
   *   `123.456`
   */
  scanNumber() {
    while (Scanner.isDigit(this.peek()) || this.peek() === '.') {
      this.consume();
    }
    return this.addToken(TokenType.NUMBER);
  }

  /*
   * Tokenizes an identifier.
   *
   * Examples of valid identifiers:
   *   `abc`
   *   `abc123`
   *   `_abc123`
   *   `_Some_Ridiculous_Var_Name_1234_`
   */
  scanIdentifier() {
    while (Scanner.isLetter(this.peek()) || Scanner.isDigit(this.peek())) {
      this.consume();
    }

    const token = this.input.substring(this.start, this.current);
    const tokenType = Scanner.reservedWords[token];
    if (tokenType) {
      return this.addToken(tokenType);
    }

    return this.addToken(TokenType.IDENTIFIER);
  }

  /*
   * Tokenizes a string. In eve, a string is represented
   * by an opening `'` and closing `'`.
   *
   * For example:
   *   'foo'
   *   'abc12348_!@#$'
   *
   * TODO: Support interpolation and escaping.
   */
  scanString() {
    while (this.peek() !== "'" && !this.isAtEnd()) {
      this.consume();
    }

    if (this.isAtEnd()) {
      throw new Error('Syntax error: unterminated string');
    }

    this.consume();

    // Strip the quotes.
    const literal = this.input.substring(this.start + 1, this.current - 1);
    return new Token(TokenType.STRING, literal);
  }

  skipComment() {
    while (this.peek() !== '\n' && !this.isAtEnd()) {
      this.consume();
    }
  }

  addToken(type) {
    const literal = this.input.substring(this.start, this.current);
    return new Token(type, literal);
  }

  consume() {
    this.current += 1;
    return this.input[this.current - 1];
  }

  match(expected) {
    if (this.isAtEnd()) return false;
    if (expected !== this.peek()) return false;

    this.consume();
    return true;
  }

  peek() {
    return this.input[this.current];
  }

  isAtEnd() {
    return this.current >= this.input.length;
  }
};
