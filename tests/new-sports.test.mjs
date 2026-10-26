import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPORTS,pose} from '../src/sports.mjs';
const TAU=Math.PI*2;
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
function headTravel(sport){
 let length=0,previous=pose(sport,0).front.equipment.worldHead;
 for(let i=1;i<=400;i++){
  const next=pose(sport,i*TAU/400).front.equipment.worldHead;
  length+=distance(previous,next);previous=next;
 }
 return length;
}
test('new sports have distinct compact strokes, equipment sizes and ready stances',()=>{
 const padel=pose('padel',0,true).front,table=pose('tabletennis',0,true).front,tennis=pose('tennis',0,true).front;
 assert.ok(table.hip.y>padel.hip.y,'table tennis uses a lower, bent-knee ready stance');
 assert.ok(table.equipment.shaftLength<padel.equipment.shaftLength&&padel.equipment.shaftLength<tennis.equipment.shaftLength);
 assert.ok(SPORTS.tabletennis.period<SPORTS.padel.period,'table tennis recovers more quickly');
 assert.ok(headTravel('tabletennis')<headTravel('padel')*.8,'table tennis retains a smaller stroke arc');
 assert.ok(headTravel('padel')<headTravel('tennis')*.85,'padel must not reuse the long tennis swing');
});
test('new rackets remain smooth at display-frame intervals and support hands stay attached',()=>{
 for(const sport of ['padel','tabletennis'])for(let t=0;t<1;t+=.002){
  const a=pose(sport,t*TAU).front,b=pose(sport,(t+1/(60*SPORTS[sport].period))*TAU).front;
  assert.ok(distance(a.equipment.worldHead,b.equipment.worldHead)<16,'no skipped section of the racket arc');
  assert.equal(a.arms[0].handOpen,true);
  assert.ok(a.shoulderRig);
  assert.ok(distance(a.arms[0].world.wrist,b.arms[0].world.wrist)<5,'the support hand cannot snap between positions');
 }
});
test('both new sports hold a stable ready pose during breaks and stopped sessions',()=>{
 for(const sport of ['padel','tabletennis']){
  const ready=pose(sport,0,true).front;
  for(let phase=0;phase<TAU;phase+=.1){
   const r=pose(sport,phase,true).front;
   assert.ok(distance(ready.equipment.worldHead,r.equipment.worldHead)<1e-8);
   assert.equal(r.projectile,undefined);
  }
 }
});
