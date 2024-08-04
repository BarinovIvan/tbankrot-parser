import puppeteer, { Browser, Page } from 'puppeteer';

/**
 * Initializes the browser and page
 * @returns {Promise<{browser: Browser, page: Page}>}
 */
export async function initializeBrowser(): Promise<{ browser: Browser, page: Page }> {
  const browser: Browser = await puppeteer.launch({ headless: false });
  const page: Page = await browser.newPage();

  return { browser, page };
}
