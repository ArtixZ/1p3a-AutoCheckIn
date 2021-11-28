const path = require('path');
const solve = require("./validate.js");

async function checkin(page, token) {
  await solve(page, token);
  await page.screenshot({ path: path.join(__dirname, "./screenshots/checkin-recapcha.png") });

  await page.click("#kx");

  await page.focus("#todaysay");
  await page.keyboard.type("两心大大滴淮列");

  await Promise.all([
    page.click('input[type="submit"]'),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  await page.screenshot({ path: path.join(__dirname, "./screenshots/checkin-checkedin.png") });
}

module.exports = checkin;
