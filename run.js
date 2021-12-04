const { spawn } = require('child_process');
const path = require('path');


function run() {
  console.log( process.env.PATH );
  const exec = spawn('/home/pi/.nvm/versions/node/v16.13.0/bin/node', [path.join(__dirname, 'app.js')], {
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
