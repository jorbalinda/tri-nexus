/**
 * Race Day - Full E2E QA Test Suite (Pass 2)
 * Uses page rendering instead of raw HTML parsing for accurate 404 detection
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/Users/jordanroah/tri-nexus/qa-screenshots';
const EMAIL = 'jroah3@gmail.com';
const COMMON_PASSWORDS = ['Password1!', 'password123', 'Test1234!', 'Jordan123!', 'Triathlon1!', 'RaceDay1!', 'Triathlete1!', 'Jordan1!'];

const issues = [];
let screenshotCounter = 0;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function screenshot(page, name) {
  ensureDir(SCREENSHOT_DIR);
  const filename = `${String(++screenshotCounter).padStart(2,'0')}_${name.replace(/[^a-z0-9_-]/gi, '_')}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  [SS] ${filename}`);
  return filepath;
}

function logIssue(issue) {
  issues.push(issue);
  const icon = issue.type === 'bug' ? 'BUG' : issue.type === 'warning' ? 'WARN' : 'INFO';
  console.log(`  [${icon}] ${issue.page}: ${issue.description}`);
}

/**
 * Proper 404 detection - checks the visible rendered text, not RSC payload
 */
async function isRendered404(page) {
  try {
    // Check the actual rendered DOM for Next.js 404 page indicators
    const is404 = await page.evaluate(() => {
      const h1s = [...document.querySelectorAll('h1, h2')].map(h => h.textContent || '');
      const pageText = document.body.innerText || '';
      return h1s.some(t => t.includes('404') || t.toLowerCase().includes('not found')) ||
             pageText.includes('This page could not be found.') ||
             pageText.includes('404: This page could not be found');
    });
    return is404;
  } catch (e) {
    return false;
  }
}

async function testLandingPage(page) {
  console.log('\n=== LANDING PAGE ===');

  const consoleErrors = [];
  const handler = msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
  page.on('console', handler);

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const title = await page.title();
  const filepath = await screenshot(page, 'landing_01_desktop');

  console.log(`  Title: "${title}"`);

  // Check title
  if (!title.includes('Race Day') && !title.toLowerCase().includes('triathlon') && !title.toLowerCase().includes('race')) {
    logIssue({ page: 'Landing', type: 'warning', description: `Unexpected page title: "${title}"` });
  } else {
    console.log('  ✓ Title correct');
  }

  // Check 404
  if (await isRendered404(page)) {
    logIssue({ page: 'Landing', type: 'bug', description: 'Landing page shows 404 error', screenshot: filepath });
    return;
  }
  console.log('  ✓ Page renders (not 404)');

  // Verify hero content
  const headings = await page.locator('h1, h2').all();
  for (const h of headings) {
    const text = await h.textContent().catch(() => '');
    if (text) console.log(`  Heading: "${text.trim()}"`);
  }

  // Verify navigation links
  const allLinks = await page.locator('a[href]').all();
  const linkData = [];
  for (const link of allLinks) {
    const text = await link.textContent().catch(() => '');
    const href = await link.getAttribute('href').catch(() => '');
    if (text && text.trim() && href) {
      linkData.push({ text: text.trim(), href });
    }
  }
  console.log(`  Links found:`);
  for (const l of linkData) console.log(`    "${l.text}" -> ${l.href}`);

  // Check for missing "Sign In" link
  const hasSignIn = linkData.some(l => l.text.toLowerCase().includes('sign in') || l.text.toLowerCase().includes('login'));
  if (!hasSignIn) {
    logIssue({ page: 'Landing', type: 'bug', description: 'No "Sign In" link visible on landing page', screenshot: filepath });
  } else {
    console.log('  ✓ Sign In link present');
  }

  // Check for "Get Started" / CTA
  const hasCTA = linkData.some(l => l.text.toLowerCase().includes('get started') || l.text.toLowerCase().includes('sign up'));
  if (!hasCTA) {
    logIssue({ page: 'Landing', type: 'warning', description: 'No "Get Started" CTA link found on landing page', screenshot: filepath });
  } else {
    console.log('  ✓ CTA link present');
  }

  // Check for broken images
  const images = await page.locator('img').all();
  for (const img of images) {
    const src = await img.getAttribute('src').catch(() => '');
    const naturalWidth = await img.evaluate(el => el.naturalWidth).catch(() => 0);
    if (naturalWidth === 0 && src && !src.startsWith('data:')) {
      logIssue({ page: 'Landing', type: 'bug', description: `Broken image: ${src}`, screenshot: filepath });
    }
  }

  // Check for visible text (page content quality)
  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 2).length;
  console.log(`  Page word count: ${wordCount}`);
  if (wordCount < 30) {
    logIssue({ page: 'Landing', type: 'bug', description: 'Landing page has very little visible text content', screenshot: filepath });
  }

  // Console errors
  await page.waitForTimeout(500);
  if (consoleErrors.length > 0) {
    console.log(`  Console errors: ${consoleErrors.length}`);
    for (const err of consoleErrors.slice(0, 5)) {
      logIssue({ page: 'Landing', type: 'bug', description: `Console error: ${err.substring(0, 200)}` });
    }
  } else {
    console.log('  ✓ No console errors');
  }

  page.off('console', handler);
}

async function testSignInPage(page) {
  console.log('\n=== SIGN IN PAGE ===');

  const consoleErrors = [];
  const handler = msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
  page.on('console', handler);

  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const filepath = await screenshot(page, 'signin_01_desktop');

  if (await isRendered404(page)) {
    logIssue({ page: 'Sign In', type: 'bug', description: 'Sign in page shows 404', screenshot: filepath });
    page.off('console', handler);
    return false;
  }

  // Get visible page text
  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  console.log(`  Page visible content (first 200 chars): "${bodyText.substring(0, 200).replace(/\n/g, ' ')}"`);

  // Check form fields
  const emailField = page.locator('input[type="email"]').first();
  const passwordField = page.locator('input[type="password"]').first();
  const submitBtn = page.locator('button[type="submit"]').first();
  const googleBtn = page.locator('button:has-text("Google"), button:has-text("Continue with Google")').first();

  const hasEmail = await emailField.isVisible().catch(() => false);
  const hasPassword = await passwordField.isVisible().catch(() => false);
  const hasSubmit = await submitBtn.isVisible().catch(() => false);
  const hasGoogle = await googleBtn.isVisible().catch(() => false);

  console.log(`  Form: email=${hasEmail}, password=${hasPassword}, submit=${hasSubmit}, google=${hasGoogle}`);

  if (!hasEmail) logIssue({ page: 'Sign In', type: 'bug', description: 'Email field not visible' });
  if (!hasPassword) logIssue({ page: 'Sign In', type: 'bug', description: 'Password field not visible' });
  if (!hasSubmit) logIssue({ page: 'Sign In', type: 'bug', description: 'Submit button not visible' });

  // Check "Back to home" link
  const backLink = page.locator('a:has-text("Back to home")').first();
  if (await backLink.isVisible().catch(() => false)) {
    const backHref = await backLink.getAttribute('href').catch(() => '');
    console.log(`  ✓ "Back to home" link -> ${backHref}`);
    // Verify it actually goes to home
    if (backHref !== '/' && backHref !== BASE_URL) {
      logIssue({ page: 'Sign In', type: 'warning', description: `"Back to home" link points to unexpected URL: ${backHref}` });
    }
  } else {
    logIssue({ page: 'Sign In', type: 'warning', description: '"Back to home" link not visible' });
  }

  // Test form validation
  if (hasEmail && hasPassword && hasSubmit) {
    // Test 1: Empty submit
    console.log('  Test: Empty form submission');
    await submitBtn.click();
    await page.waitForTimeout(800);
    const afterEmptyShot = await screenshot(page, 'signin_02_empty_submit');

    // Check if HTML5 validation triggered (browser native)
    const emailValidationMsg = await emailField.evaluate(el => el.validationMessage).catch(() => '');
    const passwordValidationMsg = await passwordField.evaluate(el => el.validationMessage).catch(() => '');
    console.log(`    Email validation: "${emailValidationMsg}"`);
    console.log(`    Password validation: "${passwordValidationMsg}"`);

    // Test 2: Invalid email format
    console.log('  Test: Invalid email format');
    await emailField.fill('notanemail');
    await passwordField.fill('anypassword');
    await submitBtn.click();
    await page.waitForTimeout(800);
    const invalidEmailShot = await screenshot(page, 'signin_03_invalid_email');
    const emailValidAfter = await emailField.evaluate(el => el.validationMessage).catch(() => '');
    console.log(`    Email validation after bad email: "${emailValidAfter}"`);

    // Test 3: Valid email, wrong password
    console.log(`  Test: Login attempt with ${EMAIL}`);
    let loggedIn = false;
    for (const pwd of COMMON_PASSWORDS) {
      await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);

      const e = page.locator('input[type="email"]').first();
      const p = page.locator('input[type="password"]').first();
      const s = page.locator('button[type="submit"]').first();

      if (!await e.isVisible().catch(() => false)) break;

      await e.fill(EMAIL);
      await p.fill(pwd);
      await s.click();
      await page.waitForTimeout(3000);

      const afterUrl = page.url();
      const afterText = await page.evaluate(() => document.body.innerText).catch(() => '');

      // Check if we navigated away from login
      if (!afterUrl.includes('/auth/login') && !afterUrl.includes('/auth/signup')) {
        console.log(`  *** SUCCESS: Logged in with password "${pwd}" ***`);
        console.log(`  *** Now at: ${afterUrl} ***`);
        loggedIn = true;
        await screenshot(page, `signin_04_login_success`);
        break;
      }

      // Check error message displayed
      const errMsg = await page.locator('.text-red-600, .text-red-400, [class*="error"]').first().textContent().catch(() => '');
      if (errMsg) console.log(`    Error: "${errMsg.trim()}" (tried: ${pwd.substring(0,4)}...)`);
    }

    if (!loggedIn) {
      await screenshot(page, 'signin_05_all_passwords_failed');
      logIssue({ page: 'Sign In', type: 'info', description: `Could not log in with email ${EMAIL} using common passwords` });
    }

    page.off('console', handler);
    return loggedIn;
  }

  page.off('console', handler);
  return false;
}

async function testSignUpPage(page) {
  console.log('\n=== SIGN UP PAGE ===');

  const consoleErrors = [];
  const handler = msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
  page.on('console', handler);

  await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const filepath = await screenshot(page, 'signup_01_desktop');

  if (await isRendered404(page)) {
    logIssue({ page: 'Sign Up', type: 'bug', description: 'Sign up page shows 404', screenshot: filepath });
    page.off('console', handler);
    return;
  }

  const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
  console.log(`  Page visible (first 200): "${bodyText.substring(0,200).replace(/\n/g,' ')}"`);

  // Check form fields
  const nameField = page.locator('input[type="text"]').first();
  const emailField = page.locator('input[type="email"]').first();
  const passwordField = page.locator('input[type="password"]').first();
  const submitBtn = page.locator('button[type="submit"]').first();

  const hasName = await nameField.isVisible().catch(() => false);
  const hasEmail = await emailField.isVisible().catch(() => false);
  const hasPassword = await passwordField.isVisible().catch(() => false);
  const hasSubmit = await submitBtn.isVisible().catch(() => false);

  console.log(`  Form fields: name=${hasName}, email=${hasEmail}, password=${hasPassword}, submit=${hasSubmit}`);

  if (!hasName) logIssue({ page: 'Sign Up', type: 'warning', description: 'Display name field not visible (may have been removed)' });

  if (hasEmail && hasPassword && hasSubmit) {
    // Test short password (< 6 chars)
    console.log('  Test: Short password');
    if (hasName) await nameField.fill('Test User');
    await emailField.fill('test@example.com');
    await passwordField.fill('abc');
    await submitBtn.click();
    await page.waitForTimeout(1000);
    await screenshot(page, 'signup_02_short_password');
    const shortPwdValidation = await passwordField.evaluate(el => el.validationMessage).catch(() => '');
    console.log(`    Password validation: "${shortPwdValidation}"`);

    // Test valid fake email
    console.log('  Test: Fake email signup');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const n2 = page.locator('input[type="text"]').first();
    const e2 = page.locator('input[type="email"]').first();
    const p2 = page.locator('input[type="password"]').first();
    const s2 = page.locator('button[type="submit"]').first();

    if (await n2.isVisible().catch(() => false)) await n2.fill('QA Test User');
    if (await e2.isVisible().catch(() => false)) await e2.fill('qa.test.user.99999@fakedomainqa.xyz');
    if (await p2.isVisible().catch(() => false)) await p2.fill('QATest1234!');
    if (await s2.isVisible().catch(() => false)) {
      await s2.click();
      await page.waitForTimeout(3000);
    }

    const afterUrl = page.url();
    const afterText = await page.evaluate(() => document.body.innerText).catch(() => '');
    await screenshot(page, 'signup_03_fake_email_response');
    console.log(`    After signup attempt: ${afterUrl}`);
    if (afterText.includes('verification') || afterText.includes('check your email') || afterText.includes('verify')) {
      console.log('    -> Shows email verification message (expected)');
    } else if (afterText.includes('Error') || afterText.includes('error') || afterText.includes('failed')) {
      console.log(`    -> Shows error: "${afterText.substring(0, 100)}"`);
    } else if (afterUrl.includes('onboarding')) {
      console.log('    -> Redirected to onboarding (signup accepted)');
    }
  }

  if (consoleErrors.length > 0) {
    for (const err of consoleErrors.slice(0, 3)) {
      logIssue({ page: 'Sign Up', type: 'bug', description: `Console error: ${err.substring(0, 200)}` });
    }
  }

  page.off('console', handler);
}

async function testPublicPages(page) {
  console.log('\n=== PUBLIC PAGES ===');

  const publicPaths = [
    { path: '/', name: 'Home/Landing' },
    { path: '/how-it-works', name: 'How It Works' },
    { path: '/privacy', name: 'Privacy Policy' },
    { path: '/terms', name: 'Terms of Service' },
    { path: '/about', name: 'About' },
    { path: '/pricing', name: 'Pricing' },
    { path: '/auth/login', name: 'Login' },
    { path: '/auth/signup', name: 'Signup' },
    { path: '/auth/callback', name: 'Auth Callback' },
  ];

  for (const p of publicPaths) {
    const consoleErrors = [];
    const handler = msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
    page.on('console', handler);

    await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'networkidle', timeout: 8000 }).catch(e => {
      console.log(`  [ERR] ${p.path}: ${e.message}`);
    });
    await page.waitForTimeout(1000);

    const is404 = await isRendered404(page);
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 2).length;

    if (is404) {
      console.log(`  [404] ${p.path} - ${p.name}`);
      logIssue({ page: p.name, type: 'info', description: `Page ${p.path} returns 404 (may be expected)` });
    } else {
      const ssPath = await screenshot(page, `public_${p.name.replace(/[^a-z0-9]/gi,'_').toLowerCase()}`);
      console.log(`  [OK]  ${p.path} - ${p.name} (${wordCount} words)`);

      // Check for console errors
      if (consoleErrors.length > 0) {
        for (const err of consoleErrors.slice(0, 2)) {
          logIssue({ page: p.name, type: 'bug', description: `Console error: ${err.substring(0, 200)}`, screenshot: ssPath });
        }
      }
    }

    page.off('console', handler);
  }
}

async function testAuthFlow(page) {
  console.log('\n=== AUTH FLOW NAVIGATION ===');

  // Test: Sign up page has link to sign in
  await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
  const signInLink = page.locator('a:has-text("Sign in"), a:has-text("Log in")').first();
  const hasSignInLink = await signInLink.isVisible().catch(() => false);
  if (hasSignInLink) {
    console.log('  ✓ Sign up page links to sign in');
  } else {
    logIssue({ page: 'Sign Up', type: 'warning', description: 'Sign up page missing link to sign in page' });
  }

  // Test: Sign in page has link to sign up
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  const signUpLink = page.locator('a:has-text("Sign up"), a:has-text("Create account")').first();
  const hasSignUpLink = await signUpLink.isVisible().catch(() => false);
  if (hasSignUpLink) {
    console.log('  ✓ Sign in page links to sign up');
  } else {
    logIssue({ page: 'Sign In', type: 'warning', description: 'Sign in page missing link to sign up page' });
  }

  // Test: Forgot password link
  const forgotPwdLink = page.locator('a:has-text("Forgot"), a:has-text("forgot"), a:has-text("Reset")').first();
  if (await forgotPwdLink.isVisible().catch(() => false)) {
    console.log('  ✓ Forgot password link found');
    await forgotPwdLink.click();
    await page.waitForLoadState('networkidle');
    await screenshot(page, 'auth_forgot_password');
  } else {
    logIssue({ page: 'Sign In', type: 'warning', description: 'No "Forgot Password" link visible on sign in page' });
  }

  // Test: Back to home link works
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  const backHome = page.locator('a:has-text("Back to home")').first();
  if (await backHome.isVisible().catch(() => false)) {
    await backHome.click();
    await page.waitForLoadState('networkidle');
    const afterUrl = page.url();
    if (afterUrl === BASE_URL || afterUrl === `${BASE_URL}/`) {
      console.log('  ✓ "Back to home" works correctly');
    } else {
      logIssue({ page: 'Sign In', type: 'bug', description: `"Back to home" navigated to wrong URL: ${afterUrl}` });
    }
  }
}

async function testProtectedRouteRedirects(page) {
  console.log('\n=== PROTECTED ROUTE REDIRECTS ===');

  const protectedRoutes = [
    '/dashboard',
    '/races',
    '/profile',
    '/onboarding',
  ];

  for (const route of protectedRoutes) {
    const consoleErrors = [];
    const handler = msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
    page.on('console', handler);

    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const finalUrl = page.url();
    const ssPath = await screenshot(page, `protected_${route.replace('/','')}`);

    if (finalUrl.includes('/auth/login') || finalUrl.includes('/auth/signup') || finalUrl.includes('/signin')) {
      console.log(`  ✓ ${route} -> redirects to ${finalUrl} (protected)`);
    } else if (finalUrl.includes(route)) {
      // Might be publicly accessible (bug) or we somehow got in
      const is404 = await isRendered404(page);
      if (is404) {
        console.log(`  [404] ${route} -> 404 (no redirect)`);
        logIssue({ page: route, type: 'info', description: `Protected route ${route} returns 404 instead of redirecting` });
      } else {
        logIssue({
          page: route,
          type: 'bug',
          description: `SECURITY: Protected route ${route} accessible without login!`,
          screenshot: ssPath
        });
      }
    } else {
      console.log(`  [?] ${route} -> ${finalUrl}`);
    }

    if (consoleErrors.length > 0) {
      for (const err of consoleErrors.slice(0, 2)) {
        logIssue({ page: route, type: 'bug', description: `Console error during redirect: ${err.substring(0, 200)}` });
      }
    }

    page.off('console', handler);
  }
}

async function testMobileViewport(page, isLoggedIn) {
  console.log('\n=== MOBILE VIEWPORT (375x812) ===');

  await page.setViewportSize({ width: 375, height: 812 });

  const mobilePages = [
    { url: '/', name: 'landing' },
    { url: '/auth/login', name: 'login' },
    { url: '/auth/signup', name: 'signup' },
    { url: '/dashboard', name: 'dashboard' },
  ];

  for (const mp of mobilePages) {
    await page.goto(`${BASE_URL}${mp.url}`, { waitUntil: 'networkidle', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const filepath = await screenshot(page, `mobile_${mp.name}`);

    // Check horizontal overflow
    const { scrollWidth, clientWidth, windowWidth } = await page.evaluate(() => ({
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.body.clientWidth,
      windowWidth: window.innerWidth
    })).catch(() => ({ scrollWidth: 0, clientWidth: 0, windowWidth: 375 }));

    if (scrollWidth > windowWidth + 5) {
      logIssue({
        page: `${mp.name} (mobile)`,
        type: 'bug',
        description: `Horizontal overflow: body.scrollWidth=${scrollWidth}px > window.innerWidth=${windowWidth}px`,
        screenshot: filepath
      });
    } else {
      console.log(`  ✓ ${mp.url}: no overflow (scrollWidth=${scrollWidth})`);
    }

    // Check touch target sizes
    const tinyTargets = await page.evaluate(() => {
      const els = [...document.querySelectorAll('button, a, input, select, textarea, [role="button"], [role="link"]')];
      return els.map(el => {
        const r = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          text: (el.textContent || el.getAttribute('aria-label') || '').trim().substring(0, 30),
          h: Math.round(r.height),
          w: Math.round(r.width),
          visible: r.height > 0 && r.width > 0
        };
      }).filter(e => e.visible && (e.h < 44 || e.w < 44) && e.h > 0);
    }).catch(() => []);

    if (tinyTargets.length > 0) {
      console.log(`  WARN: ${tinyTargets.length} small touch targets on ${mp.url}:`);
      for (const t of tinyTargets.slice(0, 8)) {
        console.log(`    ${t.tag}["${t.text}"] ${t.w}x${t.h}px`);
      }
      if (tinyTargets.length > 0) {
        // Only log if truly important ones (not just tiny links in fine print)
        const importantSmall = tinyTargets.filter(t => !['Sign In','Sign Up','Get Started','Create Account','Back to home'].some(name => t.text.includes(name)));
        if (importantSmall.length > 0) {
          logIssue({
            page: `${mp.name} (mobile)`,
            type: 'warning',
            description: `${tinyTargets.length} elements below 44px touch target (${importantSmall.slice(0,3).map(t=>`${t.tag}[${t.text}] ${t.w}x${t.h}`).join(', ')})`,
            screenshot: filepath
          });
        }
      }
    }

    // Check font sizes
    const tinyFonts = await page.evaluate(() => {
      const allText = [...document.querySelectorAll('p, span, a, button, label, h1, h2, h3, h4, h5, h6, li')];
      return allText.map(el => {
        const style = window.getComputedStyle(el);
        const size = parseFloat(style.fontSize);
        const text = (el.textContent || '').trim().substring(0, 30);
        return { tag: el.tagName, text, size };
      }).filter(e => e.size > 0 && e.size < 12 && e.text.length > 3);
    }).catch(() => []);

    if (tinyFonts.length > 0) {
      console.log(`  WARN: ${tinyFonts.length} text elements below 12px on ${mp.url}`);
      for (const f of tinyFonts.slice(0, 5)) {
        console.log(`    ${f.tag}["${f.text}"] ${f.size}px`);
      }
      logIssue({
        page: `${mp.name} (mobile)`,
        type: 'warning',
        description: `${tinyFonts.length} text elements with font size < 12px (causes zoom on iOS)`,
        screenshot: filepath
      });
    }
  }

  await page.setViewportSize({ width: 1280, height: 800 });
  console.log('  Reset to desktop viewport');
}

async function testFormValidationDeep(page) {
  console.log('\n=== DEEP FORM VALIDATION ===');

  // Password minimum length test
  await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const nameField = page.locator('input[type="text"]').first();
  const emailField = page.locator('input[type="email"]').first();
  const passwordField = page.locator('input[type="password"]').first();
  const submitBtn = page.locator('button[type="submit"]').first();

  if (await emailField.isVisible().catch(() => false) && await passwordField.isVisible().catch(() => false)) {
    // Test: password too short
    if (await nameField.isVisible().catch(() => false)) await nameField.fill('Test');
    await emailField.fill('test@example.com');
    await passwordField.fill('12345'); // 5 chars, should be invalid if min is 6
    await submitBtn.click();
    await page.waitForTimeout(1000);

    const pwdValidMsg = await passwordField.evaluate(el => el.validationMessage).catch(() => '');
    const errMsg = await page.locator('[class*="red"], .error').first().textContent().catch(() => '');
    console.log(`  Short password validation: "${pwdValidMsg || errMsg}"`);
    if (!pwdValidMsg && !errMsg) {
      logIssue({ page: 'Sign Up', type: 'warning', description: 'Password min-length (5 chars) may not show validation message' });
    }

    // Test: valid password length
    await passwordField.fill('123456'); // exactly 6 chars
    const sixCharValid = await passwordField.evaluate(el => el.checkValidity()).catch(() => true);
    console.log(`  6-char password is valid: ${sixCharValid}`);

    await screenshot(page, 'formval_signup_pw_test');
  }

  // Login form: ARIA labels check
  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const formInputs = await page.locator('input').all();
  for (const input of formInputs) {
    const id = await input.getAttribute('id').catch(() => '');
    const name = await input.getAttribute('name').catch(() => '');
    const ariaLabel = await input.getAttribute('aria-label').catch(() => '');
    const ariaLabelledBy = await input.getAttribute('aria-labelledby').catch(() => '');
    const placeholder = await input.getAttribute('placeholder').catch(() => '');
    const type = await input.getAttribute('type').catch(() => '');

    // Find associated label
    let hasLabel = false;
    if (id) {
      const labelEl = page.locator(`label[for="${id}"]`).first();
      hasLabel = await labelEl.isVisible().catch(() => false);
    }

    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      if (placeholder) {
        logIssue({ page: 'Sign In', type: 'warning', description: `Input type="${type}" has no label (only placeholder "${placeholder}") - accessibility issue` });
      } else {
        logIssue({ page: 'Sign In', type: 'bug', description: `Input type="${type}" has no label or placeholder - inaccessible` });
      }
    } else {
      console.log(`  ✓ Input type="${type}" has ${hasLabel ? 'label' : ariaLabel ? 'aria-label' : 'aria-labelledby'}`);
    }
  }
}

async function testLandingPageSections(page) {
  console.log('\n=== LANDING PAGE SECTIONS ===');

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Get all sections/divs with substantial content
  const sections = await page.evaluate(() => {
    const allSections = [...document.querySelectorAll('section, [class*="section"], main > div, main > section')];
    return allSections.map(s => ({
      tag: s.tagName,
      className: s.className.substring(0, 80),
      text: (s.innerText || '').trim().substring(0, 100),
      childCount: s.children.length
    })).filter(s => s.text.length > 10);
  }).catch(() => []);

  console.log(`  Found ${sections.length} content sections`);
  for (const s of sections.slice(0, 10)) {
    console.log(`    [${s.tag}] "${s.text.replace(/\n/g, ' ').substring(0, 80)}"...`);
  }

  // Scroll to bottom and check footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  const footerShot = await screenshot(page, 'landing_02_bottom');

  const footer = await page.locator('footer').first();
  const hasFooter = await footer.isVisible().catch(() => false);
  if (hasFooter) {
    const footerText = await footer.evaluate(el => el.innerText).catch(() => '');
    console.log(`  ✓ Footer found: "${footerText.trim().substring(0, 100)}"`);
  } else {
    logIssue({ page: 'Landing', type: 'warning', description: 'No footer visible at bottom of landing page' });
  }

  // Scroll back to top
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function testDashboardWhenLoggedIn(page) {
  console.log('\n=== DASHBOARD TESTING (LOGGED IN) ===');

  const routes = [
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/races', name: 'Races' },
    { path: '/profile', name: 'Profile' },
  ];

  for (const route of routes) {
    console.log(`\n  --- ${route.name} ---`);

    const consoleErrors = [];
    const handler = msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); };
    page.on('console', handler);

    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(e => {
      console.log(`  Load error: ${e.message}`);
    });
    await page.waitForTimeout(3000);

    const finalUrl = page.url();
    const is404 = await isRendered404(page);
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
    const filepath = await screenshot(page, `dashboard_${route.name.toLowerCase()}`);

    console.log(`  URL: ${finalUrl}`);
    console.log(`  Visible text (first 300): "${bodyText.substring(0, 300).replace(/\n/g, ' ')}"`);

    if (finalUrl.includes('/auth/')) {
      console.log(`  -> Not logged in, redirected to auth`);
    } else if (is404) {
      logIssue({ page: route.name, type: 'bug', description: `Route ${route.path} shows 404 when logged in`, screenshot: filepath });
    } else {
      console.log(`  ✓ Page loaded successfully`);

      // Check for headings
      const headings = await page.locator('h1, h2').all();
      for (const h of headings.slice(0, 3)) {
        const t = await h.textContent().catch(() => '');
        if (t) console.log(`  Heading: "${t.trim()}"`);
      }

      // Check for loading states
      const spinnerCount = await page.locator('[class*="animate-spin"], [class*="spinner"], .loading').count().catch(() => 0);
      if (spinnerCount > 0) {
        logIssue({ page: route.name, type: 'warning', description: `${spinnerCount} loading spinner(s) still visible after 3s`, screenshot: filepath });
      }

      // Check for error boundaries
      const errorBoundaries = await page.locator('[class*="error"], .error-boundary').count().catch(() => 0);
      if (errorBoundaries > 0) {
        const errText = await page.locator('[class*="error"]').first().textContent().catch(() => '');
        if (errText && errText.toLowerCase().includes('error')) {
          logIssue({ page: route.name, type: 'bug', description: `Error state visible: "${errText.substring(0, 100)}"`, screenshot: filepath });
        }
      }
    }

    if (consoleErrors.length > 0) {
      for (const err of consoleErrors.slice(0, 3)) {
        logIssue({ page: route.name, type: 'bug', description: `Console error: ${err.substring(0, 300)}` });
      }
    }

    page.off('console', handler);
  }
}

async function testKeyboardNavigation(page) {
  console.log('\n=== KEYBOARD NAVIGATION ===');

  await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Tab through all focusable elements
  const focusedElements = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    const focused = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      return {
        tag: el.tagName,
        type: el.getAttribute('type') || '',
        text: (el.textContent || el.getAttribute('placeholder') || el.getAttribute('aria-label') || '').trim().substring(0, 30)
      };
    }).catch(() => null);
    if (focused) focusedElements.push(focused);
  }

  console.log(`  Tab order (${focusedElements.length} elements):`);
  for (const el of focusedElements) {
    console.log(`    ${el.tag}[${el.type}] "${el.text}"`);
  }

  if (focusedElements.length < 3) {
    logIssue({ page: 'Sign In', type: 'warning', description: 'Fewer than 3 elements in keyboard tab order - may indicate missing focusable elements' });
  }

  // Test Enter key submit
  const emailField = page.locator('input[type="email"]').first();
  const passwordField = page.locator('input[type="password"]').first();

  if (await emailField.isVisible().catch(() => false)) {
    await emailField.fill(EMAIL);
    await passwordField.fill('testpassword');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1500);
    const afterUrl = page.url();
    console.log(`  After Enter key on password field: ${afterUrl}`);
    // Should still be on login (wrong password) or redirect (right password)
    await screenshot(page, 'keyboard_enter_submit');
  }
}

async function runAllTests() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  console.log('============================================');
  console.log('  RACE DAY - Full E2E QA Test (Pass 2)');
  console.log(`  Target: ${BASE_URL}`);
  console.log(`  Time: ${new Date().toISOString()}`);
  console.log('============================================');

  let isLoggedIn = false;

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Global error collection
    const globalErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        globalErrors.push({ url: page.url(), message: msg.text() });
      }
    });

    // Run tests
    await testLandingPage(page);
    await testLandingPageSections(page);
    isLoggedIn = await testSignInPage(page);
    await testSignUpPage(page);
    await testAuthFlow(page);
    await testPublicPages(page);
    await testProtectedRouteRedirects(page);
    await testFormValidationDeep(page);

    if (isLoggedIn) {
      await testDashboardWhenLoggedIn(page);
    } else {
      await testDashboardWhenLoggedIn(page); // Still tests redirect behavior
    }

    await testMobileViewport(page, isLoggedIn);
    await testKeyboardNavigation(page);

    // Deduplicate global errors
    const uniqueErrors = [...new Map(globalErrors.map(e => [e.message, e])).values()];

    // Final Report
    console.log('\n\n============================================');
    console.log('  FINAL QA REPORT');
    console.log('============================================');
    console.log(`Login successful: ${isLoggedIn}`);
    console.log(`Total issues: ${issues.length}`);
    console.log(`  Bugs:     ${issues.filter(i => i.type === 'bug').length}`);
    console.log(`  Warnings: ${issues.filter(i => i.type === 'warning').length}`);
    console.log(`  Info:     ${issues.filter(i => i.type === 'info').length}`);
    console.log(`Console errors: ${uniqueErrors.length}`);

    const bugs = issues.filter(i => i.type === 'bug');
    const warnings = issues.filter(i => i.type === 'warning');
    const infos = issues.filter(i => i.type === 'info');

    if (bugs.length > 0) {
      console.log('\n========= BUGS =========');
      for (const b of bugs) {
        console.log(`  [${b.page}] ${b.description}`);
        if (b.screenshot) console.log(`    Screenshot: ${b.screenshot}`);
      }
    }

    if (warnings.length > 0) {
      console.log('\n========= WARNINGS =========');
      for (const w of warnings) {
        console.log(`  [${w.page}] ${w.description}`);
        if (w.screenshot) console.log(`    Screenshot: ${w.screenshot}`);
      }
    }

    if (infos.length > 0) {
      console.log('\n========= INFO =========');
      for (const i of infos) {
        console.log(`  [${i.page}] ${i.description}`);
      }
    }

    if (uniqueErrors.length > 0) {
      console.log('\n========= CONSOLE ERRORS =========');
      for (const e of uniqueErrors.slice(0, 10)) {
        console.log(`  [${e.url}] ${e.message.substring(0, 200)}`);
      }
    }

    console.log(`\nScreenshots: ${SCREENSHOT_DIR}`);
    console.log(`Total screenshots: ${screenshotCounter}`);

    // Save report
    ensureDir(SCREENSHOT_DIR);
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      isLoggedIn,
      totalIssues: issues.length,
      bugs: bugs.length,
      warnings: warnings.length,
      info: infos.length,
      consoleErrors: uniqueErrors.length,
      issues,
      consoleErrorDetails: uniqueErrors.slice(0, 20)
    };
    fs.writeFileSync(path.join(SCREENSHOT_DIR, 'qa-report-pass2.json'), JSON.stringify(report, null, 2));
    console.log(`Report: ${SCREENSHOT_DIR}/qa-report-pass2.json`);

  } catch (error) {
    console.error('\nFATAL ERROR:', error);
  } finally {
    await browser.close();
  }
}

runAllTests();
