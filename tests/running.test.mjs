import {test} from 'node:test';
import assert from 'node:assert/strict';
import {frontRunPose} from '../src/running.mjs';
import {pose} from '../src/sports.mjs';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
test('running uses a frontal rig rather than the old side-view angles',()=>{
 assert.equal(pose('running',0).front.front,true);
 assert.equal(pose('running',0).angles,undefined);
});
test('limbs stay in their own lanes and retain anatomical lengths in depth',()=>{
 for(let p=0;p<Math.PI*2;p+=.025){
  const rig=frontRunPose(p);
  for(const leg of rig.legs){
   const {hip,knee,ankle}=leg.world;
   assert.ok(Math.abs(distance(hip,knee)-62)<1e-9);
   assert.ok(Math.abs(distance(knee,ankle)-60)<1e-9);
   assert.ok(leg.side*knee.x>0 && leg.side*ankle.x>0);
   assert.ok(Math.abs(leg.ankle.x)<22,'foot must not swing sideways across the body');
  }
  for(const arm of rig.arms){
   assert.ok(Math.abs(distance(arm.world.shoulder,arm.world.elbow)-39)<1e-9);
   assert.ok(Math.abs(distance(arm.world.elbow,arm.world.wrist)-33)<1e-9);
   assert.ok(arm.side*arm.wrist.x>0);
   assert.ok(arm.wrist.y<arm.elbow.y,'elbows stay bent with fists above elbows');
  }
 }
});
test('left and right strides alternate, with the opposite arm coming forward',()=>{
 for(let p=0;p<Math.PI*2;p+=.05){
  const a=frontRunPose(p),b=frontRunPose(p+Math.PI);
  assert.ok(Math.abs(a.legs[0].thigh-b.legs[1].thigh)<1e-9);
  assert.ok(Math.abs(a.legs[0].flex-b.legs[1].flex)<1e-9);
 }
 const high=frontRunPose(.68*Math.PI*2);
 assert.ok(high.arms[0].depth<high.arms[1].depth,'same-side arm retreats as knee comes forward');
});
test('run has foot lift, stable support height and a seamless loop',()=>{
 let minimumLift=Infinity,maximumLift=0;
 for(let p=0;p<Math.PI*2;p+=.025){
  const r=frontRunPose(p),ys=r.legs.map(l=>l.ankle.y),lift=Math.abs(ys[0]-ys[1]);
  minimumLift=Math.min(minimumLift,lift);maximumLift=Math.max(maximumLift,lift);
  assert.ok(Math.abs(Math.max(...ys)-122)<=4.01,'support foot stays near ground level');
 }
 assert.ok(maximumLift>25 && minimumLift<2);
 const a=frontRunPose(0),b=frontRunPose(Math.PI*2);
 for(let i=0;i<2;i++)for(const joint of ['hip','knee','ankle'])for(const axis of ['x','y','z']) assert.ok(Math.abs(a.legs[i][joint][axis]-b.legs[i][joint][axis])<1e-9);
});
test('resting front pose keeps arms bent and both feet down',()=>{
 const r=frontRunPose(1,true);
 assert.ok(Math.abs(r.legs[0].ankle.y-r.legs[1].ankle.y)<1e-9);
 for(const arm of r.arms)assert.ok(arm.wrist.y<arm.elbow.y);
});
