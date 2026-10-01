import test from 'node:test';
import assert from 'node:assert/strict';
import {call,discover} from '../sdk/tapenow-webmcp.mjs';
test('argument format is probed only with the read-only context; mutations run once',async()=>{
 for(const format of ['object','json']){
  let writes=0,probes=0;
  const context={getTools:async()=>[{name:'tapenow_context'},{name:'tapenow_execute_action'}],executeTool:async(tool,args)=>{
   if(tool.name==='tapenow_context'){probes++;if(format==='json'&&typeof args!=='string')throw new DOMException('Failed to parse input arguments','UnknownError');return JSON.stringify({status:'verified'});}
   writes++;assert.equal(typeof args,format==='json'?'string':'object');return JSON.stringify({status:'verified'});
  }};
  await call('tapenow_execute_action',{operationId:'test'},context);assert.equal(writes,1);assert.equal(probes,format==='json'?2:1);
  context.executeTool=async()=>{writes++;throw Error('ambiguous result');};await assert.rejects(()=>call('tapenow_execute_action',{},context));assert.equal(writes,2);
 }
});
test('unavailable native API and stale tool lists fail instead of installing a fake context',async()=>{
 await assert.rejects(()=>discover({}),/unavailable/);await assert.rejects(()=>call('tapenow_create_project',{}, {getTools:async()=>[],executeTool:async()=>{throw Error('must not run');}}),/rediscover/);
});
test('same-prefix tools from another origin are never chosen',async()=>{
 const old=globalThis.location;globalThis.location={origin:'https://app.example'};
 try{const tools=await discover({getTools:async()=>[{name:'tapenow_context',origin:'https://untrusted.example'},{name:'tapenow_context',origin:'https://app.example'}],executeTool:async()=>{}});assert.equal(tools.length,1);assert.equal(tools[0].origin,'https://app.example');}finally{if(old===undefined)delete globalThis.location;else globalThis.location=old;}
});
