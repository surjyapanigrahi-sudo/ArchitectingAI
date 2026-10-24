// Real local Next routes and Supabase client; in-memory Auth/PostgREST stand-in.
// No hosted users, email, database, or production credentials are used.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { createHmac, randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { once } from 'node:events';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const origin = 'http://127.0.0.1:3102';
const signingKey = 'isolated-auth-fixture-signing-key';
const users = new Map();
const profiles = new Map();
const refreshTokens = new Map();
const calls = {refresh:0,recover:0,signup:0,logout:0,profile:0,update:0};
const authRequests = [];
let rejectLogout = false;
const demo = {id:randomUUID(),aud:'authenticated',role:'authenticated',email:'adult@example.test',password:'DemoPassword123!',user_metadata:{full_name:'Adult Demonstrator'},created_at:new Date().toISOString(),email_confirmed_at:new Date().toISOString()};
users.set(demo.email,demo);
function token(user, expired = false) {
  const encode = data => Buffer.from(JSON.stringify(data)).toString('base64url');
  const data = `${encode({alg:'HS256',typ:'JWT'})}.${encode({sub:user.id,aud:'authenticated',role:'authenticated',email:user.email,iat:Math.floor(Date.now()/1000)-60,exp:Math.floor(Date.now()/1000)+(expired?-60:3600)})}`;
  return `${data}.${createHmac('sha256',signingKey).update(data).digest('base64url')}`;
}
function session(user) {
  const refresh_token = randomUUID(); refreshTokens.set(refresh_token,user);
  const publicUser = {...user}; delete publicUser.password;
  return {access_token:token(user),refresh_token,token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,user:publicUser};
}
const provider = createServer(async (request,response) => {
  response.setHeader('Access-Control-Allow-Origin',origin);
  response.setHeader('Access-Control-Allow-Headers','authorization,apikey,content-type,x-client-info,x-supabase-api-version,prefer');
  response.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');
  response.setHeader('Content-Type','application/json');
  if(request.method==='OPTIONS'){response.end('{}');return;}
  const url = new URL(request.url,'http://local.test');
  let text=''; for await(const chunk of request) text+=chunk;
  const body=text?JSON.parse(text):{};
  const reply=(data,status=200)=>{response.statusCode=status;response.end(JSON.stringify(data));};
  let user;
  try {const payload=JSON.parse(Buffer.from((request.headers.authorization||'').split(' ')[1].split('.')[1],'base64url').toString());user=[...users.values()].find(item=>item.id===payload.sub);} catch {}
  if(url.pathname.startsWith('/auth/'))authRequests.push({method:request.method,path:url.pathname,grant:url.searchParams.get('grant_type'),validatedFixtureUser:Boolean(user)});
  if(url.pathname==='/auth/v1/token') {
    const grant=url.searchParams.get('grant_type');
    if(grant==='password'){
      const account=users.get(body.email);
      if(!account||account.password!==body.password)return reply({code:'invalid_credentials',message:'Invalid login credentials'},400);
      return reply(session(account));
    }
    if(grant==='refresh_token'){calls.refresh++;const account=refreshTokens.get(body.refresh_token);return account?reply(session(account)):reply({message:'Invalid refresh token'},400);}
    if(grant==='pkce'&&body.auth_code==='local-recovery')return reply(session(demo));
    return reply({message:'Invalid code'},400);
  }
  if(url.pathname==='/auth/v1/signup'){
    calls.signup++;
    if(users.has(body.email))return reply({code:'user_already_exists',message:'User already registered'},422);
    const account={...demo,id:randomUUID(),email:body.email,password:body.password,user_metadata:body.data||{}};
    users.set(account.email,account);return reply(session(account));
  }
  if(url.pathname==='/auth/v1/recover'){calls.recover++;return reply({});}
  if(url.pathname==='/auth/v1/logout'){calls.logout++;return rejectLogout?reply({message:'Isolated signout failure'},500):reply({});}
  if(url.pathname==='/auth/v1/user'){
    if(!user)return reply({code:'bad_jwt',message:'Invalid session'},401);
    if(request.method==='PUT'){calls.update++;user.password=body.password;}
    const publicUser={...user};delete publicUser.password;return reply(publicUser);
  }
  if(url.pathname.startsWith('/rest/v1/')){
    if(!user)return reply({message:'Authentication required'},401);
    const table=url.pathname.split('/').at(-1);
    if(table==='profiles'){
      if(request.method==='POST'){
        if(body.id!==user.id)return reply({message:'Forbidden profile owner'},403);
        calls.profile++;profiles.set(user.id,body);return reply(body);
      }
      assert.equal(url.searchParams.get('id'),`eq.${user.id}`);
      return reply(profiles.get(user.id)||{full_name:user.user_metadata.full_name});
    }
    assert.equal(request.method,'GET','No assessment or progress writes permitted by this fixture');
    assert.equal(url.searchParams.get('user_id'),`eq.${user.id}`,'Reads must filter the validated session owner');
    return reply(table==='learner_course_progress'?null:[]);
  }
  reply({message:'Unsupported fixture endpoint'},404);
});
await new Promise(resolve=>provider.listen(0,'127.0.0.1',resolve));
const providerURL=`http://127.0.0.1:${provider.address().port}`;
const app=spawn(process.execPath,['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3102'],{
  windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'development',
    AUTH_ENABLED:' True ',AUTH_REGISTRATION_ENABLED:' tRuE ',ASSESSMENT_ENABLED:'false',NEXT_PUBLIC_DEV_AUTH_BYPASS:'false',
    NEXT_PUBLIC_SUPABASE_URL:providerURL,NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_isolated_fixture_only',
    NEXT_PUBLIC_SITE_URL:origin,SUPABASE_SECRET_KEY:'isolated-not-a-real-secret',CONTACT_ENABLED:'false',CONTACT_NOTIFICATION_ENABLED:'false'},
});
let logs='';app.stdout.on('data',chunk=>logs+=chunk);app.stderr.on('data',chunk=>logs+=chunk);
let browser;
try {
  let ready=false;
  for(let i=0;i<120;i++){
    if(app.exitCode!==null)throw Error(logs);
    try{if((await fetch(origin+'/login')).ok){ready=true;break;}}catch{}
    await new Promise(resolve=>setTimeout(resolve,500));
  }
  assert.equal(ready,true,logs);
  browser=await chromium.launch({executablePath:process.env.UI_TEST_BROWSER||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  for(const mobile of process.argv.includes('--recovery-only')?[]:[false,true]){
    const label=mobile?'mobile':'desktop';
    const context=await browser.newContext(mobile?{viewport:{width:390,height:844},isMobile:true,hasTouch:true}:{viewport:{width:1440,height:1000}});
    await context.route('**/*',route=>[origin,providerURL].includes(new URL(route.request().url()).origin)?route.continue():route.abort());
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(origin+'/dashboard');await page.waitForURL(origin+'/login');await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('#loginEmail').count(),1);
    await page.locator('#loginEmail').fill(demo.email);await page.locator('#loginPassword').fill('IncorrectPassword123!');
    await page.getByRole('button',{name:'Sign In',exact:true}).click();
    await page.getByText('Sign in unsuccessful.',{exact:true}).waitFor();
    await page.locator('#loginPassword').fill(demo.password);await page.getByRole('button',{name:'Sign In',exact:true}).click();
    await page.waitForURL(origin+'/dashboard');await page.waitForLoadState('networkidle');
    assert.ok((await page.locator('body').innerText()).includes('Adult Demonstrator'));
    const protectedAPI=await context.request.get(origin+'/api/learner-dashboard');assert.equal(protectedAPI.status(),200);
    const cookie=(await context.cookies()).find(c=>c.name.endsWith('-auth-token'));
    assert.ok(cookie,'Supabase session cookie exists');
    const stored=JSON.parse(Buffer.from(cookie.value.slice('base64-'.length),'base64url').toString());
    stored.access_token=token(demo,true);stored.expires_at=Math.floor(Date.now()/1000)-60;
    const refreshBefore=calls.refresh;
    await context.addCookies([{...cookie,value:'base64-'+Buffer.from(JSON.stringify(stored)).toString('base64url')}]);
    await page.goto(origin+'/dashboard');await page.waitForLoadState('networkidle');
    assert.ok(calls.refresh>refreshBefore,'Expired access token refreshed through protected route');
    await page.goto(origin+'/dashboard?activity=assessment');await page.waitForURL('**/part-1-assessment');
    await page.getByRole('heading',{name:'Assessment demonstration',exact:true}).waitFor();
    await page.goto(origin+'/dashboard');await page.waitForLoadState('networkidle');
    const signout=page.getByRole('button',{name:'Sign out',exact:true});
    if(!await signout.isVisible()){
      await page.locator('.learner-profile-menu > summary').click();
    }
    rejectLogout=true;await signout.click();
    await page.getByText('Sign out failed. Please try again.',{exact:true}).waitFor();
    rejectLogout=false;await signout.click();await page.waitForURL(origin+'/');
    await page.goto(origin+'/dashboard');await page.waitForURL(origin+'/login');
    await page.goto(origin+'/register');await page.waitForLoadState('networkidle');
    const signupBefore=calls.signup;
    await page.getByRole('button',{name:'Create Free Account',exact:true}).click();
    await page.locator('#fullName-error').waitFor();assert.equal(calls.signup,signupBefore);
    await page.locator('#fullName').fill('Adult Demo Account');await page.locator('#email').fill(demo.email);
    await page.locator('#password').fill('DemoPassword123!');await page.locator('#confirmPassword').fill('DemoPassword123!');await page.locator('#acceptedTerms').check();
    await page.getByRole('button',{name:'Create Free Account',exact:true}).click();
    await page.getByText('An account with this email already exists.',{exact:true}).waitFor();
    await page.locator('#email').fill(`new-${label}@example.test`);
    await page.getByRole('button',{name:'Create Free Account',exact:true}).click();await page.waitForURL(origin+'/dashboard');
    await page.waitForLoadState('networkidle');assert.ok(calls.profile>0);
    assert.equal((await context.request.get(origin+'/api/learner-dashboard')).status(),200);
    console.log(`PASS ${label}: login/invalid credentials, protected dashboard/API, session refresh, logout, registration validation/duplicate/success, profile creation, owner-filtered reads, certificate assessment gate`);
    assert.deepEqual(errors,[]);await context.close();
  }
  const context=await browser.newContext();await context.route('**/*',route=>[origin,providerURL].includes(new URL(route.request().url()).origin)?route.continue():route.abort());
  const page=await context.newPage();const recoveryErrors=[];page.on('pageerror',error=>recoveryErrors.push(error.message));
  const recoveryRequests=[];page.on('request',request=>{if(new URL(request.url()).pathname==='/reset-password')recoveryRequests.push({path:'/reset-password',hasAuthCookie:(request.headers().cookie||'').includes('-auth-token=')});});
  await page.goto(origin+'/reset-password');await page.waitForLoadState('networkidle');
  assert.equal(await page.getByRole('button',{name:'Update password',exact:true}).isDisabled(),true);
  await page.goto(origin+'/forgot-password');await page.waitForLoadState('networkidle');
  await page.locator('#recovery-value').fill(demo.email);await page.getByRole('button',{name:'Send recovery link',exact:true}).click();
  await page.getByRole('status').waitFor();assert.equal(calls.recover,1);
  const callbackResponse=await page.goto(origin+'/auth/confirm?code=local-recovery');
  assert.equal(new URL(page.url()).pathname,'/reset-password',`Recovery callback HTTP ${callbackResponse.status()}: ${(await page.locator('body').innerText()).slice(0,300)}`);
  await page.waitForLoadState('networkidle');
  assert.equal(new URL(page.url()).origin,origin,'Callback must use the configured public origin, not an internal proxy host');
  const recoveryAPIStatus=(await context.request.get(origin+'/api/learner-dashboard')).status();
  await page.waitForFunction(()=>document.querySelector('button.auth-submit:not([disabled])')||document.querySelector('.auth-form-wrap [role="alert"]'),{},{timeout:10000}).catch(()=>{});
  const recoveryCookie=(await context.cookies()).find(cookie=>cookie.name.endsWith('-auth-token'));
  let cookieShape={};try{const stored=JSON.parse(Buffer.from(recoveryCookie.value.slice(7),'base64url').toString());const payload=JSON.parse(Buffer.from(stored.access_token.split('.')[1],'base64url').toString());cookieShape={keys:Object.keys(stored),knownUser:payload.sub===demo.id,expired:payload.exp<Date.now()/1000};}catch{}
  assert.equal(await page.getByRole('button',{name:'Update password',exact:true}).isEnabled(),true,
    `Recovery session unavailable: ${JSON.stringify({recoveryAPIStatus,cookieShape,recoveryRequests,cookies:(await context.cookies()).map(cookie=>({name:cookie.name,path:cookie.path,domain:cookie.domain,secure:cookie.secure})),alerts:await page.locator('[role="alert"]').allTextContents(),requests:authRequests.slice(-8),errors:recoveryErrors})}`);
  await page.locator('#recovery-value').fill('UpdatedDemoPassword123!');await page.locator('#recovery-confirm').fill('UpdatedDemoPassword123!');
  await page.getByRole('button',{name:'Update password',exact:true}).click();
  await page.getByText('Your password has been updated. You can return to your dashboard.',{exact:true}).waitFor();assert.equal(calls.update,1);
  await context.close();console.log('PASS local recovery request, PKCE callback and password update using isolated provider; no email sent');
  console.log('NOT VERIFIED: hosted Supabase credentials, real email, deployed RLS, database persistence or certificate integrity.');
} finally {
  await browser?.close();app.kill();if(app.exitCode===null)await once(app,'exit');await new Promise(resolve=>provider.close(resolve));
}
