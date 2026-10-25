import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPORTS,pose,drawCharacter} from '../src/sports.mjs';
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const TAU=Math.PI*2;
test('all sports retain limb lengths through a continuous frontal loop',()=>{
 for(const sport of Object.keys(SPORTS)){
  for(let phase=0;phase<TAU;phase+=.04)for(const resting of [true,false]){
   const r=pose(sport,phase,resting).front;
   for(const l of r.legs){assert.ok(Math.abs(distance(l.world.hip,l.world.knee)-62)<1e-8);assert.ok(Math.abs(distance(l.world.knee,l.world.ankle)-60)<1e-8);}
   for(const a of r.arms){assert.ok(Math.abs(distance(a.world.shoulder,a.world.elbow)-39)<1e-8);assert.ok(Math.abs(distance(a.world.elbow,a.world.wrist)-33)<1e-8);}
  }
  const a=pose(sport,0).front,b=pose(sport,TAU).front;
  for(let i=0;i<2;i++)for(const joint of ['hip','knee','ankle'])for(const axis of ['x','y','z'])assert.ok(Math.abs(a.legs[i][joint][axis]-b.legs[i][joint][axis])<1e-8);
 }
});
test('walking keeps ground contact with a lower foot lift and relaxed arms',()=>{
 let walkLift=0,runLift=0;
 for(let p=0;p<TAU;p+=.03){
  const w=pose('walking',p).front,r=pose('running',p).front;
  assert.ok(Math.abs(Math.max(...w.legs.map(l=>l.ankle.y))-122)<1e-8);
  walkLift=Math.max(walkLift,Math.abs(w.legs[0].ankle.y-w.legs[1].ankle.y));runLift=Math.max(runLift,Math.abs(r.legs[0].ankle.y-r.legs[1].ankle.y));
  for(const arm of w.arms){assert.ok(arm.wrist.y>arm.elbow.y);assert.equal(arm.handOpen,true);assert.ok(arm.side*arm.wrist.x>0);}
 }
 assert.ok(walkLift>5 && walkLift<runLift*.65);
});
test('court sports have planted feet and equipment attached to the dominant hand',()=>{
 for(const sport of ['pickleball','tennis','badminton'])for(let p=0;p<TAU;p+=.03){
  const r=pose(sport,p).front,e=r.equipment,hand=r.arms.find(a=>a.side===1).wrist;
  assert.deepEqual(e.grip,hand);assert.ok(Math.abs(Math.hypot(e.head.x-hand.x,e.head.y-hand.y)-e.headDistance)<1e-8);
  for(const leg of r.legs){assert.ok(Math.abs(leg.ankle.x-leg.side*30*(1+leg.side*5*.0012))<1e-8);assert.ok(Math.abs(leg.ankle.y-122)<1e-8);}
 }
});
test('balls and shuttle meet the racket at impact and disappear during rest',()=>{
 for(const sport of ['pickleball','tennis','badminton']){
  const r=pose(sport,.42*TAU).front;
  assert.ok(Math.hypot(r.projectile.x-r.equipment.head.x,r.projectile.y-r.equipment.head.y)<1e-8);
  assert.equal(pose(sport,2,true).front.projectile,undefined);
  assert.equal(pose(sport,0).front.projectile,undefined);
 }
});
test('sports have distinct strokes: compact forehand, cross-body follow-through, overhead reach',()=>{
 const pickle=pose('pickleball',.42*TAU).front;
 const tennis=pose('tennis',.62*TAU).front;
 const badminton=pose('badminton',.42*TAU).front;
 assert.ok(pickle.equipment.grip.y>pickle.neck.y+40);
 assert.ok(tennis.equipment.grip.x<tennis.hip.x);
 assert.ok(badminton.equipment.grip.y<badminton.neck.y-25);
 assert.ok(badminton.equipment.head.y<badminton.neck.y-85);
});
test('renderer produces finite geometry for every sport, outfit and rest state',()=>{
 const base={};for(const name of ['save','restore','beginPath','closePath','fill','stroke','clip'])base[name]=()=>{};
 for(const name of ['translate','rotate','scale','moveTo','lineTo','quadraticCurveTo','bezierCurveTo','fillRect','arc','ellipse'])base[name]=(...args)=>{assert.ok(args.filter(v=>typeof v==='number').every(Number.isFinite));if(name==='arc')assert.ok(args[2]>=0);if(name==='ellipse')assert.ok(args[2]>=0&&args[3]>=0);};
 for(const sport of Object.keys(SPORTS))for(const outfit of ['sage','peach'])for(const resting of [true,false])for(let i=0;i<12;i++)drawCharacter(base,sport,i*TAU/12,resting,SPORTS[sport].color,outfit);
});
test('upstream interpolation has a continuous seam',()=>{const keys=[[0,0,1,0],[2,1,2,0],[4,-1,0,0]];const a=sampleAnglePath(keys,1e-8),b=sampleAnglePath(keys,TAU-1e-8);a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-6));});
