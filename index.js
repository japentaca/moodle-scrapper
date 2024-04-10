
console.log("start")
import { lanzar_curso } from './puppe.js'
import os, { hostname } from 'os'
import { io } from 'socket.io-client';
const client_socket = io("http://localhost:3000");
global.client_socket = client_socket
let device_data = {
  platform: os.platform(),
  arch: os.arch(), release: os.release(), totalmem: os.totalmem() / 1024, freemem: os.freemem() / 1024, hostname: os.hostname(), cpus: os.cpus().length
}
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
  let prom_arr = []
  for (let i = 0; i < data.length; i++) {
    let user = data[i].split(',')
    console.log("-----Elemento ", i, "--------", user[0])

    prom_arr.push(lanzar_curso(user))

    //lanzar_curso(user)
  }

  let res = await Promise.all(prom_arr)
  await delay(1000)
  client_socket.emit("end_scrapper",
    { res: res, start_time: start_time, duration: ((Date.now() - start_time) / 1000).toFixed(2), hostname: device_data.hostname }
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
