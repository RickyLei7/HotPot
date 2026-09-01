import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import https from 'node:https';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { runAcceptance } from './online.spec.mjs';

const baseUrl='https://127.0.0.1:8787';
const persistenceDirectory=await mkdtemp(join(tmpdir(),'hotpot-seat-e2e-'));
const artifactDirectory=await mkdtemp(join(tmpdir(),'hotpot-seat-e2e-artifacts-'));
let server;
let browser;
const output=[];

const run=(command,args)=>new Promise((resolve,reject)=>{
  const child=spawn(command,args,{stdio:'inherit'});
  child.once('error',reject);
  child.once('exit',code=>code===0?resolve():reject(new Error(`${command} exited with ${code}`)));
});

const probe=()=>new Promise(resolve=>{
  const request=https.get(baseUrl,{rejectUnauthorized:false,timeout:1_000},response=>{
    response.resume();resolve(true);
  });
  request.on('error',()=>resolve(false));
  request.on('timeout',()=>{request.destroy();resolve(false)});
});

async function waitForServer(){
  const deadline=Date.now()+30_000;
  while(Date.now()<deadline){
    if(server.exitCode!=null)throw new Error(`Wrangler exited early:\n${output.slice(-30).join('')}`);
    if(await probe())return;
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  throw new Error(`Wrangler did not become ready:\n${output.slice(-30).join('')}`);
}

async function stopServer(){
  if(!server||server.exitCode!=null)return;
  server.kill('SIGTERM');
  await Promise.race([once(server,'exit'),new Promise(resolve=>setTimeout(resolve,5_000))]);
  if(server.exitCode==null)server.kill('SIGKILL');
}

try{
  await run(process.execPath,['scripts/build-client.mjs']);
  await run(process.execPath,['scripts/create-local-secrets.mjs']);
  server=spawn('npx',['wrangler','dev','--config','wrangler.jsonc','--persist-to',persistenceDirectory],{
    stdio:['ignore','pipe','pipe']
  });
  server.stdout.on('data',chunk=>output.push(chunk.toString()));
  server.stderr.on('data',chunk=>output.push(chunk.toString()));
  await waitForServer();
  browser=await chromium.launch({headless:true});
  const result=await runAcceptance({browser,baseUrl,artifactDirectory});
  console.log(`E2E passed: ${result.profiles.join(', ')}`);
  console.log(`Screenshots: ${result.artifactDirectory}`);
}catch(error){
  console.error(error.stack||error);
  console.error(`Screenshots and partial evidence: ${artifactDirectory}`);
  process.exitCode=1;
}finally{
  await browser?.close().catch(()=>{});
  await stopServer();
  await rm(persistenceDirectory,{recursive:true,force:true});
}
