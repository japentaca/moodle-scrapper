
import { Builder, Browser, By, Key, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'



let chrome_options = new chrome.Options()
chrome_options.addArguments("--headless=new")
setTimeout(async () => {
  let driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(chrome_options)
    .build()
  try {
    await driver.get('https://formacion-tst.informaticos.ar/login/index.php')
    await delay(2000)
    await driver.findElement(By.id('username')).sendKeys('01.santiago.diaz@gmail.com.1695061393')
    await driver.findElement(By.id('password')).sendKeys('ocbocb!')
    await driver.findElement(By.id('loginbtn')).sendKeys(Key.ENTER)
    await delay(2000)
    await driver.get('https://formacion-tst.informaticos.ar/course/view.php?id=53')
    await delay(2000)
    await driver.get('https://formacion-tst.informaticos.ar/mod/quiz/view.php?id=60')

    await driver.findElement(By.className('quizstartbuttondiv')).click()
    await delay(2000)
    const inputs = await driver.findElements(By.tagName('input'));
    for (let i = 0; i < inputs.length; i++) {
      let input = await inputs[i].getAttribute('id')
      console.log("input ", input)
    }
    await delay(20000)

    //await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
    //await driver.wait(until.titleIs('webdriver - Google Search'), 1000)
  } finally {
    await driver.quit()
  }
}, 1000)



async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
