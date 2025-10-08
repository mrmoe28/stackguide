/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  // Console message handler
  page.on('console', async (msg) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    const timestamp = new Date().toLocaleTimeString();

    if (type === 'error') {
      console.log(`\n❌ [${timestamp}] CONSOLE ERROR:`);
      console.log(`   Message: ${text}`);
      console.log(`   Location: ${location.url}:${location.lineNumber}:${location.columnNumber}`);
    } else if (type === 'warning') {
      console.log(`\n⚠️  [${timestamp}] CONSOLE WARNING:`);
      console.log(`   Message: ${text}`);
    } else if (type === 'log') {
      console.log(`\n📝 [${timestamp}] CONSOLE LOG: ${text}`);
    } else if (type === 'info') {
      console.log(`\nℹ️  [${timestamp}] CONSOLE INFO: ${text}`);
    }
  });

  // Page error handler
  page.on('pageerror', (error) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n💥 [${timestamp}] PAGE ERROR (Uncaught Exception):`);
    console.log(`   ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  });

  // Request failed handler
  page.on('requestfailed', (request) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n🔴 [${timestamp}] REQUEST FAILED:`);
    console.log(`   URL: ${request.url()}`);
    console.log(`   Method: ${request.method()}`);
    console.log(`   Failure: ${request.failure().errorText}`);
  });

  // Response handler for HTTP errors
  page.on('response', async (response) => {
    const status = response.status();
    const url = response.url();
    const timestamp = new Date().toLocaleTimeString();

    if (status >= 400) {
      console.log(`\n🚨 [${timestamp}] HTTP ${status} ERROR:`);
      console.log(`   URL: ${url}`);
      console.log(`   Method: ${response.request().method()}`);

      try {
        const body = await response.text();
        if (body) {
          console.log(`   Response: ${body.substring(0, 200)}${body.length > 200 ? '...' : ''}`);
        }
      } catch (e) {
        // Body might not be readable
      }
    }
  });

  console.log('\n🔍 Console Monitor Active');
  console.log('━'.repeat(80));
  console.log('Monitoring: http://localhost:3002');
  console.log('━'.repeat(80));
  console.log('\nListening for:');
  console.log('  ❌ Console errors');
  console.log('  ⚠️  Console warnings');
  console.log('  📝 Console logs');
  console.log('  💥 Uncaught exceptions');
  console.log('  🔴 Failed requests');
  console.log('  🚨 HTTP 4xx/5xx responses');
  console.log('\n👉 Browser window opened - Test your app now!');
  console.log('   Press Ctrl+C to stop monitoring\n');

  // Navigate to the app
  try {
    await page.goto('http://localhost:3002', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });
    console.log('✅ Page loaded successfully\n');
  } catch (error) {
    console.log(`\n❌ Failed to load page: ${error.message}\n`);
  }

  // Keep the browser open
  // Press Ctrl+C to exit
  await new Promise(() => {});
})();
