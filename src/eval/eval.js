class Obj {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }

  inspect() {
    return this.value.toString();
  }
}

function evalStatements(statements) {
  let result;

  statements.forEach(statement => {
    result = Eval(statement);
  })

  return result;
}

function evalPrefixExpression(op, right) {
  switch (op) {
    case '!':
      return evalBangPrefix(right);
    case '-':
      return evalMinusPrefix(right);
    default:
      return null;
  }
}

function evalBangPrefix(right) {
  switch (right.value) {
    case true:
      return new Obj('Boolean', false);
    case false:
      return new Obj('Boolean', true);
    case null:
      return new Obj('Null', null);
    default:
      return new Obj('Boolean', false);
  }
}

function evalMinusPrefix(right) {
  if (right.type !== 'Number') {
    return new Obj('Null', null);
  }

  return new Obj('Number', -right.value);
}

function Eval(node) {
  switch (node.type) {
    case 'Program':
      return evalStatements(node.statements);

    case 'ExpressionStatement':
      return Eval(node.expression);

    case 'PrefixExpression':
      let right = Eval(node.right);
      return evalPrefixExpression(node.op, right);

    case 'Number':
      return new Obj('Number', parseFloat(node.value));

    case 'String':
      return new Obj('String', node.value);

    case 'Boolean':
      return new Obj('Boolean', node.value === 'true');

    default:
      return new Obj('Null', null);
  }
}

module.exports = Eval;
