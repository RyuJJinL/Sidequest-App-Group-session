import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pose,SPORTS} from '../src/sports.mjs';
import {buildClothing,clipClothDepth} from '../src/clothing.mjs';
const TAU=2*Math.PI;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const surfaces=m=>[m.torso,...m.sleeves,m.waistband,...m.shorts,...m.legs,...m.bareArms];
const vertices=m=>surfaces(m).flatMap(s=>s.vertices);

test('sleeves share the shirt armhole vertices throughout every sport and outfit',()=>{
 for(const sport of Object.keys(SPORTS))for(const outfit of ['sage','peach'])for(let i=0;i<48;i++){
  const m=buildClothing(pose(sport,i*TAU/48).front,outfit);
  for(const s of m.sleeves){
   const col=s.side===-1?0:4;
   assert.equal(s.rows[0][0],m.torso.rows[0][col],'outer shoulder cannot detach from the shirt');
   assert.equal(s.rows[0][4],m.torso.rows[1][col],'armpit cannot detach from the shirt');
   for(let j=1;j<4;j++){
    const v=s.rows[0][j],a=s.rows[0][0],b=s.rows[0][4];
    assert.ok(distance(v,{x:a.x+(b.x-a.x)*j/4,y:a.y+(b.y-a.y)*j/4})<1e-8,'the complete attachment edge is watertight');
   }
  }
 }
});
test('waist remains attached to the pelvis while each shorts hem follows its thigh',()=>{
 const ra=pose('running',.18*TAU).front,rb=pose('running',.68*TAU).front;
 const a=buildClothing(ra),b=buildClothing(rb);
 for(let i=0;i<5;i++){
  const va=a.waistband.rows[0][i],vb=b.waistband.rows[0][i];
  assert.ok(distance({x:va.x-ra.hip.x,y:va.y-ra.hip.y},{x:vb.x-rb.hip.x,y:vb.y-rb.hip.y})<1e-8);
 }
 for(let i=0;i<2;i++){
  assert.ok(Math.abs(a.shorts[i].rows.at(-1)[0].y-b.shorts[i].rows.at(-1)[0].y)>2,'a moving thigh must deform its shorts opening');
  const side=i===0?-1:1;
  assert.equal(a.shorts[i].rows[0][0],a.waistband.rows[2][side===-1?0:4]);
  assert.equal(a.shorts[i].rows[0][4],a.waistband.rows[2][2]);
 }
 for(const m of [a,b])for(let i=0;i<5;i++){
  const hem=m.torso.rows.at(-1)[i],waist=m.waistband.rows[0][i];
  assert.ok(Math.abs(hem.y-waist.y-4)<1e-8,'shirt hem must overlap the same moving waistband');
 }
});
test('weighted surfaces are finite, continuous and close seamlessly at the loop',()=>{
 for(const sport of Object.keys(SPORTS))for(const outfit of ['sage','peach']){
  let previous;
  for(let i=0;i<=240;i++){
   const m=buildClothing(pose(sport,i*TAU/240).front,outfit),vs=vertices(m);
   for(let j=0;j<vs.length;j++){
    const v=vs[j];assert.ok([v.x,v.y,v.world.z].every(Number.isFinite));
    assert.ok(Math.abs(Object.values(v.weights).reduce((a,b)=>a+b,0)-1)<1e-8);
    assert.ok(Object.values(v.weights).every(w=>w>=0&&w<=1));
    if(previous)assert.ok(distance(v,previous[j])<8,'no clothing vertex should teleport or switch sides');
   }
   previous=vs;
  }
  const a=vertices(buildClothing(pose(sport,1e-7).front,outfit)),b=vertices(buildClothing(pose(sport,TAU-1e-7).front,outfit));
  for(let i=0;i<a.length;i++)assert.ok(distance(a[i],b[i])<.001);
 }
});
test('jacket elbows and legging knees retain volume through bends and foreshortening',()=>{
 for(const sport of Object.keys(SPORTS))for(let i=0;i<80;i++){
  const m=buildClothing(pose(sport,i*TAU/80).front,'peach');
  for(const s of m.sleeves){const elbow=s.rows.find(r=>r[0].rest.y===-23);assert.ok(Math.abs(distance(elbow[0],elbow[4])-18)<1e-8);}
  for(const l of m.legs){const knee=l.rows.find(r=>r[0].rest.y===62);assert.ok(Math.abs(distance(knee[0],knee[2])-17)<1e-8);}
 }
});
test('cross-body shoulder correction encloses its projected fabric without a triangular hole',()=>{
 for(const sport of ['tennis','badminton'])for(let i=0;i<100;i++){
  const m=buildClothing(pose(sport,i*TAU/100).front,'peach');
  for(const s of m.sleeves){
   const p=s.shoulderPatch;
   for(const v of s.rows.slice(0,4).flat())for(let j=0;j<p.length;j++){
    const a=p[j],b=p[(j+1)%p.length];
    assert.ok((b.x-a.x)*(v.y-a.y)-(b.y-a.y)*(v.x-a.x)>-1e-7);
   }
  }
 }
});
test('sleeve depth follows the turned chest while the tennis support hand stays in front',()=>{
 const m=buildClothing(pose('tennis',.62*TAU).front,'peach');
 const root=m.sleeves[1].rows[0];
 assert.ok(root.every(v=>v.world.z>0),'this near shoulder would pass the old world-plane check');
 assert.equal(clipClothDepth(root).length,0,'the sleeve attachment is covered by the local chest surface');
 for(let i=0;i<200;i++){
  const m=buildClothing(pose('tennis',i*TAU/200).front);
  assert.ok(m.rig.depth(m.rig.arms[-1].world.wrist)>0,'the free palm must remain visible in front of the chest');
 }
});
