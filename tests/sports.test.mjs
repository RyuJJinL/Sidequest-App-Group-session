import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPORTS,pose,jointPositions} from '../src/sports.mjs';
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
test('all five sports loop continuously and preserve native bone lengths',()=>{
 for(const sport of Object.keys(SPORTS)){
  const first=pose(sport,0),last=pose(sport,2*Math.PI);
  first.angles.forEach((a,i)=>assert.ok(Math.abs(a-last.angles[i])<1e-9));
  for(let phase=0;phase<7;phase+=.1)for(const resting of [true,false]){
   const p=pose(sport,phase,resting),points=jointPositions(p);
   for(const s of p.figure.segments){const a=points.get(s.parent_id),b=points.get(s.segment_id);assert.ok(Number.isFinite(b.x)&&Number.isFinite(b.y));assert.ok(Math.abs(Math.hypot(b.x-a.x,b.y-a.y)-s.length)<1e-8);}
  }
 }
});
test('upstream interpolation has a continuous seam',()=>{const keys=[[0,0,1,0],[2,1,2,0],[4,-1,0,0]];const a=sampleAnglePath(keys,1e-8),b=sampleAnglePath(keys,2*Math.PI-1e-8);a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<1e-6));});
