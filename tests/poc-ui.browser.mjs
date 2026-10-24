import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH||'playwright');
const base=process.env.UI_TEST_BASE_URL||'http://127.0.0.1:3100';
const browser=await chromium.launch({executablePath:process.env.UI_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
function luminance(rgb){return rgb.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
try {
  for(const mobile of [false,true]){
    const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1440,height:1000}});
    // Only browsing: prohibit submissions and avoid media downloads.
    await context.route('**/*',route=>!['GET','HEAD'].includes(route.request().method())||/\.(mp4|webm)(\?|$)/.test(route.request().url())?route.abort():route.continue());
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/courses');await page.waitForLoadState('networkidle');
    const colours=await page.locator('.academy-course-card').evaluateAll(cards=>cards.map(card=>({heading:getComputedStyle(card.querySelector('h3')).color,background:getComputedStyle(card).backgroundColor})));
    for(const colour of colours){const a=luminance(colour.heading.match(/\d+/g).map(Number)),b=luminance(colour.background.match(/\d+/g).map(Number));assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5,'Course heading contrast');}
    await page.goto(base+'/courses/ai-architect');
    assert.equal(await page.locator('.course-syllabus ol > li').count(),16,'Preserve all 16 AI Architect entries');
    const lessons=await page.locator('.course-syllabus a[href]').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
    assert.equal(lessons.length,4);
    for(const href of lessons){const response=await page.goto(base+href);assert.equal(response.status(),200);assert.ok(await page.locator('h1').count());}
    await page.goto(base+'/courses/ai-for-kids');
    const samples=await page.locator('.course-syllabus a[href$=".html"]').evaluateAll(links=>links.map(link=>link.getAttribute('href')));
    assert.equal(samples.length,3);
    for(const href of samples){
      await page.goto(base+href);await page.getByRole('button',{name:'Final quiz',exact:true}).click();
      const cards=page.locator('#quizBox > .card');const count=await cards.count();assert.ok(count>0);
      for(let i=0;i<count;i++)await cards.nth(i).locator('button.opt').first().click();
      await page.getByText(/^You scored /).waitFor();
      await page.reload();await page.getByRole('button',{name:'Final quiz',exact:true}).click();
      await page.getByText(/^Your best score so far:/).waitFor();
    }
    assert.equal((await page.goto(base+'/admin')).status(),404);
    assert.equal((await page.goto(base+'/dev/current-work')).status(),404);
    await page.goto(base+'/dashboard');assert.equal(new URL(page.url()).pathname,'/login');
    assert.equal((await context.request.get(base+'/api/learner-dashboard')).status(),401);
    for(const width of [320,390,768,900,901,1440]){
      await page.setViewportSize({width,height:900});await page.goto(base+'/courses');
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Catalogue overflow at ${width}`);
    }
    assert.deepEqual(errors,[]);
    console.log(`PASS ${mobile?'mobile':'desktop'}: card contrast, 16 Architect entries, 4 professional/3 student lessons, quiz results retained locally, admin/dev 404, unauthorized routes, six responsive widths`);
    await context.close();
  }
} finally {await browser.close();}
