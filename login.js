const solve = require("./validate.js");
const fs = require('fs').promises;


async function login(page, token, username, password, key) {
  await solve(page, token);
  await page.screenshot({ path: "./screenshots/login-recapcha.png" });

  await page.focus("#username");
  await page.keyboard.type(username);

  await page.focus("#password");
  await page.keyboard.type(password);

  await Promise.all([
    page.click("input[id=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 5000 }),
  ]).catch(err => {
    console.log('error after clicking on login.');
    console.log(err);
  });

  await page.screenshot({ path: "./screenshots/login-loggedin.png" });

// write cookies into file
  const cookies = await page.cookies();
  await fs.writeFile(`./.cookies/${key}`, JSON.stringify(cookies, null, 2));

}

module.exports = login;
