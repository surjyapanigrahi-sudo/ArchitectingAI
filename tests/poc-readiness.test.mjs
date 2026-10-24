import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { parseBoolean } from '../src/config/boolean.ts';
import { getEnquiryFieldErrors, validateEnquiry } from '../src/modules/contact/validation.ts';
import { getContactClientIp } from '../src/modules/contact/client-ip.ts';
import { handleContact } from '../src/modules/contact/service.ts';

function moduleAt(file, env, dependencies) {
  const exports = {};
  vm.runInNewContext(ts.transpile(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), {module:ts.ModuleKind.CommonJS}), {
    exports, process:{env}, require:name => {
      if (name === 'server-only') return {};
      if (name.endsWith('/boolean')) return {parseBoolean};
      if (dependencies[name]) return dependencies[name];
      throw Error(`Unexpected dependency ${name}`);
    },
  });
  return exports;
}

test('feature parsing accepts explicit trimmed true only, including production-style True', () => {
  for (const value of ['true','True','TRUE',' tRuE\n']) assert.equal(parseBoolean(value), true);
  for (const value of [undefined,'','false','False','1','yes','true,false']) assert.equal(parseBoolean(value), false);
});
test('registration and certificate-producing assessment remain separately gated', () => {
  const gates = env => moduleAt('src/modules/auth/activation.ts', env, {});
  const enabled = gates({AUTH_ENABLED:' True ',AUTH_REGISTRATION_ENABLED:'TRUE'});
  assert.equal(enabled.accountCollectionEnabled(), true);
  assert.equal(enabled.registrationEnabled(), true);
  assert.equal(enabled.assessmentEnabled(), false);
  const loginOnly = gates({AUTH_ENABLED:'true'});
  assert.equal(loginOnly.registrationEnabled(), false);
  assert.equal(gates({AUTH_REGISTRATION_ENABLED:'true',ASSESSMENT_ENABLED:'true'}).registrationEnabled(), false);
  assert.equal(gates({AUTH_REGISTRATION_ENABLED:'true',ASSESSMENT_ENABLED:'true'}).assessmentEnabled(), false);
});
test('production development-auth bypass remains disabled even when its public flag is true', () => {
  const auth = moduleAt('src/modules/auth/development-auth.ts', {NODE_ENV:'production',NEXT_PUBLIC_DEV_AUTH_BYPASS:'true'}, {});
  assert.equal(auth.getDevelopmentAuthContext().bypassEnabled, false);
});
test('server user recognition requires enabled auth and a provider-validated user', async () => {
  let calls = 0;
  const run = (enabled, result) => moduleAt('src/modules/auth/current-user.ts', {}, {
    'next/server':{connection:async()=>{}}, './activation':{accountCollectionEnabled:()=>enabled},
    './development-auth':{getDevelopmentAuthContext:()=>({bypassEnabled:false})},
    '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>{calls++;return result;}}})},
  }).getCurrentUser();
  assert.equal(await run(false, null), null); assert.equal(calls, 0);
  const user = {id:'adult-demo-user'};
  assert.equal(await run(true, {data:{user},error:null}), user);
  assert.equal(await run(true, {data:{user},error:new Error('expired')}), null);
});
test('proxy refreshes cookies for enabled auth and skips provider calls when disabled', async () => {
  let calls = 0; const written = [];
  const response = () => ({cookies:{set:(...args)=>written.push(args)},headers:new Headers()});
  const dependencies = {
    'next/server':{NextResponse:{next:response}},
    '@supabase/ssr':{createServerClient:(_url,_key,options)=>({auth:{getUser:async()=>{calls++;options.cookies.setAll([{name:'session',value:'refreshed',options:{httpOnly:true}}]);}}})},
  };
  const request = {cookies:{getAll:()=>[],set:()=>{}}};
  await moduleAt('src/proxy.ts',{AUTH_ENABLED:'false'},dependencies).proxy(request);
  assert.equal(calls,0);
  const result = await moduleAt('src/proxy.ts',{AUTH_ENABLED:' True ',NEXT_PUBLIC_SUPABASE_URL:'http://local.test',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fake'},dependencies).proxy(request);
  assert.equal(calls,1); assert.equal(written[0][1],'refreshed');
  assert.equal(result.headers.get('Cache-Control'),'private, no-store');
});
test('production client IP comes from trusted context and fails closed without it', () => {
  assert.equal(getContactClientIp(true,()=>({ip:'192.0.2.5'})), '192.0.2.5');
  assert.equal(getContactClientIp(true,()=>({ip:'2001:db8::1'})), '2001:db8::1');
  assert.equal(getContactClientIp(true,()=>({ip:'192.0.2.5, 1.2.3.4'})), null);
  assert.equal(getContactClientIp(true,()=>{throw Error('no platform context');}), null);
  assert.equal(getContactClientIp(false,()=>{throw Error('local');}), 'local-development');
});
const valid = {full_name:'Adult Demo',email:'adult@example.test',phone:'',enquiry_type:'Course Enquiry',message:'A synthetic local validation check.',website:'',consent:true};
test('shared validation rejects whitespace and single-label email with field-specific messages', () => {
  for (const [field,value] of [['full_name','  '],['email','a@b'],['message','          '],['consent',false]]) {
    const input = {...valid,[field]:value};
    assert.ok(getEnquiryFieldErrors(input)[field]); assert.equal(validateEnquiry(input), null);
  }
  assert.equal(validateEnquiry({...valid,email:' ADULT@EXAMPLE.TEST '}).email,'adult@example.test');
});
test('production Contact route accepts True via trusted context and rejects spoofed IP headers', async () => {
  let persisted = 0;
  const env = {NODE_ENV:'production',CONTACT_ENABLED:' True ',CONTACT_ALLOWED_ORIGINS:'https://example.test',CONTACT_HASH_SECRET:'a'.repeat(40)};
  const route = ip => moduleAt('src/app/api/contact/route.ts', env, {
    '@/modules/contact/service':{handleContact},
    '@/modules/contact/client-ip':{getContactClientIp:()=>getContactClientIp(true,()=>({ip}))},
    '@/lib/supabase/contact-server':{createContactClient:()=>({rpc:async()=>{persisted++;return {data:'saved',error:null};}})},
  });
  const request = () => new Request('https://example.test/api/contact',{method:'POST',headers:{Origin:'https://example.test','Content-Type':'application/json','Idempotency-Key':crypto.randomUUID(),'x-nf-client-connection-ip':'192.0.2.9','x-forwarded-for':'192.0.2.10'},body:JSON.stringify(valid)});
  assert.equal((await route(undefined).POST(request())).status,503); assert.equal(persisted,0);
  assert.equal((await route('192.0.2.11').POST(request())).status,200); assert.equal(persisted,1);
});
