import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tennisPose,settle} from '../src/tennis.mjs';
import {figureSlots} from '../src/rig-slots.mjs';
import {buildClothing} from '../src/clothing.mjs';
import {normalizeAppearance,equipPart,applyOutfitPreset} from '../src/wardrobe.mjs';
import {appearanceColors} from '../src/appearance-colors.mjs';
const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
test('ready-to-swing joint-space blending preserves anatomy and racket attachment',()=>{
 for(let w=0;w<=1;w+=.025)for(let p=0;p<Math.PI*2;p+=.12){const r=tennisPose(p,false,{weight:w});for(const a of r.arms){assert.ok(Math.abs(d(a.world.shoulder,a.world.elbow)-39)<1e-8);assert.ok(Math.abs(d(a.world.elbow,a.world.wrist)-33)<1e-8);}assert.deepEqual(r.equipment.grip,r.arms[1].wrist);assert.ok(Math.abs(d(r.equipment.worldGrip,r.equipment.worldHead)-r.equipment.shaftLength)<1e-8);for(const l of r.legs)assert.ok(Math.abs(l.ankle.y-122)<1e-8);if(w<.999)assert.equal(r.projectile,undefined);}
});
test('blended clothing preserves both shared shoulder seams throughout entry and exit',()=>{
 for(let w=0;w<=1;w+=.025)for(const outfit of ['sage','peach']){const m=buildClothing(tennisPose(2.9,false,{weight:w}),outfit);for(const s of m.sleeves){const i=s.side<0?0:4;assert.equal(s.rows[0][0],m.torso.rows[0][i]);assert.equal(s.rows[0][4],m.torso.rows[1][i]);}}
});
test('hair and head layers cannot change the wrist or cloth pose',()=>{
 const a=tennisPose(2,false,{time:10}),b=tennisPose(2,false,{time:11});assert.deepEqual(a.arms,b.arms);assert.deepEqual(a.legs,b.legs);assert.notEqual(a.headRig.hairPhase,b.headRig.hairPhase);
 const slots=figureSlots(a);assert.equal(new Set(slots.map(s=>s.id)).size,slots.length);assert.ok(slots.findIndex(s=>s.id==='arm:-1:front')>slots.findIndex(s=>s.id==='top'));
});
test('transition settles without overshoot and is stable at either state',()=>{
 let w=0;for(let i=0;i<30;i++){const n=settle(w,1,1/60);assert.ok(n>=w&&n<=1);w=n;}assert.ok(w>.99);for(let i=0;i<30;i++)w=settle(w,0,1/60);assert.ok(w<.01);assert.equal(settle(.4,1,0),.4);
});
test('clothing tints and head proportion survive storage and presets restore fabric colors',()=>{
 let a=equipPart('sage','topColor','rose');a=equipPart(a,'bottomColor','slate');a=normalizeAppearance({...a,headSize:.85});const b=normalizeAppearance(JSON.parse(JSON.stringify(a)));assert.deepEqual(a,b);assert.equal(appearanceColors(a).top,'#be8c8d');assert.equal(appearanceColors(a).bottom,'#7e95a7');assert.equal(applyOutfitPreset(a,'peach').headSize,.85);assert.equal(appearanceColors(applyOutfitPreset(a,'peach')).top,'#e9aa8e');assert.equal(normalizeAppearance({headSize:Infinity}).headSize,undefined);
});
