const fs = require('fs');
const readline = require('readline');
const { Scanner } = require('./scanner');
const { Parser } = require('./parser');
const Eval = require('./eval');

function run(input) {
  const scanner = new Scanner(input);
  const parser = new Parser(scanner);
  const result = parser.parseProgram();
  return Eval(result).inspect();
}

function runFile(path) {
  const contents = fs.readFileSync(path, 'utf8');
  run(contents);
}

function runPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  });

  rl.prompt();

  rl.on('line', (line) => {
    rl.output.write(`${run(line)}\n`);
    rl.prompt();
  });

  rl.on('close', () => {
    process.exit();
  });
}

if (process.argv.length > 3) {
  console.log('Usage: eve [script]');
} else if (process.argv.length === 3) {
  runFile(process.argv[2]);
} else {
  runPrompt();
}
