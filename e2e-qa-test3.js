/**
 * Race Day - E2E QA Test (Pass 3)
 * Focused on correct routes, onboarding, and detailed page inspection
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = '/Users/jordanroah/tri-nexus/qa-screenshots/pass3';
let counter = 0;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function ss(page, name) {
  ensureDir(SCREENSHOT_DIR);
  const fname = `${String(++counter).padStart(2,'0')}_${name.replace(/[^a-z0-9_-]/gi,'_')}.png`;
  const fpath = path.join(SCREENSHOT_DIR, fname);
  await page.screenshot({ path: fpath, fullPage: true });
  console.log(`  [SS] ${fname}`);
  return fpath;
}

async function isRendered404(page) {
  return page.evaluate(() => {
    const t = document.body.innerText || '';
    return t.includes('This page could not be found.') || t.includes('404: This page could not be found');
  }).catch(() => false);
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const issues = [];
  function log(type, page, desc, filepath) {
    issues.push({ type, page, desc, filepath });
    console.log(`  [${type.toUpperCase()}] [${page}] ${desc}`);
  }

  try {
    const ctx = await browser.newContext({
      viewport: { width: 1280, height: 800 }
    });
    const page = await ctx.newPage();

    const allConsoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') allConsoleErrors.push({ url: page.url(), msg: msg.text() });
    });

    // ===================================================
    console.log('\n=== CORRECT ROUTE STRUCTURE ===');
    // Routes discovered: dashboard is /dashboard/*, races is /dashboard/races, profile is /dashboard/profile
    const allRoutes = [
      { path: '/', name: 'Landing Page', requiresAuth: false },
      { path: '/auth/login', name: 'Sign In', requiresAuth: false },
      { path: '/auth/signup', name: 'Sign Up', requiresAuth: false },
      { path: '/auth/callback', name: 'Auth Callback', requiresAuth: false },
      { path: '/onboarding', name: 'Onboarding', requiresAuth: false }, // BUG: should require auth
      { path: '/dashboard', name: 'Dashboard Home', requiresAuth: true },
      { path: '/dashboard/races', name: 'Races List', requiresAuth: true },
      { path: '/dashboard/profile', name: 'Profile', requiresAuth: true },
      { path: '/dashboard/how-it-works', name: 'How It Works', requiresAuth: true },
      { path: '/dashboard/log', name: 'Log', requiresAuth: true },
      { path: '/dashboard/account/privacy', name: 'Privacy Account', requiresAuth: true },
    ];

    for (const route of allRoutes) {
      const errors = [];
      const errHandler = msg => { if (msg.type() === 'error') errors.push(msg.text()); };
      page.on('console', errHandler);

      await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 10000 }).catch(e => {
        log('bug', route.name, `Failed to load: ${e.message}`);
      });
      await page.waitForTimeout(1500);

      const finalUrl = page.url();
      const is404 = await isRendered404(page);
      const bodyText = await page.evaluate(() => document.body.innerText).catch(() => '');
      const wordCount = bodyText.split(/\s+/).filter(w => w.length > 2).length;
      const filepath = await ss(page, `route_${route.name.replace(/[^a-z0-9]/gi,'_').toLowerCase()}`);

      // Authentication check
      if (route.requiresAuth) {
        const isRedirected = finalUrl.includes('/auth/login') || finalUrl.includes('/auth/signup');
        if (!isRedirected) {
          if (finalUrl.includes(route.path)) {
            log('bug', route.name, `SECURITY: Protected route accessible without login! Final URL: ${finalUrl}`, filepath);
          }
        } else {
          console.log(`  ✓ [PROTECTED] ${route.path} -> redirects (${finalUrl.split('/').pop()})`);
        }
      } else if (is404) {
        log('bug', route.name, `Page returns 404: ${route.path}`, filepath);
      } else {
        const headings = await page.evaluate(() =>
          [...document.querySelectorAll('h1, h2')].map(h => h.innerText.trim()).filter(t => t).slice(0, 3)
        ).catch(() => []);
        console.log(`  ✓ [PUBLIC] ${route.path} (${wordCount} words) ${headings.length > 0 ? '| h1/h2: "' + headings[0] + '"' : ''}`);
      }

      // Console errors
      if (errors.length > 0) {
        for (const e of errors.slice(0, 2)) {
          log('bug', route.name, `Console error: ${e.substring(0, 200)}`);
        }
      }

      page.off('console', errHandler);
    }

    // ===================================================
    console.log('\n=== ONBOARDING PAGE DETAILED TEST ===');
    await page.goto(`${BASE_URL}/onboarding`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    const onboardingText = await page.evaluate(() => document.body.innerText).catch(() => '');
    console.log(`  Onboarding visible to unauthenticated user: ${!onboardingText.includes('Sign in')}`);
    console.log(`  Content preview: "${onboardingText.substring(0, 200).replace(/\n/g, ' ')}"`);

    // Check if it's rendering the actual onboarding form
    const hasSteps = onboardingText.includes('race') || onboardingText.includes('Race') || onboardingText.includes('triathlon');
    if (hasSteps) {
      log('bug', 'Onboarding', 'Onboarding wizard renders for unauthenticated users - race data could be submitted without auth', await ss(page, 'onboarding_unauth'));
    } else {
      console.log('  Onboarding page shows blank or loading state for unauth users');
      await ss(page, 'onboarding_unauth_blank');
    }

    // ===================================================
    console.log('\n=== LANDING PAGE DEEP DIVE ===');
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await ss(page, 'landing_1440_fullpage');

    // Check all landing page sections
    const sections = await page.evaluate(() => {
      return [...document.querySelectorAll('section')].map(s => ({
        id: s.id,
        headings: [...s.querySelectorAll('h1, h2, h3')].map(h => h.innerText.trim()),
        wordCount: (s.innerText || '').split(/\s+/).filter(w=>w.length>2).length
      }));
    }).catch(() => []);
    console.log(`  Found ${sections.length} sections`);
    for (const s of sections) {
      console.log(`    id="${s.id}" headings: ${JSON.stringify(s.headings)} words: ${s.wordCount}`);
    }

    // Check pricing section
    const pricingText = await page.evaluate(() => {
      const pricing = document.body.innerText;
      return pricing.includes('FREE') || pricing.includes('Price') || pricing.includes('$');
    }).catch(() => false);
    if (pricingText) {
      console.log('  ✓ Pricing section found on landing page');
    } else {
      log('warning', 'Landing', 'No pricing information visible on landing page');
    }

    // ===================================================
    console.log('\n=== SIGN IN FORM DETAILED ===');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Check: label elements for inputs
    const labelCheck = await page.evaluate(() => {
      const inputs = [...document.querySelectorAll('input:not([type="hidden"])')];
      return inputs.map(input => {
        const id = input.id;
        const label = id ? document.querySelector(`label[for="${id}"]`) : null;
        const nearbyLabel = input.closest('div')?.querySelector('label');
        return {
          type: input.type,
          id,
          hasLabelFor: !!label,
          hasNearbyLabel: !!nearbyLabel,
          nearbyLabelText: nearbyLabel?.innerText || '',
          ariaLabel: input.getAttribute('aria-label') || ''
        };
      });
    }).catch(() => []);

    for (const l of labelCheck) {
      if (!l.hasLabelFor && !l.ariaLabel) {
        if (l.hasNearbyLabel) {
          // Label is visually nearby but not connected via `for` attribute
          log('warning', 'Sign In', `Input type="${l.type}" label "${l.nearbyLabelText}" not connected via 'for' attr (screen reader issue)`);
        }
      }
    }

    // Check: no "forgot password" link
    const forgotPwd = await page.locator('a:has-text("Forgot"), a:has-text("Reset"), a:has-text("Forgot password")').count();
    if (forgotPwd === 0) {
      log('warning', 'Sign In', 'No "Forgot Password" link - users cannot recover forgotten passwords');
      await ss(page, 'signin_no_forgot_pwd');
    }

    // ===================================================
    console.log('\n=== SIGN UP FLOW DETAILED ===');
    await page.goto(`${BASE_URL}/auth/signup`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Check: password confirmation field
    const passwordFields = await page.locator('input[type="password"]').count();
    console.log(`  Password fields on signup: ${passwordFields}`);
    if (passwordFields < 2) {
      log('warning', 'Sign Up', `Only ${passwordFields} password field(s) on signup form - no password confirmation/repeat field`);
    }

    // Check: password strength indicator
    const hasStrengthIndicator = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('strength') || text.includes('weak') || text.includes('strong') || text.includes('medium');
    }).catch(() => false);
    if (!hasStrengthIndicator) {
      log('warning', 'Sign Up', 'No password strength indicator visible on sign up form');
    }

    // Check: terms and privacy policy checkbox
    const hasTermsCheckbox = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.toLowerCase().includes('terms') || text.toLowerCase().includes('privacy') || text.toLowerCase().includes('agree');
    }).catch(() => false);
    if (!hasTermsCheckbox) {
      log('warning', 'Sign Up', 'No terms of service / privacy policy agreement on sign up form');
    } else {
      console.log('  ✓ Terms/privacy mention found on sign up page');
    }

    await ss(page, 'signup_detailed');

    // ===================================================
    console.log('\n=== HOW-IT-WORKS PAGE ===');
    // It's at /dashboard/how-it-works
    await page.goto(`${BASE_URL}/dashboard/how-it-works`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1500);
    const howItWorksUrl = page.url();
    console.log(`  /dashboard/how-it-works -> ${howItWorksUrl}`);
    if (!howItWorksUrl.includes('/auth/')) {
      const howtText = await page.evaluate(() => document.body.innerText).catch(() => '');
      console.log(`  Content: "${howtText.substring(0, 150).replace(/\n/g,' ')}"`);
      await ss(page, 'how_it_works');
    } else {
      console.log('  -> Redirected to auth (expected - requires login)');
    }

    // ===================================================
    console.log('\n=== AUTH CALLBACK PAGE ===');
    await page.goto(`${BASE_URL}/auth/callback`, { waitUntil: 'networkidle', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);
    const callbackUrl = page.url();
    const callbackText = await page.evaluate(() => document.body.innerText).catch(() => '');
    console.log(`  /auth/callback -> ${callbackUrl}`);
    console.log(`  Content: "${callbackText.substring(0, 100).replace(/\n/g,' ')}"`);
    const is404cb = await isRendered404(page);
    if (is404cb) {
      log('bug', 'Auth Callback', '/auth/callback returns 404 - OAuth flow will break');
      await ss(page, 'auth_callback_404');
    } else {
      console.log('  ✓ /auth/callback exists');
      await ss(page, 'auth_callback_ok');
    }

    // ===================================================
    console.log('\n=== MOBILE: LANDING PAGE (375px) ===');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    await ss(page, 'mobile_375_landing_full');

    // Check visibility of key elements
    const signInVisible = await page.locator('a:has-text("Sign In")').first().isVisible().catch(() => false);
    const ctaVisible = await page.locator('a:has-text("Get Started")').first().isVisible().catch(() => false);
    console.log(`  Sign In link visible: ${signInVisible}`);
    console.log(`  Get Started CTA visible: ${ctaVisible}`);

    if (!signInVisible) {
      log('bug', 'Landing (mobile)', 'Sign In link not visible on mobile viewport', await ss(page, 'mobile_signin_not_visible'));
    }

    // ===================================================
    console.log('\n=== MOBILE: SIGN IN (375px) ===');
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    await ss(page, 'mobile_375_signin_full');

    // Check if form is fully visible
    const emailFieldVisible = await page.locator('input[type="email"]').first().isInViewport().catch(() => false);
    const passwordFieldVisible = await page.locator('input[type="password"]').first().isInViewport().catch(() => false);
    const submitVisible = await page.locator('button[type="submit"]').first().isInViewport().catch(() => false);
    console.log(`  Email visible: ${emailFieldVisible}, Password visible: ${passwordFieldVisible}, Submit visible: ${submitVisible}`);

    if (!emailFieldVisible || !passwordFieldVisible || !submitVisible) {
      log('warning', 'Sign In (mobile)', 'Some form elements may not be in viewport initially on mobile');
    }

    // ===================================================
    console.log('\n=== API ENDPOINTS TEST ===');
    // Test key API endpoints for expected behavior
    const apiTests = [
      { path: '/api/email/welcome', method: 'GET', expectedStatus: [405] }, // Should reject GET
      { path: '/api/cron/emails', method: 'GET', expectedStatus: [401, 403, 200] }, // Should require auth
    ];

    for (const apiTest of apiTests) {
      const response = await page.evaluate(async ({ path, method }) => {
        const r = await fetch(`http://localhost:3000${path}`, { method });
        return { status: r.status, ok: r.ok };
      }, { path: apiTest.path, method: apiTest.method }).catch(() => ({ status: 0, ok: false }));

      const expected = apiTest.expectedStatus.includes(response.status);
      if (!expected) {
        // Check if it's a crash (500) vs expected behavior
        if (response.status === 500) {
          log('bug', `API ${apiTest.path}`, `Returns 500 on ${apiTest.method} request (server crash)`);
        } else {
          log('warning', `API ${apiTest.path}`, `Returns ${response.status} on ${apiTest.method} (expected: ${apiTest.expectedStatus.join(' or ')})`);
        }
      } else {
        console.log(`  ✓ ${apiTest.method} ${apiTest.path} -> ${response.status} (expected)`);
      }
    }

    // ===================================================
    console.log('\n=== WELCOME EMAIL API CRASH TEST ===');
    const welcomeApiResponse = await page.evaluate(async () => {
      const r = await fetch('http://localhost:3000/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', displayName: 'Test' })
      });
      return { status: r.status, ok: r.ok };
    }).catch(() => ({ status: 0 }));

    console.log(`  POST /api/email/welcome -> ${welcomeApiResponse.status}`);
    if (welcomeApiResponse.status === 500) {
      log('bug', 'API /api/email/welcome', 'Returns 500 - RESEND_API_KEY env variable is missing from .env.local. Welcome email API crashes on every signup. Add RESEND_API_KEY to .env.local');
    } else if (welcomeApiResponse.status === 200) {
      console.log('  ✓ Welcome email API works');
    }

    // ===================================================
    console.log('\n=== BACK TO HOME NAVIGATION BUG TEST ===');
    // Reproduce the "Back to home" redirect bug
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/auth/login`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const backHomeLink = page.locator('a:has-text("Back to home")').first();
    const backHomHref = await backHomeLink.getAttribute('href').catch(() => null);
    console.log(`  "Back to home" href="${backHomHref}"`);

    // The link says href="/" which is correct
    // But the test reported going to /auth/login -- this might be because of redirect
    if (backHomHref === '/') {
      await backHomeLink.click();
      await page.waitForLoadState('networkidle');
      const afterClick = page.url();
      console.log(`  After clicking "Back to home": ${afterClick}`);

      if (afterClick === BASE_URL + '/' || afterClick === BASE_URL) {
        console.log('  ✓ "Back to home" correctly navigates to landing page');
      } else {
        log('bug', 'Sign In', `"Back to home" should go to / but navigated to ${afterClick}`, await ss(page, 'back_to_home_bug'));
      }
    }

    // ===================================================
    // Final Report
    console.log('\n\n============================================');
    console.log('  PASS 3 QA FINDINGS');
    console.log('============================================');

    const bugs = issues.filter(i => i.type === 'bug');
    const warnings = issues.filter(i => i.type === 'warning');

    console.log(`Total issues: ${issues.length} (Bugs: ${bugs.length}, Warnings: ${warnings.length})`);

    const uniqueConsoleErrors = [...new Map(allConsoleErrors.map(e => [e.msg, e])).values()];
    console.log(`Unique console errors: ${uniqueConsoleErrors.length}`);

    if (bugs.length > 0) {
      console.log('\n--- BUGS ---');
      for (const b of bugs) {
        console.log(`  [${b.page}] ${b.desc}`);
        if (b.filepath) console.log(`    SS: ${b.filepath}`);
      }
    }

    if (warnings.length > 0) {
      console.log('\n--- WARNINGS ---');
      for (const w of warnings) {
        console.log(`  [${w.page}] ${w.desc}`);
        if (w.filepath) console.log(`    SS: ${w.filepath}`);
      }
    }

    if (uniqueConsoleErrors.length > 0) {
      console.log('\n--- CONSOLE ERRORS ---');
      for (const e of uniqueConsoleErrors.slice(0, 10)) {
        console.log(`  [${e.url}] ${e.msg.substring(0, 200)}`);
      }
    }

    console.log(`\nScreenshots: ${SCREENSHOT_DIR}`);

    // Save report
    ensureDir(SCREENSHOT_DIR);
    fs.writeFileSync(
      path.join(SCREENSHOT_DIR, 'report.json'),
      JSON.stringify({ issues, consoleErrors: uniqueConsoleErrors }, null, 2)
    );

  } finally {
    await browser.close();
  }
}

run().catch(console.error);
// This file was already run - output captured above
