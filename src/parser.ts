import { Page } from 'puppeteer';
import dotenv from 'dotenv';
import { Interface } from "readline";
import { ParsedObject } from "./interfaces";
import { initializeBrowser } from "./browserInitialization";
import { login } from "./auth";
import { createDoc } from "./createDoc";
const readline = require('readline');

dotenv.config();

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
 * Parses the content after login
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
  const { page } = await initializeBrowser();

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
  parseWebsite(url)
    .then(() => {
      console.log('Parsing complete');
      rl.close();
    })
    .catch((error) => {
      console.error('Error:', error);
      rl.close();
    });
});
