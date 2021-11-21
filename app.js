const puppeteer = require("puppeteer-core");

const login = require("./login.js");
const checkin = require("./checkin.js");

const config = require("./config.json");

async function run(config) {
  const username = config.username;
  const password = config.password;
  const token = config.witToken;

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
  const LOGIN_URL = "https://auth.1point3acres.com/login";
  const CHECKIN_URL = "https://www.1point3acres.com/bbs/dsu_paulsign-sign.html";
  await page.goto(LOGIN_URL);
  await page.screenshot({ path: "./screenshots/login-loaded.png" });
  console.log("-------------now at login page------------");

  if (page.url() === LOGIN_URL) await login(page, token, username, password);

  console.log("-------------logged in------------");

  await page.goto(CHECKIN_URL);

  console.log("-------------now at checkin page------------");

  await checkin(page, token);

  console.log("-------------checked in------------");

  browser.close();
}

run(config);
