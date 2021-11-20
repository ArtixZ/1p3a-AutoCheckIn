const solve = require("./validate.js");

async function login(page, token, username, password) {
  await solve(page, token);
  await page.screenshot({ path: "login-recapcha.png" });

  await page.focus("#username");
  await page.keyboard.type(username);

  await page.focus("#password");
  await page.keyboard.type(password);

  await Promise.all([
    page.click("input[id=submit]"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  await page.screenshot({ path: "login-loggedin.png" });
}

module.exports = login;
