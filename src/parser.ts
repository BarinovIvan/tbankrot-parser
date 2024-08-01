import puppeteer, {Browser, Page} from 'puppeteer';
const createDoc = require('./createDoc')

/**
 * Parses the specified URL using Puppeteer
 * @param url - The URL to parse
 */
async function parseWebsite(url: string): Promise<void> {
  const browser:Browser = await puppeteer.launch();
  const page:Page = await browser.newPage();

  await page.goto(url);

  const texts: string[] = await page.$$eval('.filter .image p', elements =>
    elements.map(el => {
      const text:string|null = el?.textContent;
      return text ? text.trim() : '';
    })
  );

  await createDoc(texts);

  await browser.close();
}

parseWebsite('https://tbankrot.ru/monitoring')
  .then(() => console.log('Parsinpng complete'))
  .catch((error) => console.error('Error:', error));
