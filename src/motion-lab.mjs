// SPDX-License-Identifier: GPL-3.0-or-later
import {SPORTS,drawCharacter,pose} from './sports.mjs';
import {settle} from './tennis.mjs';
import {WARDROBE_CATEGORIES,COLOR_PALETTES,normalizeAppearance,applyOutfitPreset,appearancePreset,OUTFIT_PRESETS} from './wardrobe.mjs';
const $=s=>document.querySelector(s),canvas=$('#tennis'),ctx=canvas.getContext('2d');
let saved={};try{saved=JSON.parse(localStorage.getItem('sidequest-v1'))??{};}catch{}
let appearance=normalizeAppearance(saved.appearance,saved.outfit==='peach'?'peach':'sage');
let playing=!matchMedia('(prefers-reduced-motion: reduce)').matches,seconds=0,last=null,weight=1,target=1,game=null;
const controls=[];
function save(){try{const current=JSON.parse(localStorage.getItem('sidequest-v1'))??{};localStorage.setItem('sidequest-v1',JSON.stringify({...current,appearance}));$('#save-status').textContent='Your character is saved. The timer uses the same wardrobe.';}catch{$('#save-status').textContent='Your character is ready for this visit.';}}
function field(label,key,items){const wrapper=document.createElement('label'),select=document.createElement('select');select.id='look-'+key;wrapper.append(label,select);for(const item of items){const option=document.createElement('option');option.value=item.id;option.textContent=(item.group?item.group==='male'?'Male · ':'Female · ':'')+item.label;select.append(option);}select.addEventListener('change',()=>{appearance=normalizeAppearance({...appearance,[key]:select.value});$('#outfit').value='custom';save();});$('#customization').append(wrapper);controls.push({select,key});}
for(const c of WARDROBE_CATEGORIES)field(c.label,c.key,c.items);
for(const [key,items]of Object.entries(COLOR_PALETTES))field({skinColor:'Skin tone',hairColor:'Hair color',topColor:'Top color',bottomColor:'Bottom color'}[key],key,items);
const headLabel=document.createElement('label');headLabel.textContent='Head size';const head=document.createElement('input');head.id='look-headSize';head.type='range';head.min='.75';head.max='1.25';head.step='.05';headLabel.append(head);$('#customization').append(headLabel);head.addEventListener('input',()=>{appearance=normalizeAppearance({...appearance,headSize:Number(head.value)});save();});
function sync(){for(const {select,key}of controls)select.value=appearance[key]??'original';head.value=appearance.headSize??1;}
sync();$('#outfit').value=appearancePreset(appearance)??'custom';
$('#outfit').addEventListener('change',e=>{if(e.target.value!=='custom')appearance=applyOutfitPreset(appearance,e.target.value);sync();save();});
$('#reset-look').addEventListener('click',()=>{appearance=normalizeAppearance(OUTFIT_PRESETS.sage);$('#outfit').value='sage';sync();save();});
$('#use-tennis').addEventListener('click',()=>{try{const s=JSON.parse(localStorage.getItem('sidequest-v1'))??{};localStorage.setItem('sidequest-v1',JSON.stringify({...s,sport:'tennis',appearance}));}catch{}});
function playState(){const b=$('#play');b.textContent=playing?'Ⅱ Pause':'▶ Play';b.setAttribute('aria-pressed',String(playing));}
playState();$('#play').addEventListener('click',()=>{playing=!playing;playState();});
$('#ready').addEventListener('click',()=>{target=target===1?0:1;if(target===1)seconds=0;playing=true;$('#ready').textContent=target===1?'Try swing → ready':'Try ready → swing';playState();});
$('#phase').addEventListener('input',e=>{seconds=Number(e.target.value)/100*SPORTS.tennis.period;playing=false;weight=target=1;playState();});
function setGame(){if(!game)return;const mode=$('#game-mode').value;$('#game-clip').disabled=mode!=='original';game.setMode?.(mode,$('#game-clip').value);$('#game-status').textContent=mode==='badminton'?'Game artwork · authored badminton motion':'Recovered original animation';}
$('#game-mode').addEventListener('change',setGame);$('#game-clip').addEventListener('change',()=>{seconds=0;setGame();});
function skeleton(c,m){c.save();c.strokeStyle='#ccf7a5bb';c.fillStyle='#fff7d6';c.lineWidth=1;for(const a of m.arms.concat(m.legs)){const points=a.wrist?[a.shoulder,a.elbow,a.wrist]:[a.hip,a.knee,a.ankle];c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();for(const p of points){c.beginPath();c.arc(p.x,p.y,2,0,Math.PI*2);c.fill();}}c.restore();}
function frame(now){const dt=last===null?0:Math.min(.05,(now-last)/1000);last=now;const speed=Number($('#speed').value);if(playing)seconds+=dt*speed;weight=settle(weight,target,playing?dt*speed:0);const phase=seconds/SPORTS.tennis.period*Math.PI*2,legacy=$('#renderer').value==='legacy';ctx.clearRect(0,0,640,650);ctx.save();ctx.translate(315,340);ctx.scale(1.65,1.65);ctx.fillStyle='#0e251c66';ctx.beginPath();ctx.ellipse(0,149,65,7,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a8bb8a22';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-140,153);ctx.lineTo(140,153);ctx.stroke();const options={legacy,weight,time:seconds};drawCharacter(ctx,'tennis',phase,weight<.001,SPORTS.tennis.color,appearance,options);if($('#rig').checked)skeleton(ctx,pose('tennis',phase,false,options).front);ctx.restore();const t=((seconds/SPORTS.tennis.period)%1+1)%1;$('#phase').value=t*100;$('#phase-value').textContent=Math.round(t*100)+'%';$('#stroke-label').textContent=weight<.01?'Ready stance':t<.34?'Preparation':t<.48?'Contact & release':t<.76?'Follow-through':'Recovery';if(game){const mode=$('#game-mode').value,clip=$('#game-clip').value,duration=mode==='badminton'?3.2:(game.clips.find(c=>c.name===clip)?.duration||2.2);game.draw(t*duration,{mode,clip});}requestAnimationFrame(frame);}
requestAnimationFrame(frame);
const clipLabels={
 '常规互动动画/走路':'Walking', '常规互动动画/跑步':'Running', '待机动画/待机':'Idle',
 '待机动画/待机_伸懒腰':'Idle · stretch', '待机动画/待机_环顾四周':'Idle · look around',
 '待机动画/头发飘动':'Hair movement', '姿势/姿势_舞2':'Dance pose',
 '物品交互动画/书_仔细看':'Reading a book', '物品交互动画/鱼竿_抛竿_右手':'Fishing · cast',
 '物品交互动画/鱼竿_收竿_右手':'Fishing · retrieve', '物品交互动画/游戏手柄_认真玩_右手':'Gaming · concentrate',
 '物品交互动画/哑铃_轻松_右手':'Dumbbell · easy repetition', '物品交互动画/吉他_普通_右手':'Playing guitar',
 '物品交互动画/笔_黑板书写_右手':'Writing on a board', '常规互动动画/喝东西':'Drinking',
 '常规互动动画/坐下':'Sitting down', '常规互动动画/水下潜泳':'Underwater swimming'
};
try{const {mountGameReference}=await import('./game-reference.mjs');game=await mountGameReference($('#game'),{onStatus:message=>{$('#game-status').textContent=message;}});$('#game-clip').replaceChildren(...[...game.clips].sort((a,b)=>Number(Boolean(clipLabels[b.name]))-Number(Boolean(clipLabels[a.name]))).map(clip=>{const o=document.createElement('option');o.value=clip.name;o.textContent=clipLabels[clip.name]?clipLabels[clip.name]+' · '+clip.name:clip.name;return o;}));const idle=game.clips.find(c=>c.name==='待机动画/待机')??game.clips.find(c=>c.name.includes('待机'));if(idle)$('#game-clip').value=idle.name;setGame();}catch(e){$('#game-status').textContent='Recovered assets are unavailable in this copy. Open the private comparison site.';console.error(e);}
