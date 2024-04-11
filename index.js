
console.log("start")
import { lanzar_curso } from './puppe.js'
import os, { hostname } from 'os'
import fs from 'fs';
import { io } from 'socket.io-client';
const client_socket = io("http://167.172.44.239:46302");
global.client_socket = client_socket
let device_data = {
  platform: os.platform(),
  arch: os.arch(), release: os.release(), totalmem: os.totalmem() / 1024, freemem: os.freemem() / 1024, hostname: os.hostname(), cpus: os.cpus().length
}
global.device_data = device_data
//console.log(device_data)
client_socket.on('connect', () => {
  console.log('socket connected');
  client_socket.emit('device_data', device_data)
});
client_socket.on("msg", (data) => {
  //console.log("socket message", data)
})
client_socket.on("ping", (data) => {
  client_socket.emit("pong", data)
})
client_socket.on("start_scrapper", async (data) => {
  console.log("start scrapper")
  let start_time = Date.now()
  let users = data.users
  let prom_arr = []
  for (let i = 0; i < users.length; i++) {
    let user = users[i].split(',')
    console.log("-----Elemento ", i, "--------", user[0])
    let directory = process.cwd() + '/userdata/' + i
    console.log("userdir", directory)
    try {
      fs.rmSync(process.cwd() + "/captura", { recursive: true, force: true });
      fs.mkdirSync(process.cwd() + "/captura");
      fs.rmSync(directory, { recursive: true, force: true });

      fs.mkdirSync(directory);
    } catch (error) {
      console.log(error)
    }

    prom_arr.push(lanzar_curso(user, directory, data.url))

    //lanzar_curso(user)
  }

  let res = await Promise.all(prom_arr)
  //await delay(1000)
  client_socket.emit("end_scrapper",
    res
  )

  console.log("stop time", ((Date.now() - start_time) / 1000).toFixed(2))

})
//console.log(device_data)




let procesando = false/* 
setInterval(async () => {
  if (procesando) return
  procesando = true
  for (let i = 0; i < users.length; i++) {
    let user = users[i].split(',')
    console.log("-----Elemento ", i, "--------", user[0])
    await lanzar_curso(user)


  }
  procesando = false


}, 1000) */



async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
