import puppeteer from 'puppeteer'

const url = "https://formacion-tst.informaticos.ar/login/index.php"


async function lanzar_curso(user) {
  try {

    let start_time = Date.now()

    let last_log_time = Date.now()
    const user_email = user[0]

    loguear('lanzar_curso ' + user_email);

    const browser = await puppeteer.launch({
      headless: "shell"
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);
    //loguear('newPage');

    // Navigate the page to a URL
    await page.goto(url);
    loguear('entrada a  ' + url);
    await page.setViewport({ width: 1080, height: 1024 });
    //await capturar("login")

    await page.waitForNetworkIdle();
    await page.type("#username", user[0]);
    await page.type("#password", user[1]);
    //await capturar("tipeo")

    await page.click("#loginbtn");
    loguear('click login ' + url);
    await page.waitForNetworkIdle();

    loguear('post login  ' + url);
    //await capturar("post login")

    //await delay(20000)
    await browser.close();
    loguear('close');

    console.log("total:", ((Date.now() - start_time) / 1000).toFixed(2), user_email)


    async function capturar(fn) {

      await page.screenshot({ path: './captura/' + user[0] + '_' + fn + '.png' });
    }
    async function loguear(texto) {

      //console.log(user_email, ((Date.now() - last_log_time) / 1000).toFixed(2), texto)
      last_log_time = Date.now()
    }
  } catch (error) {
    console.log(error)
    return

  }
}

export { lanzar_curso }



async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
