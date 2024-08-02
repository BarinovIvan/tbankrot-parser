import puppeteer, {Browser, ElementHandle, NodeFor, Page} from 'puppeteer';
import dotenv from 'dotenv';
const createDoc = require('./createDoc')
const readline = require('readline');

dotenv.config();

/**
 * Logs into the website using the provided credentials
 * @param page
 * @param email
 * @param password
 */
async function login(page:Page, email:string, password:string):Promise<void> {
  await page.locator('#login').click();

  await page.locator('#lg-mail').fill(email);
  await page.locator('#lg-pas').fill(password);

  await page.locator('#login-btn').click();

  await page.waitForNavigation({ timeout: 5000 })
}

/**
 * Parses the specified URL using Puppeteer
 * @param url - The URL to parse
 */
async function parseWebsite(url: string): Promise<void> {
  const browser:Browser = await puppeteer.launch();
  const page:Page = await browser.newPage();

  await page.goto(url);

  const email:string|undefined = process.env.EMAIL
  const password:string|undefined = process.env.PASSWORD
  if (!email || !password) {
    console.error('Specify email and password in .env file')
    process.exit(1);
  }

  try {
    await login(page, email, password);
  } catch (e) {
    console.error('Logging in is failed.', e)
    process.exit(1);
  }

  const texts: string[] = await page.$$eval('.filter .image p', elements =>
    elements.map(el => {
      const text:string|null = el?.textContent;
      return text ? text.trim() : '';
    })
  );

  await createDoc(texts);

  await browser.close();
}

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for URL
rl.question('Please enter the URL to parse: ', (url:string) => {
  const urlConst:string = 'https://tbankrot.ru/?search=&swp=any_word&stop=&num=&debtor_cat=0&debtor=&au=&org=&start_p1=&start_p2=&p1=&p2=&min_p1=&min_p2=&pp_1=&pp_2=&st_1=&st_2=&sz_1=&sz_2=&ez_1=&ez_2=&et_1=&et_2=&parent_cat=2&sub_cat=5&sort_order=desc&sort=&show_period=all'


  parseWebsite(urlConst)
    .then(() => {
      console.log('Parsing complete');
      rl.close();
    })
    .catch((error) => {
      console.error('Error:', error);
      rl.close();
    });
});
