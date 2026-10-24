// Isolated integration test: real Next Contact API, loopback RPC stub, no database.
// Run with PLAYWRIGHT_MODULE_PATH set if Playwright is outside this repository.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { once } from 'node:events';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const origin = 'http://127.0.0.1:3101';
const records = [];
let failStorage = false;
const storage = createServer(async (request, response) => {
  assert.equal(request.url, '/rest/v1/rpc/submit_contact_enquiry');
  assert.equal(request.method, 'POST');
  let body = '';
  for await (const chunk of request) body += chunk;
  const args = JSON.parse(body);
  assert.equal(args.p_enquiry.email, 'visitor@example.test');
  assert.equal(args.p_enquiry.consent_version, 'contact-2026-10-review-1');
  assert.match(args.p_ip_hash, /^[a-f0-9]{64}$/);
  response.setHeader('Content-Type', 'application/json');
  if (failStorage) {
    response.writeHead(500);
    response.end(JSON.stringify({ message: 'Isolated storage failure' }));
  } else {
    records.push(args);
    response.end(JSON.stringify('saved'));
  }
});
await new Promise(resolve => storage.listen(0, '127.0.0.1', resolve));
const storageURL = `http://127.0.0.1:${storage.address().port}`;
const app = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3101'], {
  cwd: process.cwd(), windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, NODE_ENV: 'development', NETLIFY: 'false', CONTACT_ENABLED: 'true',
    CONTACT_ALLOWED_ORIGINS: origin, CONTACT_HASH_SECRET: 'isolated-local-test-secret-at-least-32-characters',
    CONTACT_NOTIFICATIONS_ENABLED: 'false', NEXT_PUBLIC_SUPABASE_URL: storageURL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'local-test-anon-key', SUPABASE_SECRET_KEY: 'local-test-secret-key' },
});
let logs = '';
app.stdout.on('data', chunk => { logs += chunk; });
app.stderr.on('data', chunk => { logs += chunk; });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (app.exitCode !== null) throw new Error(`Local preview exited: ${logs}`);
    try { if ((await fetch(`${origin}/contact`)).ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.equal(ready, true, logs);
  browser = await chromium.launch({ executablePath: process.env.UI_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  for (const mobile of [false, true]) {
    const label = mobile ? 'mobile' : 'desktop';
    const context = await browser.newContext(mobile ? { viewport:{width:390,height:844},isMobile:true,hasTouch:true } : { viewport:{width:1440,height:1000} });
    await context.route('**/*', route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`${origin}/contact`);
    await page.waitForLoadState('networkidle');
    const button = page.getByRole('button', {name:'Submit Enquiry',exact:true});
    assert.equal(await button.isDisabled(), true);
    await page.locator('#enquiry-name').fill('Local Test Visitor');
    await page.locator('#enquiry-email').fill('visitor@example.test');
    await page.locator('#enquiry-phone').fill('5550100123');
    await page.locator('#enquiry-type').selectOption('Course Enquiry');
    await page.locator('#enquiry-message').fill('Please share details for this isolated local test.');
    const policy = page.getByRole('link', {name:/^Read the Privacy Policy/});
    const popupPromise = page.waitForEvent('popup');
    await policy.click();
    const policyTab = await popupPromise;
    await policyTab.waitForURL(`${origin}/privacy?from=contact`);
    const closed = policyTab.waitForEvent('close');
    await policyTab.locator('.editorial-copy a[href="/contact"]').click();
    await closed;
    assert.equal(await page.locator('#enquiry-name').inputValue(), 'Local Test Visitor');
    assert.equal(await page.locator('[name="consent"]').isChecked(), false);
    assert.equal(await button.isDisabled(), true, 'policy reading must not imply consent');
    await page.locator('[name="consent"]').check();
    await button.waitFor({state:'visible'});
    assert.equal(await button.isEnabled(), true);
    // Same-tab fallback: return link must preserve the draft as well.
    await policy.evaluate(link => link.removeAttribute('target'));
    await policy.click();
    await page.waitForURL(`${origin}/privacy?from=contact`);
    await page.locator('.editorial-copy a[href="/contact"]').click();
    await page.waitForURL(`${origin}/contact`);
    assert.equal(await page.locator('#enquiry-message').inputValue(), 'Please share details for this isolated local test.');
    assert.equal(await page.locator('[name="consent"]').isChecked(), true);
    await page.locator('#enquiry-email').fill('invalid');
    assert.equal(await button.isDisabled(), true);
    await page.locator('#enquiry-email').fill('visitor@example.test');
    await page.locator('#enquiry-message').fill('short');
    assert.equal(await button.isDisabled(), true);
    await page.locator('#enquiry-message').fill('Please share details for this isolated local test.');
    await page.locator('[name="consent"]').uncheck();
    assert.equal(await button.isDisabled(), true);
    await page.locator('[name="consent"]').check();
    failStorage = true;
    const failed = page.waitForResponse(response => response.url() === `${origin}/api/contact` && response.request().method() === 'POST');
    await button.click();
    assert.equal((await failed).status(), 503);
    await page.locator('.enquiry-panel [role="alert"]').waitFor();
    assert.equal(await page.locator('#enquiry-name').inputValue(), 'Local Test Visitor');
    failStorage = false;
    const before = records.length;
    const saved = page.waitForResponse(response => response.url() === `${origin}/api/contact` && response.request().method() === 'POST');
    await button.click();
    const response = await saved;
    assert.equal(response.status(), 200);
    assert.deepEqual(await response.json(), {ok:true});
    await page.getByRole('status').filter({hasText:'Your enquiry has been saved.'}).waitFor();
    assert.equal(records.length, before + 1);
    assert.equal(await page.locator('#enquiry-name').inputValue(), '');
    assert.equal(await page.locator('[name="consent"]').isChecked(), false);
    assert.equal(await button.isDisabled(), true);
    await page.goto(`${origin}/privacy`);
    await page.locator('.editorial-copy a[href="/contact"]').click();
    assert.equal(await page.locator('#enquiry-name').inputValue(), '', 'successful submission clears shared draft');
    assert.deepEqual(errors, []);
    console.log(`PASS ${label}: new-tab and same-tab privacy flows, explicit consent, validation gating, real API 503/retry/200, isolated RPC, draft cleared`);
    await context.close();
  }
  const count = records.length;
  const invalid = {full_name:'Local Test Visitor',email:'visitor@example.test',phone:'',enquiry_type:'Course Enquiry',message:'Valid local message.',website:'',consent:false};
  const rejected = await fetch(`${origin}/api/contact`, {method:'POST',headers:{Origin:origin,'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify(invalid)});
  assert.equal(rejected.status, 400);
  const hostile = await fetch(`${origin}/api/contact`, {method:'POST',headers:{Origin:'https://hostile.test','Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({...invalid,consent:true})});
  assert.equal(hostile.status, 403);
  assert.equal(records.length, count);
  console.log('PASS real API rejects missing consent and unapproved origin without persistence');
  console.log('Storage is a loopback-only in-memory RPC stub. No Supabase database or email delivery was exercised.');
} finally {
  await browser?.close();
  app.kill();
  if (app.exitCode === null) await once(app, 'exit');
  await new Promise(resolve => storage.close(resolve));
}
