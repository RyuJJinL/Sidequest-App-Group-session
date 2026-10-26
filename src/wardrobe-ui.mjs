// SPDX-License-Identifier: GPL-3.0-or-later
import {WARDROBE_CATEGORIES,OUTFIT_PRESETS,normalizeAppearance,equipPart,appearancePreset} from './wardrobe.mjs';
import {drawIllustratedFigure} from './character.mjs';
import {frontRunPose} from './running.mjs';
import {SPORTS,drawCharacter} from './sports.mjs';

const CROPS={face:[0,-103,1.45],hair:[14,-117,1.12],headAccessory:[0,-123,1.6],top:[0,-38,1.45],bottom:[0,63,.83],shoes:[0,128,2.05]};
const PRESET_LABELS={sage:'Court classic',peach:'Track club'};
export function mountWardrobe({getAppearance,onChange,getSport,onSportChange}){
 const $=s=>document.querySelector(s),dialog=$('#wardrobe-dialog'),tabs=$('#wardrobe-tabs'),items=$('#wardrobe-items');
 const preview=$('#wardrobe-preview'),ctx=preview.getContext('2d');
 let category=WARDROBE_CATEGORIES[0];
 function status(message){$('#wardrobe-status').textContent=message;}
 function choose(next,message){const persisted=onChange(next);render();status(persisted===false?`${message} equipped for this visit.`:`${message} equipped. Look saved.`);}
 function thumbnail(canvas,key,id){
  const c=canvas.getContext('2d'),[x,y,scale]=CROPS[key];
  c.clearRect(0,0,180,150);c.save();c.translate(90-x*scale,75-y*scale);c.scale(scale,scale);
  drawIllustratedFigure(c,frontRunPose(0,true),0,equipPart(getAppearance(),key,id));c.restore();
 }
 function buildItems(){
  $('#wardrobe-category-title').textContent=category.label;
  items.dataset.count=category.items.length;
  items.setAttribute('aria-labelledby',`wardrobe-tab-${category.key}`);
  items.replaceChildren(...category.items.map(item=>{
   const button=document.createElement('button');button.type='button';button.className='closet-item';button.dataset.wardrobeOption=item.id;
   button.setAttribute('aria-label',item.label);button.setAttribute('aria-pressed','false');
   const art=document.createElement('span');art.className='closet-item-art';
   const canvas=document.createElement('canvas');canvas.width=180;canvas.height=150;canvas.setAttribute('aria-hidden','true');art.append(canvas);
   const label=document.createElement('span');label.className='closet-item-name';label.textContent=item.label;
   const tick=document.createElement('span');tick.className='closet-tick';tick.setAttribute('aria-hidden','true');tick.textContent='✓';label.append(tick);
   const detail=document.createElement('small');detail.textContent=item.detail;button.append(art,label,detail);
   button.addEventListener('click',()=>choose(equipPart(getAppearance(),category.key,item.id),item.label));
   return button;
  }));
 }
 function selectCategory(next,focus=false){
  category=next;buildItems();render();
  if(focus)$(`#wardrobe-tab-${category.key}`).focus();
 }
 for(const [i,group] of WARDROBE_CATEGORIES.entries()){
  const b=document.createElement('button');b.type='button';b.id=`wardrobe-tab-${group.key}`;b.dataset.wardrobeCategory=group.key;b.setAttribute('role','tab');b.setAttribute('aria-controls','wardrobe-items');
  const label=document.createElement('span');label.textContent=group.label;
  const selected=document.createElement('small');selected.className='closet-current';b.append(label,selected);
  b.addEventListener('click',()=>selectCategory(group));
  b.addEventListener('keydown',event=>{
   if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
   event.preventDefault();const index=event.key==='Home'?0:event.key==='End'?5:(i+(['ArrowRight','ArrowDown'].includes(event.key)?1:5))%6;
   selectCategory(WARDROBE_CATEGORIES[index],true);
  });tabs.append(b);
 }
 for(const key of Object.keys(OUTFIT_PRESETS)){
  const b=document.createElement('button');b.type='button';b.dataset.wardrobePreset=key;b.setAttribute('aria-pressed','false');
  const swatches=document.createElement('span');swatches.className=`closet-swatches ${key}`;swatches.setAttribute('aria-hidden','true');
  for(let i=0;i<3;i++)swatches.append(document.createElement('i'));
  b.append(swatches,document.createTextNode(PRESET_LABELS[key]));
  b.addEventListener('click',()=>choose(normalizeAppearance(key),PRESET_LABELS[key]));$('#wardrobe-presets').append(b);
 }
 for(const [key,s] of Object.entries(SPORTS)){
  const option=document.createElement('option');option.value=key;option.textContent=s.name;$('#wardrobe-sport').append(option);
 }
 $('#wardrobe-sport').addEventListener('change',event=>{onSportChange(event.target.value);render();});
 $('#wardrobe-open').addEventListener('click',()=>{render();status('Changes apply immediately');dialog.showModal();});
 $('#wardrobe-close').addEventListener('click',()=>dialog.close());
 $('#wardrobe-done').addEventListener('click',()=>dialog.close());
 function render(){
  const appearance=getAppearance(),preset=appearancePreset(appearance);
  $('#look-name').textContent=preset?PRESET_LABELS[preset]:'Your custom mix';
  for(const group of WARDROBE_CATEGORIES){
   const b=$(`#wardrobe-tab-${group.key}`),active=category.key===group.key;
   b.setAttribute('aria-selected',active);b.tabIndex=active?0:-1;
   b.querySelector('.closet-current').textContent=group.items.find(item=>item.id===appearance[group.key]).label;
  }
  for(const b of document.querySelectorAll('[data-wardrobe-preset]'))b.setAttribute('aria-pressed',b.dataset.wardrobePreset===preset);
  for(const b of items.querySelectorAll('[data-wardrobe-option]')){
   const active=b.dataset.wardrobeOption===appearance[category.key];b.setAttribute('aria-pressed',active);
   thumbnail(b.querySelector('canvas'),category.key,b.dataset.wardrobeOption);
  }
  $('#wardrobe-sport').value=getSport();
  $('#wardrobe-preview-name').textContent=preset?PRESET_LABELS[preset]:'Made by you';
 }
 function paintPreview(phase,reducedMotion){
  if(!dialog.open)return;
  const sport=getSport(),resting=reducedMotion||!$('#wardrobe-motion').checked;
  ctx.clearRect(0,0,480,660);ctx.save();ctx.translate(205,350);ctx.scale(1.9,1.9);
  ctx.fillStyle='#102a2255';ctx.beginPath();ctx.ellipse(0,139,57,6,0,0,Math.PI*2);ctx.fill();
  drawCharacter(ctx,sport,phase,resting,SPORTS[sport].color,getAppearance());ctx.restore();
 }
 buildItems();render();
 return {render,paintPreview};
}
