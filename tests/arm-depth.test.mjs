import {test} from 'node:test';
import assert from 'node:assert/strict';
import {frontSpan,drawFrontPart} from '../src/arm-depth.mjs';
import {courtPose} from '../src/actions.mjs';
import {SPORTS} from '../src/sports.mjs';
test('an arm crossing the torso reveals a continuous portion instead of switching the whole limb',()=>{
 assert.deepEqual(frontSpan(-1,1),[.5,1]);
 const before=frontSpan(-1.01,1),after=frontSpan(-.99,1);
 assert.ok(before && after,'both sides of the old midpoint threshold must still draw a visible part');
 assert.ok(Math.abs(before[0]-after[0])<.01);
 assert.deepEqual(frontSpan(1,-1),[0,.5]);
 assert.equal(frontSpan(-2,-1),null);
 assert.deepEqual(frontSpan(1,2),[0,1]);
});
test('partially occluded geometry is drawn with a clipping boundary and restores canvas state',()=>{
 let draws=0,clips=0,stack=0;
 const ctx={save:()=>stack++,restore:()=>stack--,beginPath(){},moveTo(){},lineTo(){},closePath(){},clip:()=>clips++};
 drawFrontPart(ctx,{z:-1},{z:1},{x:0,y:0},{x:30,y:40},()=>draws++);
 assert.equal(draws,1);assert.equal(clips,1);assert.equal(stack,0);
 drawFrontPart(ctx,{z:-1},{z:-2},{x:0,y:0},{x:30,y:40},()=>draws++);
 assert.equal(draws,1);
});
test('the tennis free arm never folds behind a shoulder that is facing the viewer',()=>{
 for(let t=0;t<1;t+=.001){const a=courtPose('tennis',t*2*Math.PI).arms[0].world;if(a.shoulder.z>=0)assert.ok(a.elbow.z>=0);assert.ok(a.wrist.z>0,'free palm stays in front of the chest');}
});
test('badminton keeps its racket frame continuous through the overhead reach',()=>{
 let previous;
 for(let t=0;t<=1;t+=.001){
  const r=courtPose('badminton',t*2*Math.PI),v=r.arms[1].wristUp,f=r.arms[1].forearm;
  assert.ok(Math.abs(v.x*f.x+v.y*f.y+v.z*f.z)<1e-8);
  assert.ok(Math.abs(Math.hypot(v.x,v.y,v.z)-1)<1e-8);
  if(previous)assert.ok(Math.hypot(r.equipment.worldHead.x-previous.x,r.equipment.worldHead.y-previous.y,r.equipment.worldHead.z-previous.z)<4);
  previous=r.equipment.worldHead;
 }
});

test('badminton does not skip a large portion of its swing between display frames',()=>{
 const frame=1/(60*SPORTS.badminton.period);
 for(let t=0;t<1;t+=.001){
  const a=courtPose('badminton',t*2*Math.PI).equipment.worldHead,b=courtPose('badminton',(t+frame)*2*Math.PI).equipment.worldHead;
  assert.ok(Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)<16,'normal playback must retain a smooth, readable racket arc');
 }
});
