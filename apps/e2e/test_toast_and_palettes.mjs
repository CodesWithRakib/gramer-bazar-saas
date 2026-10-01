import { chromium } from '@playwright/test';
import fs from 'fs';

async function runQA() {
  console.log('Starting Browser Visual QA...');
  if (!fs.existsSync('scratch/screenshots')) {
    fs.mkdirSync('scratch/screenshots', { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();

  // Test 1: Load homepage in Bangla on Desktop
  console.log('Navigating to http://localhost:5000/bn...');
  await page.goto('http://localhost:5000/bn', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2000);
  console.log('Page title:', await page.title());

  // Trigger Toasts via window.__toast
  console.log('Triggering toasts in Bangla...');
  await page.evaluate(() => {
    const toast = window.__toast;
    if (!toast) throw new Error('window.__toast not found');

    toast.success({
      title: 'পণ্যটি সফলভাবে কার্টে যোগ করা হয়েছে',
      description: 'আপনার শপিং ব্যাগ প্রস্তুত। চেকআউট করতে কার্ট দেখুন।',
      badge: 'সফল',
      action: {
        label: 'কার্ট দেখুন',
        onClick: () => console.log('Cart clicked'),
      },
    });

    toast.error({
      title: 'অর্ডার প্রক্রিয়া ব্যর্থ হয়েছে',
      description: 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
      badge: 'ত্রুটি',
    });

    toast.warning({
      title: 'সীমিত স্টক সতর্কতা',
      description: 'এই পণ্যটির মাত্র ২টি আইটেম স্টকে অবশিষ্ট আছে।',
      badge: 'সতর্কতা',
    });

    toast.info({
      title: 'নতুন কুপন উপলব্ধ',
      description: 'কুপন কোড GRAM20 ব্যবহারে ২০% পর্যন্ত ছাড় পান।',
      badge: 'অফার',
      link: {
        href: '/bn/offers',
        label: 'অফারসমূহ',
      },
    });
  });

  await page.waitForTimeout(600);

  // Screenshot 1: Desktop Toasts in Bangla
  await page.screenshot({ path: 'scratch/screenshots/01-toasts-desktop-bangla.png' });
  console.log('Saved: scratch/screenshots/01-toasts-desktop-bangla.png');

  // Verify toast container presence and count
  const toastCount = await page.locator('aside[aria-label="Notifications"] > div').count();
  console.log('Active visible toast count on desktop:', toastCount);

  // Test 2: Mobile Viewport (375x667)
  console.log('Testing Mobile Viewport (375x667)...');
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(500);

  // Trigger a loading toast on mobile
  await page.evaluate(() => {
    window.__toast.loading({
      title: 'পেমেন্ট ভেরিফাই করা হচ্ছে...',
      description: 'অনুগ্রহ করে অপেক্ষা করুন, উইন্ডো বন্ধ করবেন না।',
      badge: 'অপেক্ষমান',
    });
  });

  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/screenshots/02-toasts-mobile-bangla.png' });
  console.log('Saved: scratch/screenshots/02-toasts-mobile-bangla.png');

  // Verify no horizontal overflow on mobile
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile has horizontal scroll overflow:', hasHorizontalScroll);

  // Test 3: English and RTL
  console.log('Testing English and RTL...');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('http://localhost:5000/en', { waitUntil: 'domcontentloaded', timeout: 120000 });
  await page.waitForTimeout(2000);

  await page.evaluate(() => {
    window.__toast.dismiss();
  });
  await page.waitForTimeout(300);

  await page.evaluate(() => {
    window.__toast.success({
      title: 'Product added successfully',
      description: 'Your shopping cart is ready. Proceed to checkout anytime.',
      badge: 'Success',
      action: {
        label: 'View Cart',
        onClick: () => console.log('Cart clicked'),
      },
    });

    window.__toast.info({
      title: 'Special offer applied',
      description: 'Coupon code SAVE10 has been automatically applied to eligible items.',
      badge: 'Offer',
      link: {
        href: '/en/offers',
        label: 'View Offers',
      },
    });

    window.__toast.warning({
      title: 'Low stock notification',
      description: 'Selected variant only has 3 items left in inventory.',
      badge: 'Notice',
    });
  });

  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/screenshots/03-toasts-desktop-english.png' });
  console.log('Saved: scratch/screenshots/03-toasts-desktop-english.png');

  // Switch to RTL
  await page.evaluate(() => {
    document.documentElement.setAttribute('dir', 'rtl');
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'scratch/screenshots/04-toasts-rtl.png' });
  console.log('Saved: scratch/screenshots/04-toasts-rtl.png');

  // Test 4: Testing all 5 Palettes
  console.log('Testing all 5 theme palettes...');
  await page.evaluate(() => {
    document.documentElement.setAttribute('dir', 'ltr');
    window.__toast.dismiss();
  });
  await page.waitForTimeout(300);

  const palettes = ['clean', 'fresh', 'premium', 'modern', 'warm'];
  for (const pal of palettes) {
    await page.evaluate((themeId) => {
      document.documentElement.setAttribute('data-theme', themeId);
      localStorage.setItem('gramer_bazar_theme_palette', themeId);
      window.__toast.success({
        title: 'Theme Applied: ' + themeId.toUpperCase(),
        description: 'Global color palette switched cleanly across all portal components.',
      });
    }, pal);
    await page.waitForTimeout(500);

    const primaryColor = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    });
    console.log('Palette ' + pal + ' -> --primary CSS value: ' + primaryColor);

    await page.screenshot({ path: 'scratch/screenshots/05-palette-' + pal + '.png' });
    console.log('Saved: scratch/screenshots/05-palette-' + pal + '.png');
  }

  await browser.close();
  console.log('All Browser Visual QA steps completed successfully!');
}

runQA().catch((err) => {
  console.error('QA Error:', err);
  process.exit(1);
});
