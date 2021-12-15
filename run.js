const { spawn } = require('child_process');
const path = require('path');
const { promisify } = require('util');
const cmd = promisify(require('child_process').exec)


async function run() {
  // console.log( process.env.PATH );
  const execPath = await cmd('which node');
  console.log('node path: ', execPath);
  if(execPath.stderr) throw new Error('Node JS is not installed.');

  const exec = spawn(execPath.stdout.trim(), [path.join(__dirname, 'app.js')], {
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
