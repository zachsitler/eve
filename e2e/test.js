const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const eveRoot = process.cwd();

// Test patterns
const TEST_PATTERN = /expect: (.*)/g;

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

const runScript = (path) => {
  const script = fs.readFileSync(path, 'utf8');
  const tests = script.match(TEST_PATTERN).map(line => line.match('/.n'));
  exec(`babel-node ./eve.js ${path}`, (err, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
  });
};

const runTests = (path) => {
  runScript(path);
};

walk(path.join(eveRoot, 'test'), runTests);

// let passed = 0;
// let failed = 0;
