/* eslint-disable no-undef */
const path = require('path');
const solve = require("./validate.js");

async function checkin(page, token) {
  let cont = true;
  try {
    // page.on('console', consoleObj => console.log(consoleObj.text()));

    await page.waitForFunction(() => {
      const qiandao = document.querySelector(`form[name="qiandao"]`);
      return !!qiandao;
    },{ timeout: 50000 })

    console.log("not checked in yet");
    
  } catch(err) {
    cont = false;
    console.log("already checked in");
  }
  
  if(cont) {
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
  
}

module.exports = checkin;
