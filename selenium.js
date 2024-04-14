
import { Builder, Browser, By, Key, until } from 'selenium-webdriver'
//import chrome from 'selenium-webdriver/chrome'


//const url = "https://formacion-tst.informaticos.ar/login/index.php"


function lanzar_curso(user, directory, url) {
  const user_email = user[0]
  let page
  let browser
  let last_log = ""
  return new Promise(async (resolve, reject) => {
    try {
      let response = null
      //await delay(Math.random() * 5000 + 1000)
      let start_time = Date.now()

      let last_log_time = Date.now()


      loguear('lanzar_curso ' + user_email);
      let browser = await new Builder()
        .forBrowser(Browser.CHROME)
        .setChromeOptions([
          '--no-crash-upload',
          '--disable-oopr-debug-crash-dump',
          '--disable-client-side-phishing-detection',
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-software-rasterizer',
          '--disable-crash-reporter',
          '--disable-gpu',
          '--disable-features=VizDisplayCompositor',
          '--user-data-dir=' + directory])
        .build()
      page.setDefaultNavigationTimeout(0);
      //loguear('newPage');

      // Navigate the page to a URL
      loguear('entro a ' + url);
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      loguear('entré a ' + url);
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
      response = await page.click("#loginbtn");



      loguear('click login ' + url);
      await page.waitForNetworkIdle();

      loguear('post login  ' + url);
      //await capturar("post login")
      let url_curso = "https://formacion-tst.informaticos.ar/course/view.php?id=53"
      await page.goto(url_curso, { waitUntil: 'domcontentloaded' });
      loguear('entré a ' + url_curso);
      //capturar("curso")

      url_curso = "https://formacion-tst.informaticos.ar/mod/quiz/view.php?id=60"
      await page.goto(url_curso, { waitUntil: 'domcontentloaded' });
      loguear('entré a ' + url_curso);

      await page.waitForNetworkIdle();
      delay(2000)
      let element = await page.waitForSelector('div > .quizstartbuttondiv');

      await element.click();

      await page.waitForNetworkIdle();
      loguear('entré cuestionario');
      let attempt_id = await msg_to_server("get_quiz_attempt_id", user[2])
      console.log("attempt_id", attempt_id)
      if (!attempt_id) {
        loguear('no devolvió attempt_id');
        await page.close()
        await browser.close();
        return
      }

      loguear("pido todos lo inputs")
      let inputs = await page.waitForSelector('input[type="radio"]')
      console.log("los inputs", inputs)
      let tt = await page.evaluate(elem => {
        console.log("elem", elem)
        return elem
      })
      console.log("tt", tt)


      /*  for (let i = 0; i < inputs.length; i++) {
         let input = inputs[i]
         console.log(i, input)
         //await input.click()
       } */

      /*  
       for (let i = 1; i < 10; i++) {
         let j = 0
         //let str = "#q" + attempt_id + ":" + i + "_answer" + j
         let str = "#" + i + "_answer" + j
         console.log("pincho en selector", str)
         //element = await page.waitForSelector(str)
         await page.click(str)
         loguear('hice click en  ' + str)
         await delay(1000)
       } */

      await delay(20000)
      await page.close()
      loguear('page close');
      //await delay(20000)
      await browser.close();
      loguear('browser close');


      //console.log("total:", ((Date.now() - start_time) / 1000).toFixed(2), user_email)
      let res_obj = {
        status: true,
        user_email: user_email,
        total_time: ((Date.now() - start_time) / 1000).toFixed(2),
        hostname: global.device_data.hostname,
        last_log: last_log
      }
      global.client_socket.emit("end_item", res_obj)

      resolve(res_obj)
      await delay(2000)
      loguear("killing browser")
      await kill_browser()


      async function loguear(texto) {

        console.log(user_email, ((Date.now() - last_log_time) / 1000).toFixed(2), texto)
        last_log_time = Date.now()
        last_log = texto
      }
    } catch (error) {
      await kill_browser()
      capturar("error", user_email, "last_log", last_log)
      console.log(user_email, error.toString())
      let res_obj = { status: false, user_email: user_email, total_time: error.toString(), hostname: global.device_data.hostname, last_log: last_log }
      global.client_socket.emit("end_item", res_obj)
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
        await page.screenshot({ path: './captura/' + user[0] + '_' + fn + '.png' });

      } catch (error) {
        console.log("no pude hacer la captura", error.toString())

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
