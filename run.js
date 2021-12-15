const { spawn } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec)


async function run() {
  // console.log( process.env.PATH );
  const execPath = await exec('which node');
  const exec = spawn(execPath, [path.join(__dirname, 'app.js')], {
    env: {
      NODE_ENV: 'production',
      PATH: process.env.PATH
    }
  });

  exec.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  exec.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  exec.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if(code != 0) {
      setTimeout(() => run(), 300000);
    }
  }); 
}

run();
