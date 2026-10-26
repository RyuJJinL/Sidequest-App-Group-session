import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FITNESS_IDS,fitnessPose} from '../src/fitness.mjs';
import {SPORTS,pose,drawCharacter} from '../src/sports.mjs';
const TAU=2*Math.PI;
const at=(id,t,rest=false)=>fitnessPose(id,t*TAU,rest);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0));
test('all seven fitness activities are selectable with distinct motion and sensible pacing',()=>{
 for(const id of FITNESS_IDS){assert.equal(pose(id,0).front.fitness.sport,id);assert.ok(SPORTS[id].period>1);}
 assert.ok(SPORTS.yoga.period>SPORTS.cycling.period*3);
 const signatures=FITNESS_IDS.map(id=>JSON.stringify(at(id,.3).arms.map(a=>a.wrist)));
 assert.equal(new Set(signatures).size,7);
});
test('gym curls alternate while each dumbbell remains gripped throughout the rep',()=>{
 const a=at('gym',0),b=at('gym',.5);
 assert.ok(a.arms[0].wrist.y<a.arms[1].wrist.y-35);
 assert.ok(b.arms[1].wrist.y<b.arms[0].wrist.y-35);
 for(let t=0;t<1;t+=.01){const r=at('gym',t);r.fitness.weights.forEach((w,i)=>assert.ok(distance(w,r.arms[i].wrist)<1e-8));}
});
test('Pilates lifts one leg with controlled extension while yoga retains its rooted balance',()=>{
 const ready=at('pilates',0),lift=at('pilates',.5);
 assert.ok(lift.legs[1].ankle.x>ready.legs[1].ankle.x+50);
 assert.ok(lift.legs[1].ankle.y<ready.legs[1].ankle.y-20);
 for(let t=0;t<1;t+=.01){
  for(const id of ['pilates','yoga'])assert.ok(Math.abs(at(id,t).legs[0].ankle.y-122)<1e-8);
  const y=at('yoga',t);assert.ok(y.legs[1].ankle.y<65);assert.ok(distance(y.arms[0].wrist,y.arms[1].wrist)<9);
 }
});
test('cycling feet stay on opposite pedals and hands stay on the handlebar grips',()=>{
 for(let t=0;t<1;t+=.01){const r=at('cycling',t),f=r.fitness;
  assert.ok(Math.abs(r.legs[0].world.ankle.y+r.legs[1].world.ankle.y-192)<1e-8);
  assert.ok(Math.abs(r.legs[0].world.ankle.z+r.legs[1].world.ankle.z-48)<1e-8);
  f.pedals.forEach((p,i)=>{assert.ok(Math.abs(p.x-r.legs[i].ankle.x)<1e-8);assert.ok(Math.abs(p.y-r.legs[i].ankle.y-18)<1e-8);});
  f.handles.forEach((h,i)=>assert.ok(distance(h,r.arms[i].wrist)<1e-8));
 }
});
test('dance transfers weight across alternating steps; swimming alternates strokes and flutter kicks',()=>{
 const left=at('dance',.25),right=at('dance',.75);
 assert.ok(left.hip.x>10&&right.hip.x<-10);
 assert.ok(Math.abs(left.legs[0].ankle.y-122)<1e-8&&Math.abs(right.legs[1].ankle.y-122)<1e-8);
 assert.ok(left.legs[1].ankle.y<115&&right.legs[0].ankle.y<115);
 const a=at('swimming',0),b=at('swimming',.5);
 assert.ok(a.arms[0].wrist.y<b.arms[0].wrist.y-70);
 assert.ok(a.arms[1].wrist.y>b.arms[1].wrist.y+70);
 const kick=at('swimming',.125);assert.ok(kick.legs[0].ankle.z>kick.legs[1].ankle.z+20);
});
test('CrossFit extends from a loaded squat while the kettlebell remains shared between both hands',()=>{
 const low=at('crossfit',.18),high=at('crossfit',.46);
 assert.ok(low.hip.y>high.hip.y+25);
 assert.ok(low.fitness.kettlebell.y>high.fitness.kettlebell.y+55);
 for(let t=0;t<1;t+=.01){const r=at('crossfit',t),k=r.fitness.kettlebell;
  assert.ok(Math.abs(k.x-(r.arms[0].wrist.x+r.arms[1].wrist.x)/2)<1e-8);
  assert.ok(Math.abs(k.y-(r.arms[0].wrist.y+r.arms[1].wrist.y)/2-4)<1e-8);
  assert.ok(distance(r.arms[0].wrist,r.arms[1].wrist)<13);
 }
});
test('fitness joints and attached props are continuous around the full loop and stable when stopped',()=>{
 for(const id of FITNESS_IDS){
  let prev;
  for(let i=0;i<=720;i++){
   const r=at(id,i/720);
   if(prev)for(let j=0;j<2;j++)for(const name of ['shoulder','elbow','wrist'])assert.ok(distance(prev.arms[j].world[name],r.arms[j].world[name])<4,`${id} ${name} must move smoothly`);
   prev=r;
  }
  const a=at(id,0),b=at(id,1-1e-8);
  for(let j=0;j<2;j++)assert.ok(distance(a.arms[j].world.wrist,b.arms[j].world.wrist)<.001);
  const rest=at(id,0,true);
  for(let t=.1;t<1;t+=.1){const r=at(id,t,true);assert.deepEqual(r.fitness,rest.fitness);assert.deepEqual(r.arms,rest.arms);assert.deepEqual(r.legs,rest.legs);}
 }
});
test('swimming renders horizontally with water layered behind and ahead of the clothed avatar',()=>{
 const calls=[];
 const base={save(){},restore(){},beginPath(){},closePath(){},fill(){},stroke(){},clip(){}};
 for(const name of ['translate','rotate','scale','moveTo','lineTo','quadraticCurveTo','bezierCurveTo','fillRect','arc','ellipse'])base[name]=(...args)=>calls.push([name,...args]);
 drawCharacter(base,'swimming',1,false,SPORTS.swimming.color,'peach');
 assert.ok(calls.some(([n,v])=>n==='rotate'&&v===Math.PI/2));
 assert.ok(calls.filter(([n])=>n==='lineTo').length>200,'pool edges and surface ripples are drawn');
});
