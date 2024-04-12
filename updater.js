console.log("UPDATER START")
import fs from 'fs';
import os, { hostname } from 'os'
import { io } from 'socket.io-client';
import { pid } from 'process';
const client_socket = io("http://167.172.44.239:46302");
import { execFile } from 'node:child_process';
console.log("pid", pid)
fs.writeFileSync("pid.txt", pid.toString())
client_socket.on("UPDATE_APP", (data) => {
  if (os.hostname() == 'DESKTOP-S4RPOTO') {
    console.log("en casa noooo")
    return
  }

  const child_git = execFile('git ', ['pull'], (error, stdout, stderr) => {
    console.log("stderr lanzar git", stderr);
    if (error) {
      console.log("error lanzando git", error)
    }
    console.log("output de git pull", stdout);
    console.log("lanzo node index")
    const child_start = execFile('node', ['./index.js'], (error, stdout, stderr) => {
      console.log("stderr lanzar node index", stderr);
      if (error) {
        console.log("error lanzando node index", error)
      }
      console.log("output de lanzar node index", stdout)
    });

  });
})
client_socket.on('connect', () => {
  console.log('updater socket connected');
  client_socket.emit('updater_register', os.hostname())
});
