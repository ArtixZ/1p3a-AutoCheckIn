/* eslint-disable no-undef */
const axios = require("axios");

const solve = require("./validate.js");

const API = "https://us-central1-p3a-dayquestion.cloudfunctions.net/g";

async function question(page, token) {
    try {
        await solve(page, token);

        const obj = {};

        const question = await page.evaluate(() => {
            const questionNode = document.querySelector(
                "#fwin_pop font[color='#FF6600']"
            ).lastChild;
            return questionNode.textContent.trim();
        });

        const options = await page.evaluate(() => {
            // const optionNodes = document.querySelectorAll(".qs_option");
            // return Array.from(optionNodes).map(node => node.textContent.trim());
            let opts = [];
            for (let i = 1; i <= 4; i++) {
                const selector = `div[onclick="document.getElementById('a${i}').checked='checked';"]`;
                const element = document.querySelector(selector);
                if (element) {
                    opts.push(element.innerText.trim());
                }
            }
            return opts;
        });

        obj["q"] = question;
        obj["o"] = options;

        var data = JSON.stringify({
            data: obj,
        });

        var config = {
            method: "post",
            url: API,
            headers: {
                "content-type": "application/json",
            },
            data: data,
        };

        const response = await axios(config);
        const res = response.data;

        let ansIdx;
        for (let i in res["result"]) {
            if (res["result"][i]) ansIdx = Number(i) + 1;
        }

        await page.click(
            `div[onclick="document.getElementById('a${ansIdx}').checked='checked';"]`
        );

        await page.click(".pnc");
    } catch (err) {
        console.trace(err);
        throw err;
    }
}

module.exports = question;
