import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LIFE_IDS,lifePose} from '../src/life.mjs';
import {pose} from '../src/sports.mjs';
const TAU=2*Math.PI,at=(id,t,rest=false)=>lifePose(id,t*TAU,rest);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0));
test('28 new activities use distinct full-body choreography',()=>{
 assert.equal(LIFE_IDS.length,28);
 for(const id of LIFE_IDS)assert.equal(pose(id,0).front.life.activity,id);
 assert.equal(new Set(LIFE_IDS.map(id=>JSON.stringify(at(id,.32).arms.map(a=>a.world)))).size,28);
});
test('life loops keep fixed bones and smooth joints, including the cleanup return',()=>{
 for(const id of LIFE_IDS){let prev;
  for(let i=0;i<=720;i++){const r=at(id,i/720);
   for(const a of r.arms){assert.ok(Math.abs(distance(a.world.shoulder,a.world.elbow)-39)<1e-7);assert.ok(Math.abs(distance(a.world.elbow,a.world.wrist)-33)<1e-7);}
   if(prev)for(let k=0;k<2;k++)for(const j of ['shoulder','elbow','wrist'])assert.ok(distance(prev.arms[k].world[j],r.arms[k].world[j])<5,`${id} ${j}`);
   prev=r;
  }
  const a=at(id,0),b=at(id,1-1e-8);for(let k=0;k<2;k++)assert.ok(distance(a.arms[k].wrist,b.arms[k].wrist)<.001);
  for(const t of [.1,.45,.83]){const r=at(id,t,true),rest=at(id,0,true);assert.deepEqual(r.life,rest.life);assert.deepEqual(r.arms,rest.arms);assert.deepEqual(r.legs,rest.legs);}
 }
});
test('controller and steering wheel hold rigid two-hand contact',()=>{
 for(let t=0;t<1;t+=.01)for(const [id,key,span]of [['gaming','controller',32],['roadtrips','wheel',54]]){
  const r=at(id,t),p=r.life[key];assert.ok(distance(p.a,r.arms[0].wrist)<1e-8);assert.ok(distance(p.b,r.arms[1].wrist)<1e-8);
  assert.ok(Math.abs(distance(p.a,p.b)-span)<1e-8);
 }
});
test('keyboard fingers stay on the laptop and book hand crosses the page',()=>{
 for(let t=0;t<1;t+=.01)for(const a of at('coding',t).arms)assert.ok(a.wrist.y>50&&a.wrist.y<56);
 const a=at('reading',0),b=at('reading',.5);assert.ok(b.life.book.page.x<a.life.book.page.x-35);assert.ok(distance(b.life.book.left,b.arms[0].wrist)<1e-8);
});
test('coin and donation can release into their containers before reappearing',()=>{
 for(const [id,key]of [['financialliteracy','coin'],['volunteering','can']]){
  const held=at(id,.4).life[key],release=at(id,.5).life[key],drop=at(id,.58).life[key],hidden=at(id,.7).life[key],newItem=at(id,.99).life[key];
  assert.ok(held.held&&!release.held);assert.ok(drop.y>release.y);assert.equal(hidden.opacity,0);assert.ok(newItem.held&&newItem.opacity>.99);
  assert.ok(distance(at(id,.5-1e-7).life[key],release)<.001,'release cannot teleport');
 }
});
test('tool and care props remain on solved wrists',()=>{
 for(let t=0;t<1;t+=.01)for(const [id,key]of [['workshops','hammer'],['diy','driver'],['cleanups','picker'],['communityprojects','roller'],['animalwelfare','bowl'],['daytrips','binoculars']]){
  const r=at(id,t),p=r.life[key],hand=id==='animalwelfare'?0:1;assert.ok(distance(p.grip,r.arms[hand].wrist)<1e-8);
 }
 const r=at('animalwelfare',.25);assert.ok(r.arms[1].wrist.y<81&&r.arms[1].wrist.x>45,'petting hand reaches the dog head');
});
test('meditation crosses ankles and wellness breathing remains calm',()=>{
 for(const id of ['meditation','breathwork','wellnessactivities'])assert.equal(at(id,.3).expression,'calm');
 for(const l of at('meditation',.3).legs)assert.ok(l.world.ankle.x*l.side<0);
 assert.ok(at('breathwork',.5).neck.y<at('breathwork',0).neck.y-1.9);
 assert.ok(at('charityactivities',.5).arms[0].wrist.z>at('charityactivities',0).arms[0].wrist.z+25);
});
