import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CREATIVE_IDS,creativePose} from '../src/creative.mjs';
import {SPORTS,pose} from '../src/sports.mjs';
const TAU=Math.PI*2,at=(id,t,rest=false)=>creativePose(id,t*TAU,rest);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0));
test('eight distinct creative activities extend the picker to 37 choices',()=>{
 assert.equal(Object.keys(SPORTS).length,37);
 for(const id of CREATIVE_IDS)assert.equal(pose(id,0).front.creative.activity,id);
 const signatures=CREATIVE_IDS.map(id=>JSON.stringify(at(id,.31).arms.map(a=>a.world)));
 assert.equal(new Set(signatures).size,8);
 for(const id of ['drawing','pottery','crafts','writing'])assert.ok(at(id,0).creative.seated);
 for(const id of ['painting','photography','music','filmmaking'])assert.ok(!at(id,0).creative.seated);
});
test('painting brush stays on the canvas while the other hand holds the palette',()=>{
 for(let t=0;t<1;t+=.005){const r=at('painting',t),a=r.creative;
  assert.ok(distance(a.brush.grip,r.arms[1].wrist)<1e-8&&distance(a.palette.grip,r.arms[0].wrist)<1e-8);
  assert.ok(a.brush.tip.x>=42&&a.brush.tip.x<=118&&a.brush.tip.y>=-88&&a.brush.tip.y<=24);
  assert.ok(Math.abs(a.brush.tip.x-a.brush.grip.x-25)<1e-8);
 }
});
test('drawing traces a broad sketch while writing moves between rows with lifted returns',()=>{
 let drawingLift=0,writingLift=0;const rows=new Set();
 for(let t=0;t<1;t+=.005)for(const id of ['drawing','writing']){
  const r=at(id,t),pen=r.creative.pen;assert.ok(distance(pen.grip,r.arms[1].wrist)<1e-8);
  assert.ok(pen.tip.x>=-11&&pen.tip.x<=64);
  if(id==='drawing'){drawingLift=Math.max(drawingLift,pen.lift);assert.ok(pen.tip.y>=36&&pen.tip.y<=62);}
  else{writingLift=Math.max(writingLift,pen.lift);if(pen.lift<.01)rows.add(Math.round(pen.tip.y));}
 }
 assert.equal(drawingLift,0);assert.ok(writingLift>10);for(const y of [43,49,55])assert.ok(rows.has(y));
 assert.equal(at('drawing',0).creative.pen.kind,'pencil');assert.equal(at('writing',0).creative.pen.kind,'pen');
});
test('pottery hands stay on the changing clay walls while the wheel turns and the foot presses',()=>{
 const ready=at('pottery',0),shape=at('pottery',.5);
 assert.ok(shape.creative.clay.height>ready.creative.clay.height+5);
 assert.ok(shape.creative.clay.halfWidth<ready.creative.clay.halfWidth-2);
 for(let t=0;t<1;t+=.005){const r=at('pottery',t),v=r.creative.clay;
  for(const a of r.arms){assert.ok(Math.abs(a.wrist.x-a.side*v.halfWidth)<1e-8);assert.ok(Math.abs(a.wrist.y-(v.baseY-v.height*.55))<1e-8);}
 }
 assert.ok(at('pottery',.2).creative.wheelAngle>3);
 assert.ok(at('pottery',.125).legs[0].ankle.y<ready.legs[0].ankle.y-2);
});
test('photography raises a two-handed camera to the eyes for a single shutter beat',()=>{
 const low=at('photography',.05),high=at('photography',.48);
 assert.ok(high.creative.camera.y<low.creative.camera.y-70);
 assert.ok(Math.abs(high.creative.camera.y-(high.neck.y-29))<1e-8);
 assert.ok(high.creative.camera.flash>.99);assert.equal(low.creative.camera.flash,0);
 for(let t=0;t<1;t+=.01){const r=at('photography',t),c=r.creative.camera;
  for(const a of r.arms){assert.ok(Math.abs(a.wrist.x-a.side*21)<1e-8);assert.ok(Math.abs(a.wrist.y-c.y-6)<1e-8);}
 }
 assert.equal(at('photography',.48,true).creative.camera.flash,0);
});
test('craft scissors open and close while remaining in the cutting hand',()=>{
 let min=1,max=0;
 for(let t=0;t<1;t+=.005){const r=at('crafts',t),s=r.creative.scissors;
  assert.ok(distance(s.grip,r.arms[1].wrist)<1e-8);assert.ok(Math.abs(s.pivot.x-s.grip.x-8)<1e-8);
  assert.ok(s.pivot.x>=37-1e-8&&s.pivot.x<44&&s.pivot.y>37&&s.pivot.y<43);
  min=Math.min(min,s.opening);max=Math.max(max,s.opening);
 }
 assert.ok(min<.13&&max>.51);
});
test('guitar fretting follows the neck and strumming crosses the soundhole',()=>{
 let low=1e6,high=-1e6;
 for(let t=0;t<1;t+=.005){const r=at('music',t),g=r.creative.guitar;
  assert.ok(distance(g.fretting,r.arms[0].wrist)<1e-8&&distance(g.strumming,r.arms[1].wrist)<1e-8);
  const neckY=r.hip.y-17+(g.fretting.x-r.hip.x+18)*44/58;
  assert.ok(Math.abs(g.fretting.y-neckY)<1,'fretting hand should touch the guitar neck');
  assert.ok(Math.abs(g.strumming.x-r.hip.x-9)<1e-8);low=Math.min(low,g.strumming.y-r.hip.y);high=Math.max(high,g.strumming.y-r.hip.y);
 }
 assert.ok(high-low>19);
});
test('filmmaking pans a fixed tripod camera with the hand attached to its handle',()=>{
 for(let t=0;t<1;t+=.005){const r=at('filmmaking',t),v=r.creative.video;
  assert.ok(distance(v.handle,r.arms[1].wrist)<1e-8);
  assert.ok(Math.abs(v.handle.x-(v.x-34*Math.cos(v.angle)-9*Math.sin(v.angle)))<1e-8);
  assert.ok(Math.abs(v.handle.y-(v.y-34*Math.sin(v.angle)+9*Math.cos(v.angle)))<1e-8);
  assert.equal(v.x,66);assert.equal(v.y,-44);
 }
 assert.ok(at('filmmaking',.25).creative.video.angle>.13&&at('filmmaking',.75).creative.video.angle<-.13);
});
test('creative movements loop smoothly and pause with their tools and equipment',()=>{
 for(const id of CREATIVE_IDS){let prev;
  for(let i=0;i<=720;i++){const r=at(id,i/720);
   if(prev)for(let k=0;k<2;k++)for(const j of ['shoulder','elbow','wrist'])assert.ok(distance(prev.arms[k].world[j],r.arms[k].world[j])<4,`${id} ${j} should not jump`);
   prev=r;
  }
  const a=at(id,0),b=at(id,1-1e-8);for(let k=0;k<2;k++)assert.ok(distance(a.arms[k].wrist,b.arms[k].wrist)<.001);
  const rest=at(id,0,true);for(let t=.1;t<1;t+=.1){const r=at(id,t,true);assert.deepEqual(r.creative,rest.creative);assert.deepEqual(r.arms,rest.arms);assert.deepEqual(r.legs,rest.legs);}
 }
});
