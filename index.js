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
  let procs_x_cpu = users.length / os.cpus().length
  if (procs_x_cpu < 1) procs_x_cpu = 1
  let procs_x_cpu_count = 0
  console.log("procs_x_cpu", procs_x_cpu)
  let proc_count = 0
  let parms = []
  let procs_finalizados = 0
  for (let i = 0; i < users.length; i++) {

    let user = users[i]
    parms.push({
      user: user,
      curso_data: data.curso_data
    })

    procs_x_cpu_count++
    if (procs_x_cpu_count >= procs_x_cpu) {
      proc_count++
      console.log("-----Lanzo proceso ", proc_count, " Elementos", parms.length)
      //prom_arr.push(lanzar_curso(user, data.curso_data))
      let proc = child_process.fork('./axios_scrapper.js', [JSON.stringify(parms)])

      proc.on("exit", (code) => {
        console.log("exit", code)
        console.log("finalizo", procs_finalizados)
        procs_finalizados++

        if (procs_finalizados >= proc_count) {
          procesando = false
          console.log("stop time", ((Date.now() - start_time) / 1000).toFixed(2))

        }

      })
      proc.on("message", (msg) => {
        //console.log("msg from fork", msg)
        let temp = JSON.parse(msg)

        client_socket.emit(temp.type, temp.data)
      })
      procs_x_cpu_count = 0
      parms = []
    }
  }
})




async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}