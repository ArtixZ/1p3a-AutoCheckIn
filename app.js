const puppeteer = require("puppeteer-core");
const fs = require("fs").promises;
const path = require("path");

const login = require("./login.js");
const checkin = require("./checkin.js");

const config = require("./config.json");

const LOGIN_URL = "https://auth.1point3acres.com/login";
const CHECKIN_URL = "https://www.1point3acres.com/bbs/dsu_paulsign-sign.html";

// clear out screenshots before run.

try {
  fs.readdir("./screenshots").then((files) => {
    for (const file of files) {
      fs.unlink(path.join("./screenshots", file));
    }
  });
} catch (err) {
  console.log("can't remove previous screenshots.");
}

async function run(config) {
  const username = config.username;
  const password = config.password;
  const token = config.witToken;
  const key = config.key;

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

  // read cookies and set cookies to page.
  try {
    const cookiesString = await fs.readFile(`./.cookies/${key}`);
    const cookies = JSON.parse(cookiesString);
    await page.setCookie(...cookies);
  } catch (err) {
    console.log("can't set cookie.", err);
  }

  await page.goto(LOGIN_URL);
  await page.screenshot({ path: "./screenshots/login-loaded.png" });
  console.log("-------------now at login page------------");

  if (page.url() === LOGIN_URL)
    await login(page, token, username, password, key);

  console.log("-------------logged in------------");

  await page.goto(CHECKIN_URL);

  console.log("-------------now at checkin page------------");

  await checkin(page, token);

  console.log("-------------checked in------------");

  browser.close();
}

for (let cfg of config) {
  run(cfg);
}
