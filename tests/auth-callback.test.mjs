import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function callback({enabled=true,error=null,user={id:'fake-user'}}={}){
 const calls=[];
 const result=()=>({data:{user},error});
 const client={auth:{
 exchangeCodeForSession:async code=>{calls.push(['code',code]);return result();},
 verifyOtp:async args=>{calls.push(['otp',args]);return result();}
 }};

 class NextResponse extends Response{static redirect(url){return new Response(null,{status:307,headers:{location:String(url)}})}}
 const exports={};const context={exports,URL,require:name=>{if(name==='next/server')return {NextResponse};if(name.endsWith('/activation'))return {accountCollectionEnabled:()=>enabled};if(name.endsWith('/server'))return {createClient:async()=>client};if(name.endsWith('/profile'))return {upsertUserProfile:async()=>null};throw Error('Unexpected dependency');}};
 vm.runInNewContext(ts.transpile(readFileSync(new URL('../src/app/(auth)/auth/confirm/route.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.CommonJS}),context);return {run:query=>exports.GET({url:'https://example.test/auth/confirm'+query,nextUrl:new URL('https://example.test/auth/confirm'+query)}),calls};
}
test('disabled callback never exchanges a token',async()=>{const c=callback({enabled:false});assert.equal((await c.run('?code=secret')).status,503);assert.equal(c.calls.length,0);});
test('PKCE confirmation redirects to fixed internal dashboard, ignoring untrusted destination',async()=>{const c=callback();const r=await c.run('?code=example-code&destination=https://hostile.test');assert.equal(r.headers.get('location'),'https://example.test/dashboard');assert.deepEqual(c.calls[0],['code','example-code']);});
test('recovery code and recovery OTP route to reset page',async()=>{for(const query of ['?code=example-code&destination=reset-password','?token_hash=example-token&type=recovery']){const c=callback();const r=await c.run(query);assert.equal(r.headers.get('location'),'https://example.test/reset-password');assert.equal(c.calls.length,1);}});
test('malformed or expired links do not expose provider details',async()=>{const invalid=callback();assert.equal((await invalid.run('?token_hash=example&type=unsupported')).status,400);assert.equal(invalid.calls.length,0);const expired=callback({error:new Error('private provider detail')});const r=await expired.run('?code=expired');assert.equal(r.status,400);assert(!(await r.text()).includes('private provider detail'));});
