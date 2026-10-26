import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WARDROBE_CATEGORIES,OUTFIT_PRESETS,normalizeAppearance,restoreAppearance,equipPart,appearancePreset} from '../src/wardrobe.mjs';
import {buildClothing,drawClothedLeg,drawClothedShorts} from '../src/clothing.mjs';
import {SPORTS,pose,drawCharacter} from '../src/sports.mjs';

test('old full outfits migrate without losing track clothing or changing timer preferences',()=>{
 for(const outfit of ['sage','peach']){
  const saved={outfit,sport:'padel',settings:{focus:40},task:'Read a chapter',sound:false};
  const before=structuredClone(saved);
  assert.deepEqual(restoreAppearance(saved),OUTFIT_PRESETS[outfit]);
  assert.deepEqual(saved,before);
 }
 const custom={...OUTFIT_PRESETS.peach,top:'polo',shoes:'sage',hair:'bun'};
 assert.deepEqual(restoreAppearance({outfit:'peach',appearance:custom}),custom);
 assert.deepEqual(restoreAppearance(null),OUTFIT_PRESETS.sage);
 assert.equal(restoreAppearance({outfit:'peach',appearance:{top:'invalid'}}).top,'jacket');
});
test('equipping any of the six categories changes only that part and survives JSON storage',()=>{
 for(const category of WARDROBE_CATEGORIES)for(const item of category.items){
  const original=normalizeAppearance('peach'),next=equipPart(original,category.key,item.id);
  assert.equal(next[category.key],item.id);
  for(const other of WARDROBE_CATEGORIES)if(other.key!==category.key)assert.equal(next[other.key],original[other.key]);
  assert.deepEqual(original,OUTFIT_PRESETS.peach,'presets are not mutated');
  assert.deepEqual(restoreAppearance(JSON.parse(JSON.stringify({appearance:next}))),next);
 }
 assert.deepEqual(equipPart(OUTFIT_PRESETS.sage,'top','unknown'),OUTFIT_PRESETS.sage);
 assert.deepEqual(equipPart(OUTFIT_PRESETS.sage,'unknown','jacket'),OUTFIT_PRESETS.sage);
 assert.equal(appearancePreset(normalizeAppearance('peach')),'peach');
 assert.equal(appearancePreset(equipPart(OUTFIT_PRESETS.peach,'top','polo')),null);
});
function canvasRecorder(){
 const fills=[],ctx={};
 for(const name of ['save','restore','beginPath','closePath','stroke','clip'])ctx[name]=()=>{};
 ctx.fill=()=>fills.push(ctx.fillStyle);
 for(const name of ['translate','rotate','scale','moveTo','lineTo','quadraticCurveTo','bezierCurveTo','fillRect','arc','ellipse'])ctx[name]=(...args)=>assert.ok(args.filter(v=>typeof v==='number').every(Number.isFinite));
 return {ctx,fills};
}
test('polo with leggings and jacket with bare shorts render the selected bottoms independently',()=>{
 for(const top of ['polo','jacket'])for(const bottom of ['shorts','leggings']){
  const appearance={...OUTFIT_PRESETS.sage,top,bottom},m=buildClothing(pose('tennis',1.2).front,appearance);
  assert.equal(m.jacket,top==='jacket');assert.equal(m.leggings,bottom==='leggings');
  const {ctx,fills}=canvasRecorder();drawClothedLeg(ctx,m,-1);
  assert.equal(fills[0],bottom==='leggings'?'#55545a':'#efb59b','leg covering must follow bottoms, never the top');
  fills.length=0;drawClothedShorts(ctx,m);
  assert.equal(fills[0],bottom==='leggings'?'#be8c8d':'#f1dfbf','shorts colour must follow the selected bottoms');
  assert.equal(m.bareArms.length,top==='polo'?2:0,'sleeves depend only on the top');
 }
});
test('all 96 complete combinations render across every sport without invalid geometry',()=>{
 let combinations=[{}];
 for(const category of WARDROBE_CATEGORIES)combinations=combinations.flatMap(a=>category.items.map(item=>({...a,[category.key]:item.id})));
 assert.equal(combinations.length,96);
 const {ctx}=canvasRecorder();
 for(const appearance of combinations)for(const sport of Object.keys(SPORTS)){
  drawCharacter(ctx,sport,.42*2*Math.PI,false,SPORTS[sport].color,appearance);
  drawCharacter(ctx,sport,1.2,true,SPORTS[sport].color,appearance);
 }
});
