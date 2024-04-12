import puppeteer from 'puppeteer'

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

      browser = await puppeteer.launch({
        headless: "shell",
        //headless: false,
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
      loguear('entro a ' + url);
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      loguear('entré a ' + url);
      //await page.waitForNetworkIdle();
      //await page.setViewport({ width: 1080, height: 1024 });
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
      if (browser && browser.process() != null) {
        loguear("killing browser")
        browser.process().kill('SIGINT')
      }


      async function loguear(texto) {

        console.log(user_email, ((Date.now() - last_log_time) / 1000).toFixed(2), texto)
        last_log_time = Date.now()
        last_log = texto
      }
    } catch (error) {
      browser.process().kill('SIGINT')
      capturar("error", user_email, "last_log", last_log)
      console.log(user_email, error.toString())
      let res_obj = { status: false, user_email: user_email, total_time: error.toString(), hostname: global.device_data.hostname, last_log: last_log }
      global.client_socket.emit("end_item", res_obj)
      resolve(res_obj)

    }
    async function capturar(fn, user_email) {
      try {
        await page.screenshot({ path: './captura/' + user[0] + '_' + fn + '.png' });

      } catch (error) {
        console.log("no pude hacer la caputura", error.toString())

      }

    }
  })

}

export { lanzar_curso }



async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
