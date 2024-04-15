#!/bin/bash
while true; do
     git pull 
     npm i
     node index.js
    sleep 2  # Adjust sleep time as needed
done