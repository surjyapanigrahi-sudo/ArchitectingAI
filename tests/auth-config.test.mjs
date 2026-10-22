import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import {readFileSync} from 'node:fs';
function config(env){const exports={};vm.runInNewContext(ts.transpile(readFileSync(new URL('../src/lib/supabase/config.ts',import.meta.url),'utf8'),{module:ts.ModuleKind.CommonJS}),{exports,URL,process:{env}});return exports;}
test('production redirects require canonical HTTPS origin',()=>{for(const value of [undefined,'http://example.test','https://example.test/path','https://user:password@example.test','https://example.test/?destination=bad','ftp://example.test'])assert.throws(()=>config({NODE_ENV:'production',NEXT_PUBLIC_SITE_URL:value}).getPublicSiteUrl());assert.equal(config({NODE_ENV:'production',NEXT_PUBLIC_SITE_URL:'https://example.test/'}).getPublicSiteUrl(),'https://example.test');});
test('development has localhost fallback without exposing provider errors',()=>{const c=config({NODE_ENV:'development'});assert.equal(c.getPublicSiteUrl(),'http://localhost:3000');assert.equal(c.getSafeAuthError(new Error('private provider details'),'Safe error'),'Safe error');});
