# [1point3acres.com/bbs](https://www.1point3acres.com/bbs/) auto check in

## Features
 - Auto resolve recaptcha using voice regconition API.
 - Auto restart on failure
 - Easy to schedule as Cron job
 - Support multi-account checkin one after another.
 
## Get started
 - Clone the repo. `cd` into folder and run `npm install`.
 - Add `username` and `password` into **config.json** file.
 - Create a free token from [wit.ai](https://wit.ai/) (which can be found under Settings in the Wit.ai UI), and add `token` into **config.json** file.
 - Run `node run.js`

## Prerequisites
 - `chromium-browser` is installed. Example to install in debian: `sudo apt install chromium-browser -y`
 - Node JS is installed.

## Todo:
 - Auto solve questions every day to double the points (API is ready: https://us-central1-p3a-dayquestion.cloudfunctions.net/g).
 - Store recognized voice and train data.
