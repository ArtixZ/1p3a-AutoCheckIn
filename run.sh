#!/bin/bash

today=$(date +"%m_%d_%Y")
node ./app.js  &>> .log/log-${today}

if [ $? -eq 0 ]

then 
    exit 0

else 
    sleep 5m

    . ./run.sh
fi