const Closure = require('./closure');
const Eve = require('./runtime');

function isError(obj) {
  if (obj) {
    return obj.type === 'Error';
  }

  return false;
}

function isTruthy(obj) {
  switch (obj.inspect()) {
    case null:
      return null;
    case false:
      return false;
    case true:
      return true;
    default:
      return true;
  }
}

function unwrapResult(obj) {
  if (obj.type === 'Return') {
    return obj.value;
  }

  return obj;
}

function extendFnEnv(fn, args) {
  const env = new Closure(fn.env);

  fn.params.body.forEach((param, i) => {
    env.set(param.value, args[i]);
  });

  return env;
}

function applyFunction(fn, args) {
  if (fn.type !== 'Function') {
    return new Eve.Error(`not a function: ${fn.type}`);
  }

  const closure = extendFnEnv(fn, args);
  const result = Eval(fn.body, closure);

  return unwrapResult(result);
}

function evalHash(node, env) {
  const pairs = {};

  for (let i = 0; i < node.pairs.length; i++) {
    const [key, val] = node.pairs[i];

    const evalKey = Eval(key, env);
    if (isError(key)) {
      return key;
    }

    const evalVal = Eval(val, env);
    if (isError(evalVal)) {
      return evalVal;
    }

    pairs[evalKey.value] = evalVal;
  }

  return new Eve.Hash(pairs);
}

function evalIndexExpression(left, index) {
  if (left.type === 'Array' && index.type === 'Number') {
    return evalIndexArrayExpression(left, index);
  }
  return new Eve.Error(`index operator not supported: ${left.type}`);
}

function evalIndexArrayExpression(array, index) {
  const max = array.elements.length - 1;
  const addr = index.value;

  if (addr < 0 || addr > max) {
    return new Eve.Null();
  }

  return array.elements[addr];
}

function evalIdentifier(node, env) {
  const val = env.get(node.value);

  if (!val) {
    return new Eve.Error(`${node.value} is not defined`);
  }

  return val;
}

function evalExpressions(exps, env) {
  const results = [];

  for (let i = 0; i < exps.length; i++) {
    const exp = exps[i];
    const result = Eval(exp, env);

    if (isError(result)) {
      return [result];
    }

    results.push(result);
  }

  return results;
}

function evalProgram(statements, env) {
  let result;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    result = Eval(statement, env);

    if (result.type === 'Return') {
      return result.value;
    } else if (result.type === 'Error') {
      return result;
    }
  }

  return result;
}

function evalBlockStatement(statements, env) {
  let result;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    result = Eval(statement, env);

    if (result && (result.type === 'Return' || result.type === 'Error')) {
      return result;
    }
  }

  return result;
}

function evalIfStatement(statement, env) {
  const condition = Eval(statement.condition, env);

  if (isError(condition)) {
    return condition;
  }

  if (isTruthy(condition)) {
    return Eval(statement.thenArm, env);
  } else if (statement.elseArm) {
    return Eval(statement.elseArm, env);
  }
  return new Eve.Null();
}

function evalPrefixExpression(op, right) {
  switch (op) {
    case '!':
      return evalBangPrefix(right);
    case '-':
      return evalMinusPrefix(right);
    default:
      return new Eve.Error(`unknown operator: ${op} ${right.type}`);
  }
}

function evalBangPrefix(right) {
  switch (right.value) {
    case true:
      return new Eve.Boolean(false);
    case false:
      return new Eve.Boolean(true);
    case null:
      return new Eve.Null();
    default:
      return new Eve.Boolean(false);
  }
}

function evalMinusPrefix(right) {
  if (right.type !== 'Number') {
    return new Eve.Error(`unknown operator: -${right.type}`);
  }

  return new Eve.Number(-right.value);
}

function evalInfixExpression(op, left, right) {
  if (left.type === 'Number' && right.type === 'Number') {
    return evalIntegerInfixExpression(op, left, right);
  } else if (left.type === 'String' && right.type === 'String') {
    return evalStringInfixExpression(op, left, right);
  } else if (op === '==') {
    return new Eve.Boolean(left.value === right.value);
  } else if (op === '!=') {
    return new Eve.Boolean(left.value !== right.value);
  } else if (left.type !== right.type) {
    return new Eve.Error(`type mismatch: ${left.type} ${op} ${right.type}`);
  }
  return new Eve.Error(`unknown operator: ${left.type} ${op} ${right.type}`);
}

function evalIntegerInfixExpression(op, left, right) {
  const leftVal = left.value;
  const rightVal = right.value;

  switch (op) {
    case '+':
      return new Eve.Number(leftVal + rightVal);
    case '-':
      return new Eve.Number(leftVal - rightVal);
    case '/':
      return new Eve.Number(leftVal / rightVal);
    case '*':
      return new Eve.Number(leftVal * rightVal);
    case '<':
      return new Eve.Boolean(leftVal < rightVal);
    case '>':
      return new Eve.Boolean(leftVal > rightVal);
    case '<=':
      return new Eve.Boolean(leftVal <= rightVal);
    case '>=':
      return new Eve.Boolean(leftVal >= rightVal);
    case '==':
      return new Eve.Boolean(leftVal === rightVal);
    case '!=':
      return new Eve.Boolean(leftVal !== rightVal);
    default:
      return new Eve.Error(
        `unknown operator: ${left.type} ${op} ${right.type}`
      );
  }
}

function evalStringInfixExpression(op, left, right) {
  if (op !== '+') {
    return new Eve.Error(`unknown operator: ${left.type} ${op} ${right.type}`);
  }

  return new Eve.String(left.value + right.value);
}

function Eval(node, env) {
  switch (node.type) {
    case 'Program':
      return evalProgram(node.statements, env);

    case 'BlockStatement':
      return evalBlockStatement(node.statements, env);

    case 'IfStatement':
      return evalIfStatement(node, env);

    case 'Function':
      return new Eve.Function(node.params, node.body, env);

    case 'LetStatement':
      const val = Eval(node.value, env);

      if (isError(val)) {
        return val;
      }

      // Add the new var to the env.
      env.set(node.name, val);
      return val;

    case 'ReturnStatement': {
      const val = Eval(node.expression, env);

      if (isError(val)) {
        return val;
      }

      return new Eve.Return(val);
    }

    case 'ExpressionStatement':
      return Eval(node.expression, env);

    case 'IndexExpression':
      const left = Eval(node.left, env);

      if (isError(left)) {
        return left;
      }

      const index = Eval(node.index, env);
      if (isError(index)) {
        return index;
      }

      return evalIndexExpression(left, index);

    case 'CallExpression':
      const fn = Eval(node.fn, env);

      if (isError(fn)) {
        return fn;
      }

      const args = evalExpressions(node.args, env);
      if (args.length && isError(args[0])) {
        return args[0];
      }

      return applyFunction(fn, args);

    case 'AssignmentExpression':
      const right = Eval(node.right, env);

      if (isError(right)) {
        return right;
      }

      env.set(node.left, right);
      return right;

    case 'PrefixExpression': {
      const right = Eval(node.right, env);

      if (isError(right)) {
        return right;
      }

      return evalPrefixExpression(node.op, right);
    }

    case 'InfixExpression': {
      const left = Eval(node.left, env);
      if (isError(left)) {
        return left;
      }

      const right = Eval(node.right, env);
      if (isError(right)) {
        return right;
      }

      return evalInfixExpression(node.op, left, right);
    }

    case 'Hash':
      return evalHash(node, env);

    case 'Array':
      const elements = evalExpressions(node.elements, env);

      if (elements.length === 1 && isError(elements[0])) {
        return elements[0];
      }

      return new Eve.Array(elements);

    case 'Identifier':
      return evalIdentifier(node, env);

    case 'Number':
      return new Eve.Number(parseFloat(node.value));

    case 'String':
      return new Eve.String(node.value);

    case 'Boolean':
      return new Eve.Boolean(node.value === 'true');

    default:
      return new Eve.Null();
  }
}

module.exports = Eval;
