// SPDX-License-Identifier: GPL-3.0-or-later
// Appearance is independent of sport, pose and timer state. Legacy full-outfit
// strings remain supported by the renderer and are migrated on app startup.
export const WARDROBE_CATEGORIES=[
 {key:'face',label:'Face',items:[
  {id:'soft',label:'Soft smile',detail:'Your original easygoing expression'},
  {id:'bright',label:'Bright smile',detail:'A little extra good energy'}]},
 {key:'hair',label:'Hair',items:[
  {id:'ponytail',label:'High ponytail',detail:'The original flowing ponytail'},
  {id:'bun',label:'Sport bun',detail:'Swept up and ready to move'}]},
 {key:'headAccessory',label:'Head accessory',items:[
  {id:'striped',label:'Retro headband',detail:'Peach, cream and slate stripes'},
  {id:'sage',label:'Sage headband',detail:'A simple court-green band'},
  {id:'none',label:'No headband',detail:'Keep it simple'}]},
 {key:'top',label:'Tops',items:[
  {id:'polo',label:'Sage polo',detail:'Court classic · short sleeves'},
  {id:'jacket',label:'Track jacket',detail:'Track club · peach, cream and slate'}]},
 {key:'bottom',label:'Bottoms',items:[
  {id:'shorts',label:'Cream shorts',detail:'Court classic · white crew socks'},
  {id:'leggings',label:'Shorts + leggings',detail:'Track club · mauve over charcoal'}]},
 {key:'shoes',label:'Shoes',items:[
  {id:'sage',label:'Sage sneakers',detail:'Court classic · cream and green'},
  {id:'rose',label:'Rose sneakers',detail:'Track club · cream and dusty rose'}]}
];
export const OUTFIT_PRESETS=Object.freeze({
 sage:Object.freeze({face:'soft',hair:'ponytail',headAccessory:'striped',top:'polo',bottom:'shorts',shoes:'sage'}),
 peach:Object.freeze({face:'soft',hair:'ponytail',headAccessory:'striped',top:'jacket',bottom:'leggings',shoes:'rose'})
});
export function normalizeAppearance(value,fallback='sage'){
 const base=OUTFIT_PRESETS[fallback]??OUTFIT_PRESETS.sage;
 if(typeof value==='string')return {...(OUTFIT_PRESETS[value]??base)};
 const result={...base};
 if(value&&typeof value==='object')for(const category of WARDROBE_CATEGORIES){
  if(category.items.some(item=>item.id===value[category.key]))result[category.key]=value[category.key];
 }
 return result;
}
export function restoreAppearance(saved){return normalizeAppearance(saved?.appearance,saved?.outfit==='peach'?'peach':'sage');}
export function equipPart(appearance,category,id){
 const result=normalizeAppearance(appearance),group=WARDROBE_CATEGORIES.find(c=>c.key===category);
 if(group?.items.some(item=>item.id===id))result[category]=id;
 return result;
}
export function appearancePreset(appearance){
 return Object.keys(OUTFIT_PRESETS).find(key=>WARDROBE_CATEGORIES.every(c=>appearance[c.key]===OUTFIT_PRESETS[key][c.key]))??null;
}
