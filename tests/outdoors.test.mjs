import {test} from 'node:test';
import assert from 'node:assert/strict';
import {OUTDOOR_IDS,outdoorPose,drawOutdoorEnvironment} from '../src/outdoors.mjs';
import {SPORTS,pose} from '../src/sports.mjs';
const TAU=Math.PI*2,at=(id,t,rest=false)=>outdoorPose(id,t*TAU,rest);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0));
test('nine outdoor categories extend the selector to 29 independent activities',()=>{
 assert.equal(Object.keys(SPORTS).length,29);
 for(const id of OUTDOOR_IDS){assert.equal(pose(id,0).front.outdoor.sport,id);assert.equal(SPORTS[id].ground,false);}
 const signatures=OUTDOOR_IDS.map(id=>JSON.stringify(at(id,.31).arms.map(a=>a.world)));
 assert.equal(new Set(signatures).size,9);
});
test('trekking steps and trail bounds differ from walking and running, including ground support and flight',()=>{
 let hikeLift=0,walkLift=0,trailFlight=0,trailSway=0;
 for(let i=0;i<240;i++){
  const t=i/240,h=at('hiking',t),tr=at('trailrunning',t),w=pose('walking',t*TAU).front;
  assert.ok(Math.abs(Math.max(...h.legs.map(l=>l.ankle.y))-122)<1e-8,'hiking always has a support foot');
  hikeLift=Math.max(hikeLift,Math.abs(h.legs[0].ankle.y-h.legs[1].ankle.y));
  walkLift=Math.max(walkLift,Math.abs(w.legs[0].ankle.y-w.legs[1].ankle.y));
  trailFlight=Math.max(trailFlight,122-Math.max(...tr.legs.map(l=>l.ankle.y)));
  trailSway=Math.max(trailSway,Math.abs(tr.hip.x));
  h.outdoor.poles.forEach((p,i)=>assert.ok(distance(p.grip,h.arms[i].wrist)<1e-8));
 }
 assert.ok(hikeLift>walkLift+8);
 assert.ok(trailFlight>11&&trailSway>8,'trail running clears uneven ground with lateral balance');
 assert.ok(SPORTS.hiking.period>SPORTS.trailrunning.period*2);
 for(const [id,old]of [['hiking','walking'],['trailrunning','running']]){
  assert.notDeepEqual(at(id,.23).arms.map(a=>a.world),pose(old,.23*TAU).front.arms.map(a=>a.world));
 }
});
test('camping mallet strikes the peg precisely and remains in the same hand through the lift',()=>{
 const hit=at('camping',.36),lift=at('camping',.20);
 assert.ok(distance(hit.outdoor.hammer.head,hit.outdoor.stake)<1e-8);
 assert.ok(distance(lift.outdoor.hammer.head,lift.outdoor.stake)>35);
 assert.ok(hit.hip.y>60&&hit.legs.every(l=>l.world.ankle.z<l.world.knee.z-45),'kneeling folds the calves behind the thighs');
 for(let t=0;t<1;t+=.01){const r=at('camping',t);assert.ok(distance(r.outdoor.hammer.grip,r.arms[1].wrist)<1e-8);}
});
test('climbing pauses on fixed holds before alternating upward and downward reaches',()=>{
 const high=at('climbing',.32),low=at('climbing',.02);
 assert.ok(high.arms[0].wrist.y<low.arms[0].wrist.y-24);
 for(const t of [.02,.10,.32,.48,.54,.82]){
  const r=at('climbing',t);
  for(const a of r.arms)assert.ok(r.outdoor.holds.some(h=>Math.hypot(h.x-a.wrist.x,h.y-a.wrist.y)<.01),'gripping hand meets a rock hold during a planted interval');
 }
 for(let t=0;t<1;t+=.005){const r=at('climbing',t);assert.ok(r.arms.some(a=>r.outdoor.holds.some(h=>Math.hypot(h.x-a.wrist.x,h.y-a.wrist.y)<.01)),'at least one hand stays planted while the other moves');}
 assert.ok(at('climbing',.38).legs[1].ankle.y<at('climbing',.05).legs[1].ankle.y-20);
});
test('surfing crouches over a fixed board stance and counters board roll with the arms',()=>{
 const a=at('surfing',.25),b=at('surfing',.75);
 assert.ok(a.hip.y>25&&b.hip.y>25);
 assert.ok(a.outdoor.frame.angle>0&&b.outdoor.frame.angle<0);
 assert.ok(a.arms[0].wrist.y<a.arms[1].wrist.y&&b.arms[0].wrist.y>b.arms[1].wrist.y);
 for(let t=0;t<1;t+=.01){const r=at('surfing',t);for(const l of r.legs){assert.ok(Math.abs(l.ankle.y-112)<1e-8);assert.ok(Math.abs(l.ankle.x-l.side*43*(1+8*.0012))<1e-8);}}
});
test('freediving is head first with paired long-fin kicks, while scuba uses horizontal frog finning and bubbles',()=>{
 const f=at('freediving',.25),s=at('scubadiving',.25);
 assert.ok(Math.abs(f.outdoor.frame.angle-Math.PI)<.1);
 assert.ok(Math.abs(s.outdoor.frame.angle-Math.PI/2)<.1);
 assert.ok(f.arms.every(a=>a.wrist.y<f.neck.y-65));
 assert.ok(Math.abs(f.legs[0].world.ankle.z-f.legs[1].world.ankle.z)<1e-8);
 assert.ok(at('scubadiving',.5).legs[1].ankle.x>at('scubadiving',0).legs[1].ankle.x+25);
 for(const id of ['freediving','scubadiving'])for(let t=0;t<1;t+=.01){const r=at(id,t);r.outdoor.fins.forEach((fin,i)=>assert.ok(distance(fin.ankle,r.legs[i].ankle)<1e-8));}
 assert.ok(f.outdoor.fins[0].length>s.outdoor.fins[0].length+15);
 const calls={freediving:0,scubadiving:0};
 for(const id of Object.keys(calls)){
  const c=new Proxy({save(){},restore(){}},{get:(o,k)=>o[k]??(()=>calls[id]++)});
  drawOutdoorEnvironment(c,at(id,.3),true);
 }
 assert.equal(calls.freediving,0);assert.ok(calls.scubadiving>0);
});
test('both kayak hands remain on one rigid paddle as opposite blades change sides',()=>{
 for(let t=0;t<1;t+=.01){const r=at('kayaking',t),d=r.outdoor.paddle;
  assert.ok(distance(d.a,r.arms[0].wrist)<1e-8&&distance(d.b,r.arms[1].wrist)<1e-8);
  assert.ok(Math.abs(Math.hypot(d.b.x-d.a.x,d.b.y-d.a.y)-58)<1e-8);
  const side=Math.sin(d.angle)>=0?1:-1,splash=r.outdoor.splash;
  assert.ok(Math.abs(splash.x-d.center.x-side*142*Math.cos(d.angle))<1e-8);
  assert.ok(Math.abs(splash.y-d.center.y-side*142*Math.sin(d.angle))<1e-8);
 }
 assert.ok(at('kayaking',.25).outdoor.paddle.angle>.4&&at('kayaking',.75).outdoor.paddle.angle<-.4);
 assert.ok(at('kayaking',0).hip.y>40);
});
test('fishing keeps the rod in one hand while the other turns the reel',()=>{
 for(let t=0;t<1;t+=.01){const r=at('fishing',t),rod=r.outdoor.rod,w=r.arms[0].wrist;
  assert.ok(distance(rod.grip,r.arms[1].wrist)<1e-8);
  assert.ok(Math.abs(Math.hypot(w.x-rod.reel.x,w.y-rod.reel.y)-4)<1e-8);
  assert.ok(Math.abs(Math.hypot(rod.tip.x-rod.grip.x,rod.tip.y-rod.grip.y)-122)<1e-8);
 }
});
test('outdoor joints remain smooth across every cycle and freeze with their equipment when stopped',()=>{
 for(const id of OUTDOOR_IDS){
  let last;
  for(let i=0;i<=720;i++){
   const r=at(id,i/720);
   if(last)for(let k=0;k<2;k++){
    for(const j of ['shoulder','elbow','wrist'])assert.ok(distance(last.arms[k].world[j],r.arms[k].world[j])<4,`${id} ${j} should not snap`);
    for(const j of ['hip','knee','ankle'])assert.ok(distance(last.legs[k].world[j],r.legs[k].world[j])<4,`${id} ${j} should not snap`);
   }
   last=r;
  }
  const a=at(id,0),b=at(id,1-1e-8);
  for(let k=0;k<2;k++){assert.ok(distance(a.arms[k].wrist,b.arms[k].wrist)<.001);assert.ok(distance(a.legs[k].ankle,b.legs[k].ankle)<.001);}
  const rest=at(id,0,true);
  for(let t=.1;t<1;t+=.1){const r=at(id,t,true);assert.deepEqual(r.outdoor,rest.outdoor);assert.deepEqual(r.arms,rest.arms);assert.deepEqual(r.legs,rest.legs);}
 }
});
