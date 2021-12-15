const fs = require('fs').promises;
const path = require('path');
const solve = require("./validate.js");



async function login(page, token, username, password) {
  await solve(page, token);
  await page.screenshot({ path: path.join(__dirname, "./screenshots/login-recapcha.png") });

  await page.focus("#username");
  await page.keyboard.type(username);

  await page.focus("#password");
  await page.keyboard.type(password);

  await Promise.all([
    page.click("input[id=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 40000 }),
  ]).catch(err => {
    console.log('error after clicking on login.');
    console.log(err);
  });

  await page.screenshot({ path: path.join(__dirname, "./screenshots/login-loggedin.png") });

// write cookies into file
  const cookies = await page.cookies();
  await fs.writeFile(path.join(__dirname, `./.cookies/${username}`), JSON.stringify(cookies, null, 2));

}

module.exports = login;
