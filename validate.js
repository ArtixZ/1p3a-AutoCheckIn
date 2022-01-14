/* eslint-disable no-undef */
const axios = require("axios");
const https = require("https");
const path = require("path");

function rdn(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

async function solve(page, token) {
    console.log("-------------solving recaptcha------------");
    while (true) {
        try {
            await page.waitForFunction(
                () => {
                    const iframe = document.querySelector(
                        'iframe[src*="api2/anchor"]'
                    );
                    if (!iframe) return false;

                    return !!iframe.contentWindow.document.querySelector(
                        "#recaptcha-anchor"
                    );
                },
                { timeout: 40000 }
            );

            let frames = await page.frames();
            const recaptchaFrame = frames.find((frame) =>
                frame.url().includes("api2/anchor")
            );

            const checkbox = await recaptchaFrame.$("#recaptcha-anchor");
            await checkbox.click({ delay: rdn(30, 150) });

            await page.waitForFunction(() => {
                const iframe = document.querySelector('iframe[src*="api2/bframe"]');
                if (!iframe) return false;

                const img = iframe.contentWindow.document.querySelector(
                    ".rc-image-tile-wrapper img"
                );
                return img && img.complete;
            });

            frames = await page.frames();
            const imageFrame = frames.find((frame) =>
                frame.url().includes("api2/bframe")
            );
            const audioButton = await imageFrame.$("#recaptcha-audio-button");
            audioButton.click({ delay: rdn(30, 150) });

            try {
                const blocked = await Promise.any([
                    isBlocked(page),
                    notBlocked(page)
                ]);

                if(blocked) {
                    await page.screenshot({
                        path: path.join(
                            __dirname,
                            "./screenshots/recaptcha-blocked.png"
                        ),
                    });
                    console.log("blocked.");
    // if ddos blocked then exit.
                    process.exit(5);
                } else {
                    await page.screenshot({
                        path: path.join(
                            __dirname,
                            "./screenshots/recaptcha-NOT-blocked.png"
                        ),
                    });

                    console.log("NOT blocked.");
                }

            } catch(err) {
                console.error("Check block failed!", e);
                await page.screenshot({
                    path: path.join(
                        __dirname,
                        "./screenshots/recaptcha-check-block-failed.png"
                    ),
                });
                
                continue;
            }
            

            // eslint-disable-next-line no-constant-condition
            try {
                await page.waitForFunction(
                    () => {
                        const iframe = document.querySelector(
                            'iframe[src*="api2/bframe"]'
                        );
                        if (!iframe) return false;

                        return !!iframe.contentWindow.document.querySelector(
                            ".rc-audiochallenge-tdownload-link"
                        );
                    },
                    { timeout: 40000 }
                );
                await page.screenshot({
                    path: path.join(
                        __dirname,
                        "./screenshots/recaptcha-toSolve.png"
                    ),
                });

                // await page.waitForSelector('iframe[src*="api2/bframe"]');
                // await page.waitForSelector('.rc-audiochallenge-tdownload-link');
            } catch (e) {
                console.error("Recaptcha is not loaded correctly!", e);
                await page.screenshot({
                    path: path.join(
                        __dirname,
                        "./screenshots/recaptcha-toSolve-failed.png"
                    ),
                });

                try{
                    await page.click(`span[onclick="updateseccode('S00')"]`);
                    await page.screenshot({
                        path: path.join(
                            __dirname,
                            "./screenshots/recaptcha-reload.png"
                        ),
                    });
                } catch(err) {
                    console.log("no need to reload recaptcha");
                }

                continue;
            }

            const audioLink = await page.evaluate(() => {
                const iframe = document.querySelector(
                    'iframe[src*="api2/bframe"]'
                );
                return iframe.contentWindow.document.querySelector(
                    "#audio-source"
                ).src;
            });

            const audioBytes = await page.evaluate((audioLink) => {
                return (async () => {
                    const response = await window.fetch(audioLink);
                    const buffer = await response.arrayBuffer();
                    return Array.from(new Uint8Array(buffer));
                })();
            }, audioLink);

            const httsAgent = new https.Agent({ rejectUnauthorized: false });
            const response = await axios({
                httsAgent,
                method: "post",
                url: "https://api.wit.ai/speech?v=2021092",
                data: new Uint8Array(audioBytes).buffer,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "audio/mpeg3",
                },
            });

            let audioTranscript = null;

            try {
                audioTranscript = response.data
                    .match('"text": "(.*)",')[1]
                    .trim();
            } catch (e) {
                const reloadButton = await imageFrame.$(
                    "#recaptcha-reload-button"
                );
                await reloadButton.click({ delay: rdn(30, 150) });
                continue;
            }

            const input = await imageFrame.$("#audio-response");
            await input.click({ delay: rdn(30, 150) });
            await input.type(audioTranscript, { delay: rdn(30, 75) });

            const verifyButton = await imageFrame.$("#recaptcha-verify-button");
            await verifyButton.click({ delay: rdn(30, 150) });

            try {
                // check if it's successfully solved.
                await page.waitForFunction(
                    () => {
                        const iframe = document.querySelector(
                            'iframe[src*="api2/anchor"]'
                        );
                        if (!iframe) return false;

                        return !!iframe.contentWindow.document.querySelector(
                            '#recaptcha-anchor[aria-checked="true"]'
                        );
                    },
                    { timeout: 40000 }
                );

                return page.evaluate(
                    () => document.getElementById("g-recaptcha-response").value
                );
            } catch (e) {
                console.error(e);
                await page.screenshot({
                    path: path.join(
                        __dirname,
                        "./screenshots/recaptcha-solved-error.png"
                    ),
                });
                continue;
            }

            // eslint-disable-next-line no-unreachable
            console.log("-------------recaptcha solved------------");
        } catch (e) {
            console.error("failed on solving recaptcha.\n", e);

            await page.screenshot({
                path: path.join(__dirname, "./screenshots/recaptcha-error.png"),
            });

            throw e;
        }
    }
}

async function isBlocked(page) {
    await page.waitForFunction(
        () => {
            const iframe = document.querySelector(
                'iframe[src*="api2/bframe"]'
            );
            if (!iframe) return false;

            return !!iframe.contentWindow.document.querySelector(
                ".rc-doscaptcha-header-text"
            );
        },
        { timeout: 40000 }
    );
    return true;
}

async function notBlocked(page) {
    await page.waitForFunction(
        () => {
            const iframe = document.querySelector(
                'iframe[src*="api2/bframe"]'
            );
            if (!iframe) return false;

            return !!iframe.contentWindow.document.querySelector(
                ".rc-audiochallenge-tdownload-link"
            );
        },
        { timeout: 40000 }
    );
    return false;
}

module.exports = solve;
