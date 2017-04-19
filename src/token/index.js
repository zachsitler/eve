/*
 * TokenType is an enum consisting on contants that are used to
 * represent lexical tokens.
 */
class TokenType {
  static EOF = 0;
  static PLUS = 1;
  static MINUS = 2;
  static SLASH = 3;
  static STAR = 4;
  static SEMICOLON = 5;
  static LEFT_PAREN = 6;
  static RIGHT_PAREN = 7;
  static LEFT_BRACKET = 8;
  static RIGHT_BRACKET = 9;
  static LEFT_BRACE = 10;
  static RIGHT_BRACE = 11;
  static COLON = 12;
  static IDENTIFIER = 13;
  static NUMBER = 14;
  static STRING = 15;
  static EQUAL = 16;
  static EQUAL_EQUAL = 17;
  static BANG = 18;
  static BANG_EQUAL = 19;
  static LESS = 20;
  static LESS_EQUAL = 21;
  static GREATER = 22;
  static GREATER_EQUAL = 23;
  static LET = 24;
  static IF = 25;
  static ELSE = 26;
  static RETURN = 27;
  static FN = 28;
  static WHILE = 29;
  static COMMA = 30;
  static TRUE = 31;
  static FALSE = 32;
  static NULL = 33;
  static PERIOD = 34;
}

/*
 * A token is used to represent a lexical token.
 */
class Token {
  constructor(type, literal) {
    this.type = type;
    this.literal = literal;
  }
}

module.exports = {
  TokenType,
  Token,
};
