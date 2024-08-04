import { Page } from 'puppeteer';

/**
 * Logs into the website using the provided credentials
 * @param page
 * @param email
 * @param password
 */
export async function login(page: Page, email: string, password: string): Promise<void> {
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
