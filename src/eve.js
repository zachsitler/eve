import fs from 'fs'
import readline from 'readline'
import { Scanner } from './scanner'
import { Parser } from './parser'
import { Eval, Environment } from './eval'

/**
 * This is where the "magic" happens. Scan, Parse, and finally interpret
 * the desired input.
 *
 * @param  {String} input
 * @param  {Environment} env
 * @return {String} - the output of the interpreted program
 */
function run(input, env) {
  const scanner = new Scanner(input)
  const parser = new Parser(scanner)
  const result = parser.parseProgram()
  return Eval(result, env).inspect()
}

/**
 * A helper function to execute a script at a given path.
 * @param  {String} path - the relative path to the file
 */
function runFile(path) {
  const contents = fs.readFileSync(path, 'utf8')
  run(contents, new Environment())
}

/**
 * The REPL!!
 */
function runPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> ',
  })

  const env = new Environment()

  rl.prompt()

  rl.on('line', line => {
    rl.output.write(`${run(line, env)}\n`)
    rl.prompt()
  })

  rl.on('close', () => {
    process.exit()
  })
}

if (process.argv.length > 3) {
  console.log('Usage: eve [script]')
} else if (process.argv.length === 3) {
  runFile(process.argv[2])
} else {
  runPrompt()
}
