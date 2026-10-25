import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courtPose} from '../src/actions.mjs';
const TAU=Math.PI*2,SPORTS=['pickleball','tennis','badminton'];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function averageHeadSpeed(sport,start,end){
 let sum=0,prior=courtPose(sport,start*TAU).equipment.worldHead;
 for(let t=start+.001;t<=end;t+=.001){const next=courtPose(sport,t*TAU).equipment.worldHead;sum+=distance(prior,next);prior=next;}
 return sum/(end-start);
}
test('strokes accelerate into contact and load the body before releasing the racket',()=>{
 for(const sport of SPORTS){
  const load=courtPose(sport,.20*TAU),lag=courtPose(sport,.33*TAU),hit=courtPose(sport,.42*TAU),finish=courtPose(sport,.62*TAU);
  assert.ok(lag.torso.hipYaw>load.torso.hipYaw && lag.torso.chestYaw<0);
  assert.ok(load.stroke.flex>hit.stroke.flex && finish.stroke.flex>hit.stroke.flex,'elbow extends into impact, then folds for follow-through');
  assert.ok(lag.stroke.cock>hit.stroke.cock,'racket releases its loaded wrist angle');
  assert.ok(averageHeadSpeed(sport,.34,.42)>averageHeadSpeed(sport,.10,.20)*1.4);
 }
});
test('hands, elbows and racket heads stay continuous through every stroke and loop seam',()=>{
 for(const sport of SPORTS){
  for(let t=0;t<1;t+=.001){
   const a=courtPose(sport,t*TAU),b=courtPose(sport,(t+.001)*TAU);
   for(let i=0;i<2;i++)for(const name of ['shoulder','elbow','wrist'])assert.ok(distance(a.arms[i].world[name],b.arms[i].world[name])<3,'joint must not flip between neighboring poses');
   assert.ok(distance(a.equipment.worldHead,b.equipment.worldHead)<6,'racket must not jump between neighboring poses');
   assert.ok(Math.abs(distance(a.arms[1].world.wrist,a.equipment.worldHead)-a.equipment.shaftLength)<1e-8,'physical racket length is independent of foreshortening');
  }
  const a=courtPose(sport,0),b=courtPose(sport,TAU);
  for(let i=0;i<2;i++)for(const name of ['shoulder','elbow','wrist'])assert.ok(distance(a.arms[i].world[name],b.arms[i].world[name])<1e-8);
  assert.ok(distance(a.equipment.worldHead,b.equipment.worldHead)<1e-8);
 }
});
test('tennis wraps to the opposite shoulder and badminton uses a compact preparation and downward finish',()=>{
 const tennis=courtPose('tennis',.62*TAU);
 assert.ok(tennis.equipment.grip.x<tennis.hip.x && tennis.equipment.grip.y<tennis.neck.y+20);
 const load=courtPose('badminton',.33*TAU),hit=courtPose('badminton',.42*TAU),finish=courtPose('badminton',.62*TAU);
 assert.ok(load.arms[0].wrist.y>load.neck.y+20 && load.arms[0].wrist.y<load.hip.y+5,'reference stroke keeps the free hand near the chest');
 assert.ok(load.equipment.depth<0,'racket drops behind the torso during loading');
 assert.ok(hit.equipment.grip.y<hit.neck.y-25);
 assert.ok(finish.equipment.grip.y>hit.equipment.grip.y+60 && finish.equipment.grip.x<finish.hip.x);
});
