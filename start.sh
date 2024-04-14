#!/bin/bash
npm remove puppeteer
npm i
while true; do
    git pull && node index
    sleep 2  # Adjust sleep time as needed
done