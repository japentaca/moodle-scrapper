import puppeteer from 'puppeteer'

import os from "os"


function lanzar_curso(user, directory, curso_data) {
  const user_email = user[0]
  const user_id = user[2]

  let page
  let browser
  let last_log = ""
  let headless = true
  if (os.hostname == "fabo") headless = false

  return new Promise(async (resolve, reject) => {
    let start_time = Date.now()

    let last_log_time = Date.now()

    try {
      let response = null
      //await delay(Math.random() * 5000 + 1000)




      browser = await puppeteer.launch({
        ///headless: "shell",
        headless: headless,
        timeout: 0,
        args: [
          '--no-crash-upload',
          '--disable-oopr-debug-crash-dump',
          '--disable-client-side-phishing-detection',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--disable-crash-reporter',
          '--disable-gpu',
          '--disable-features=VizDisplayCompositor',
          '--user-data-dir=' + directory]
      });
      page = await browser.newPage({
        timeout: 0
      });
      page.setDefaultNavigationTimeout(0);
      //loguear('newPage');

      // Navigate the page to a URL
      loguear('entro a login_url');
      await page.goto(curso_data.login_url, { waitUntil: 'domcontentloaded' });
      loguear('entré a login_url');
      //await page.waitForNetworkIdle();
      await page.setViewport({ width: 1080, height: 1024 });
      //await capturar("login")

      //await page.waitForNetworkIdle();
      await delay(Math.random() * 1000)
      await page.type("#username", user[0]);
      await delay(Math.random() * 1000)
      await page.type("#password", user[1]);
      //await capturar("tipeo")
      await delay(Math.random() * 1000)
      loguear('click login ');
      await delay(2000)
      response = await page.click("#loginbtn");
      delay(5000)
      await page.waitForNetworkIdle({
        idleTime: 3000
      });
      loguear('post login');
      //await capturar("post login")

      delay(2000)
      capturar("curso", user_email)

      await delay(2000)
      loguear('redirecciono al curso');

      await page.goto(curso_data.curso_url, { waitUntil: 'domcontentloaded' });
      await page.waitForNetworkIdle({
        idleTime: 3000
      });

      await delay(2000)
      capturar("curso", user_email)

      await page.goto(curso_data.quiz_url, { waitUntil: 'domcontentloaded' });
      await page.waitForNetworkIdle({
        idleTime: 3000
      });
      loguear('entré al quiz');
      delay(2000)
      capturar("quiz", user_email)

      let element = await page.waitForSelector('div > .quizstartbuttondiv');

      await element.click();
      await page.waitForNetworkIdle({
        idleTime: 3000
      });

      loguear('entré a quiz');

      for (let i = 0; i < curso_data.quiz_pages; i++) {
        //for (let i = 0; i < 2; i++) {
        await delay(1000)
        loguear('click next ' + i);
        let boton = await page.waitForSelector('input[name="next"]');
        await boton.click();
        await page.waitForNetworkIdle({
          idleTime: 3000
        });
      }
      loguear('logout');
      await page.goto(curso_data.logout_url, { waitUntil: 'domcontentloaded' });
      await delay(2000)
      const el = await page.waitForSelector("text/Continuar");
      el.click()
      await page.waitForNetworkIdle({
        idleTime: 3000
      });
      await delay(2000)
      await page.close()
      loguear('page close');
      //await delay(20000)
      await browser.close();
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
      await kill_browser()


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

      console.log(error)

      await capturar("error", user_email, "last_log", last_log)
      await delay(240000)
      await kill_browser()

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
      resolve(res_obj)

    }
    async function kill_browser() {
      if (browser && browser.process() != null) {
        //loguear("killing browser")
        browser.process().kill('SIGINT')
      }
    }
    async function capturar(fn, user_email) {
      try {
        await page.screenshot({ path: './captura/' + fn + '_' + user_email + '.png' });

      } catch (error) {
        //console.log("no pude hacer la captura", error.toString())

      }

    }
  })

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
