// SPDX-License-Identifier: GPL-3.0-or-later
// Food and social activities on the existing clothed character. Held props,
// contact points and gestures share the avatar's pose clock and fixed bones.
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
import {chain,limb} from './actions.mjs';
export const LEISURE_IDS=['cafe','foodtrips','cooking','baking','picnics','karaoke','trivianights','communitymeetups'];
const TAU=Math.PI*2,INK='#543c35';
const point=(x,y,z=0)=>({x,y,z}),mix=(a,b,t)=>a+(b-a)*t;
const sample=(keys,t)=>sampleAnglePath(keys.map(([p,...v])=>[p*TAU,...v]),t*TAU);
const target=(x,y,z=24)=>point(x/(1+z*.0012),y,z);
const seated=id=>id==='cafe'||id==='trivianights';
function solve(start,end,side,type,pole){const [a,b]=type==='leg'?[62,60]:[39,33],c=chain(start,end,a,b,pole??point(side*(type==='leg'?.15:1),0,type==='leg'?1:.35));return {...limb(start,c.middle,c.end,side,type),handOpen:false};}
const sip=t=>sample([[0,0,0,0],[.18,0,0,0],[.40,1,0,0],[.57,1,0,0],[.82,0,0,0]],t)[0];
const taste=t=>sample([[0,0,0,0],[.12,0,0,0],[.36,1,0,0],[.50,1,0,0],[.76,0,0,0]],t)[0];
const answer=t=>sample([[0,0,0,0],[.22,0,0,0],[.43,1,0,0],[.63,1,0,0],[.87,0,0,0]],t)[0];
const wave=t=>sample([[0,0,0,0],[.26,.9,0,0],[.46,1,0,0],[.64,.85,0,0],[.92,0,0,0]],t)[0];
export function leisurePose(id,phase,resting=false){
 if(!LEISURE_IDS.includes(id))throw new Error('Unknown leisure activity');
 const t=resting?0:((phase/TAU)%1+1)%1,p=t*TAU,sin=resting?0:Math.sin(p),pulse=resting?0:(1-Math.cos(p))/2;
 const x=id==='karaoke'?sin*4:id==='communitymeetups'?sin*1.5:0;
 const y=id==='picnics'?100:id==='baking'?40:id==='cooking'?30:seated(id)?43:8;
 const lean=id==='baking'?10:0,hip=point(x,y),neck=point(x*.7,y-78+lean);
 const s={activity:id,t,p,seated:seated(id),resting};
 const rollY=45+(resting?0:sin*6),hello=wave(t),raised=answer(t);
 const legs=[-1,1].map(side=>{
  const root=point(hip.x+side*13,hip.y);
  if(id==='picnics')return solve(root,point(-side*10,122,25),side,'leg',point(side,0,.1));
  const lift=id==='karaoke'&&!resting?Math.max(0,side*sin)*3:0;
  return solve(root,point(x+side*26,122-lift,4),side,'leg');
 });
 const arms=[-1,1].map(side=>{
  const shoulder=point(neck.x+side*25,neck.y+16);let end;
  if(id==='cafe')end=side===1?target(mix(43,24,sip(t)),mix(37,neck.y+2,sip(t)),26):target(-27,27,25);
  if(id==='foodtrips')end=side===1?target(mix(4,12,taste(t)),mix(9,neck.y+8,taste(t)),26):target(-32,-5,26);
  if(id==='cooking')end=side===1?target(24+Math.cos(p*2)*8,-2+Math.sin(p*2)*2,24):target(-36,21,24);
  if(id==='baking')end=target(side*34,rollY,23);
  if(id==='picnics')end=side===1?target(mix(29,13,taste(t)),mix(hip.y-24,neck.y-1,taste(t)),26):target(-29,hip.y-17,26);
  if(id==='karaoke')end=side===1?target(neck.x+18+sin,neck.y+7,26):target(hip.x-42-sin*8,hip.y-24-sin*14,25);
  if(id==='trivianights')end=side===1?target(mix(32,49,raised),mix(25,neck.y+9,raised),25):target(-29,37+(resting?0:Math.sin(p*2)**2*2),25);
  if(id==='communitymeetups')end=side===1?target(mix(43,56,hello)+(resting?0:Math.sin(p*3)*5*hello),mix(neck.y+35,neck.y-35,hello),25):target(hip.x-36-sin*5,hip.y-15-(resting?0:Math.cos(p)*6),25);
  const arm=solve(shoulder,end,side,'arm');return {...arm,handOpen:id==='communitymeetups'};
 });
 const r={front:true,hip,neck,legs,arms,phase,resting,torso:{chestYaw:0,hipYaw:0,chestScale:1},
  legOrder:[...legs].sort((a,b)=>a.ankle.z-b.ankle.z).map(l=>l.side),armOrder:[-1,1],
  shoulderRig:{left:arms[0].shoulder,right:arms[1].shoulder,roots:arms.map(a=>({side:a.side,root:{x:mix(a.shoulder.x,neck.x,.23),y:a.shoulder.y-3}}))},leisure:s};
 const left=arms[0].wrist,right=arms[1].wrist;
 if(id==='cafe')s.cup={grip:{...right},x:right.x-12,y:right.y-3,lift:sip(t)};
 if(id==='foodtrips'){
  s.plate={grip:{...left},x:left.x+10,y:left.y+8};s.fork={grip:{...right},tip:point(right.x-8,right.y-18),lift:taste(t)};
 }
 if(id==='cooking')s.spoon={grip:{...right},tip:point(right.x-16,right.y+30)};
 if(id==='baking')s.rollingPin={a:{...left},b:{...right},x:(left.x+right.x)/2,y:(left.y+right.y)/2,angle:p*2,doughWidth:42+pulse*2};
 if(id==='picnics'){
  s.plate={grip:{...left},x:left.x+10,y:left.y+8};s.sandwich={grip:{...right},x:right.x-6,y:right.y-9,lift:taste(t)};
 }
 if(id==='karaoke')s.microphone={grip:{...right},head:point(right.x-5,right.y-18)};
 if(id==='trivianights'){
  s.card={grip:{...right},x:right.x,y:right.y-13,lift:raised};s.buzzer={x:-29,y:48,press:resting?0:Math.sin(p*2)**2};
 }
 if(id==='communitymeetups')s.badge={x:neck.x,y:neck.y+55};
 return r;
}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function shape(c,points,fill,stroke=INK,width=1.5){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
const rect=(c,x,y,w,h,fill,stroke=INK)=>shape(c,[point(x,y),point(x+w,y),point(x+w,y+h),point(x,y+h)],fill,stroke);
function chair(c){shape(c,[point(-38,-42),point(38,-42),point(41,65),point(-41,65)],'#6b8270');for(const x of [-28,28])line(c,[point(x,-31),point(x,57)],'#96aa8d',3);for(const x of [-35,35])line(c,[point(x,63),point(x,137)],'#7f9076',5);}
function steam(c,x,y,p,resting){
 for(let i=0;i<3;i++){const u=resting?.3:((p/TAU+i/3)%1+1)%1;c.save();c.globalAlpha=Math.sin(Math.PI*u)**2*.4;c.beginPath();c.moveTo(x+i*9-9,y-u*21);c.bezierCurveTo(x+i*9-16,y-7-u*21,x+i*9,y-10-u*21,x+i*9-8,y-18-u*21);c.strokeStyle='#d9dcc0';c.lineWidth=1.4;c.stroke();c.restore();}
}
function plate(c,x,y,food=true){
 oval(c,x,y,28,8,'#dce0c4','#a1b49e',1.5);oval(c,x,y-1,22,5,'#f1e5c8','#b1c0a8',.8);
 if(food){oval(c,x-7,y-4,10,5,'#c6a578');for(const [dx,dy,color]of [[7,-5,'#92ad79'],[16,-3,'#d5a58c'],[2,-8,'#e3c78f']])oval(c,x+dx,y+dy,5,3,color);}
}
function peer(c,x,p,side){
 c.save();c.translate(x,28);c.scale(.72,.72);
 const bob=Math.sin(p+side)*1.1,skin=side===-1?'#c89977':'#e9bb9d',shirt=side===-1?'#779891':'#b5949e';
 for(const s of [-1,1]){line(c,[point(s*9,72),point(s*12,142)],'#65766e',11);oval(c,s*12,145,10,5,'#c8c9ae');}
 shape(c,[point(-22,15),point(22,15),point(24,77),point(-24,77)],shirt);
 line(c,[point(-21,24),point(-29,60),point(-19,78)],skin,8);line(c,[point(21,24),point(33,37),point(43,20)],skin,8);
 oval(c,0,-9+bob,21,26,skin);c.beginPath();c.moveTo(-21,-9+bob);c.bezierCurveTo(-28,-44,24,-44,22,-10+bob);c.quadraticCurveTo(5,-14+bob,-7,-27+bob);c.quadraticCurveTo(-11,-16+bob,-21,-9+bob);c.closePath();c.fillStyle=side===-1?'#4e4540':'#6b5248';c.fill();c.strokeStyle=INK;c.lineWidth=2;c.stroke();
 for(const s of [-1,1])oval(c,s*7,-9+bob,2.5,3.4,'#553c32',null);
 c.beginPath();c.moveTo(-6,4+bob);c.quadraticCurveTo(0,10+bob,7,3+bob);c.strokeStyle=INK;c.lineWidth=1.7;c.stroke();c.restore();
}
export function drawLeisureBack(c,r){
 const s=r.leisure;if(!s)return;c.save();
 if(s.seated)chair(c);
 if(s.activity==='cafe'||s.activity==='trivianights')for(const x of [-67,70])line(c,[point(x,59),point(x,139)],'#9c805e',5);
 if(s.activity==='foodtrips'){
  line(c,[point(-83,140),point(-83,-78),point(-49,-78)],'#91a48d',3);
  shape(c,[point(-102,-80),point(-65,-80),point(-59,-65),point(-108,-65)],'#ae9c76');
  for(const x of [-101,-87,-73])line(c,[point(x,-79),point(x-4,-66)],'#d8c39a',5);
  oval(c,74,131,26,8,'#879c7144',null);rect(c,61,110,26,23,'#a7b696');for(const x of [65,75,83])line(c,[point(x,110),point(x+4,96)],'#d1bc85',4);
 }
 if(s.activity==='picnics'){
  shape(c,[point(-112,129),point(104,129),point(125,158),point(-126,158)],'#c4958b');
  for(let x=-104;x<110;x+=18)line(c,[point(x,130),point(x+4,157)],'#efd5ae88',5);
  for(const y of [136,147,156])line(c,[point(-112,y),point(112,y)],'#f2d7b17a',3);
  shape(c,[point(70,111),point(110,111),point(106,141),point(74,141)],'#b39669');
  c.beginPath();c.arc(90,112,17,Math.PI,TAU);c.strokeStyle='#dbc49a';c.lineWidth=4;c.stroke();
  for(const y of [118,125,132])line(c,[point(74,y),point(108,y)],'#786f4c',1.4);for(const x of [79,88,98])line(c,[point(x,113),point(x,139)],'#dec59a',1);
  rect(c,-88,112,15,30,'#789d91');oval(c,-80.5,112,7.5,3,'#c4d0b2');
 }
 if(s.activity==='karaoke'){
  rect(c,58,-94,90,65,'#59756d');rect(c,63,-89,80,54,'#294f4a');
  for(const [i,w]of [57,48,63,41].entries())line(c,[point(70,-76+i*10),point(70+w,-76+i*10)],i===1?'#dbbf96':'#98b4a3',2);
  for(const x of [-75,82]){rect(c,x-17,85,34,58,'#60796d');oval(c,x,119,10,13,'#314c45','#97ab91',2);oval(c,x,96,5,5,'#b5bea0');}
  oval(c,0,145,85,6,'#b49dc51a',null);
 }
 if(s.activity==='trivianights'){
  rect(c,67,-78,50,54,'#7f998d');rect(c,71,-74,42,46,'#355c55');
  c.beginPath();c.moveTo(84,-62);c.bezierCurveTo(82,-73,104,-72,101,-60);c.quadraticCurveTo(100,-55,93,-53);c.lineTo(93,-46);c.strokeStyle='#e7d4aa';c.lineWidth=3;c.stroke();oval(c,93,-38,2,2,'#e7d4aa',null);
 }
 if(s.activity==='communitymeetups'){
  oval(c,0,145,132,9,'#98b99819',null);peer(c,-100,s.p,-1);peer(c,99,s.p,1);
  for(const x of [-87,86]){line(c,[point(x,87),point(x,142)],'#899e86',4);line(c,[point(x-17,108),point(x+17,108)],'#a1b398',5);}
  line(c,[point(-111,-48),point(-50,-60)],'#9eb39677',1);line(c,[point(52,-60),point(112,-48)],'#9eb39677',1);
  for(const [x,y,color]of [[-94,-51,'#d0b391'],[-71,-56,'#a5c0ac'],[71,-56,'#c3afc6'],[94,-51,'#dbbd90']])shape(c,[point(x-6,y),point(x+6,y),point(x,y+12)],color,null);
 }
 c.restore();
}
export function drawLeisureMiddle(c,r){
 const s=r.leisure;if(!s)return;c.save();
 if(s.activity==='cafe'){
  oval(c,0,62,83,15,'#9c805e');oval(c,0,55,83,13,'#c1a57b');
  oval(c,31,48,20,5,'#dce0c4','#9daf99');
  shape(c,[point(-48,38),point(-17,39),point(-13,55),point(-51,54)],'#dee0c3');
  for(const y of [43,47,51])line(c,[point(-44,y),point(-22,y)],'#a4b59d',.8);
  oval(c,-56,46,9,5,'#d9ba86');line(c,[point(-57,44),point(-52,48)],'#b2976f',1.5);
 }
 if(s.activity==='cooking'||s.activity==='baking'){
  rect(c,-86,72,172,64,'#698477');rect(c,-75,84,68,41,s.activity==='baking'?'#354e47':'#789284');rect(c,5,84,67,41,'#789284');
  if(s.activity==='baking'){rect(c,-68,90,54,27,'#6a7564');for(const x of [-56,-39,-23])oval(c,x,109,6,3,'#c6a47a');}
  line(c,[point(-55,81),point(-27,81)],'#c9c5a2',3);line(c,[point(28,81),point(53,81)],'#c9c5a2',3);
 }
 if(s.activity==='cooking'||s.activity==='baking'){
  shape(c,[point(-77,27),point(77,27),point(92,69),point(-92,69)],'#c5b38c');rect(c,-92,69,184,8,'#9d8966');
  if(s.activity==='cooking'){
   shape(c,[point(-48,32),point(53,32),point(66,62),point(-59,62)],'#7c9587');oval(c,7,50,34,7,'#405b50');
   shape(c,[point(-19,28),point(33,28),point(31,51),point(-16,51)],'#92aaa0');oval(c,7,29,26,8,'#cfceb0');oval(c,7,28,22,5,'#d1af77');
   line(c,[point(-19,33),point(-36,26)],'#657f73',5);line(c,[point(33,34),point(44,34)],'#657f73',5);
   for(const [x,y,color]of [[-2,27,'#9caf75'],[14,29,'#d99379'],[21,27,'#b9b67e']])oval(c,x,y,4,2,color,null);
   rect(c,-73,37,16,23,'#9eaf91');for(const x of [-70,-64,-59])line(c,[point(x,38),point(x+2,18)],'#d8c19b',2);
  }else{
   shape(c,[point(-63,34),point(65,34),point(75,63),point(-70,63)],'#a48b61');oval(c,0,46,s.rollingPin.doughWidth,11,'#e3c89b','#b09b75',1.2);
   oval(c,-60,41,13,6,'#c1cfb4');shape(c,[point(-73,41),point(-48,41),point(-52,55),point(-68,55)],'#9eb5a3');
   for(const [x,y]of [[56,49],[60,57]])oval(c,x,y,6,3,'#d2ac77');
  }
 }
 if(s.activity==='trivianights'){
  shape(c,[point(-69,34),point(71,34),point(88,65),point(-83,65)],'#b39b77');rect(c,-83,65,171,8,'#8b7659');
  shape(c,[point(6,45),point(53,45),point(60,60),point(1,60)],'#e3dfc0');for(const y of [49,54,58])line(c,[point(10,y),point(44,y)],'#a5b69d',1);
  oval(c,-29,49,15,5,'#c3b296');oval(c,-29,44+s.buzzer.press*1.5,11,4,'#c68d84','#8b6f60',1.5);
 }
 c.restore();
}
export function drawLeisureTorso(c,r){
 const b=r.leisure?.badge;if(!b)return;c.save();
 line(c,[point(r.neck.x-9,r.neck.y+15),point(b.x,b.y-2),point(r.neck.x+9,r.neck.y+15)],'#a8c2b1',2.3);
 rect(c,b.x-9,b.y-2,18,23,'#e8ddbd');oval(c,b.x,b.y+5,3.4,3.4,'#9ab29f',null);for(const y of [b.y+12,b.y+16])line(c,[point(b.x-5,y),point(b.x+5,y)],'#8ca394',1.1);c.restore();
}
export function drawLeisureFront(c,r,colors){
 const s=r.leisure;if(!s)return;c.save();
 if(s.cup){const q=s.cup;oval(c,q.x+13,q.y,7,8,'#c4d0b4','#e1dfbd',3);shape(c,[point(q.x-12,q.y-9),point(q.x+10,q.y-9),point(q.x+9,q.y+11),point(q.x-9,q.y+11)],'#c6d4b7');oval(c,q.x-1,q.y-9,11,3.7,'#8d7554','#e7dfbd',1.3);steam(c,q.x,q.y-14,s.p,s.resting);}
 if(s.plate)plate(c,s.plate.x,s.plate.y);
 if(s.fork){const f=s.fork;line(c,[point(f.grip.x+5,f.grip.y+10),f.tip],'#cad0b7',2.5);for(const dx of [-2,0,2])line(c,[point(f.tip.x+dx,f.tip.y+2),point(f.tip.x+dx-2,f.tip.y-4)],'#dbe0c6',1);oval(c,f.tip.x,f.tip.y-1,4,3,'#c99e75');}
 if(s.spoon){const q=s.spoon;line(c,[point(q.grip.x+4,q.grip.y-8),q.tip],'#b99e72',3);oval(c,q.tip.x,q.tip.y,4.5,2.4,'#dfbd87');steam(c,7,21,s.p,s.resting);}
 if(s.rollingPin){const q=s.rollingPin;c.save();c.translate(q.x,q.y);rect(c,-25,-5,50,10,'#d6b68a');oval(c,-25,0,4,5,'#b29169');oval(c,25,0,4,5,'#e4c99c');line(c,[point(-38,0),point(-26,0)],'#b19066',5);line(c,[point(26,0),point(38,0)],'#b19066',5);line(c,[point(-19,Math.sin(q.angle)*3),point(19,Math.sin(q.angle)*3)],'#b9956655',.8);c.restore();}
 if(s.sandwich){const q=s.sandwich;shape(c,[point(q.x-13,q.y+5),point(q.x+12,q.y+5),point(q.x-6,q.y-13)],'#efdbac');line(c,[point(q.x-12,q.y+2),point(q.x+9,q.y+2)],'#91aa72',3);line(c,[point(q.x-11,q.y+5),point(q.x+10,q.y+5)],'#d2937b',2);}
 if(s.microphone){const m=s.microphone;line(c,[point(m.grip.x+3,m.grip.y+8),m.head],'#b8bfa9',6);oval(c,m.head.x,m.head.y,8,9,'#819b90','#d0d4b6',1.5);for(const y of [-3,1,5])line(c,[point(m.head.x-5,m.head.y+y),point(m.head.x+5,m.head.y+y)],'#48695d',.9);
  c.beginPath();c.moveTo(m.grip.x+3,m.grip.y+9);c.bezierCurveTo(m.grip.x+44,42,26,134,62,146);c.strokeStyle='#769184';c.lineWidth=1.5;c.stroke();
  for(const [x,y]of [[-65,-47],[49,2]]){line(c,[point(x,y),point(x,y-17),point(x+8,y-19)],'#d7bd96',1.7);oval(c,x-2,y,4,2.7,'#d7bd96',null);}
 }
 if(s.card){const q=s.card;rect(c,q.x-13,q.y-20,26,33,'#e3d6ac','#a68e6c');rect(c,q.x-9,q.y-16,18,7,'#b4c5a5',null);line(c,[point(q.x-6,q.y+1),point(q.x-1,q.y+6),point(q.x+7,q.y-4)],'#739d87',2.4);}
 for(const arm of r.arms)oval(c,arm.wrist.x,arm.wrist.y,4.5,3.8,colors.skin,colors.skinInk,1.2);
 c.restore();
}
