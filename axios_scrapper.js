import os from "os"
import { parse } from 'node-html-parser';
import axios from 'axios';
import fs from 'fs/promises';
axios.defaults.withCredentials = true;


function lanzar_curso(user, curso_data) {
  //console.log("lancar_curso", curso_data)
  const user_email = user[0]
  const user_id = user[2]
  let cookies = {}


  let last_log = ""
  let headless = true


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
      console.log("logintoken", login_token)
      console.log("login_url", curso_data.login_url)
      response = await axios({
        maxRedirects: 0,
        validateStatus: function (status) {
          return status >= 200 && status < 400; // default
        },
        url: curso_data.login_url,
        method: 'post',
        data: { username: user[0], password: user[1], logintoken: login_token },
        headers: {
          Cookie: cookies,
          "Content-Type": "application/x-www-form-urlencoded"
        },


      })

      //console.log("response SC", response.status)
      //console.log("response request", response.headers)
      await guardar_html(response.data, "post_login")
      if (response.status == 303) {
        cookies = response.headers['set-cookie']
        console.log("redirecciono a ", response.headers.location)
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
        //console.log("redir 1 response SC", response.status)
        //console.log("redir 1 response request", response.headers)
        if (response.status == 303) {
          //cookies = response.headers['set-cookie']
          console.log("redirecciono 2", response.headers.location)
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
          //console.log("redir 2 response SC", response.status)
          //console.log("redir 2 response request", response.headers)
          await guardar_html(response.data, "post_redirects")
        }
      }


      //console.log("response", parse(response.data).toString())
      loguear('voy al curso');
      console.log("voy a curso", curso_data.curso_url)
      response = await axios({
        url: curso_data.curso_url,
        method: 'get',
        headers: {
          Cookie: cookies
        },
      })
      await guardar_html(response.data, "post_curso")


      loguear("voy a quiz")
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

      console.log("input_cm_id", input_cm_id, "input_sesskey", input_sesskey)

      console.log("voy al start atttempt quiz", curso_data.start_atttempt_quiz_url)
      loguear("voy al start atttempt quiz")
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
      //console.log("atempt quiz", response.status)
      //console.log("attempt quiz response request", response.headers)
      if (response.status == 303) {
        //cookies = response.headers['set-cookie']
        next_location = response.headers.location
        console.log("redirecciono quiz", response.headers.location)
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

        //console.log("redir quiz", response.status)
        //console.log("redir quiz", response.headers)
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


        console.log("hago post de los input a ", next_location)
        loguear('click next ' + i);
        //console.log(quiz_post_data)
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
        console.log("quiz responder status " + i, response.status)
        if (response.status == 303) {
          //cookies = response.headers['set-cookie']
          console.log("redirecciono pregunta quiz " + i, response.headers.location)
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
          //console.log("redir quiz", response.status)
          //console.log("redir quiz", response.headers)
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
      console.log("post_logout sesskey", sesskey)
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


      //console.log("total:", ((Date.now() - start_time) / 1000).toFixed(2), user_email)
      let res_obj = {
        status: true,
        //user_email: user_email,
        user_id: user_id,
        total_time: ((Date.now() - start_time) / 1000).toFixed(2),
        hostname: global.device_data.hostname,
        last_log: last_log
      }
      //global.client_socket.emit("end_item", res_obj)

      resolve(res_obj)
      await delay(2000)
      //loguear("killing browser")
      //await kill_browser()


      async function loguear(texto, status = true) {

        global.client_socket.emit("item_log",
          {
            status: status,
            start_time: new Date(start_time).toLocaleTimeString(),
            user_id: user_id,
            user_email: user_email,
            total_time: ((Date.now() - start_time) / 1000).toFixed(2),
            hostname: global.device_data.hostname,
            //duration: ((Date.now() - last_log_time) / 1000).toFixed(2),
            //user_email: user_email,
            texto: texto,
            last_log: last_log

          })

        console.log(user_email, ((Date.now() - last_log_time) / 1000).toFixed(2), texto)
        last_log_time = Date.now()
        last_log = texto

      }
    } catch (error) {

      console.log(error.message)



      console.log(user_email, error.toString())
      let res_obj = {
        status: false,
        //user_email: user_email,
        start_time: new Date(start_time).toLocaleTimeString(),
        user_id: user_id,
        user_email: user_email,
        total_time: ((Date.now() - start_time) / 1000).toFixed(2),
        hostname: global.device_data.hostname,
        texto: error.toString(),
        last_log: last_log
      }
      global.client_socket.emit("item_log", res_obj)

      await delay(20000)



      resolve(res_obj)

    }

  })

}
async function guardar_html(html, file) {
  return
  await fs.writeFile(process.cwd() + "/captura/" + file + ".html", html, 'utf8')
}
export { lanzar_curso }

function msg_to_server(msg, data) {
  console.log("msg_to_server", msg, data)
  return new Promise((resolve, reject) => {
    try {
      global.client_socket.emit(msg, data, (res) => {
        resolve(res)
      })
    } catch (error) {
      console.log(error)
      resolve(false)
    }

  })
}



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