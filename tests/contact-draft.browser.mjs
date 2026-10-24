import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const baseURL = process.env.UI_TEST_BASE_URL || 'http://127.0.0.1:3100';
const output = process.env.UI_TEST_OUTPUT || path.join(process.env.TEMP || '/tmp', 'architecting-ai-ui-verification');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.UI_TEST_BROWSER || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
const draft = { fullName:'Sample Visitor', email:'visitor@example.com', phone:'5550100123', enquiryType:'Course Enquiry', message:'Please share more details about the available course samples.', consent:true };
async function verify(page, values) {
  for (const [selector, value] of Object.entries({ '#enquiry-name':values.fullName, '#enquiry-email':values.email, '#enquiry-phone':values.phone, '#enquiry-type':values.enquiryType, '#enquiry-message':values.message })) {
    assert.equal(await page.locator(selector).inputValue(), value, selector);
  }
  assert.equal(await page.locator('input[name="consent"]').isChecked(), values.consent);
}
try {
  for (const mobile of [false, true]) {
    const label = mobile ? 'mobile' : 'desktop';
    const context = await browser.newContext(mobile ? { viewport:{width:390,height:844},isMobile:true,hasTouch:true } : { viewport:{width:1440,height:1000} });
    const page = await context.newPage();
    const errors = [];
    const posts = [];
    page.on('pageerror', error => errors.push(error.message));
    // This test never submits an enquiry or reaches the contact backend.
    await context.route('**/api/contact', async route => { posts.push(route.request().method()); await route.abort(); });
    await page.goto(`${baseURL}/contact`);
    await page.waitForLoadState('networkidle');
    await page.locator('#enquiry-name').fill(draft.fullName);
    await page.locator('#enquiry-email').fill(draft.email);
    await page.locator('#enquiry-phone').fill(draft.phone);
    await page.locator('#enquiry-type').selectOption(draft.enquiryType);
    await page.locator('#enquiry-message').fill(draft.message);
    await page.locator('input[name="consent"]').check();
    const policyLink = page.getByRole('link', {name:/^Read the Privacy Policy/});
    assert.equal(await policyLink.getAttribute('target'), '_blank');
    const popupPromise = page.waitForEvent('popup');
    await policyLink.click();
    const policyTab = await popupPromise;
    await policyTab.waitForURL(`${baseURL}/privacy?from=contact`);
    assert.equal(await policyTab.locator('.editorial-copy a[href="/contact"]').getAttribute('href'), '/contact');
    const closed = policyTab.waitForEvent('close');
    await policyTab.locator('.editorial-copy a[href="/contact"]').click();
    await closed;
    await verify(page, draft);
    console.log(`PASS ${label}: policy opens separately; original form and explicit consent remain intact`);
    // Also preserve the same-tab return-link flow for visitors who choose it.
    await policyLink.evaluate(link => link.removeAttribute('target'));
    await policyLink.click();
    await page.waitForURL(`${baseURL}/privacy?from=contact`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByRole('link', {name:'\u2190 Back to Contact Us',exact:true}).click();
    await page.waitForURL(`${baseURL}/contact`);
    await verify(page, draft);
    console.log(`PASS ${label}: all fields and consent survive policy scrolling and return link`);
    const edited = {...draft, message:'Updated message after reading the privacy policy.', consent:false};
    await page.locator('#enquiry-message').fill(edited.message);
    await page.locator('input[name="consent"]').uncheck();
    await page.getByRole('link', {name:/^Read the Privacy Policy/}).evaluate(link => link.removeAttribute('target'));
    await page.getByRole('link', {name:/^Read the Privacy Policy/}).click();
    await page.waitForURL(`${baseURL}/privacy?from=contact`);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.goBack();
    await page.waitForURL(`${baseURL}/contact`);
    await verify(page, edited);
    await page.locator('#enquiry-message').scrollIntoViewIfNeeded();
    await page.screenshot({path:path.join(output,`contact-draft-restored-${label}.png`)});
    console.log(`PASS ${label}: latest edits and unchecked consent survive browser Back`);
    const freshTab = await context.newPage();
    await freshTab.goto(`${baseURL}/contact`);
    await freshTab.waitForLoadState('networkidle');
    assert.equal(await freshTab.locator('#enquiry-name').inputValue(), '');
    assert.equal(await freshTab.locator('#enquiry-message').inputValue(), '');
    await freshTab.close();
    await page.reload();
    await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('#enquiry-name').inputValue(), '');
    assert.equal(await page.locator('#enquiry-message').inputValue(), '');
    assert.deepEqual(posts, []);
    assert.deepEqual(errors, []);
    console.log(`PASS ${label}: no cross-tab draft, no storage persistence, no backend requests or runtime errors`);
    await context.close();
  }
} finally { await browser.close(); }
