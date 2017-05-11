# Eve [![Build Status](https://travis-ci.com/zachsitler/eve.svg?token=jM57TwesxyoNy8ahi5gJ&branch=master)](https://travis-ci.com/zachsitler/eve)

Small, interpreted, javascript like toy language.

```js
print('Hello, World!');

let players = [
  { 'name': 'LeBron James', 'ppg': 26.4, 'apg': 8.7, 'age': 32 },
  { 'name': 'Russell Westbrook', 'ppg': 31.6, 'apg': 10.4, 'age': 28  },
  { 'name': 'James Harden', 'ppg': 29.1, 'apg': 11.2, 'age': 27 },
  { 'name': 'Kevin Durant', 'ppg': 25.1, 'apg': 3.8, 'age': 27 }
];

let pointPerGameLeaders = players
   .sort((a, b) => b.ppg - a.ppg)
   .map(player => {
     return { player.name: player.ppg }
   });

print(pointPerGameLeaders); // ==> Point per game leaders: [{ 'Russell Westbrook': 31.6 }, ... ]

let averagePointsPerGameUnder30 = players
  .filter(player => player.age < 30)
  .map(player => player.ppg)
  .avg();

print('Average Points Per Game Under 30: ' + averagePointsPerGameUnder30); // ==> ...: 28.6

print('Number of players with five assists or better: ' + players
  .filter(player => player.apg > 5)
  .count()); // ==> Number of players with five assists or better: 3

print('Most assists per game: ' + players
  .map(player => player.apg)
  .sort()
  .reverse()
  .first()); // ==> Most assists per game: 11.2
```

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
10.234; // floating points
```

### Strings
```js
'foo'; // strings
'hello' + 'bar'; // concatenation
```

### Arrays

Arrays can arbitrarily grow/decrease in size and accept any values.
```js
[1, 2, 3]; // standard array
[[1], [2], [3]; // nested arrays
[{}, fn() {}, 'foo']; // any generic value
[1, 2, 3][2]; // arrays can be accessed in via an index expression
```

Arrays have a handy set of functions that can be accessed.
```js
[1, 2, 3].count();               // ==> 3
[1, 2, 3].map(x => x + 1);       // ==> [2, 3, 4]
[1, 2, 3].each(x => x);          // ==> null
[1, 2, 3].filter(x => x > 1);    // ==> [2, 3]
[1, 2, 3].sort((a, b) => b - 1); // ==> [3, 2, 1]
[1, 2, 3].reverse();             // ==> [3, 2, 1]
[1, 2, 3].rest();                // ==> [2, 3]
[1, 2, 3].first();               // ==> [1]
[1, 2, 3].last();                // ==> [3]
[1, 2, 3].avg();                 // ==> [2]
[1, 2, 3].sum();                 // ==> [6]
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
let fibonacci = fn(n) {
  if (n <= 1) return 1;

  fibonacci(n - 1) + fibonacci(n - 2);
};
```

Functions can be lambdas as well.
```js
(x => x + 1)(3); // ==> 4
```

Functions are first class objects and can be returned and passed around like any other object.
```js
let concat = a => b => c => a + b + c;
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
let makeAdder = x => y => x + y;
let add5 = makeAdder(5);
let add10 = makeAdder(10);

print(add5(2)); // expect: 7
print(add10(2)); // expect: 12
```
