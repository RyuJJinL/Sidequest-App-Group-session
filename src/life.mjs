// SPDX-License-Identifier: GPL-3.0-or-later
// Entertainment, learning, wellness, causes and travel: original cyclic poses
// on the same fixed-bone, clothed avatar. Props derive from solved contacts.
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
import {chain,limb} from './actions.mjs';
import {drawPeer} from './leisure.mjs';
const TAU=Math.PI*2,INK='#543c35';
export const LIFE_ACTIVITIES={
 moviewatchparties:{name:'Movie Watch Parties',icon:'▷',verb:'Settle into a story',detail:'A shared moment. A little imagination.',period:5.8,color:'#c9b8d8',family:'entertainment'},
 sportswatchparties:{name:'Sports Watch Parties',icon:'⚑',verb:'Share the excitement',detail:'A good rally. A little team spirit.',period:3.6,color:'#c3d791',family:'entertainment'},
 concertmeetups:{name:'Concert Meetups',icon:'♬',verb:'Find a shared rhythm',detail:'Good company. A little live energy.',period:3.8,color:'#d6b6d8',family:'entertainment'},
 anime:{name:'Anime',icon:'✧',verb:'Let imagination lead',detail:'A little courage. A world of stories.',period:4.2,color:'#b7c4eb',family:'entertainment'},
 gaming:{name:'Gaming',icon:'⊞',verb:'Enjoy the next challenge',detail:'Stay curious. Find your next move.',period:3.1,color:'#a2cbbf',family:'entertainment'},
 theater:{name:'Theater',icon:'❦',verb:'Give a moment your attention',detail:'A shared story. A little applause.',period:5.2,color:'#dfb7ac',family:'entertainment'},
 languageexchange:{name:'Language Exchange',icon:'↔',verb:'Find a new way to connect',detail:'Listen, share, and try another word.',period:5.6,color:'#b7d4bc',family:'learning'},
 coding:{name:'Coding',icon:'⌘',verb:'Build one thought at a time',detail:'A small idea. A useful next step.',period:3.4,color:'#aecbdc',family:'learning'},
 workshops:{name:'Workshops',icon:'⊡',verb:'Learn by making',detail:'A steady hand. A new possibility.',period:4.2,color:'#d9c09c',family:'learning'},
 reading:{name:'Book Clubs / Reading',icon:'▤',verb:'Follow the next page',detail:'Make space for a different perspective.',period:6.2,color:'#c9c5a0',family:'learning'},
 skillclasses:{name:'Skill Classes',icon:'⌁',verb:'Make practice a little ritual',detail:'Try a stitch. Learn something new.',period:4.8,color:'#d3b7cb',family:'learning'},
 publicspeaking:{name:'Public Speaking',icon:'◖',verb:'Give your ideas a voice',detail:'One clear thought. A little confidence.',period:4.6,color:'#b4cbbc',family:'learning'},
 financialliteracy:{name:'Financial Literacy',icon:'◉',verb:'Make room to learn',detail:'A little attention. A clearer picture.',period:5.8,color:'#c8c99a',family:'learning'},
 diy:{name:'DIY',icon:'⊕',verb:'Make it your own',detail:'A small fix. Something to be proud of.',period:4.4,color:'#d8bd9c',family:'learning'},
 meditation:{name:'Meditation',icon:'◯',verb:'Be here for a moment',detail:'A quiet pause. A little room to breathe.',period:7.2,color:'#bfd1b7',family:'wellness'},
 breathwork:{name:'Breathwork',icon:'◎',verb:'Settle into a softer rhythm',detail:'Make a little space for yourself.',period:6.8,color:'#add2cb',family:'wellness'},
 recovery:{name:'Recovery',icon:'⌇',verb:'Give yourself a little time',detail:'Gentle movement. An unhurried pace.',period:5.6,color:'#c3c9da',family:'wellness'},
 wellnessactivities:{name:'Wellness Activities',icon:'∿',verb:'Move a little more gently',detail:'A small stretch. A fresh perspective.',period:6.2,color:'#d6c3ae',family:'wellness'},
 volunteering:{name:'Volunteering',icon:'♡',verb:'Make a small contribution',detail:'Thoughtful hands. A little shared good.',period:5.2,color:'#b6cda7',family:'causes'},
 cleanups:{name:'Cleanups',icon:'♧',verb:'Care for a shared place',detail:'One small pickup makes a difference.',period:5.4,color:'#b8c995',family:'causes'},
 charityactivities:{name:'Charity Activities',icon:'♥',verb:'Share a little kindness',detail:'A thoughtful gesture. A little connection.',period:5.6,color:'#d8b0b0',family:'causes'},
 animalwelfare:{name:'Animal Welfare',icon:'♧',verb:'Make room for a little care',detail:'A gentle hand. A friendly companion.',period:4.8,color:'#c9bd9f',family:'causes'},
 communityprojects:{name:'Community Projects',icon:'▧',verb:'Build something together',detail:'A small effort. A shared place.',period:4.6,color:'#afc5b1',family:'causes'},
 daytrips:{name:'Day Trips',icon:'⌕',verb:'See a little further',detail:'A fresh view. A little curiosity.',period:5.8,color:'#c7c79e',family:'travel'},
 citywalks:{name:'City Walks',icon:'▥',verb:'Notice something new',detail:'A city block. A different perspective.',period:1.9,color:'#bec5d3',family:'travel'},
 heritagetours:{name:'Heritage Tours',icon:'▦',verb:'Follow a story through time',detail:'Look a little closer. Find a new detail.',period:5.4,color:'#d5c49f',family:'travel'},
 roadtrips:{name:'Road Trips',icon:'⊚',verb:'Enjoy a change of scenery',detail:'A new route. A little open space.',period:4.8,color:'#adc8c8',family:'travel'},
 islandhopping:{name:'Island Hopping',icon:'≈',verb:'Find a fresh horizon',detail:'A gentle rhythm. Another little adventure.',period:4.6,color:'#a8d3c4',family:'travel'}
};
for(const [id,a]of Object.entries(LIFE_ACTIVITIES))Object.assign(a,{previewScale:['islandhopping','cleanups'].includes(id)?1.15:['concertmeetups','sportswatchparties','languageexchange','daytrips','heritagetours'].includes(id)?1.2:1.4,previewX:240,ground:false});
export const LIFE_IDS=Object.keys(LIFE_ACTIVITIES);
const point=(x,y,z=0)=>({x,y,z}),mix=(a,b,t)=>a+(b-a)*t;
const sample=(keys,t)=>sampleAnglePath(keys.map(([p,...v])=>[p*TAU,...v]),t*TAU);
const target=(x,y,z=24)=>point(x/(1+z*.0012),y,z);
const unit=x=>((x%1)+1)%1,clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const SEATED=['moviewatchparties','gaming','languageexchange','coding','reading','skillclasses','financialliteracy','recovery','roadtrips','islandhopping'];
function solve(start,end,side,type,pole){const [a,b]=type==='leg'?[62,60]:[39,33],c=chain(start,end,a,b,pole??point(side*(type==='leg'?.15:1),0,type==='leg'?1:.35));return {...limb(start,c.middle,c.end,side,type),handOpen:false};}
const lift=t=>sample([[0,0,0,0],[.16,0,0,0],[.39,1,0,0],[.59,1,0,0],[.85,0,0,0]],t)[0];
const reach=t=>sample([[0,0,0,0],[.18,0,0,0],[.38,1,0,0],[.52,1,0,0],[.82,0,0,0]],t)[0];
const donation=t=>sample([[0,50,5,0],[.16,50,5,0],[.37,7,29,0],[.50,7,29,0],[.65,8,17,0],[.86,50,5,0]],t);
const cleaning=t=>sample([[0,32,33,.50],[.18,34,32,.50],[.40,17,-9,.08],[.60,-10,-28,-.38],[.69,-10,-28,-.38],[.89,32,33,.50]],t);
export function lifePose(id,phase,resting=false){
 if(!LIFE_ACTIVITIES[id])throw new Error('Unknown life activity');
 const t=resting?0:unit(phase/TAU),p=t*TAU,sin=resting?0:Math.sin(p),pulse=resting?0:(1-Math.cos(p))/2;
 let x=0,y=SEATED.includes(id)?43:8,lean=0;
 if(id==='coding')y=56;
 if(['meditation','animalwelfare'].includes(id))y=id==='meditation'?100:80;
 if(id==='cleanups'){y=38;lean=12;}
 if(['workshops','diy','volunteering','communityprojects'].includes(id))y=30;
 if(id==='recovery')y=60;
 if(id==='islandhopping')y=43+sin*3;
 if(id==='sportswatchparties')y=8+pulse*4;
 if(['anime','wellnessactivities','citywalks'].includes(id))x=sin*3;
 if(id==='citywalks')y=8+Math.cos(p*2)*1.5;
 if(id==='communityprojects')x=-20;
 if(id==='theater')lean=sample([[0,0,0,0],[.48,0,0,0],[.68,12,0,0],[.84,0,0,0]],t)[0];
 const hip=point(x,y),neck=point(x*.7+(id==='wellnessactivities'?sin*4:0),y-78+lean-(['meditation','breathwork'].includes(id)?pulse*2:0));
 const legs=[-1,1].map(side=>{
  const root=point(hip.x+side*13,hip.y);
  if(id==='meditation')return solve(root,point(-side*10,122,25),side,'leg',point(side,0,1));
  if(id==='animalwelfare'){
   const k=chain(root,point(side*24,116,-18),62,60,point(side*.2,0,1));return {...limb(root,k.middle,k.end,side,'leg'),handOpen:false};
  }
  if(id==='recovery'&&side===1)return solve(root,point(24,99+sin*4,75),side,'leg');
  const stride=id==='citywalks'&&!resting?Math.max(0,Math.sin(p+(side===1?0:Math.PI)))**2:0;
  return solve(root,point(hip.x+side*(id==='anime'?33:26),122-stride*15,4+stride*16),side,'leg');
 });
 const angle=id==='gaming'?sin*.07:id==='roadtrips'?sin*.20:0;
 const turn=resting?0:Math.sin(Math.PI*t)**4,offer=pulse,clap=resting?0:(1-Math.cos(p*3))/2;
 const arms=[-1,1].map(side=>{
  const shoulder=point(neck.x+side*25,neck.y+16);let end;
  if(id==='moviewatchparties')end=side===1?target(mix(12,9,lift(t)),mix(27,neck.y+3,lift(t)),24):target(-32,30,25);
  if(id==='sportswatchparties')end=side===1?target(43,neck.y-23-pulse*12,24):target(-36,neck.y+31+sin*13,24);
  if(id==='concertmeetups')end=target(side*(46+sin*5),neck.y-21+side*sin*13,23);
  if(id==='anime')end=side===1?target(51,neck.y+30-sin*6,40):target(-32,hip.y-12,24);
  if(id==='gaming')end=target(side*16*Math.cos(angle),38+side*16*Math.sin(angle),25);
  if(id==='theater')end=target(side*(22-clap*17),neck.y+39+clap*2,28);
  if(id==='languageexchange')end=side===1?target(45,mix(22,neck.y+12,lift(t)),25):target(-28,hip.y-9+sin*2,25);
  if(id==='coding')end=target(side*20,53+(resting?0:Math.sin(p*4+side)*1.5),25);
  if(id==='workshops')end=side===1?target(29,15-reach(t)*25,24):target(-28,31,24);
  if(id==='reading')end=side===1?target(25-turn*37,31-turn*8,25):target(-28,38,25);
  if(id==='skillclasses')end=target(side*18,26+side*sin*5,25);
  if(id==='publicspeaking')end=side===1?target(42,neck.y+35-sin*5,26):target(-36,neck.y+42+sin*6,25);
  if(id==='financialliteracy'){
   const [rx,ry]=sample([[0,8,35,0],[.16,8,35,0],[.38,47,22,0],[.50,47,22,0],[.64,43,17,0],[.84,8,35,0]],t);
   end=side===1?target(rx,ry,25):target(-32,39+(resting?0:Math.sin(p*3)**2),25);
  }
  if(id==='diy')end=side===1?target(29,8,25+(resting?0:Math.sin(p*3)*2)):target(-15,32,24);
  if(id==='meditation')end=target(side*43,101+pulse,22);
  if(id==='breathwork')end=side===-1?target(-4,neck.y+52,27):target(4,hip.y-13,28);
  if(id==='recovery')end=target(side*20,24-sin*2,25);
  if(id==='wellnessactivities')end=side===1?target(50+sin*5,neck.y-35,24):target(hip.x-34,hip.y-11,25);
  if(id==='volunteering'){const [rx,ry]=donation(t);end=side===1?target(rx,ry,25):target(-24,33,23);}
  if(id==='cleanups'){const [rx,ry]=cleaning(t);end=side===1?target(rx,ry,25):target(-31,45,25);}
  if(id==='charityactivities')end=target(side*(20+4*offer),hip.y-12-offer*10,22+offer*26);
  if(id==='animalwelfare')end=side===1?target(52+sin*5,78+(resting?0:Math.sin(p*2)**2*2),25):target(-30,70,24);
  if(id==='communityprojects')end=side===1?target(39,-5+sin*25,24):target(-45,hip.y-6,24);
  if(id==='daytrips')end=side===1?target(23,mix(hip.y-11,neck.y-23,lift(t)),25):target(-34,hip.y-7,24);
  if(id==='citywalks')end=side===1?target(25,neck.y+46,25):target(hip.x-36,hip.y-5+sin*6,24);
  if(id==='heritagetours')end=side===1?target(50,neck.y+35-sin*8,25):target(-34,hip.y-10,25);
  if(id==='roadtrips')end=target(side*27*Math.cos(angle),32+side*27*Math.sin(angle),25);
  if(id==='islandhopping')end=side===1?target(50,neck.y-15+(resting?0:Math.sin(p*2)*12),24):target(-29,32+sin*3,25);
  const a=solve(shoulder,end,side,'arm',id==='cleanups'?point(side,1,.35):undefined);return {...a,handOpen:['theater','meditation','breathwork','wellnessactivities','publicspeaking','animalwelfare','heritagetours','islandhopping'].includes(id)};
 });
 const l={activity:id,t,p,resting,seated:SEATED.includes(id),breath:pulse};
 const r={front:true,hip,neck,legs,arms,phase,resting,expression:['meditation','breathwork','wellnessactivities'].includes(id)?'calm':undefined,
  torso:{chestYaw:0,hipYaw:0,chestScale:1},legOrder:[...legs].sort((a,b)=>a.ankle.z-b.ankle.z).map(v=>v.side),armOrder:[-1,1],
  shoulderRig:{left:arms[0].shoulder,right:arms[1].shoulder,roots:arms.map(a=>({side:a.side,root:{x:mix(a.shoulder.x,neck.x,.23),y:a.shoulder.y-3}}))},life:l};
 const left=arms[0].wrist,right=arms[1].wrist,grip=w=>({...w});
 if(id==='moviewatchparties')l.popcorn={bowl:point(left.x+8,left.y+10),grip:grip(left),kernel:point(right.x-7,right.y-12)};
 if(id==='sportswatchparties')l.finger={grip:grip(right),x:right.x,y:right.y-19};
 if(id==='concertmeetups')l.glowsticks=arms.map(a=>({grip:grip(a.wrist),tip:point(a.wrist.x+a.side*7,a.wrist.y-29)}));
 if(id==='gaming')l.controller={a:grip(left),b:grip(right),x:(left.x+right.x)/2,y:(left.y+right.y)/2,angle};
 if(id==='languageexchange')l.cards=arms.map((a,i)=>({grip:grip(a.wrist),x:a.wrist.x,y:a.wrist.y-13,kind:i}));
 if(id==='coding')l.keys=arms.map(a=>grip(a.wrist));
 if(id==='workshops')l.hammer={grip:grip(right),head:point(right.x,right.y+24)};
 if(id==='reading')l.book={left:grip(left),page:grip(right),turn};
 if(id==='skillclasses')l.needles=arms.map(a=>({grip:grip(a.wrist),tip:point(-a.side*4,45)}));
 if(id==='publicspeaking')l.clicker={grip:grip(right),x:right.x+3,y:right.y-2};
 if(id==='financialliteracy'){
  let coin=point(right.x,right.y+7),alpha=1,held=true;
  if(!resting&&t>=.50&&t<=.87){const u=clamp((t-.50)/.12);coin=point(47,mix(29,47,u));alpha=1-smooth((t-.57)/.05);held=false;}
  if(!resting&&t>.87)alpha=smooth((t-.87)/.08);
  l.coin={...coin,opacity:alpha,held,grip:grip(right)};
 }
 if(id==='diy')l.driver={grip:grip(right),tip:point(right.x+25,right.y),angle:p*3};
 if(id==='recovery')l.band={a:grip(left),b:grip(right),foot:point(legs[1].ankle.x,legs[1].ankle.y+17)};
 if(id==='volunteering'){
  let can=point(right.x-5,right.y+9),alpha=1,held=true;
  if(!resting&&t>=.50&&t<=.86){can=point(2,mix(38,62,clamp((t-.50)/.14)));alpha=1-smooth((t-.57)/.07);held=false;}
  if(!resting&&t>.86)alpha=smooth((t-.86)/.10);
  l.can={...can,opacity:alpha,held,grip:grip(right)};
 }
 if(id==='cleanups'){
  const [, ,a]=cleaning(t);l.picker={grip:grip(right),tip:point(right.x+Math.sin(a)*86,right.y+Math.cos(a)*86)};
  l.litter={x:l.picker.tip.x,y:l.picker.tip.y+8,opacity:resting?1:t<.64?1:t<.86?1-smooth((t-.64)/.06):smooth((t-.90)/.10)};
 }
 if(id==='charityactivities')l.gift={a:grip(left),b:grip(right),x:(left.x+right.x)/2,y:(left.y+right.y)/2+6,width:Math.abs(right.x-left.x)+8};
 if(id==='animalwelfare')l.bowl={grip:grip(left),x:left.x+5,y:left.y+12};
 if(id==='communityprojects')l.roller={grip:grip(right),head:point(right.x+22,right.y-22)};
 if(id==='daytrips')l.binoculars={grip:grip(right),x:right.x-12,y:right.y-6};
 if(['daytrips','heritagetours'].includes(id))l.map={grip:grip(left),x:left.x+4,y:left.y+7};
 if(id==='citywalks'){l.phone={grip:grip(right),x:right.x,y:right.y-10};l.tote={grip:grip(left),x:left.x,y:left.y+32};}
 if(id==='roadtrips')l.wheel={a:grip(left),b:grip(right),x:0,y:32,angle};
 if(id==='islandhopping')l.boatBob=sin*3;
 return r;
}

function line(c,pts,color=INK,width=2){c.beginPath();pts.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function shape(c,pts,fill,stroke=INK,width=1.5){c.beginPath();pts.forEach((v,i)=>i?c.lineTo(v.x,v.y):c.moveTo(v.x,v.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
const rect=(c,x,y,w,h,color,stroke=INK)=>shape(c,[point(x,y),point(x+w,y),point(x+w,y+h),point(x,y+h)],color,stroke);
function heart(c,x,y,size=8,color='#d3a695'){
 c.beginPath();c.moveTo(x,y+size);c.bezierCurveTo(x-size*2,y-size*.1,x-size,y-size*1.5,x,y-size*.45);c.bezierCurveTo(x+size,y-size*1.5,x+size*2,y-size*.1,x,y+size);c.closePath();c.fillStyle=color;c.fill();
}
function star(c,x,y,r=8,color='#dfd1a2') {shape(c,Array.from({length:10},(_,i)=>{const a=i*TAU/10-Math.PI/2,rad=i%2?r*.4:r;return point(x+Math.cos(a)*rad,y+Math.sin(a)*rad);}),color,null);}
function chair(c,lounge=false){
 shape(c,[point(-39,-43),point(39,-43),point(44,64),point(-44,64)],lounge?'#7a8c79':'#526e61');
 for(const x of [-34,34])line(c,[point(x,63),point(x,139)],'#84967a',5);
 if(lounge)for(const x of [-49,49]){rect(c,x-8,20,16,51,'#8d9d83');oval(c,x,20,8,6,'#a6b196');}
}
function screen(c,x,y,w=78,h=55,kind='movie'){
 rect(c,x,y,w,h,'#88a294');rect(c,x+4,y+4,w-8,h-8,'#274c48');
 if(kind==='movie'){shape(c,[point(x+w*.39,y+h*.26),point(x+w*.39,y+h*.74),point(x+w*.70,y+h*.5)],'#d8cea6',null);for(const yy of [y+8,y+h-9])for(let xx=x+8;xx<x+w-8;xx+=12)rect(c,xx,yy,5,3,'#68887a',null);}
 if(kind==='sports'){rect(c,x+9,y+9,w-18,h-18,'#5f8971');line(c,[point(x+w/2,y+9),point(x+w/2,y+h-9)],'#d8debc',1);oval(c,x+w/2,y+h/2,8,8,'#7b9c7a','#d8debc',1);oval(c,x+w*.72,y+h*.65,4,4,'#eee0bf');}
 if(kind==='gaming'){for(const [dx,dy,co]of [[12,27,'#c5b478'],[23,27,'#c5b478'],[42,17,'#a9c49e'],[53,17,'#a9c49e'],[18,12,'#d0a49d']])rect(c,x+dx,y+dy,8,8,co,null);line(c,[point(x+8,y+h-11),point(x+w-8,y+h-11)],'#a2b5a1',2);}
 line(c,[point(x+w/2,y+h),point(x+w/2,y+h+18)],'#9fb098',4);line(c,[point(x+w/2-20,y+h+18),point(x+w/2+20,y+h+18)],'#9fb098',3);
}
function desk(c){
 shape(c,[point(-72,33),point(73,33),point(91,68),point(-88,68)],'#b49e79');rect(c,-88,68,179,8,'#8e795b');
}
const DESK=['languageexchange','coding','workshops','skillclasses','financialliteracy','diy','volunteering'];
export function drawLifeBack(c,r){
 const l=r.life;if(!l)return;const id=l.activity;c.save();
 if(l.seated)chair(c,id==='moviewatchparties');
 if(DESK.includes(id))for(const x of [-73,76])line(c,[point(x,61),point(x,139)],'#9a8062',5);
 if(id==='moviewatchparties'||id==='sportswatchparties'){screen(c,62,-87,81,58,id==='moviewatchparties'?'movie':'sports');drawPeer(c,-100,l.p,-1);}
 if(id==='gaming')screen(c,64,-77,70,51,'gaming');
 if(id==='concertmeetups'){
  drawPeer(c,-104,l.p,-1);drawPeer(c,103,l.p,1);line(c,[point(-92,-112),point(95,-112)],'#8c9b86',4);
  for(const x of [-68,68]){oval(c,x,-105,9,5,'#bca4c9');shape(c,[point(x-4,-101),point(x+4,-101),point(x+42,140),point(x-42,140)],'#d2bad411',null);}
  for(const x of [-78,83])star(c,x,-48,6,'#bfb1d3');
 }
 if(id==='anime'){
  for(let i=0;i<10;i++){const a=i*TAU/10;line(c,[point(Math.cos(a)*76,Math.sin(a)*83-22),point(Math.cos(a)*92,Math.sin(a)*103-22)],'#c6c2a04d',2);}
  star(c,86,-78,10,'#b8cee0');star(c,-74,-20,7,'#d9bc91');
 }
 if(id==='theater'){
  for(const s of [-1,1]){shape(c,[point(s*62,-157),point(s*116,-157),point(s*116,139),point(s*91,125),point(s*83,-45)],'#916e7766',null);for(const xx of [93,106])line(c,[point(s*xx,-148),point(s*xx,128)],'#b48e8a55',2);}
  line(c,[point(-112,145),point(112,145)],'#c1ad86',3);
 }
 if(id==='languageexchange'){drawPeer(c,105,l.p,1);for(const [x,y,color]of [[-68,-78,'#b9c8ac'],[81,-70,'#d7c09e']]){oval(c,x,y,22,14,color);shape(c,[point(x-5,y+11),point(x-10,y+23),point(x+5,y+12)],color,null);for(const dx of [-8,0,8])oval(c,x+dx,y,1.6,1.6,'#678676',null);}}
 if(id==='publicspeaking'){
  screen(c,60,-99,87,67,'blank');for(const [i,h]of [12,22,32].entries())rect(c,74+i*19,-50-h,11,h,['#c8b58c','#97b59f','#b4bfd0'][i],null);
 }
 if(id==='meditation'||id==='breathwork'){
  oval(c,0,id==='meditation'?54:-30,70+l.breath*10,84+l.breath*9,'#a8c4b50a','#accfba33',1.5);
  if(id==='meditation'){shape(c,[point(-85,131),point(86,131),point(102,151),point(-103,151)],'#839f8a');oval(c,0,140,68,8,'#a3b59d',null);}
 }
 if(id==='recovery'){oval(c,78,137,16,6,'#a4b9a433',null);rect(c,65,115,25,20,'#9ab19a');line(c,[point(68,111),point(84,111)],'#d3d2ad',4);}
 if(id==='wellnessactivities')shape(c,[point(-83,138),point(81,138),point(96,153),point(-98,153)],'#a6b4a0');
 if(id==='cleanups'){
  shape(c,[point(-106,145),point(-48,133),point(29,143),point(90,124),point(109,146)],'#91a77f33',null);
  line(c,[point(49,131),point(97,131)],'#819579',3);
 }
 if(id==='animalwelfare'){
  oval(c,70,140,58,6,'#aab58b22',null);
  oval(c,78,117,27,17,'#b59773');for(const x of [61,92]){line(c,[point(x,122),point(x,137)],'#ac8c69',8);oval(c,x-1,139,7,3,'#d2b28a');}
  line(c,[point(101,111),point(115,99),point(121,91+Math.sin(l.p*3)*5)],'#b99e7c',6);
  oval(c,59,95,17,16,'#c4a37b');oval(c,46,91,5,10,'#8c7157');oval(c,72,91,5,10,'#8c7157');
  for(const x of [53,64])oval(c,x,93,2,2.5,'#4d4035',null);oval(c,59,101,4,3,'#655145',null);line(c,[point(59,103),point(56,107),point(62,107)],'#775b47',1);
 }
 if(id==='communityprojects'){
  for(const x of [51,126])line(c,[point(x,17),point(x,143)],'#9d8b65',4);
  rect(c,49,-82,78,109,'#a4b49a');rect(c,54,-77,68,99,'#d8ddba');
  heart(c,91,-54,9,'#c49a8b');for(const y of [-25,-13,-1,11])line(c,[point(79,y),point(114,y)],'#97b29a',3);
 }
 if(id==='daytrips'){
  shape(c,[point(-119,139),point(-75,76),point(-37,139)],'#76917b55',null);shape(c,[point(54,139),point(89,82),point(127,139)],'#829b7e44',null);
  oval(c,96,-75,15,15,'#d6c09133',null);rect(c,-93,102,16,39,'#a0b18d');line(c,[point(-90,112),point(-80,108)],'#d8d3ac',2);
 }
 if(id==='daytrips'){
  shape(c,[point(-34,r.neck.y+19),point(34,r.neck.y+19),point(37,r.hip.y+2),point(-37,r.hip.y+2)],'#a99876');
 }
 if(id==='citywalks'){
  for(const [x,w,h,co]of [[-119,36,135,'#82968d33'],[-76,30,99,'#b9ab8233'],[75,42,152,'#7c999633']]){rect(c,x,142-h,w,h,co,'#91a28b44');for(let y=155-h;y<132;y+=21)for(let dx=8;dx<w-4;dx+=13)rect(c,x+dx,y,5,8,'#b6c4a34d',null);}
  line(c,[point(-132,146),point(130,146)],'#a8b69d55',2);
 }
 if(id==='heritagetours'){
  for(const x of [75,127]){rect(c,x,-71,16,204,'#b6b18d');rect(c,x-5,-80,26,9,'#d0c59f');rect(c,x-5,133,26,9,'#c8bd94');for(const dx of [4,10])line(c,[point(x+dx,-65),point(x+dx,126)],'#8b9b7d',1);}
  line(c,[point(70,-87),point(106,-113),point(148,-87)],'#c5bc94',7);line(c,[point(64,145),point(155,145)],'#c5bc94',5);
 }
 if(id==='roadtrips'){
  shape(c,[point(-108,65),point(-95,-123),point(92,-123),point(108,65)],'#729b9b1c','#8ca69b',4);
  line(c,[point(-92,-119),point(91,-119)],'#b1bca2',4);rect(c,-15,-110,30,9,'#7e9a8f');
  for(const s of [-1,1])shape(c,[point(s*78,-102),point(s*62,-82),point(s*91,-82)],'#7fa18a55',null);
 }
 if(id==='islandhopping'){
  for(const [x,y,sz]of [[-110,16,34],[104,-26,30]]){
   oval(c,x,y+15,sz,6,'#ccb98b55',null);shape(c,[point(x-sz,y+15),point(x,y-7),point(x+sz,y+15)],'#92b39a66',null);
   line(c,[point(x+3,y+11),point(x+6,y-28)],'#b9ad7f',3);for(const s of [-1,1])line(c,[point(x+6,y-28),point(x+s*20,y-22)],'#8faf86',5);
  }
  const b=l.boatBob;shape(c,[point(-65,57+b),point(65,57+b),point(47,124+b),point(0,177+b),point(-47,124+b)],'#8ba99a');
  line(c,[point(-53,32+b),point(53,32+b)],'#c5d3b6',4);for(const x of [-52,52])line(c,[point(x,32+b),point(x,66+b)],'#9fbca9',3);
 }
 c.restore();
}
export function drawLifeMiddle(c,r){
 const l=r.life;if(!l)return;const id=l.activity;c.save();
 if(DESK.includes(id)){desk(c);}
 if(id==='workshops'||id==='diy'){
  rect(c,-24,39,76,19,'#b39365');line(c,[point(-24,48),point(52,48)],'#dcc091',1.4);
  if(id==='workshops'){rect(c,13,27,31,12,'#c4a373');line(c,[point(29,26),point(29,39)],'#d7cdb0',3);}
  else{rect(c,47,7,18,42,'#b89b6c');rect(c,-12,5,77,9,'#d3b382');oval(c,54,8,3,3,'#d4d2af');}
  for(const x of [-51,-43])line(c,[point(x,46),point(x+10,62)],'#c5b38b',3);
 }
 if(id==='languageexchange'){
  shape(c,[point(-9,45),point(42,45),point(49,61),point(-15,61)],'#d6dbc0');for(const [x,co]of [[-42,'#c1b1cc'],[-23,'#e0c596']])rect(c,x,45,15,11,co);
 }
 if(id==='skillclasses'){oval(c,62,54,14,9,'#b89fb3');for(const d of [-6,0,6])line(c,[point(51,54+d*.3),point(72,54+d*.3)],'#dac0cc',1);}
 if(id==='financialliteracy'){
  rect(c,-47,39,30,23,'#8ba59a');for(let y=45;y<59;y+=5)for(let x=-42;x< -20;x+=6)rect(c,x,y,3,2,'#d7dec0',null);
  rect(c,-43,41,20,3,'#3e6156');shape(c,[point(-6,43),point(24,43),point(32,61),point(-10,61)],'#e4dfbf');for(const y of [47,52,57])line(c,[point(-3,y),point(19,y)],'#a0b89d',.8);
  rect(c,33,43,29,27,'#a8c4b466','#91b2a3');oval(c,47.5,43,14.5,4,'#b9c8ae');line(c,[point(41,42),point(54,42)],'#658778',2);for(const [x,y]of [[42,60],[51,58],[46,66]])oval(c,x,y,5,2,'#d4bf88');
 }
 if(id==='volunteering'){
  rect(c,-22,43,48,24,'#bba174');shape(c,[point(-22,43),point(-36,31),point(-10,33),point(2,43)],'#d6bd8b');shape(c,[point(26,43),point(38,32),point(13,33),point(2,43)],'#ccb181');heart(c,2,56,6,'#ddc4a0');
  for(const [x,y]of [[53,54],[66,54],[59,36]]){rect(c,x-6,y-14,12,19,'#a6b99d');oval(c,x,y-14,6,2,'#d5d4b2');}
 }
 if(id==='publicspeaking'){
  shape(c,[point(-41,3),point(40,3),point(31,142),point(-31,142)],'#a28a68');oval(c,0,8,44,8,'#c9b289');oval(c,0,72,12,15,'#b8b597');
  line(c,[point(-25,5),point(-23,-26),point(-11,-31)],'#8fa796',2.5);oval(c,-9,-32,6,3,'#8da99a');
 }
 if(id==='roadtrips'){
  shape(c,[point(-108,58),point(106,58),point(118,122),point(-117,122)],'#6c8d82');line(c,[point(-104,60),point(101,60)],'#b8c7aa',5);
  for(const x of [-73,65]){oval(c,x,86,12,12,'#c2c9aa');oval(c,x,86,8,8,'#3c5d52');}
 }
 if(id==='islandhopping'){
  const b=l.boatBob;shape(c,[point(-62,66+b),point(-43,126+b),point(0,177+b),point(43,126+b),point(62,66+b),point(34,82+b),point(-34,82+b)],'#b5c3a6');
  line(c,[point(0,89+b),point(0,167+b)],'#dce0ba',3);
 }
 c.restore();
}
export function drawLifeTorso(c,r){
 const l=r.life;if(!l)return;const id=l.activity;c.save();
 if(id==='anime'){
  line(c,[point(r.neck.x-13,r.neck.y+14),point(r.neck.x+14,r.neck.y+14)],'#c9a095',7);
  shape(c,[point(r.neck.x+12,r.neck.y+15),point(68,r.neck.y+22+Math.sin(l.p)*4),point(78,r.neck.y+35),point(42,r.neck.y+29),point(r.neck.x+12,r.neck.y+20)],'#b88583');
 }
 if(id==='daytrips')for(const side of [-1,1])line(c,[point(r.neck.x+side*21,r.neck.y+18),point(r.hip.x+side*16,r.hip.y-14)],'#d3bf94',5);
 if(id==='volunteering'){rect(c,r.neck.x-9,r.neck.y+42,18,16,'#dce0bf');heart(c,r.neck.x,r.neck.y+49,4,'#a8ba9e');}
 if(id==='islandhopping'){
  for(const side of [-1,1])shape(c,[point(r.neck.x+side*10,r.neck.y+18),point(r.neck.x+side*24,r.neck.y+23),point(r.hip.x+side*23,r.hip.y-5),point(r.hip.x+side*5,r.hip.y-5)],'#d5aa7f');
  for(const y of [r.neck.y+40,r.neck.y+55])line(c,[point(r.neck.x-18,y),point(r.neck.x+18,y)],'#8c9d85',3);
 }
 c.restore();
}
export function drawLifeFront(c,r,colors){
 const l=r.life;if(!l)return;const id=l.activity,left=r.arms[0].wrist,right=r.arms[1].wrist;c.save();
 if(l.popcorn){
  const b=l.popcorn.bowl;shape(c,[point(b.x-20,b.y-14),point(b.x+20,b.y-14),point(b.x+15,b.y+12),point(b.x-15,b.y+12)],'#d6bfa0');for(const x of [-10,0,10])line(c,[point(b.x+x,b.y-12),point(b.x+x*.7,b.y+10)],'#a58d76',3);
  for(const [x,y]of [[-14,-14],[-6,-18],[3,-14],[11,-18],[16,-13]])oval(c,b.x+x,b.y+y,5,4,'#eee2b8','#c4b88f',.8);
  oval(c,l.popcorn.kernel.x,l.popcorn.kernel.y,3.3,3,'#f1e2b6');
 }
 if(l.finger){
  const f=l.finger;shape(c,[point(f.x-8,f.y+21),point(f.x-9,f.y-13),point(f.x-4,f.y-23),point(f.x+2,f.y-23),point(f.x+3,f.y-5),point(f.x+11,f.y-11),point(f.x+16,f.y-4),point(f.x+8,f.y+10),point(f.x+8,f.y+21)],'#c8d5a0');
  line(c,[point(f.x-2,f.y-17),point(f.x-2,f.y+6)],'#819e7e',1.5);
 }
 if(l.glowsticks)for(const s of l.glowsticks){line(c,[s.grip,s.tip],'#b8c5b1',6);line(c,[point(mix(s.grip.x,s.tip.x,.18),mix(s.grip.y,s.tip.y,.18)),s.tip],s.grip.x<0?'#d5b4d5':'#c4d59b',4);}
 if(id==='anime'){
  for(const [x,y,sz]of [[right.x+18,right.y-1,9],[right.x+34,right.y-10,5]])star(c,x,y,sz,'#e0c791');
 }
 if(l.controller){
  const q=l.controller;c.save();c.translate(q.x,q.y);c.rotate(q.angle);
  shape(c,[point(-25,-10),point(23,-10),point(30,10),point(21,16),point(10,6),point(-10,6),point(-22,16),point(-30,9)],'#90ab9d');
  line(c,[point(-21,-2),point(-10,-2)],'#526d5f',3);line(c,[point(-15.5,-7),point(-15.5,3)],'#526d5f',3);
  for(const [x,y,color]of [[15,-5,'#d4ae99'],[22,0,'#d9c78f'],[8,0,'#bbc0db'],[15,5,'#adc993']])oval(c,x,y,2.4,2.4,color,null);c.restore();
 }
 if(l.cards)for(const q of l.cards){
  rect(c,q.x-12,q.y-18,24,31,q.kind?'#c0cebc':'#e2cda5');
  if(!q.kind){line(c,[point(q.x-7,q.y+4),point(q.x,q.y-10),point(q.x+7,q.y+4)],'#7c947f',2);line(c,[point(q.x-4,q.y),point(q.x+4,q.y)],'#7c947f',1.5);}
  else{oval(c,q.x,q.y-5,7,5,'#e9ddbc','#739380',1);line(c,[point(q.x-3,q.y-1),point(q.x-5,q.y+5)],'#739380',1.2);}
 }
 if(id==='coding'){
  shape(c,[point(-46,44),point(45,44),point(56,68),point(-58,68)],'#9cae9d');
  rect(c,-43,-3,86,50,'#91aaa0');rect(c,-39,1,78,41,'#254b45');
  for(const [i,w]of [32,45,23,38,28].entries())line(c,[point(-30+(i%2)*7,9+i*6),point(-30+(i%2)*7+w,9+i*6)],['#b9ceac','#d8bca4','#b6c6dd'][i%3],1.7);
  for(let y=51;y<64;y+=5)for(let x=-36;x<39;x+=9)rect(c,x,y,6,2,'#c5cdb1',null);
  line(c,[point(-7,66),point(9,66)],'#6d8c7d',2);
 }
 if(l.hammer){line(c,[point(l.hammer.grip.x,l.hammer.grip.y-7),l.hammer.head],'#c8a777',4);rect(c,l.hammer.head.x-11,l.hammer.head.y-5,22,10,'#91a294');}
 if(l.book){
  shape(c,[point(-34,26),point(-4,30),point(0,37),point(4,30),point(33,26),point(39,53),point(5,56),point(0,60),point(-5,56),point(-39,53)],'#d6c59f');
  line(c,[point(0,36),point(0,58)],'#a88e6a',1.5);
  for(const s of [-1,1])for(const y of [35,40,45,50])line(c,[point(s*7,y+2),point(s*28,y)],'#a3ae91',.9);
  const p=l.book.page;shape(c,[point(0,34),point(p.x+3,p.y-5),point(p.x+7,p.y+19),point(0,57)],'#f0e2bd','#c1b38e',.8);
 }
 if(l.needles){
  rect(c,-15,43,30,22,'#b3bdc8');for(let x=-10;x<=10;x+=5)for(let y=47;y<63;y+=5)line(c,[point(x-2,y),point(x,y+2),point(x+2,y)],'#e1d4c1',.8);
  for(const n of l.needles)line(c,[point(n.grip.x+(n.grip.x<0?-10:10),n.grip.y-8),n.tip],'#d6c3a2',2);
  c.beginPath();c.moveTo(4,61);c.quadraticCurveTo(32,72,62,54);c.strokeStyle='#c7aec2';c.lineWidth=1.7;c.stroke();
 }
 if(l.clicker){rect(c,l.clicker.x-4,l.clicker.y-8,8,16,'#77988c');oval(c,l.clicker.x,l.clicker.y-4,1.7,1.7,'#d5c89c',null);}
 if(l.coin&&l.coin.opacity>0){c.save();c.globalAlpha=l.coin.opacity;oval(c,l.coin.x,l.coin.y,5,5,'#dfc58a','#a69b6e',1.2);oval(c,l.coin.x,l.coin.y,2.8,2.8,'#e4cf9b','#bdad7b',.6);c.restore();}
 if(l.driver){
  const d=l.driver;line(c,[d.grip,d.tip],'#b1bda8',3);line(c,[point(d.grip.x-12,d.grip.y),point(d.grip.x+3,d.grip.y)],'#85a293',7);
  line(c,[point(d.grip.x-8,d.grip.y+Math.sin(d.angle)*2),point(d.grip.x-1,d.grip.y+Math.sin(d.angle)*2)],'#c0c6a6',1);
  for(const a of [d.angle,d.angle+Math.PI/2])line(c,[point(d.tip.x-Math.cos(a)*3,d.tip.y-Math.sin(a)*3),point(d.tip.x+Math.cos(a)*3,d.tip.y+Math.sin(a)*3)],'#7e9785',1);
 }
 if(l.band){
  const b=l.band;line(c,[b.a,point(b.foot.x-10,b.foot.y),point(b.foot.x+10,b.foot.y),b.b],'#b3a4c8',3);line(c,[point(b.a.x-4,b.a.y),point(b.a.x+4,b.a.y)],'#897c9e',5);line(c,[point(b.b.x-4,b.b.y),point(b.b.x+4,b.b.y)],'#897c9e',5);
 }
 if(id==='cleanups'){
  shape(c,[point(-61,53),point(-30,53),point(-23,122),point(-68,122)],'#91aa8c');oval(c,-46,53,17,5,'#3e6653','#b7c7a0',2);line(c,[left,point(-30,54)],'#b5c49e',3);
  const q=l.picker;line(c,[q.grip,q.tip],'#b9c6b0',3);line(c,[point(q.grip.x-7,q.grip.y-7),point(q.grip.x+5,q.grip.y+5)],'#8ca794',5);line(c,[point(q.tip.x-5,q.tip.y+5),q.tip,point(q.tip.x+5,q.tip.y+5)],'#d0d3ae',2);
  if(l.litter.opacity>0){const z=l.litter;c.save();c.globalAlpha=z.opacity;shape(c,[point(z.x-4,z.y-10),point(z.x+4,z.y-10),point(z.x+6,z.y+12),point(z.x-6,z.y+12)],'#bfd0bd88','#91b2a0');rect(c,z.x-3,z.y-14,6,4,'#b4bca0');c.restore();}
 }
 if(l.can&&l.can.opacity>0){const z=l.can;c.save();c.globalAlpha=z.opacity;rect(c,z.x-6,z.y-10,12,19,'#a8bc9c');oval(c,z.x,z.y-10,6,2,'#d9d4af');line(c,[point(z.x-5,z.y+2),point(z.x+5,z.y+2)],'#d5c39a',3);c.restore();}
 if(l.gift){
  const q=l.gift,w=q.width;rect(c,q.x-w/2,q.y-13,w,29,'#c7b58e');rect(c,q.x-w/2-2,q.y-17,w+4,7,'#dcc8a0');line(c,[point(q.x,q.y-16),point(q.x,q.y+15)],'#b89394',5);heart(c,q.x,q.y,7,'#cd9a96');
  oval(c,q.x-7,q.y-20,8,4,'#cfb0aa');oval(c,q.x+7,q.y-20,8,4,'#cfb0aa');
 }
 if(l.bowl){const q=l.bowl;oval(c,q.x,q.y,19,5,'#c0c8a5');shape(c,[point(q.x-19,q.y),point(q.x+19,q.y),point(q.x+14,q.y+12),point(q.x-14,q.y+12)],'#93af9b');for(const dx of [-9,-2,5,11])oval(c,q.x+dx,q.y-1,3,2,'#b69b70',null);}
 if(l.roller){const q=l.roller;line(c,[point(q.grip.x-7,q.grip.y+7),point(q.grip.x+7,q.grip.y-13),point(q.head.x,q.grip.y-13),q.head],'#bac5ac',2.4);rect(c,q.head.x-13,q.head.y-5,26,10,'#9cb69b');line(c,[point(q.head.x-11,q.head.y-3),point(q.head.x+11,q.head.y-3)],'#c1d0af',1);}
 if(l.map){const q=l.map;shape(c,[point(q.x-18,q.y-16),point(q.x-1,q.y-12),point(q.x+15,q.y-17),point(q.x+20,q.y+13),point(q.x+2,q.y+17),point(q.x-20,q.y+12)],'#dce0bb');line(c,[point(q.x-12,q.y+6),point(q.x-2,q.y-6),point(q.x+9,q.y+3)],'#8eae97',2);oval(c,q.x+9,q.y+3,2,2,'#c19a84',null);}
 if(l.binoculars){const q=l.binoculars;line(c,[point(q.x-8,q.y),point(q.x+8,q.y)],'#819f8d',8);for(const dx of [-9,9]){rect(c,q.x+dx-6,q.y-5,12,13,'#a9b99b');oval(c,q.x+dx,q.y-5,6,6,'#527a70','#c7d0ac',1.5);oval(c,q.x+dx-1,q.y-7,2,2,'#a1c5bc',null);}}
 if(l.tote){const q=l.tote;line(c,[left,point(q.x-13,q.y-15),point(q.x+13,q.y-15),left],'#c9c6a0',2);shape(c,[point(q.x-16,q.y-17),point(q.x+16,q.y-17),point(q.x+20,q.y+18),point(q.x-19,q.y+18)],'#b6bb97');line(c,[point(q.x-12,q.y-12),point(q.x-12,q.y+13)],'#d9d4ae',1);}
 if(l.phone){const q=l.phone;rect(c,q.x-7,q.y-12,14,24,'#a2b79d');rect(c,q.x-5,q.y-9,10,16,'#4c776a');line(c,[point(q.x-2,q.y+9),point(q.x+2,q.y+9)],'#d7d5b4',1);}
 if(id==='heritagetours')line(c,[right,point(right.x+10,right.y-10)],colors.skin,4);
 if(l.wheel){const q=l.wheel;c.save();c.translate(q.x,q.y);c.rotate(q.angle);oval(c,0,0,31,31,'#00000000','#c0c6a4',5);for(let i=0;i<3;i++){const a=i*TAU/3;line(c,[point(0,0),point(Math.cos(a)*28,Math.sin(a)*28)],'#91aa92',4);}oval(c,0,0,8,8,'#799783','#c0c6a4',2);c.restore();}
 if(id==='islandhopping'){
  const b=l.boatBob;oval(c,0,111+b,15,17,'#00000000','#dcd7ac',5);for(const y of [144,155]){c.beginPath();for(let x=-110;x<=110;x+=5){const yy=y+Math.sin(x*.06-l.p*2)*2;x===-110?c.moveTo(x,yy):c.lineTo(x,yy);}c.strokeStyle='#a3d1c588';c.lineWidth=2;c.stroke();}
 }
 for(const arm of r.arms)oval(c,arm.wrist.x,arm.wrist.y,4.4,id==='meditation'?3:3.7,colors.skin,colors.skinInk,1.2);
 c.restore();
}
