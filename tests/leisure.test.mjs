import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEISURE_IDS,leisurePose} from '../src/leisure.mjs';
import {SPORTS,pose} from '../src/sports.mjs';
const TAU=Math.PI*2,at=(id,t,rest=false)=>leisurePose(id,t*TAU,rest);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0));
test('eight food and social activities retain distinct motion',()=>{
 for(const id of LEISURE_IDS)assert.equal(pose(id,0).front.leisure.activity,id);
 assert.equal(new Set(LEISURE_IDS.map(id=>JSON.stringify(at(id,.32).arms.map(a=>a.world)))).size,8);
});
test('cafe cup rises from its saucer to the mouth without leaving the hand',()=>{
 const low=at('cafe',0),high=at('cafe',.45);
 assert.ok(high.leisure.cup.y<low.leisure.cup.y-60);
 assert.ok(Math.abs(high.leisure.cup.y-9-(high.neck.y-10))<1e-8);
 assert.ok(Math.abs(low.leisure.cup.y+11-45)<1e-8);
 for(let t=0;t<1;t+=.01){const r=at('cafe',t),q=r.leisure.cup;assert.ok(distance(q.grip,r.arms[1].wrist)<1e-8);assert.ok(Math.abs(q.x-q.grip.x+12)<1e-8);}
});
test('food trips lift a fork to tasting height while the held plate remains level',()=>{
 const low=at('foodtrips',0),bite=at('foodtrips',.4);
 assert.ok(bite.leisure.fork.tip.y<low.leisure.fork.tip.y-65);
 assert.ok(Math.abs(bite.leisure.fork.tip.y-(bite.neck.y-10))<1e-8);
 for(let t=0;t<1;t+=.01){const r=at('foodtrips',t),s=r.leisure;
  assert.ok(distance(s.fork.grip,r.arms[1].wrist)<1e-8&&distance(s.plate.grip,r.arms[0].wrist)<1e-8);
  assert.ok(Math.abs(s.plate.y-3)<1e-8);
 }
});
test('cooking spoon stirs inside the pot and baking uses a rigid pin across both hands',()=>{
 for(let t=0;t<1;t+=.005){
  const c=at('cooking',t),q=c.leisure.spoon;assert.ok(distance(q.grip,c.arms[1].wrist)<1e-8);
  assert.ok(((q.tip.x-7)/22)**2+((q.tip.y-28)/5)**2<1,'spoon stays in the soup surface');
  const b=at('baking',t),r=b.leisure.rollingPin;
  assert.ok(distance(r.a,b.arms[0].wrist)<1e-8&&distance(r.b,b.arms[1].wrist)<1e-8);
  assert.ok(Math.abs(r.a.y-r.b.y)<1e-8&&Math.abs(r.b.x-r.a.x-68)<1e-8);
  assert.ok(r.y>=39-1e-8&&r.y<=51+1e-8,'pin travels on the dough');
 }
 assert.ok(at('baking',.25).leisure.rollingPin.y>at('baking',.75).leisure.rollingPin.y+11);
});
test('picnics use a crossed-leg pose and a sandwich lift distinct from the fork-tasting pose',()=>{
 const rest=at('picnics',0),bite=at('picnics',.4);
 for(const l of rest.legs)assert.ok(l.world.ankle.x*l.side<0,'ankles cross the body center');
 assert.ok(bite.leisure.sandwich.y<rest.leisure.sandwich.y-50);
 assert.ok(Math.abs(bite.leisure.sandwich.y-(bite.neck.y-10))<1e-8);
 assert.notDeepEqual(bite.arms,at('foodtrips',.4).arms);
 for(let t=0;t<1;t+=.01){const r=at('picnics',t),s=r.leisure;assert.ok(distance(s.sandwich.grip,r.arms[1].wrist)<1e-8&&distance(s.plate.grip,r.arms[0].wrist)<1e-8);}
});
test('karaoke keeps the microphone beside the mouth while swaying and gesturing',()=>{
 for(let t=0;t<1;t+=.005){const r=at('karaoke',t),m=r.leisure.microphone;
  assert.ok(distance(m.grip,r.arms[1].wrist)<1e-8);assert.ok(Math.abs(m.head.y-(r.neck.y-11))<1e-8);
 }
 assert.ok(at('karaoke',.25).hip.x>3.9&&at('karaoke',.75).hip.x< -3.9);
 assert.ok(distance(at('karaoke',.25).arms[0].wrist,at('karaoke',.75).arms[0].wrist)>25);
});
test('trivia raises an answer card and keeps the buzzer hand at the button',()=>{
 const low=at('trivianights',0),answer=at('trivianights',.5);
 assert.ok(answer.leisure.card.y<low.leisure.card.y-45);
 for(let t=0;t<1;t+=.01){const r=at('trivianights',t),s=r.leisure;
  assert.ok(distance(s.card.grip,r.arms[1].wrist)<1e-8);assert.ok(Math.abs(s.card.y-s.card.grip.y+13)<1e-8);
  assert.ok(Math.abs(r.arms[0].wrist.x-s.buzzer.x)<1e-8);assert.ok(r.arms[0].wrist.y>=37-1e-8&&r.arms[0].wrist.y<=39+1e-8);
 }
});
test('community greeting raises an open hand while its badge follows the torso',()=>{
 const low=at('communitymeetups',0),wave=at('communitymeetups',.46);
 assert.ok(wave.arms[1].wrist.y<low.arms[1].wrist.y-65);assert.ok(wave.arms[1].handOpen);
 for(let t=0;t<1;t+=.01){const r=at('communitymeetups',t),b=r.leisure.badge;assert.ok(Math.abs(b.x-r.neck.x)<1e-8&&Math.abs(b.y-r.neck.y-55)<1e-8);}
});
test('food and social loops remain continuous and pause with every attached prop',()=>{
 for(const id of LEISURE_IDS){let prev;
  for(let i=0;i<=720;i++){const r=at(id,i/720);if(prev)for(let k=0;k<2;k++)for(const j of ['shoulder','elbow','wrist'])assert.ok(distance(prev.arms[k].world[j],r.arms[k].world[j])<4,`${id} ${j} should not snap`);prev=r;}
  const a=at(id,0),b=at(id,1-1e-8);for(let k=0;k<2;k++)assert.ok(distance(a.arms[k].wrist,b.arms[k].wrist)<.001);
  const rest=at(id,0,true);for(let t=.1;t<1;t+=.1){const r=at(id,t,true);assert.deepEqual(r.leisure,rest.leisure);assert.deepEqual(r.arms,rest.arms);assert.deepEqual(r.legs,rest.legs);}
 }
});
