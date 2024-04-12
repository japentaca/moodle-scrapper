
import fs from 'fs';
import os, { hostname } from 'os'
import { io } from 'socket.io-client';
import { pid } from 'process';
const client_socket = io("http://167.172.44.239:46302");
import { execFile } from 'node:child_process';
try {
  fs.rmSync("updater_log.txt", { force: true })
} catch (error) {

}
log_to_file("UPDATER START")
log_to_file("pid", pid)
fs.writeFileSync("pid.txt", pid.toString())
client_socket.on("UPDATE_APP", (data) => {
  if (os.hostname() == 'DESKTOP-S4RPOTO') {
    log_to_file("en casa noooo")
    return
  }

  const child_git = execFile('git ', ['pull'], (error, stdout, stderr) => {
    log_to_file("stderr lanzar git", stderr);
    if (error) {
      log_to_file("error lanzando git", error)
    }
    log_to_file("output de git pull", stdout);
    log_to_file("lanzo node index")
    const child_start = execFile('node', ['./index.js'], (error, stdout, stderr) => {
      log_to_file("stderr lanzar node index", stderr);
      if (error) {
        log_to_file("error lanzando node index", error)
      }
      log_to_file("output de lanzar node index", stdout)
    });

  });
})
client_socket.on('connect', () => {
  log_to_file('updater socket connected');
  client_socket.emit('updater_register', os.hostname())
});

function log_to_file() {
  let str = ""
  for (let i = 0; i < arguments.length; i++) {
    str += " " + arguments[i]
  }
  fs.appendFileSync("updater_log.txt", str + "\n")
}
