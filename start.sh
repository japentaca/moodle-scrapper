#!/bin/bash
while true; do
     git reset --hard HEAD
     git pull 
     npm i
     node index.js
    sleep 2  # Adjust sleep time as needed
done