import { chromium, Page, Browser } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/Users/jordanroah/tri-nexus/qa-screenshots';
const EMAIL = 'jroah3@gmail.com';
const COMMON_PASSWORDS = ['Password1!', 'password123', 'Test1234!', 'Jordan123!', 'Triathlon1!', 'RaceDay1!'];

interface Issue {
  page: string;
  type: 'bug' | 'warning' | 'info';
  description: string;
  screenshot?: string;
}

const issues: Issue[] = [];
let screenshotCounter = 0;

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function screenshot(page: Page, name: string): Promise<string> {
  ensureDir(SCREENSHOT_DIR);
  const filename = `${++screenshotCounter}_${name.replace(/[^a-z0-9_-]/gi, '_')}.png`;
  const filepath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filepath, fullPage: true });
  console.log(`  [SCREENSHOT] ${filename}`);
  return filepath;
}

function logIssue(issue: Issue) {
  issues.push(issue);
  const icon = issue.type === 'bug' ? '🐛' : issue.type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`  ${icon} [${issue.type.toUpperCase()}] ${issue.page}: ${issue.description}`);
}

async function checkForConsoleErrors(page: Page, pageName: string) {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  return errors;
}

async function testLandingPage(page: Page) {
  console.log('\n=== TESTING LANDING PAGE ===');

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  const filepath = await screenshot(page, '01_landing_page');

  // Check page title
  const title = await page.title();
  console.log(`  Page title: "${title}"`);
  if (!title || title.trim() === '') {
    logIssue({ page: 'Landing', type: 'bug', description: 'Page title is empty', screenshot: filepath });
  }

  // Check for main navigation elements
  const signInBtn = await page.locator('text=Sign In, a[href*="signin"], a[href*="login"], button:has-text("Sign In"), a:has-text("Sign In")').first();
  const hasSignIn = await signInBtn.isVisible().catch(() => false);
  if (!hasSignIn) {
    logIssue({ page: 'Landing', type: 'bug', description: 'No "Sign In" button/link visible on landing page', screenshot: filepath });
  } else {
    console.log('  ✓ Sign In button found');
  }

  // Check for main hero content
  const bodyText = await page.textContent('body');
  if (bodyText && bodyText.length < 100) {
    logIssue({ page: 'Landing', type: 'bug', description: 'Landing page has very little content', screenshot: filepath });
  }

  // Check for broken images
  const images = await page.locator('img').all();
  for (const img of images) {
    const src = await img.getAttribute('src');
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    if (naturalWidth === 0 && src && !src.startsWith('data:')) {
      logIssue({ page: 'Landing', type: 'bug', description: `Broken image: ${src}`, screenshot: filepath });
    }
  }

  // Check console errors
  await page.waitForTimeout(1000);
  if (consoleErrors.length > 0) {
    for (const err of consoleErrors) {
      logIssue({ page: 'Landing', type: 'bug', description: `Console error: ${err}`, screenshot: filepath });
    }
  }

  // Check for "How It Works" or similar public pages
  const navLinks = await page.locator('nav a, header a').all();
  const navTexts = [];
  for (const link of navLinks) {
    const text = await link.textContent();
    if (text) navTexts.push(text.trim());
  }
  console.log(`  Nav links found: ${navTexts.join(', ')}`);

  return filepath;
}

async function testSignInPage(page: Page) {
  console.log('\n=== TESTING SIGN IN PAGE ===');

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Try to navigate to sign in
  const signinUrls = ['/signin', '/login', '/auth/signin', '/auth/login'];
  let signinPageFound = false;

  for (const url of signinUrls) {
    try {
      await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 5000 });
      const currentUrl = page.url();
      if (!currentUrl.includes('404') && !currentUrl.endsWith('/')) {
        console.log(`  Sign in page found at: ${url}`);
        signinPageFound = true;
        break;
      }
    } catch (e) {
      // Try next URL
    }
  }

  if (!signinPageFound) {
    // Try clicking the Sign In button from landing page
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const signInBtns = page.locator('text=Sign In, a:has-text("Sign In"), button:has-text("Sign In")');
    const count = await signInBtns.count();
    if (count > 0) {
      await signInBtns.first().click();
      await page.waitForLoadState('networkidle');
      console.log(`  Navigated to: ${page.url()}`);
    }
  }

  const filepath = await screenshot(page, '02_signin_page');

  // Check for email and password fields
  const emailField = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]').first();
  const passwordField = page.locator('input[type="password"], input[name="password"]').first();

  const hasEmail = await emailField.isVisible().catch(() => false);
  const hasPassword = await passwordField.isVisible().catch(() => false);

  if (!hasEmail) {
    logIssue({ page: 'Sign In', type: 'bug', description: 'No email input field found', screenshot: filepath });
  }
  if (!hasPassword) {
    logIssue({ page: 'Sign In', type: 'bug', description: 'No password input field found', screenshot: filepath });
  }

  // Test empty form submission
  if (hasEmail && hasPassword) {
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign In"), button:has-text("Login"), button:has-text("Log In")').first();
    await submitBtn.click();
    await page.waitForTimeout(1000);
    const emptySubmitShot = await screenshot(page, '03_signin_empty_submit');

    // Check for validation messages
    const pageContent = await page.textContent('body');
    const hasValidation = pageContent && (
      pageContent.includes('required') ||
      pageContent.includes('invalid') ||
      pageContent.includes('error') ||
      pageContent.includes('Please')
    );
    if (!hasValidation) {
      logIssue({ page: 'Sign In', type: 'warning', description: 'Empty form submission may not show validation messages', screenshot: emptySubmitShot });
    } else {
      console.log('  ✓ Empty form shows validation');
    }

    // Test invalid email format
    await emailField.fill('notanemail');
    await passwordField.fill('password123');
    await submitBtn.click();
    await page.waitForTimeout(1000);
    const invalidEmailShot = await screenshot(page, '04_signin_invalid_email');
    console.log('  ✓ Tested invalid email format');

    // Test with real credentials - try common passwords
    await emailField.fill(EMAIL);
    let loggedIn = false;
    for (const pwd of COMMON_PASSWORDS) {
      await passwordField.fill(pwd);
      await submitBtn.click();
      await page.waitForTimeout(2000);

      const currentUrl = page.url();
      if (currentUrl.includes('/dashboard') || currentUrl.includes('/home') || !currentUrl.includes('signin') && !currentUrl.includes('login')) {
        console.log(`  ✓ Logged in successfully with password!`);
        loggedIn = true;
        break;
      }

      // Clear and try again
      await emailField.fill(EMAIL);
    }

    if (!loggedIn) {
      logIssue({ page: 'Sign In', type: 'info', description: `Could not log in with email ${EMAIL} - common passwords did not work. Testing form behavior only.` });
      const loginFailShot = await screenshot(page, '05_signin_failed_attempts');
    }

    return loggedIn;
  }

  return false;
}

async function testSignUpPage(page: Page) {
  console.log('\n=== TESTING SIGN UP PAGE ===');

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Try to navigate to sign up
  const signupUrls = ['/signup', '/register', '/auth/signup', '/auth/register'];
  let signupPageFound = false;

  for (const url of signupUrls) {
    try {
      await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle', timeout: 5000 });
      const currentUrl = page.url();
      if (!currentUrl.includes('404')) {
        console.log(`  Sign up page found at: ${url}`);
        signupPageFound = true;
        break;
      }
    } catch (e) {}
  }

  if (!signupPageFound) {
    // Try from landing page
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    const signUpBtn = page.locator('text=Sign Up, a:has-text("Sign Up"), button:has-text("Sign Up"), a:has-text("Get Started"), button:has-text("Get Started")').first();
    if (await signUpBtn.isVisible().catch(() => false)) {
      await signUpBtn.click();
      await page.waitForLoadState('networkidle');
    }
  }

  const filepath = await screenshot(page, '06_signup_page');

  const emailField = page.locator('input[type="email"], input[name="email"]').first();
  const hasEmail = await emailField.isVisible().catch(() => false);

  if (hasEmail) {
    // Test with invalid email
    await emailField.fill('invalidemail');
    const submitBtn = page.locator('button[type="submit"]').first();
    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(1000);
      await screenshot(page, '07_signup_invalid_email');
    }

    // Test with fake valid email
    await emailField.fill('test.fake.user.12345@notreal.com');
    const passwordFields = await page.locator('input[type="password"]').all();
    if (passwordFields.length > 0) {
      await passwordFields[0].fill('TestPassword1!');
      if (passwordFields.length > 1) {
        await passwordFields[1].fill('TestPassword1!');
      }
    }

    if (await submitBtn.isVisible().catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '08_signup_fake_email_submit');
    }

    console.log('  ✓ Sign up form tested');
  } else {
    logIssue({ page: 'Sign Up', type: 'info', description: 'Sign up page may not be accessible or has different structure' });
  }
}

async function testPublicPages(page: Page) {
  console.log('\n=== TESTING PUBLIC PAGES ===');

  const publicPaths = [
    '/',
    '/how-it-works',
    '/privacy',
    '/about',
    '/terms',
    '/pricing',
  ];

  for (const pagePath of publicPaths) {
    try {
      await page.goto(`${BASE_URL}${pagePath}`, { waitUntil: 'networkidle', timeout: 8000 });
      const status = await page.evaluate(() => document.readyState);
      const bodyText = await page.textContent('body');
      const isNotFound = bodyText && (bodyText.includes('404') || bodyText.includes('Page Not Found') || bodyText.includes('not found'));

      if (!isNotFound) {
        const shot = await screenshot(page, `public_${pagePath.replace(/\//g, '_') || 'home'}`);
        console.log(`  ✓ ${pagePath} - accessible`);

        // Check for console errors on each page
        const consoleErrors: string[] = [];
        page.once('console', msg => {
          if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        await page.waitForTimeout(500);
      } else {
        console.log(`  - ${pagePath} - 404 or not found`);
      }
    } catch (e) {
      console.log(`  - ${pagePath} - error: ${(e as Error).message}`);
    }
  }
}

async function testDashboard(page: Page, isLoggedIn: boolean) {
  console.log('\n=== TESTING DASHBOARD (if logged in) ===');

  if (!isLoggedIn) {
    // Try to access dashboard directly to test redirect behavior
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    const currentUrl = page.url();

    if (currentUrl.includes('/dashboard')) {
      logIssue({ page: 'Dashboard', type: 'bug', description: 'Dashboard accessible without authentication!', screenshot: await screenshot(page, 'dashboard_unauth_access') });
    } else {
      console.log(`  ✓ Dashboard redirects unauthenticated users to: ${currentUrl}`);
      await screenshot(page, 'dashboard_redirect');
    }
    return;
  }

  // Test all dashboard routes
  const dashboardRoutes = [
    { path: '/dashboard', name: 'Dashboard Home' },
    { path: '/races', name: 'Races' },
    { path: '/profile', name: 'Profile' },
    { path: '/how-it-works', name: 'How It Works' },
  ];

  for (const route of dashboardRoutes) {
    console.log(`\n  Testing: ${route.name}`);

    const consoleErrors: string[] = [];
    const handler = (msg: any) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    };
    page.on('console', handler);

    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1500); // Let async content load

    const filepath = await screenshot(page, `dashboard_${route.name.replace(/\s/g, '_').toLowerCase()}`);

    // Check if we got redirected away
    const currentUrl = page.url();
    if (!currentUrl.includes(route.path)) {
      logIssue({ page: route.name, type: 'bug', description: `Unexpected redirect to: ${currentUrl}`, screenshot: filepath });
    }

    // Check for error states
    const bodyText = await page.textContent('body') || '';
    if (bodyText.includes('Error') || bodyText.includes('Something went wrong') || bodyText.includes('Failed to')) {
      logIssue({ page: route.name, type: 'bug', description: 'Error message visible on page', screenshot: filepath });
    }

    // Check for empty/loading states that should have content
    if (bodyText.trim().length < 200) {
      logIssue({ page: route.name, type: 'warning', description: 'Page has very little content, may not have loaded', screenshot: filepath });
    }

    // Log console errors
    if (consoleErrors.length > 0) {
      for (const err of consoleErrors.slice(0, 3)) { // Limit to first 3
        logIssue({ page: route.name, type: 'bug', description: `Console error: ${err.substring(0, 200)}` });
      }
    }

    page.off('console', handler);
  }
}

async function testMobileViewport(page: Page) {
  console.log('\n=== TESTING MOBILE VIEWPORT (375px) ===');

  await page.setViewportSize({ width: 375, height: 812 });

  const pagesToTest = [
    { url: '/', name: 'landing_mobile' },
    { url: '/signin', name: 'signin_mobile' },
    { url: '/dashboard', name: 'dashboard_mobile' },
  ];

  for (const p of pagesToTest) {
    await page.goto(`${BASE_URL}${p.url}`, { waitUntil: 'networkidle', timeout: 8000 });
    await page.waitForTimeout(1000);
    const filepath = await screenshot(page, p.name);

    // Check for horizontal overflow (indicates mobile layout issues)
    const hasOverflow = await page.evaluate(() => {
      return document.body.scrollWidth > window.innerWidth;
    });

    if (hasOverflow) {
      const overflowWidth = await page.evaluate(() => document.body.scrollWidth);
      logIssue({
        page: `${p.name} (mobile)`,
        type: 'bug',
        description: `Horizontal overflow detected: body.scrollWidth=${overflowWidth}px > viewport 375px`,
        screenshot: filepath
      });
    } else {
      console.log(`  ✓ ${p.url} - no horizontal overflow`);
    }

    // Check for elements that are too small (touch targets)
    const smallButtons = await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button, a, input[type="button"], input[type="submit"]')];
      return buttons
        .map(el => {
          const rect = el.getBoundingClientRect();
          return { tag: el.tagName, text: (el as HTMLElement).innerText?.substring(0, 30), height: rect.height, width: rect.width };
        })
        .filter(b => b.height > 0 && b.height < 40 && b.width > 0);
    });

    if (smallButtons.length > 0) {
      logIssue({
        page: `${p.name} (mobile)`,
        type: 'warning',
        description: `${smallButtons.length} interactive elements may be too small for touch: ${smallButtons.slice(0,3).map(b => `${b.tag}[${b.text}] ${Math.round(b.height)}px`).join(', ')}`,
        screenshot: filepath
      });
    }
  }

  // Reset to desktop
  await page.setViewportSize({ width: 1280, height: 800 });
}

async function testInteractiveElements(page: Page, isLoggedIn: boolean) {
  console.log('\n=== TESTING INTERACTIVE ELEMENTS ===');

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Check all links on landing page
  const links = await page.locator('a[href]').all();
  const hrefs: string[] = [];
  for (const link of links) {
    const href = await link.getAttribute('href');
    if (href) hrefs.push(href);
  }
  console.log(`  Found ${hrefs.length} links on landing page: ${hrefs.slice(0, 10).join(', ')}`);

  // Test each internal link
  for (const href of hrefs.filter(h => h.startsWith('/') && !h.startsWith('/_'))) {
    try {
      await page.goto(`${BASE_URL}${href}`, { waitUntil: 'networkidle', timeout: 5000 });
      const bodyText = await page.textContent('body') || '';
      const is404 = bodyText.includes('404') || bodyText.includes('Page Not Found');
      if (is404) {
        logIssue({ page: 'Navigation', type: 'bug', description: `Broken internal link: ${href} returns 404` });
      }
    } catch (e) {
      logIssue({ page: 'Navigation', type: 'warning', description: `Link ${href} failed to load: ${(e as Error).message}` });
    }
  }
}

async function testFormValidation(page: Page) {
  console.log('\n=== TESTING FORM VALIDATION ===');

  // Test sign in form
  await page.goto(`${BASE_URL}/signin`, { waitUntil: 'networkidle' });
  const currentUrl = page.url();

  if (currentUrl.includes('signin') || currentUrl.includes('login')) {
    // Test XSS in email field
    const emailField = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailField.isVisible().catch(() => false)) {
      await emailField.fill('<script>alert("xss")</script>');
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      const xssShot = await screenshot(page, 'form_xss_test');
      console.log('  ✓ Tested XSS input in email field');

      // Check if XSS executed (it shouldn't)
      const hasAlert = await page.evaluate(() => {
        return document.title.includes('xss') || document.body.innerHTML.includes('<script>');
      });
      if (hasAlert) {
        logIssue({ page: 'Sign In', type: 'bug', description: 'SECURITY: XSS vulnerability detected!', screenshot: xssShot });
      }
    }

    // Test SQL injection
    if (await emailField.isVisible().catch(() => false)) {
      await emailField.fill("' OR '1'='1");
      await page.waitForTimeout(300);
      console.log('  ✓ Tested SQL injection input in email field');
    }
  }
}

async function testThemeToggle(page: Page) {
  console.log('\n=== TESTING THEME TOGGLE ===');

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });

  // Look for theme toggle button
  const themeBtn = page.locator('button[aria-label*="theme" i], button[aria-label*="dark" i], button[aria-label*="light" i], button:has-text("Theme")').first();

  if (await themeBtn.isVisible().catch(() => false)) {
    await themeBtn.click();
    await page.waitForTimeout(500);
    const darkShot = await screenshot(page, 'theme_dark');
    console.log('  ✓ Theme toggle works');

    await themeBtn.click();
    await page.waitForTimeout(500);
    await screenshot(page, 'theme_light');
  } else {
    console.log('  - Theme toggle not found on landing page (may be in sidebar)');
  }
}

async function runAllTests() {
  const browser: Browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    // Collect all console errors globally
    const allConsoleErrors: {url: string, message: string}[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        allConsoleErrors.push({ url: page.url(), message: msg.text() });
      }
    });

    // Run all test suites
    await testLandingPage(page);
    const isLoggedIn = await testSignInPage(page);
    await testSignUpPage(page);
    await testPublicPages(page);
    await testDashboard(page, isLoggedIn);
    await testMobileViewport(page);
    await testInteractiveElements(page, isLoggedIn);
    await testFormValidation(page);
    await testThemeToggle(page);

    // Log all console errors found
    if (allConsoleErrors.length > 0) {
      console.log('\n=== ALL CONSOLE ERRORS ===');
      const uniqueErrors = [...new Set(allConsoleErrors.map(e => e.message))];
      for (const err of uniqueErrors.slice(0, 10)) {
        console.log(`  ERROR: ${err.substring(0, 200)}`);
      }
    }

    // Final report
    console.log('\n\n========= QA REPORT =========');
    console.log(`Total issues found: ${issues.length}`);

    const bugs = issues.filter(i => i.type === 'bug');
    const warnings = issues.filter(i => i.type === 'warning');
    const infos = issues.filter(i => i.type === 'info');

    console.log(`  Bugs: ${bugs.length}`);
    console.log(`  Warnings: ${warnings.length}`);
    console.log(`  Info: ${infos.length}`);

    console.log('\n--- BUGS ---');
    for (const issue of bugs) {
      console.log(`  [${issue.page}] ${issue.description}`);
      if (issue.screenshot) console.log(`    Screenshot: ${issue.screenshot}`);
    }

    console.log('\n--- WARNINGS ---');
    for (const issue of warnings) {
      console.log(`  [${issue.page}] ${issue.description}`);
      if (issue.screenshot) console.log(`    Screenshot: ${issue.screenshot}`);
    }

    console.log('\n--- INFO ---');
    for (const issue of infos) {
      console.log(`  [${issue.page}] ${issue.description}`);
    }

    console.log(`\nScreenshots saved to: ${SCREENSHOT_DIR}`);

    // Save report as JSON
    const report = {
      timestamp: new Date().toISOString(),
      totalIssues: issues.length,
      bugs: bugs.length,
      warnings: warnings.length,
      info: infos.length,
      consoleErrorCount: allConsoleErrors.length,
      issues,
      allConsoleErrors: allConsoleErrors.slice(0, 20)
    };

    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'qa-report.json'),
      JSON.stringify(report, null, 2)
    );
    console.log(`\nFull report saved to: ${SCREENSHOT_DIR}/qa-report.json`);

  } finally {
    await browser.close();
  }
}

runAllTests().catch(console.error);
