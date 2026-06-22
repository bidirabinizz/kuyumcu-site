const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Intercept network requests to capture the JSON data
  page.on('response', async (response) => {
    if (response.url().includes('ajax/doviz') || response.url().includes('ajax')) {
      try {
        const text = await response.text();
        console.log("URL:", response.url());
        console.log("RESPONSE:", text.substring(0, 1000));
      } catch (e) {}
    }
  });

  await page.goto('https://www.haremaltin.com/', { waitUntil: 'networkidle2' });
  
  // Alternatively, just grab the "prices" variable from the window object
  const prices = await page.evaluate(() => {
    return window.prices;
  });
  
  if (prices) {
    console.log("WINDOW.PRICES:");
    console.log(JSON.stringify({
      ALTIN: prices.ALTIN,
      USDTRY: prices.USDTRY
    }, null, 2));
  } else {
    console.log("No prices variable found in window.");
  }

  await browser.close();
})();
