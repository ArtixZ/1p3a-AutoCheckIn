const puppeteer = require("puppeteer-core");
const fs = require("fs").promises;
const path = require("path");

const login = require("./login.js");
const checkin = require("./checkin.js");
const question = require("./question.js");

const config = require("./config.json");

const LOGIN_URL = "https://auth.1point3acres.com/login";
const CHECKIN_URL = "https://www.1point3acres.com/bbs/dsu_paulsign-sign.html";

// clear out screenshots before run.

async function run(config) {
    try {
        await fs
            .readdir(path.join(__dirname, "./screenshots"))
            .then(async (files) => {
                for (const file of files) {
                    await fs.unlink(
                        path.join(__dirname, "./screenshots", file)
                    );
                }
            });
    } catch (err) {
        console.log("can't remove previous screenshots.");
        console.log(err);
    }

    const username = config.username;
    const password = config.password;
    const token = config.witToken;
    console.log(`-------------working on user ${username}------------`);

    //   const browser = await puppeteer.launch();
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: "/usr/bin/chromium-browser",
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-web-security",
        ],
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);

    // page.on("console", (consoleObj) => console.log(consoleObj.text()));

    // read cookies and set cookies to page.
    try {
        const cookiesString = await fs.readFile(
            path.join(__dirname, `./.cookies/${username}`)
        );
        const cookies = JSON.parse(cookiesString);
        await page.setCookie(...cookies);
    } catch (err) {
        console.log("can't set cookie.", err);
    }

    try {
        // -------LOG IN--------
        console.log("-------------go to login page------------");
        await page.goto(LOGIN_URL);
        await page.screenshot({
            path: path.join(__dirname, "./screenshots/login-loaded.png"),
        });
        console.log("-------------now at login page------------");
        if (page.url() === LOGIN_URL)
            await login(page, token, username, password);
        console.log("-------------logged in------------");
        // -------LOG IN--------

        // -------Check IN--------
        console.log("-------------go to checkin page------------");
        await page.goto(CHECKIN_URL);
        console.log("-------------now at checkin page------------");
        await checkin(page, token);
        console.log("-------------checked in------------");
        // -------Check IN--------

        // -------Questionnaire--------
        console.log("-------------go to questionnaire page------------");
        await page.click(
            `a[onclick^="showWindow('pop','plugin.php?id=ahome_dayquestion:pop')"]`
        );
        await page.waitForSelector(".pnc");
        await page.screenshot({
            path: path.join(
                __dirname,
                "./screenshots/daily-question-loaded.png"
            ),
        });
        console.log("-------------now at questionnaire page------------");
        await question(page, token);
        console.log("-------------question answered------------");
        // -------Questionnaire--------
    } catch (err) {
        console.log(err, err.stack);
    } finally {
        await browser.close();
    }
}

(async () => {
    for (let cfg of config) {
        await run(cfg);
    }
})();
