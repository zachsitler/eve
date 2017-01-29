// @flow
import fs from 'fs'
import readline from 'readline'

function run (input) {
  console.log(input)
}

function runFile (path) {
  const contents = fs.readFileSync(path)
  run(contents)
}

function runPrompt () {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
  })

  rl.prompt()

  rl.on('line', (line) => {
    run(line)
    rl.prompt()
  })

  rl.on('close', () => {
    process.exit()
  })
}

if (process.argv.length > 3) {
  console.log('Usage: eve [script]')
} else if (process.argv.length === 1) {
  runFile(process.argv[0])
} else {
  runPrompt()
}
