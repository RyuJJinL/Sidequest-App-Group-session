// SPDX-License-Identifier: GPL-3.0-or-later
// Appearance is independent of sport, pose and timer state. Legacy full-outfit
// strings remain supported by the renderer and are migrated on app startup.
export const FACES=[
 {id:'soft',label:'Soft smile',group:'female',detail:'Soft oval · the original face',width:30,chin:36,jaw:.65,eyes:5,brows:2,smile:'soft'},
 {id:'bright',label:'Bright smile',group:'female',detail:'Slender cheeks · a bright grin',width:28.5,chin:36,jaw:.62,eyes:5.3,brows:2,smile:'open'},
 {id:'female-round',label:'Round cheeks',group:'female',detail:'Full cheeks · crescent eyes',width:32,chin:34,jaw:.72,eyes:4.6,brows:2,smile:'crescent'},
 {id:'female-heart',label:'Heart shape',group:'female',detail:'Wide cheeks · a tapered chin',width:31,chin:37,jaw:.49,eyes:4.3,brows:2,smile:'soft'},
 {id:'female-oval',label:'Oval & freckles',group:'female',detail:'Long oval · a sprinkle of freckles',width:27.5,chin:39,jaw:.63,eyes:4.5,brows:1.8,smile:'soft',freckles:true},
 {id:'male-classic',label:'Classic',group:'male',detail:'Balanced jaw · an easy smile',width:30,chin:35,jaw:.82,eyes:4.2,brows:3.1,smile:'soft'},
 {id:'male-round',label:'Round smile',group:'male',detail:'Rounded jaw · a cheerful grin',width:32,chin:35,jaw:.78,eyes:4.5,brows:2.8,smile:'open'},
 {id:'male-angular',label:'Angular',group:'male',detail:'Defined cheekbones · a square chin',width:29.5,chin:38,jaw:.9,eyes:3.7,brows:3.2,smile:'soft'}
];
export const HAIRSTYLES=[
 {id:'ponytail',label:'High ponytail',group:'female',detail:'The original flowing ponytail'},
 {id:'bun',label:'Sport bun',group:'female',detail:'Swept up and ready to move'},
 {id:'bob',label:'Chin-length bob',group:'female',detail:'A rounded bob with a soft fringe'},
 {id:'waves',label:'Long waves',group:'female',detail:'Loose, shoulder-length waves'},
 {id:'braid',label:'Side braid',group:'female',detail:'A woven braid with a peach tie'},
 {id:'crop',label:'Textured crop',group:'male',detail:'Tapered sides and a textured fringe'},
 {id:'side-part',label:'Side part',group:'male',detail:'A clean part with a swept fringe'},
 {id:'quiff',label:'Swept quiff',group:'male',detail:'A lifted, swept-back front'},
 {id:'curls',label:'Curly top',group:'male',detail:'Soft curls with close-cut sides'},
 {id:'buzz',label:'Buzz cut',group:'male',detail:'An even, close-cropped cut'}
];
export const SKIN_COLORS=[
 {id:'porcelain',label:'Porcelain',hex:'#f5d8c5'},
 {id:'peach',label:'Peach',hex:'#efb59b'},
 {id:'beige',label:'Warm beige',hex:'#dca382'},
 {id:'golden',label:'Golden',hex:'#c8895e'},
 {id:'tan',label:'Tan',hex:'#b77c58'},
 {id:'warm-brown',label:'Warm brown',hex:'#995f43'},
 {id:'brown',label:'Brown',hex:'#794b37'},
 {id:'deep',label:'Deep brown',hex:'#54382d'}
];
export const HAIR_COLORS=[
 {id:'black',label:'Soft black',hex:'#292b32'},
 {id:'espresso',label:'Espresso',hex:'#65483e'},
 {id:'chestnut',label:'Chestnut',hex:'#88563e'},
 {id:'auburn',label:'Auburn',hex:'#a1533d'},
 {id:'copper',label:'Copper',hex:'#bb6c40'},
 {id:'honey',label:'Honey brown',hex:'#bc8d52'},
 {id:'blonde',label:'Golden blonde',hex:'#ddc18b'},
 {id:'silver',label:'Silver',hex:'#a5adb0'},
 {id:'rose',label:'Dusty rose',hex:'#b27088'},
 {id:'blue',label:'Midnight blue',hex:'#526b99'}
];
export const COLOR_PALETTES={skinColor:SKIN_COLORS,hairColor:HAIR_COLORS};
export const WARDROBE_CATEGORIES=[
 {key:'face',label:'Face',items:FACES},
 {key:'hair',label:'Hair',items:HAIRSTYLES},
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
 sage:Object.freeze({face:'soft',hair:'ponytail',headAccessory:'striped',top:'polo',bottom:'shorts',shoes:'sage',skinColor:'peach',hairColor:'espresso'}),
 peach:Object.freeze({face:'soft',hair:'ponytail',headAccessory:'striped',top:'jacket',bottom:'leggings',shoes:'rose',skinColor:'peach',hairColor:'espresso'})
});
export function normalizeAppearance(value,fallback='sage'){
 const base=OUTFIT_PRESETS[fallback]??OUTFIT_PRESETS.sage;
 if(typeof value==='string')return {...(OUTFIT_PRESETS[value]??base)};
 const result={...base};
 if(value&&typeof value==='object')for(const category of WARDROBE_CATEGORIES){
  if(category.items.some(item=>item.id===value[category.key]))result[category.key]=value[category.key];
 }
 if(value&&typeof value==='object')for(const [key,palette] of Object.entries(COLOR_PALETTES)){
  if(palette.some(color=>color.id===value[key]))result[key]=value[key];
 }
 return result;
}
export function restoreAppearance(saved){return normalizeAppearance(saved?.appearance,saved?.outfit==='peach'?'peach':'sage');}
export function equipPart(appearance,category,id){
 const result=normalizeAppearance(appearance),group=WARDROBE_CATEGORIES.find(c=>c.key===category);
 if(group?.items.some(item=>item.id===id))result[category]=id;
 if(COLOR_PALETTES[category]?.some(color=>color.id===id))result[category]=id;
 return result;
}
export function applyOutfitPreset(appearance,key){
 const result=normalizeAppearance(appearance),preset=OUTFIT_PRESETS[key];
 if(preset)for(const part of ['headAccessory','top','bottom','shoes'])result[part]=preset[part];
 return result;
}
export function appearancePreset(appearance){
 return Object.keys(OUTFIT_PRESETS).find(key=>Object.keys(OUTFIT_PRESETS[key]).every(part=>appearance[part]===OUTFIT_PRESETS[key][part]))??null;
}
