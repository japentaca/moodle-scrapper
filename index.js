console.log("start scrapper")
import { execFile, spawn } from 'node:child_process'

import os, { hostname } from 'os'
import fs from 'fs';
import { io } from 'socket.io-client';
import child_process from 'node:child_process'

const client_socket = io("http://167.172.44.239:46302");
global.client_socket = client_socket
let device_data = {
  platform: os.platform(),
  arch: os.arch(), release: os.release(), totalmem: os.totalmem() / 1024, freemem: os.freemem() / 1024, hostname: os.hostname(), cpus: os.cpus().length
}
global.device_data = device_data
//console.log(device_data)
client_socket.on('connect', () => {
  console.log('scrapper socket connected');
  client_socket.emit('device_data', device_data)
});
client_socket.on("msg", (data) => {
  //console.log("socket message", data)
})
client_socket.on("ping", (data) => {
  client_socket.emit("pong", data)
})
client_socket.on("UPDATE_APP", (data) => {
  try {
    console.log("UPDATE APP", data)
    if (os.hostname() == 'DESKTOP-S4RPOTO') {
      console.log("en casa noooo")
      return
    }

    console.log("cierro proceso para updater");
    process.exit(0)


  } catch (error) {
    console.log("error update_app", error)
  }
})
let procesando = false
client_socket.on("start_scrapper", async (data) => {
  if (procesando) {
    console.log("esta procesando, relax")
    return
  }

  procesando = true
  console.log("msg sstart scrapper")
  let start_time = Date.now()
  let users = data.users
  let prom_arr = []
  console.log("cant users", users.length)

  let proc_count = 0
  for (let i = 0; i < users.length; i++) {
    let user = users[i].split(',')
    console.log("-----Elemento ", i, "--------", user[0])
    //prom_arr.push(lanzar_curso(user, data.curso_data))
    let proc = child_process.fork('./axios_scrapper.js', [user, JSON.stringify(data.curso_data)])
    proc_count++
    proc.on("message", (msg) => {
      //console.log("msg from fork", msg)
      let temp = JSON.parse(msg)
      if (temp.data.texto == "FINAL") proc_count--
      if (proc_count == 0) {
        procesando = false
        console.log("stop time", ((Date.now() - start_time) / 1000).toFixed(2))

      }
      client_socket.emit(temp.type, temp.data)
    })

  }
})




async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}