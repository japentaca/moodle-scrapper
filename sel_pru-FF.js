
import { Builder, Browser, By, Key, until } from 'selenium-webdriver'
import chrome from 'selenium-webdriver/chrome.js'



let chrome_options = new chrome.Options()
chrome_options.addArguments('--headless=new', '--no-crash-upload',
  '--disable-oopr-debug-crash-dump',
  '--disable-client-side-phishing-detection',
  '--no-sandbox',
  '--disable-dev-shm-usage',
  '--disable-software-rasterizer',
  '--disable-crash-reporter',
  '--disable-gpu',
  '--disable-features=VizDisplayCompositor')
setTimeout(async () => {
  let driver = await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(chrome_options)
    .build()
  try {
    await driver.get('https://www.google.com/ncr')
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN)
    await driver.wait(until.titleIs('webdriver - Google Search'), 1000)
  } finally {
    await driver.quit()
  }
}, 1000)