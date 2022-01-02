const { spawn } = require("child_process");
const path = require("path");

function run() {
    console.log("node path: ", process.execPath);

    const exec = spawn(process.execPath, [path.join(__dirname, "app.js")], {
        env: {
            NODE_ENV: "production",
            PATH: process.env.PATH,
        },
    });

    exec.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });

    exec.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });

    exec.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
        if (code != 0) {
            console.log("Going to restart after 5 minutes.");

            setTimeout(() => {
                console.log("Restarting...");

                run();
            }, 300000);
        }
    });
}

run();
