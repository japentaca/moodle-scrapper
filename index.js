
console.log("start")
import fs from 'fs/promises'
import os, { hostname } from 'os'
let device_data = {
  platform: os.platform(),
  arch: os.arch(), release: os.release(), totalmem: os.totalmem() / 1024, freemem: os.freemem() / 1024, hostname: os.hostname(), cpus: os.cpus().length
}
console.log(device_data)

const users_buf = await fs.readFile('./data/users_202404092146_3949.csv', 'utf-8')

let users = users_buf.split('\n')
users.map(user => user.split(','))
users = shuffle(users)
//console.log(users)

import { lanzar_curso } from './puppe.js'

let procesando = false
setInterval(async () => {
  if (procesando) return
  procesando = true
  for (let i = 0; i < users.length; i++) {
    let user = users[i].split(',')
    console.log("-----Elemento ", i, "--------", user[0])
    lanzar_curso(user)
    i++
    user = users[i].split(',')
    console.log("-----Elemento ", i, "--------", user[0])
    lanzar_curso(user)

    i++
    user = users[i].split(',')
    console.log("-----Elemento ", i, "--------", user[0])
    await lanzar_curso(user)

  }
  procesando = false


}, 1000)

function shuffle(arr) {
  var j, x, index;
  for (index = arr.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1));
    x = arr[index];
    arr[index] = arr[j];
    arr[j] = x;
  }
  return arr;
}



