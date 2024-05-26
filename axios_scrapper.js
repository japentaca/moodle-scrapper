import os from "os"
import { parse } from 'node-html-parser';
import axios from 'axios';
import fs from 'fs/promises';
axios.defaults.withCredentials = true;
let device_data = {
  platform: os.platform(),
  arch: os.arch(), release: os.release(), totalmem: os.totalmem() / 1024, freemem: os.freemem() / 1024, hostname: os.hostname(), cpus: os.cpus().length
}
let parms = null
try {
  parms = JSON.parse(process.argv[2])
  console.log("fork parms", parms.length)
} catch (error) {
  console.log(error)
  process.exit(0)
}

//console.log("lancar_curso", curso_data)

let cookies = {}

let user_email = null
let user_id = null
let last_log = ""

setTimeout(async () => {
  let prom_arr = []
  for (let i = 0; i < parms.length; i++) {

    let user = parms[i].user.split(',')
    console.log(process.pid, "lanzo curso", i, user[0])
    prom_arr.push(lanzar_curso(user, parms[i].curso_data))

    delay(1000)

  }

  await Promise.all(prom_arr)
}, Math.random() * 1000 + 1000)

async function lanzar_curso(user, curso_data) {
  let user_email = user[0]
  let user_id = user[2]
  let user_pass = user[1]

  return new Promise(async (resolve, reject) => {
    let start_time = Date.now()

    let last_log_time = Date.now()

    try {
      let response = null

      let next_location = null
      //await delay(Math.random() * 5000 + 1000)

      loguear('entro a login_url');
      response = await axios.get(curso_data.login_url, {

      })
      loguear('entré a login_url');

      await guardar_html(response.data, "login_page")

      let html = response.data
      let root = parse(html)
      let login_token = root.querySelector('input[name="logintoken"]').attributes.value

      cookies = response.headers['set-cookie']

      response = await axios({
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // default
        },
        url: curso_data.login_url,
        method: 'post',
        data: { username: user_email, password: user_pass, logintoken: login_token },
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded"
        },


      })

      await guardar_html(response.data, "post_login")
      if (response.status == 303) {
        cookies = response.headers['set-cookie']

        response = await axios({
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // default
          },
          url: response.headers.location,
          method: 'get',
          headers: {
            Cookie: cookies
          },
        })

        if (response.status == 303) {
          //cookies = response.headers['set-cookie']

          response = await axios({
            maxRedirects: 0,
            validateStatus: function (status) {
              return status >= 200 && status < 400; // default
            },
            url: response.headers.location,
            method: 'get',
            headers: {
              Referer: curso_data.login_url,
              Cookie: cookies
            },
          })

          await guardar_html(response.data, "post_redirects")
        }
      }



      loguear('curso');

      response = await axios({
        url: curso_data.curso_url,
        method: 'get',
        headers: {
          Cookie: cookies
        },
      })
      await guardar_html(response.data, "post_curso")


      loguear("quiz")
      response = await axios({
        url: curso_data.quiz_url,
        method: 'get',
        headers: {
          Cookie: cookies
        },
      })
      await guardar_html(response.data, "post_quiz")
      //cookies = response.headers['set-cookie']

      html = response.data
      root = parse(html)
      let input_cm_id = root.querySelector('input[name="cmid"]').attributes.value
      let input_sesskey = root.querySelector('input[name="sesskey"]').attributes.value


      loguear("start atttempt quiz")
      response = await axios({
        data: {
          cmid: input_cm_id,
          sesskey: input_sesskey
        },
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // default
        },
        url: curso_data.start_atttempt_quiz_url,
        method: 'post',
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded"
        },
      })

      if (response.status == 303) {
        //cookies = response.headers['set-cookie']
        next_location = response.headers.location

        response = await axios({
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // default
          },
          url: response.headers.location,
          method: 'get',
          headers: {
            Cookie: cookies
          },
        })

        await guardar_html(response.data, "post_redirect_quiz")
      }

      //aca empezaría el loop

      for (let i = 0; i < curso_data.quiz_pages; i++) {
        html = response.data
        root = parse(html)
        let form = root.querySelector('form')
        let form_inputs = form.querySelectorAll('input')
        //console.log(form_children)
        let quiz_post_data = {}
        form_inputs.forEach(element => {
          if (element.getAttribute('name') !== undefined) {
            //console.log("element", element.tagName, element.getAttribute('name'), element.getAttribute('value'))
            let t = element.getAttribute('name').replaceAll("'", "")
            quiz_post_data[element.getAttribute('name').replaceAll("'", "")] = element.getAttribute('value').replaceAll("'", "")
          }
        })


        loguear('click next ' + i);

        response = await axios({
          data: quiz_post_data,
          maxRedirects: 0,
          validateStatus: function (status) {
            return status >= 200 && status < 400; // default
          },
          url: form.getAttribute('action'),
          method: 'post',
          headers: {
            Cookie: cookies,
            "Content-Type": "multipart/form-data; boundary=----WebKitFormBoundary" + generateRandomString(12)
          },
        })
        guardar_html(response.data, "quiz_respuesta " + i)

        if (response.status == 303) {
          //cookies = response.headers['set-cookie']

          response = await axios({
            maxRedirects: 0,
            validateStatus: function (status) {
              return status >= 200 && status < 400; // default
            },
            url: response.headers.location,
            method: 'get',
            headers: {
              Cookie: cookies
            },
          })


          await guardar_html(response.data, "post_redirect_quiz_pregunta" + i)
        }
        await delay(1000)
      }
      loguear('logout');

      response = await axios({
        url: curso_data.logout_url,
        method: 'get',
        headers: {
          Cookie: cookies
        },
      })
      await guardar_html(response.data, "post_logout")
      html = response.data
      root = parse(html)
      let sesskey = root.querySelector('input[name="sesskey"]').attributes.value

      response = await axios({
        data: {
          sesskey: sesskey
        },
        url: curso_data.logout_url,
        method: 'post',
        headers: {
          Cookie: cookies
        },
      })
      await guardar_html(response.data, "post_logout2")
      loguear('FINAL');
      delay(1000)
      let res_obj = {
        status: true,
        //user_email: user_email,
        user_id: user_id,
        total_time: ((Date.now() - start_time) / 1000).toFixed(2),
        hostname: device_data.hostname,
        last_log: last_log
      }

      resolve(res_obj)

      async function loguear(texto, status = true) {
        let msg = {
          type: "item_log",
          data: {
            status: status,
            start_time: new Date(start_time).toLocaleTimeString(),
            user_id: user_id,
            user_email: user_email,
            total_time: ((Date.now() - start_time) / 1000).toFixed(2),
            hostname: device_data.hostname,
            //duration: ((Date.now() - last_log_time) / 1000).toFixed(2),
            //user_email: user_email,
            texto: texto,
            last_log: last_log

          }

        }

        process.send(JSON.stringify(msg))

        //console.log(user_email, ((Date.now() - last_log_time) / 1000).toFixed(2), texto)
        last_log_time = Date.now()
        last_log = texto

      }
    } catch (error) {

      console.log(error.message)
      console.log(user_email, error.toString())
      let msg = {
        type: "item_log", data: {
          status: false,
          //user_email: user_email,
          start_time: new Date(start_time).toLocaleTimeString(),
          user_id: user_id,
          user_email: user_email,
          total_time: ((Date.now() - start_time) / 1000).toFixed(2),
          hostname: device_data.hostname,
          texto: error.toString(),
          last_log: last_log
        }
      }

      process.send(JSON.stringify(msg))

      await delay(2000)



      resolve(res_obj)

    }

  })

}


async function guardar_html(html, file) {
  return
  await fs.writeFile(process.cwd() + "/captura/" + file + ".html", html, 'utf8')
}
export { lanzar_curso }





async function delay(ms) {

  return new Promise(resolve => setTimeout(resolve, ms));
}
function generateRandomString(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}