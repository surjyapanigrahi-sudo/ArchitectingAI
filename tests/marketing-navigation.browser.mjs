import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Run against `npm run build` + `npm start -- --port 3100`.
// Playwright can live outside this repo: set PLAYWRIGHT_MODULE_PATH to its directory.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const baseURL = process.env.UI_TEST_BASE_URL || 'http://127.0.0.1:3100';
const output = process.env.UI_TEST_OUTPUT || path.join(process.env.TEMP || '/tmp', 'architecting-ai-ui-verification');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.UI_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const results = [];
const errors = [];
const routes = ['/', '/courses', '/about', '/contact', '/privacy', '/terms', '/login'];
const courseRoutes = ['/courses/ai-for-kids', '/courses/ai-architect', '/courses/ai-agents-automation', '/courses/cybersecurity-essentials'];
const otherPublicRoutes = ['/learning-paths', '/workshops', '/workshops/enterprise-ai-foundations', '/workshops/enterprise-ai-foundations/part-1-assessment', '/verify-certificate', '/experience/mission-zero', '/register', '/forgot-password', '/reset-password'];
function record(check) { results.push(check); console.log(`PASS ${check}`); }
async function load(page, route) {
  const response = await page.goto(`${baseURL}${route}`);
  assert.equal(response.status(), 200, `${route} HTTP status`);
  // Wait for hydration, so the first button click cannot race event attachment.
  await page.waitForLoadState('networkidle');
}
async function headerMetrics(page) {
  return page.locator('header:has(nav[aria-label="Primary navigation"])').evaluate(header => {
    const box = el => { const r = el.getBoundingClientRect(); return { x:r.x, y:r.y, width:r.width, height:r.height }; };
    const nav = header.querySelector('nav');
    const logo = header.querySelector('img');
    const home = nav.querySelector('a');
    return { header:box(header), logo:box(logo), home:box(home), font:getComputedStyle(home).fontSize, gap:getComputedStyle(nav).gap, signIn:box(header.querySelector('a:last-child')) };
  });
}
try {
  for (const mobile of [false, true]) {
    const label = mobile ? 'mobile' : 'desktop';
    const context = await browser.newContext(mobile ? { viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1 } : { viewport:{width:1440,height:1000} });
    const page = await context.newPage();
    page.on('pageerror', error => errors.push(`${label}: ${error.message}`));
    let reference;
    const metrics = {};
    for (const route of routes) {
      await load(page, route);
      const nav = page.locator('nav[aria-label="Primary navigation"]');
      assert.equal(await nav.count(), 1, `${route} must have one public header`);
      const current = await headerMetrics(page);
      metrics[route] = current;
      assert.ok(current.logo.y >= current.header.y && current.logo.y + current.logo.height <= current.header.y + current.header.height, `${label} logo fits header`);
      if (!reference) reference = current;
      assert.deepEqual(current, reference, `${label} header geometry differs on ${route}`);
      assert.equal(await page.locator('#marketing-courses').isVisible(), false);
      if (mobile) await page.getByRole('button', { name:'Menu',exact:true }).tap();
      const courses = page.getByRole('button', { name:'Courses', exact:true });
      assert.equal(await courses.getAttribute('aria-expanded'), 'false');
      assert.equal(await courses.locator('svg').count(), 0);
      assert.equal(await page.locator('#marketing-courses').isVisible(), false);
      if (mobile) await courses.tap(); else await courses.click();
      assert.equal(await page.locator('#marketing-courses').isVisible(), true);
      assert.equal(await page.locator('#marketing-courses > *').count(), 4);
      await page.screenshot({ path:path.join(output, `${label}-${route.slice(1) || 'home'}-header.png`) });
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('#marketing-courses').isVisible(), false);
      record(`${label} ${route}: consistent header, hidden by default, activation, Escape`);
    }
    await writeFile(path.join(output, `${label}-header-metrics.json`), JSON.stringify(metrics, null, 2));
    await load(page, '/');
    const courses = page.getByRole('button', { name:'Courses', exact:true });
    const panel = page.locator('#marketing-courses');
    if (mobile) await page.getByRole('button', { name:'Menu',exact:true }).tap();
    if (!mobile) {
      await courses.hover();
      assert.equal(await panel.isVisible(), false, 'hover must not open');
      await courses.focus();
      assert.equal(await panel.isVisible(), false, 'focus must not open');
    }
    await courses.focus();
    await page.keyboard.press('Enter');
    assert.equal(await panel.isVisible(), true);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), courseRoutes[0]);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.getAttribute('href')), courseRoutes[1]);
    await page.keyboard.press('Tab');
    assert.equal(await panel.isVisible(), false, 'tab out closes disclosure');
    await courses.focus();
    await page.keyboard.press('Space');
    assert.equal(await panel.isVisible(), true);
    await page.keyboard.press('Escape');
    assert.equal(await panel.isVisible(), false);
    assert.equal(await courses.evaluate(el => el === document.activeElement), true, 'Escape returns focus');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    assert.equal(await panel.isVisible(), false, 'second activation toggles closed');
    record(`${label}: Enter/Space, Tab order, focus exit, Escape focus return, toggle`);
    if (!mobile) {
      await courses.click();
      await page.locator('#marketing-courses a').first().hover();
      assert.equal(await panel.isVisible(), true, 'pointer reaches dropdown without closing');
      await page.mouse.move(1400, 500);
      assert.equal(await panel.isVisible(), false, 'mouse leave closes');
      record('desktop: mouse leave closes; dropdown remains reachable');
    }
    if (mobile) await courses.tap(); else await courses.click();
    if (mobile) await page.touchscreen.tap(380, 820); else await page.locator('h1').first().click();
    assert.equal(await panel.isVisible(), false, 'outside pointer closes');
    if (mobile) assert.equal(await page.getByRole('navigation', {name:'Primary navigation'}).isVisible(), false);
    record(`${label}: outside ${mobile ? 'tap' : 'click'} closes`);
    for (const route of courseRoutes.slice(0,2)) {
      if (mobile) await page.getByRole('button', {name:'Menu',exact:true}).tap();
      if (mobile) await courses.tap(); else await courses.click();
      await page.locator(`#marketing-courses a[href="${route}"]`).click();
      await page.waitForURL(`${baseURL}${route}`);
      assert.equal(await panel.isVisible(), false, 'course selection closes');
      if (mobile) assert.equal(await page.getByRole('navigation', {name:'Primary navigation'}).isVisible(), false);
      record(`${label}: select ${route}, navigation and close`);
    }
    for (const route of courseRoutes) {
      await load(page, route);
      assert.equal(await page.locator('h1').count(), 1);
      assert.deepEqual(await headerMetrics(page), reference);
      record(`${label}: course destination ${route} returns 200 and shared header`);
    }
    await load(page, '/privacy');
    const back = page.getByRole('link', {name:'\u2190 Back to Contact Us',exact:true});
    assert.equal(await back.isVisible(), true);
    assert.equal(await back.getAttribute('href'), '/contact');
    await back.click();
    await page.waitForURL(`${baseURL}/contact`);
    assert.equal(await page.locator('h1').textContent(), 'Contact Architecting AI');
    record(`${label}: Privacy return link navigates to Contact`);
    if (!mobile) {
      for (const route of otherPublicRoutes) {
        await load(page, route);
        assert.equal(await page.getByRole('navigation', {name:'Primary navigation'}).count(), 1);
        assert.deepEqual(await headerMetrics(page), reference);
        record(`public route ${route}: shared header`);
      }
    }
    await context.close();
  }
  assert.deepEqual(errors, [], 'browser runtime errors');
  record('no browser runtime errors');
} finally {
  await writeFile(path.join(output, 'results.json'), JSON.stringify({baseURL,results,errors},null,2));
  await browser.close();
  console.log(`Artifacts: ${output}`);
}
