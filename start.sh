#!/bin/bash
npm i
while true; do
    git pull && node index
    sleep 2  # Adjust sleep time as needed
done