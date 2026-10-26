import {test} from 'node:test';
import assert from 'node:assert/strict';
import {WARDROBE_CATEGORIES,FACES,HAIRSTYLES,SKIN_COLORS,HAIR_COLORS,COLOR_PALETTES,OUTFIT_PRESETS,normalizeAppearance,restoreAppearance,equipPart,applyOutfitPreset,appearancePreset} from '../src/wardrobe.mjs';
import {buildClothing,drawClothedLeg,drawClothedShorts} from '../src/clothing.mjs';
import {appearanceColors} from '../src/appearance-colors.mjs';
import {drawHairBack,drawHead} from '../src/head.mjs';
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
test('every face and hairstyle renders in each sport with mixed clothes and palettes',()=>{
 const {ctx}=canvasRecorder();
 for(const [i,face] of FACES.entries())for(const [j,hair] of HAIRSTYLES.entries())for(const sport of Object.keys(SPORTS)){
  const appearance={...OUTFIT_PRESETS.sage,face:face.id,hair:hair.id,
   skinColor:SKIN_COLORS[i%SKIN_COLORS.length].id,hairColor:HAIR_COLORS[j%HAIR_COLORS.length].id,
   top:(i+j)%2?'polo':'jacket',bottom:i%2?'shorts':'leggings',shoes:j%2?'sage':'rose',headAccessory:['none','sage','striped'][(i+j)%3]};
  drawCharacter(ctx,sport,.42*2*Math.PI,false,SPORTS[sport].color,appearance);
  drawCharacter(ctx,sport,1.2,true,SPORTS[sport].color,appearance);
 }
});
test('the catalog contains exactly the requested male and female face and hair totals',()=>{
 assert.equal(FACES.filter(i=>i.group==='male').length,3);
 assert.equal(FACES.filter(i=>i.group==='female').length,5);
 assert.equal(HAIRSTYLES.filter(i=>i.group==='male').length,5);
 assert.equal(HAIRSTYLES.filter(i=>i.group==='female').length,5);
 for(const list of [FACES,HAIRSTYLES,SKIN_COLORS,HAIR_COLORS])assert.equal(new Set(list.map(i=>i.id)).size,list.length);
});
test('skin and hair palettes save independently of face, hairstyle, clothes and each other',()=>{
 const original={...OUTFIT_PRESETS.peach,face:'male-angular',hair:'crop'};
 for(const [key,colors] of Object.entries(COLOR_PALETTES))for(const color of colors){
  const next=equipPart(original,key,color.id);
  assert.equal(next[key],color.id);
  for(const part of Object.keys(original))if(part!==key)assert.equal(next[part],original[part]);
  assert.deepEqual(restoreAppearance(JSON.parse(JSON.stringify({appearance:next}))),next);
 }
 const old={face:'bright',hair:'bun',top:'polo',bottom:'leggings',shoes:'rose',headAccessory:'none'};
 assert.deepEqual(restoreAppearance({appearance:old}),{...old,skinColor:'peach',hairColor:'espresso'});
 assert.equal(appearancePreset(equipPart(OUTFIT_PRESETS.sage,'skinColor','deep')),null);
 assert.deepEqual(equipPart(original,'hairColor','not-a-color'),original);
});
test('trying a clothing set preserves the chosen face, hairstyle, skin and hair colors',()=>{
 const custom={...OUTFIT_PRESETS.sage,face:'male-angular',hair:'quiff',skinColor:'deep',hairColor:'silver'};
 const next=applyOutfitPreset(custom,'peach');
 for(const key of ['face','hair','skinColor','hairColor'])assert.equal(next[key],custom[key]);
 for(const key of ['headAccessory','top','bottom','shoes'])assert.equal(next[key],OUTFIT_PRESETS.peach[key]);
});
test('every skin tone reaches the face, neck, arms, bare legs and racket fingers',()=>{
 for(const skin of SKIN_COLORS)for(const sport of ['walking','tennis','padel','tabletennis','badminton']){
  const a={...OUTFIT_PRESETS.sage,skinColor:skin.id,headAccessory:'none'},rec=canvasRecorder();
  drawCharacter(rec.ctx,sport,.42*2*Math.PI,false,SPORTS[sport].color,a);
  assert.ok(rec.fills.filter(c=>c===skin.hex).length>=10,'all exposed surfaces share the selected skin tone');
  if(skin.id!=='peach')assert.equal(rec.fills.includes('#efb59b'),false,'no original peach skin may leak through a new tone');
 }
});
test('all hairstyles use the chosen hair fill and produce distinct vector shapes',()=>{
 const fingerprints=[];
 for(const hair of HAIRSTYLES){
  const a={...OUTFIT_PRESETS.sage,hair:hair.id,headAccessory:'none',hairColor:'blue'},colors=appearanceColors(a),rec=canvasRecorder(),commands=[];
  for(const name of ['moveTo','lineTo','bezierCurveTo','quadraticCurveTo','ellipse','arc']){
   const original=rec.ctx[name];rec.ctx[name]=(...args)=>{original(...args);commands.push([name,...args]);};
  }
  drawHairBack(rec.ctx,{x:0,y:0},0,a,colors);drawHead(rec.ctx,{x:0,y:0},0,a,colors);
  assert.ok(rec.fills.includes(colors.hair));assert.equal(rec.fills.includes('#65483e'),false);
  fingerprints.push(JSON.stringify(commands));
 }
 assert.equal(new Set(fingerprints).size,10,'each hairstyle must have its own geometry');
});
