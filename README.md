# Eve [![Build Status](https://travis-ci.com/zachsitler/eve.svg?token=jM57TwesxyoNy8ahi5gJ&branch=master)](https://travis-ci.com/zachsitler/eve)

Eve is a little, toy, javascript like langauge interpreted in javascript.
I made it entirely for fun.

## Getting started
```sh
$ git clone git@github.com:zachsitler/eve.git
$ cd eve && npm install
$ npm run build && node build/eve.js
> print('hello, world!')

# Or run a file
$ node build/eve.js ./main.eve
```

## Syntax

### Comments

Only single line comments are supported.
```js
// This is a comment.
print('foo'); // This is also a comment.
```

### Numbers

All numbers are stored as doubles (64-bit) values.
```js
5; // integer
-10; // negative values
10.234 // floating points
```

### Strings
```js
'foo'; // strings
'hello' + 'bar'; // concatenation
```

### Arrays

Arrays can be arbitrarily grow/decrease in size and accept any values.
```js
[1, 2, 3]; // standard array
[[1], [2], [3]; // nested arrays
[{}, fn() {}, 'foo']; // any generic value
[1, 2, 3][2]; // arrays can be accessed in via an index expression
```

### Objects

Objects are identical to JS objects in behavior.
```js
{'foo': 'bar'}; // obj declaration
{ 1 + 2: '3'}; // keys can be expressions
let obj = {'name': 'Zach'};
obj.name === obj['name']; // keys can be accessed as properties or index expressions
```

### Functions

Functions are defined with the keyword `fn`. Function declaration and
behavior is similar to JS as well.
```js
let sum = fn(x, y) {
  return x + y;
};
sum(1, 2); // 3
```

Functions can be lambdas as well.
```js
(fn(x) { x + 1 })(3); // 4
```

Functions are first class objects and can be returned and passed around
like any other object.
```js
let concat = fn(a) { fn(b) { fn(c) { a + b + c }}};
print(concat('a')('b')('c')); // abc
```

### Expressions

Expressions follow typical PEMDAS precendence.
```js
1 + 2; // 3
1 + 2 * 3; // 7
(1 + 2) * 3; // 9
4 / 4 * 4; // 4
```

### Sample programs

#### Hello, world
```js
print('hello, world');
```

#### Fibonacci
```js
let fibonacci = fn(n) {
  if (n <= 1) return 1;

  fibonacci(n - 1) + fibonacci(n - 2);
};

print(fibonacci(5)); // ==> 8
```

#### Closures
```js
let makeAdder = fn(x) {
  return fn(y) {
    return x + y;
  };
};

let add5 = makeAdder(5);
let add10 = makeAdder(10);

print(add5(2)); // expect: 7
print(add10(2)); // expect: 12
```
