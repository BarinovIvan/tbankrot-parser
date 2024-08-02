import puppeteer, {Browser, ElementHandle, NodeFor, Page} from 'puppeteer';
import dotenv from 'dotenv';
import {Interface} from "readline";
import {ParsedObject} from "./interfaces";
const createDoc = require('./createDoc')
const readline = require('readline');

dotenv.config();

/**
 * Initializes the browser and page
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
async function initializeBrowser(): Promise<{ browser: Browser, page: Page }> {
  const browser: Browser = await puppeteer.launch({ headless: false });
  const page: Page = await browser.newPage();

  return { browser, page };
}

/**
 * Loads and validates email and password
 */
function loadEmailAndPassword(): { email: string, password: string } {
  const email: string | undefined = process.env.EMAIL;
  const password: string | undefined = process.env.PASSWORD;
  if (!email || !password) {
    console.error('Specify email and password in .env file');
    process.exit(1);
  }

  return { email, password };
}

/**
 * Logs into the website using the provided credentials
 * @param page
 * @param email
 * @param password
 */
async function login(page: Page, email: string, password: string): Promise<void> {
  try {
    console.log('Clicking login button');
    await page.locator('#login').click();

    console.log('Filling email');
    await page.locator('#lg-mail').fill(email);

    console.log('Filling password');
    await page.locator('#lg-pas').fill(password);

    console.log('Clicking login button to submit');
    await page.locator('#login-btn').click();

    console.log('Waiting for navigation');
    await page.waitForNavigation({ timeout: 5000 });
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

/**
 * Parses the content after login
 * @returns {Promise<{title: string, price: string, text: string}[]>}
 */
async function parseContent(page: Page): Promise<ParsedObject[]> {
  console.log('Parsing content after login');
  const showMoreButtons = await page.$$('.show_more');
  for (const button of showMoreButtons) {
    await button.click();
  }

  const data:ParsedObject[] = await page.$$eval('.lot', elements =>
    elements.map(el => {

      const titleElement:Element|null = el.querySelector('.lot_title');
      const priceElement:Element|null = el.querySelector('.current_price');
      const textElement:Element|null = el.querySelector('.lot_text .text');

      const title:string|null = titleElement?.textContent?.trim() || '';
      const price:string|null = priceElement?.textContent?.trim() || '';
      const text:string|null = textElement?.textContent?.trim() || '';

      return { title, price, text };
    })
  );

  return data;
}

/**
 * Handles document creation with parsed texts
 */
async function handleDocumentCreation(data: ParsedObject[]): Promise<void> {
  console.log('Creating document with parsed data');
  await createDoc(data);
}


/**
 * Parses the specified URL using Puppeteer
 * @param {string} url - The URL to parse
 * @returns {Promise<void>}
 */
async function parseWebsite(url: string): Promise<void> {
  const { browser, page } = await initializeBrowser();

  try {
    console.log(`Navigating to ${url}`);
    await page.goto(url);

    const { email, password } = loadEmailAndPassword();
    await login(page, email, password);

    const data:ParsedObject[] = await parseContent(page);
    await handleDocumentCreation(data);
  } catch (error) {
    console.error('Error during parsing:', error);
  } finally {
    // await browser.close();
    console.log('Browser closed');
  }
}


// Create readline interface
const rl:Interface = readline.createInterface({
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
