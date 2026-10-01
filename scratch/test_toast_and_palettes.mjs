import { chromium } from '@playwright/test';

async function runQA() {
  console.log('Starting Browser Visual QA...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Test 1: Load homepage in Bangla
  console.log('Navigating to http://localhost:5000/bn...');
  await page.goto('http://localhost:5000/bn', { waitUntil: 'networkidle' });
  console.log('Page title:', await page.title());

  // Open theme switcher
  const switcherBtn = page.locator('button[aria-label="থিম প্যালেট পরিবর্তন"]');
  await switcherBtn.click();
  await page.waitForTimeout(300);

  // Trigger Success Toast
  const successBtn = page.locator('button:text("Success")');
  await successBtn.click();
  await page.waitForTimeout(200);

  // Trigger Error Toast
  const errorBtn = page.locator('button:text("Error")');
  await errorBtn.click();
  await page.waitForTimeout(200);

  // Trigger Warning Toast
  const warningBtn = page.locator('button:text("Warning")');
  await warningBtn.click();
  await page.waitForTimeout(200);

  // Trigger Info Toast
  const infoBtn = page.locator('button:text("Info")');
  await infoBtn.click();
  await page.waitForTimeout(300);

  // Close switcher dropdown
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // Screenshot 1: Desktop Toasts
  await page.screenshot({ path: 'scratch/screenshots/01-toasts-desktop-bangla.png' });
  console.log('Saved: 01-toasts-desktop-bangla.png');

  // Check toast element count and properties
  const toastItems = await page.locator('aside[aria-label="Notifications"] > div').count();
  console.log('Active visible toast count on desktop:', toastItems);

  // Test 2: Mobile Viewport (375x667)
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(400);

  // Trigger loading toast on mobile
  await switcherBtn.click();
  await page.waitForTimeout(300);
  const loadingBtn = page.locator('button:text("Loading")');
  await loadingBtn.click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);

  await page.screenshot({ path: 'scratch/screenshots/02-toasts-mobile-bangla.png' });
  console.log('Saved: 02-toasts-mobile-bangla.png');

  // Check for horizontal overflow on mobile
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile has horizontal scroll:', hasHorizontalScroll);

  // Test 3: English and RTL
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5000/en', { waitUntil: 'networkidle' });

  // Trigger English Toasts via toast API in browser console
  await page.evaluate(() => {
    const switcher = document.querySelector('button[aria-label="Switch theme palette"]');
    if (switcher) switcher.click();
  });
  await page.waitForTimeout(300);
  const successBtnEn = page.locator('button:text("Success")');
  await successBtnEn.click();
  const infoBtnEn = page.locator('button:text("Info")');
  await infoBtnEn.click();
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/screenshots/03-toasts-desktop-english.png' });
  console.log('Saved: 03-toasts-desktop-english.png');

  // Switch to RTL
  await page.evaluate(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: 'scratch/screenshots/04-toasts-rtl.png' });
  console.log('Saved: 04-toasts-rtl.png');

  // Test 4: Testing all 5 Palettes
  await page.evaluate(() => {
    document.documentElement.setAttribute('dir', 'ltr');
  });

  const palettes = ['clean', 'fresh', 'premium', 'modern', 'warm'];
  for (let i = 0; i < palettes.length; i++) {
    const pal = palettes[i];
    await page.evaluate((themeId) => {
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('gramer_bazar_theme_palette', themeId);
    }, pal);
    await page.waitForTimeout(300);

    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    });
    console.log('Palette ' + pal + ' --primary CSS var:', primaryColor);

    await page.screenshot({ path: 'scratch/screenshots/05-palette-' + pal + '.png' });
    console.log('Saved: 05-palette-' + pal + '.png');
  }

  await browser.close();
  console.log('Visual QA completed successfully!');
}

runQA().catch((err) => {
  console.error('QA Error:', err);
  process.exit(1);
});
