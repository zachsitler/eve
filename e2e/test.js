const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

/**
 * Tests should be of the following format:

 *   print(someLine()); // expect: 'foo'
 *   print(1 + 2); // expect: 3
 *
 * Note, that they must log to standard out in order for the test to
 * work correctly.
 */
const TEST_PATTERN = /expect: (.*)/g;
const eveRoot = process.cwd();

/**
 * Recursively walk a directory, invoking the callback with the path of each
 * child.
 */
const walk = (dir, callback) => {
  fs.readdir(dir, (err, data) => {
    if (err) throw err;

    data.forEach((item) => {
      if (path.extname(item) === '.eve') {
        return callback(path.join(dir, item));
      }

      walk(path.join(dir, item), callback);
    });
  });
};

/**
 * Run a script and assert each test. Any failed tests are logged to
 * stderr so that travis tests fail.
 */
const runScript = (pathToScript) => {
  const script = fs.readFileSync(pathToScript, 'utf8');
  const tests = script.match(TEST_PATTERN).map(line => line.match(/:\s(.*)/)[1]);

  let passed = 0;
  let failed = 0;

  exec(`babel-node ./src/eve.js ${pathToScript}`, (err, stdout, stderr) => {
    const lines = stdout.split('\n');

    tests.forEach((expected, i) => {
      const actual = lines[i];

      if (expected === actual) {
        passed++;
      } else {
        failed++;
        console.error(`Failed - expected: ${expected}, actual: ${actual}`);
      }
    });

    console.log(`${path.basename(pathToScript)}: passed: ${passed} failed: ${failed}`);
  });
};

walk(path.join(eveRoot, 'e2e/fixtures'), runScript);
