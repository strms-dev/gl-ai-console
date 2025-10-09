const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('Testing STRMS page...');
  await page.goto('http://localhost:3000/strms');
  await page.waitForTimeout(2000);

  const scrollY = await page.evaluate(() => window.scrollY);
  const bodyScrollTop = await page.evaluate(() => document.body.scrollTop);
  const htmlScrollTop = await page.evaluate(() => document.documentElement.scrollTop);

  console.log('STRMS page - window.scrollY:', scrollY);
  console.log('STRMS page - body.scrollTop:', bodyScrollTop);
  console.log('STRMS page - html.scrollTop:', htmlScrollTop);

  console.log('\nTesting project details page...');
  await page.goto('http://localhost:3000/strms/leads/c4b6018e-6d36-4a6a-b4de-d1fa84082c6c');
  await page.waitForTimeout(2000);

  const scrollY2 = await page.evaluate(() => window.scrollY);
  const bodyScrollTop2 = await page.evaluate(() => document.body.scrollTop);
  const htmlScrollTop2 = await page.evaluate(() => document.documentElement.scrollTop);

  console.log('Details page - window.scrollY:', scrollY2);
  console.log('Details page - body.scrollTop:', bodyScrollTop2);
  console.log('Details page - html.scrollTop:', htmlScrollTop2);

  await page.screenshot({ path: 'scroll-test.png', fullPage: true });
  console.log('\nScreenshot saved as scroll-test.png');

  await browser.close();
})();
