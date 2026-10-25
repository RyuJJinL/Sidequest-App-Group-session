import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courtPose} from '../src/actions.mjs';
const TAU=Math.PI*2;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
test('tennis sleeve anchors track the actual clavicles through the unit turn',()=>{
 for(let t=0;t<1;t+=.005){
  const r=courtPose('tennis',t*TAU),attachments=r.shoulderRig;
  assert.ok(attachments);
  assert.deepEqual(attachments.left,r.arms[0].shoulder);
  assert.deepEqual(attachments.right,r.arms[1].shoulder);
  for(const arm of r.arms){
   const root=attachments.roots.find(a=>a.side===arm.side).root;
   assert.ok(distance(root,arm.shoulder)<8.5,'sleeve socket must stay close to its shoulder');
   assert.ok(Math.abs(root.x-r.neck.x)<Math.abs(arm.shoulder.x-r.neck.x),'sleeve root overlaps the shirt instead of leaving a gap');
  }
 }
});
test('preparation keeps the elbow down and hands together before releasing the guide hand',()=>{
 for(let t=.12;t<=.33;t+=.005){
  const r=courtPose('tennis',t*TAU),arm=r.arms[1];
  assert.ok(arm.world.elbow.y-arm.world.shoulder.y>=32,'preparation upper arm stays relaxed below the shoulder');
  if(t<=.23)assert.ok(distance(r.arms[0].wrist,r.arms[1].wrist)<35,'guide hand follows the racket through the first part of preparation');
 }
});
test('the loaded racket arm is behind the chest and rotates forward into contact',()=>{
 const load=courtPose('tennis',.23*TAU),hit=courtPose('tennis',.42*TAU);
 const depth=(a)=>(a.world.shoulder.z+a.world.elbow.z)/2;
 assert.ok(depth(load.arms[1])<0 && depth(load.arms[0])>0);
 assert.ok(depth(hit.arms[1])>0);
 assert.ok(load.torso.chestYaw<-.7);
});
