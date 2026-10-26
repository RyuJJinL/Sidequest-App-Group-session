// SPDX-License-Identifier: GPL-3.0-or-later
// Nine original outdoor loops. No walking/running pose is reused. Contacts,
// equipment grips and the illustrated wardrobe share one articulated skeleton.
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
import {chain,limb} from './actions.mjs';
export const OUTDOOR_IDS=['hiking','camping','trailrunning','climbing','surfing','freediving','scubadiving','kayaking','fishing'];
const TAU=Math.PI*2,INK='#543c35';
const point=(x,y,z=0)=>({x,y,z}),mix=(a,b,t)=>a+(b-a)*t;
const sample=(keys,t)=>sampleAnglePath(keys.map(([p,...v])=>[p*TAU,...v]),t*TAU);
const target=(x,y,z=24)=>point(x/(1+z*.0012),y,z);
const unitTime=x=>((x%1)+1)%1;
function solve(start,end,side,type,pole){
 const [a,b]=type==='leg'?[62,60]:[39,33],c=chain(start,end,a,b,pole??point(side,0,.35));
 return {...limb(start,c.middle,c.end,side,type),handOpen:true};
}
function extend(start,length,x,y,z){const k=length/Math.hypot(x,y,z);return point(start.x+x*k,start.y+y*k,start.z+z*k);}
function legFK(root,side,thigh,flex,lateral=3){
 const knee=extend(root,62,side*lateral,62*Math.cos(thigh),62*Math.sin(thigh));
 const ankle=extend(knee,60,side*lateral*.5,60*Math.cos(thigh-flex),60*Math.sin(thigh-flex));
 return {...limb(root,knee,ankle,side,'leg'),scale:1+ankle.z*.0015};
}
function climbHand(side,t){
 const [y]=sample([[0,-78,0,0],[.12,-78,0,0],[.25,-104,0,0],[.35,-104,0,0],[.46,-78,0,0]],unitTime(t+(side===1?.5:0)));
 return target(side*46,y,12);
}
const hammerAngle=t=>sample([[0,-.80,0,0],[.20,-.95,0,0],[.36,.45,0,0],[.45,.45,0,0],[.75,-.80,0,0]],t)[0];
const campHand=t=>{const [lift]=sample([[0,11,0,0],[.20,17,0,0],[.36,0,0,0],[.45,0,0,0],[.75,11,0,0]],t);return target(37,68-lift,18);};
export function outdoorPose(id,phase,resting=false){
 if(!OUTDOOR_IDS.includes(id))throw new Error('Unknown outdoor activity');
 const t=resting?0:unitTime(phase/TAU),p=t*TAU,sin=resting?0:Math.sin(p),pulse=resting?0:(1-Math.cos(p))/2;
 let x=0,y=8,lean=0;
 if(id==='hiking'){x=sin*2;y=9+Math.cos(p*2)*2;lean=5;}
 if(id==='trailrunning'){x=sin*9;y=5-(resting?0:Math.sin(p*2)**2*10);lean=8;}
 if(id==='camping'){x=-14;y=72;lean=5;}
 if(id==='climbing'){x=sin*4;y=12-Math.sin(p)**2*8;}
 if(id==='surfing'){x=sin*9;y=29+pulse*12;lean=3;}
 if(id==='freediving'||id==='scubadiving'){x=sin*1.4;y=0;}
 if(id==='kayaking'){x=sin*2;y=43;lean=3;}
 const hip=point(x,y),neck=point(x*.65,y-78+lean);
 const legs=[-1,1].map(side=>{
  const root=point(hip.x+side*13,hip.y),q=p+(side===1?0:Math.PI);
  if(id==='hiking'){
   const lift=resting?0:Math.max(0,Math.sin(q))**2;
   return solve(root,point(side*25,122-33*lift,8+28*lift),side,'leg',point(side*.12,0,1));
  }
  if(id==='trailrunning'){
   const [thigh,flex]=resting?[0,.14]:sample([[0,.45,.35],[.18,.05,.20],[.38,-.52,.28],[.56,-.30,1.05],[.76,.58,.95],[.92,.58,.43]],unitTime(t+(side===1?0:.5)));
   return legFK(root,side,thigh,flex,5);
  }
  if(id==='camping'){
   const knee=extend(root,62,side*13,51,32),ankle=extend(knee,60,side*4,-14,-58);
   return {...limb(root,knee,ankle,side,'leg'),scale:1+ankle.z*.0015};
  }
  if(id==='climbing'){
   const [height]=sample([[0,101,0,0],[.20,101,0,0],[.36,77,0,0],[.58,77,0,0],[.79,101,0,0]],unitTime(t+(side===1?0:.5)));
   return solve(root,point(side*47,height,8),side,'leg',point(side*.75,0,1));
  }
  if(id==='surfing')return solve(root,point(side*43,112,8),side,'leg',point(side*.5,0,1));
  if(id==='freediving'){
   const kick=resting?0:Math.sin(p)*.20,flex=resting?.10:.14+.12*(1-Math.cos(p-.5));
   return legFK(root,side,kick,flex,2);
  }
  if(id==='scubadiving'){
   const fold=resting?.2:(1-Math.cos(p))/2;
   const knee=extend(root,62,side*(7+22*fold),54,18*fold);
   const ankle=extend(knee,60,side*(3+19*fold),55,-22*fold);
   return {...limb(root,knee,ankle,side,'leg'),scale:1+ankle.z*.0015};
  }
  if(id==='kayaking')return solve(root,point(side*26,119,25),side,'leg',point(side*.3,0,1));
  return solve(root,point(side*26,122,4),side,'leg',point(side*.15,0,1));
 });
 // Trail bounds retain anatomical lengths and include a genuine airborne
 // interval. Shift the complete rig, rather than stretching a support leg.
 if(id==='trailrunning'){
  const floor=Math.max(...legs.map(l=>l.ankle.y));
  const flight=resting?0:Math.sin(p*2)**2*12,shift=122-flight-floor;
  hip.y+=shift;neck.y+=shift;
  for(const l of legs){for(const key of ['hip','knee','ankle']){l.world[key].y+=shift;l[key].y+=shift;}}
 }
 const paddleAngle=resting?0:Math.sin(p)*.48,paddleCenter=point(sin*4,6);
 const arms=[-1,1].map(side=>{
  const shrug=id==='freediving'?22:0,shoulder=point(neck.x+side*25,neck.y+16-shrug);
  let end;
  if(id==='hiking')end=target(side*43,neck.y+52+Math.sin(p+(side===1?Math.PI:0))*10,26);
  if(id==='trailrunning'){
   const counter=resting?0:Math.sin(p+(side===1?Math.PI:0));
   const elbow=extend(shoulder,39,side*10,31,-counter*21);
   const wrist=extend(elbow,33,side*-8,-20-counter*7,24);
   return {...limb(shoulder,elbow,wrist,side,'arm'),handOpen:false};
  }
  if(id==='camping')end=side===1?campHand(t):target(-39,24,24);
  if(id==='climbing')end=climbHand(side,t);
  if(id==='surfing')end=target(hip.x+side*(84+2*sin),neck.y+22+side*sin*14,18);
  if(id==='freediving')end=target(neck.x+side*24,neck.y-70,12);
  if(id==='scubadiving')end=target(neck.x+side*20,neck.y+45+side*sin*2,30);
  if(id==='kayaking')end=target(paddleCenter.x+side*29*Math.cos(paddleAngle),paddleCenter.y+side*29*Math.sin(paddleAngle),28);
  if(id==='fishing')end=side===1?target(30,-28+sin*3,25):target(23+Math.cos(p)*4,-17+sin*7,25);
  const arm=solve(shoulder,end,side,'arm');return {...arm,handOpen:['surfing','freediving','scubadiving'].includes(id)};
 });
 const o={sport:id,t,p,resting},r={front:true,hip,neck,legs,arms,phase,resting,
  torso:{chestYaw:0,hipYaw:0,chestScale:1},
  legOrder:[...legs].sort((a,b)=>a.ankle.z-b.ankle.z).map(l=>l.side),armOrder:[-1,1],
  shoulderRig:{left:arms[0].shoulder,right:arms[1].shoulder,roots:arms.map(a=>({side:a.side,root:{x:mix(a.shoulder.x,neck.x,.23),y:a.shoulder.y-3}}))},outdoor:o};
 if(id==='hiking')o.poles=arms.map((a,i)=>{const lift=resting?0:Math.max(0,Math.sin(p+(i?Math.PI:0)))**2;return {grip:{...a.wrist},tip:point(a.wrist.x+a.side*14,146-lift*15)};});
 if(id==='camping'){
  const grip=arms[1].wrist,angle=hammerAngle(t);o.hammer={grip:{...grip},angle,head:point(grip.x+Math.sin(angle)*42,grip.y+Math.cos(angle)*42)};
  o.stake=point(37+Math.sin(.45)*42,68+Math.cos(.45)*42);
 }
 if(id==='climbing')o.holds=[...[-1,1].flatMap(s=>[-78,-104].map(y=>point(s*46,y))),...[-1,1].flatMap(s=>[101,77].map(y=>point(s*47,y+23)))];
 if(id==='surfing')o.frame={x:0,y:135,angle:sin*.055,scale:1,pivotY:135};
 if(id==='freediving')o.frame={x:0,y:-4,angle:Math.PI+sin*.07,scale:.82,pivotY:0};
 if(id==='scubadiving')o.frame={x:0,y:16,angle:Math.PI/2+sin*.055,scale:.80,pivotY:0};
 if(id==='kayaking'){
  // Both grips are authored on one rigid shaft; solve first, then render the
  // paddle through the actual wrist positions, including its blade tips.
  const a=arms[0].wrist,b=arms[1].wrist;
  o.paddle={a:{...a},b:{...b},center:point((a.x+b.x)/2,(a.y+b.y)/2),angle:Math.atan2(b.y-a.y,b.x-a.x)};
  const down=Math.sin(o.paddle.angle)>=0?1:-1;
  o.splash={x:o.paddle.center.x+down*142*Math.cos(o.paddle.angle),y:o.paddle.center.y+down*142*Math.sin(o.paddle.angle),opacity:Math.min(1,Math.abs(Math.sin(o.paddle.angle))*3)};
 }
 if(id==='fishing'){
  const grip=arms[1].wrist,angle=-.72+sin*.12;
  o.rod={grip:{...grip},tip:point(grip.x+Math.cos(angle)*122,grip.y+Math.sin(angle)*122),reel:point(grip.x-7,grip.y+11)};
  o.float=point(160+sin*3,143+Math.sin(p*2)*2);
 }
 if(id==='freediving'||id==='scubadiving')o.fins=legs.map(l=>({ankle:{...l.ankle},angle:Math.atan2(l.ankle.y-l.knee.y,l.ankle.x-l.knee.x)-Math.PI/2,length:id==='freediving'?57:41}));
 return r;
}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function shape(c,points,fill,stroke=INK,width=1.5){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
const rect=(c,x,y,w,h,fill)=>shape(c,[point(x,y),point(x+w,y),point(x+w,y+h),point(x,y+h)],fill);
function rock(c,x,y,size=12,color='#819483'){shape(c,[point(x-size,y),point(x-size*.5,y-size*.65),point(x+size*.45,y-size*.8),point(x+size,y),point(x+size*.4,y+4),point(x-size*.5,y+4)],color,'#56675a');}
export function applyOutdoorFrame(c,r){const f=r.outdoor?.frame;if(!f)return;c.translate(f.x,f.y);c.rotate(f.angle);c.scale(f.scale,f.scale);c.translate(0,-f.pivotY);}
export function drawOutdoorEnvironment(c,r,front=false){
 const o=r.outdoor;if(!o)return;const water=['surfing','kayaking','freediving','scubadiving'].includes(o.sport),dive=o.sport==='freediving'||o.sport==='scubadiving';
 c.save();
 if(water&&!front){
  if(dive){
   shape(c,[point(-184,-182),point(182,-182),point(196,159),point(-193,159)],'#4b8e9422','#6caaa94d');
   for(const s of [-1,1])for(let i=0;i<3;i++){
    const x=s*(149+i*10);c.beginPath();c.moveTo(x,155);c.bezierCurveTo(x-15,115,x+17,109,x+Math.sin(o.p+i)*6,79-i*15);c.strokeStyle=['#6d9f87','#50897e','#83ad8d'][i];c.lineWidth=5-i;c.stroke();
   }
  }else{oval(c,0,o.sport==='kayaking'?108:146,o.sport==='kayaking'?158:136,o.sport==='kayaking'?60:17,'#60999d2e','#77b8b369',1);}
 }
 if(front&&water&&!dive){
  for(const [y,span] of [[145,133],[156,120]]){c.beginPath();for(let x=-span;x<=span;x+=4){const h=y+Math.sin(x*.06-o.p*2)*2.4;x===-span?c.moveTo(x,h):c.lineTo(x,h);}c.strokeStyle='#a5d4ca88';c.lineWidth=1.7;c.stroke();}
 }
 if(front&&o.splash){const s=o.splash;c.save();c.globalAlpha=s.opacity;oval(c,s.x,s.y+3,19,4,'#b7e0d322','#a6d8cc99',1.4);c.restore();}
 if(front&&o.sport==='scubadiving'){
  const f=o.frame,local=point(r.neck.x,r.neck.y-14);
  const mouth=point(f.x+(local.x*Math.cos(f.angle)-local.y*Math.sin(f.angle))*f.scale,f.y+(local.x*Math.sin(f.angle)+local.y*Math.cos(f.angle))*f.scale);
  for(let i=0;i<4;i++){
   const u=unitTime(o.t+i/4);c.save();c.globalAlpha=Math.sin(Math.PI*u)**2*.65;
   oval(c,mouth.x+Math.sin(u*TAU+i)*8,mouth.y-u*140,2+u*3,2+u*3,'#afd9d51a','#b7e5e1',1);c.restore();
  }
 }
 c.restore();
}
export function drawOutdoorBack(c,r){
 const o=r.outdoor;if(!o)return;c.save();
 if(o.sport==='hiking'||o.sport==='trailrunning'){
  shape(c,[point(-113,150),point(-58,137),point(-10,147),point(39,133),point(111,148),point(111,156),point(-113,156)],'#687c5a44',null);
  for(const [x,y,s]of [[-72,147,13],[-25,146,12],[29,146,14],[79,140,11]])rock(c,x,y,s);
  if(o.sport==='trailrunning'){
   line(c,[point(-70,157),point(66,157)],'#9d8060',9);for(const x of [-55,-13,28,55])line(c,[point(x,154),point(x+3,160)],'#5e5c47',1.5);
  }
  const h=r.hip,n=r.neck,wide=o.sport==='hiking'?38:29;
  shape(c,[point(h.x-wide,n.y+14),point(h.x+wide,n.y+14),point(h.x+wide+2,h.y+6),point(h.x-wide-2,h.y+6)],o.sport==='hiking'?'#b29b6f':'#718f91');
  if(o.sport==='hiking')for(const s of [-1,1])rect(c,h.x+s*42-5,n.y+50,10,22,'#7d9d98');
 }
 if(o.sport==='camping'){
  const x=111;
  shape(c,[point(46,142),point(x,21),point(185,142)],'#c6a778');
  shape(c,[point(x,21),point(128,142),point(185,142)],'#8b9c77');
  shape(c,[point(69,139),point(x,57),point(126,139)],'#435d4d');
  line(c,[point(x,21),point(128,142)],'#e4cda2',2);line(c,[point(185,142),point(205,147)],'#bfb38b',1);
  rect(c,-79,133,24,10,'#bb8d65');line(c,[point(-81,145),point(-53,145)],'#71664d',3);
 }
 if(o.sport==='climbing'){
  shape(c,[point(-103,146),point(-94,-153),point(-35,-175),point(70,-163),point(100,-112),point(104,146)],'#74806b44','#71846a77');
  for(const [x,y]of [[-71,-131],[68,-23],[-70,39],[15,-145],[73,123]])line(c,[point(x-8,y),point(x+4,y+14),point(x-3,y+24)],'#91a18a44',1.5);
  o.holds.forEach((h,i)=>rock(c,h.x,h.y,9,['#c19c77','#9cae80','#b896a1'][i%3]));
  line(c,[point(0,-176),point(r.hip.x,r.hip.y+2),point(r.hip.x+8,149)],'#d8bd8b',2);
 }
 if(o.sport==='surfing'){
  c.save();c.translate(0,137);c.rotate(-.035);oval(c,0,0,103,12,'#edcba0','#795b48',2);
  line(c,[point(-88,0),point(88,0)],'#9cbbad',4);oval(c,0,-1,15,3,'#f5e5c3',null);c.restore();
 }
 if(o.sport==='scubadiving'){
  for(const s of [-1,1]){
   oval(c,r.hip.x+s*26,r.neck.y+49,12,43,'#a9b6ac','#53675d',2);
   rect(c,r.hip.x+s*26-10,r.neck.y+31,20,7,'#4d685f');
  }
 }
 if(o.sport==='kayaking'){
  shape(c,[point(0,23),point(67,50),point(58,103),point(0,176),point(-58,103),point(-67,50)],'#b69062','#755d48',2);
  oval(c,0,54,38,23,'#314e46','#d9be91',3);
 }
 if(o.sport==='fishing'){
  oval(c,158,148,50,9,'#6faaa333','#88b9ad88',1);
  shape(c,[point(-72,119),point(-45,119),point(-48,144),point(-68,144)],'#9eada0');oval(c,-58,119,14,4,'#728d83');
  c.beginPath();c.arc(-58,119,12,Math.PI,TAU);c.strokeStyle='#d5c39b';c.lineWidth=2;c.stroke();
 }
 c.restore();
}
export function drawOutdoorMiddle(c,r){
 if(r.outdoor?.sport!=='kayaking')return;c.save();
 shape(c,[point(-63,63),point(-45,110),point(0,176),point(45,110),point(63,63),point(36,79),point(-36,79)],'#cba477','#775d47',2);
 line(c,[point(0,84),point(0,163)],'#efe0b8',3);
 for(const y of [103,118,133])line(c,[point(-17,y),point(17,y)],'#7e7053',2);
 c.restore();
}
export function drawOutdoorTorso(c,r){
 const id=r.outdoor?.sport;if(!id)return;const n=r.neck,h=r.hip;c.save();
 if(['hiking','trailrunning','scubadiving'].includes(id)){
  for(const s of [-1,1])line(c,[point(n.x+s*20,n.y+16),point(h.x+s*15,h.y-14)],id==='hiking'?'#c8b58d':'#526e68',5);
  line(c,[point(h.x-16,h.y-26),point(h.x+16,h.y-26)],'#d8c7a5',3);
 }
 if(id==='climbing'){
  line(c,[point(h.x-23,h.y+1),point(h.x+23,h.y+1)],'#af8f74',6);
  for(const s of [-1,1])line(c,[point(h.x+s*20,h.y+5),point(h.x+s*10,h.y+20),point(h.x,h.y+4)],'#c5a67d',3);
  oval(c,h.x,h.y+2,4,6,'#d4c8a5');
 }
 c.restore();
}
export function drawOutdoorFront(c,r,colors){
 const o=r.outdoor;if(!o)return;c.save();
 if(o.poles)for(const pole of o.poles){line(c,[pole.grip,pole.tip],'#b9bfa6',3);line(c,[point(pole.grip.x,pole.grip.y-5),point(pole.grip.x,pole.grip.y+5)],'#526e61',6);oval(c,pole.tip.x,pole.tip.y,5,1.8,'#a5a887');}
 if(o.hammer){
  const m=o.hammer;line(c,[m.grip,m.head],'#d6b07e',5);c.save();c.translate(m.head.x,m.head.y);c.rotate(-m.angle);rect(c,-13,-6,26,12,'#84958a');c.restore();
  line(c,[o.stake,point(o.stake.x-3,141)],'#c5c0a3',3);line(c,[point(o.stake.x-5,o.stake.y),point(o.stake.x+5,o.stake.y)],'#d8c9a5',3);
 }
 if(o.paddle){
  const d=o.paddle;c.save();c.translate(d.center.x,d.center.y);c.rotate(d.angle);
  line(c,[point(-122,0),point(122,0)],'#e1c89c',5);
  for(const s of [-1,1])shape(c,[point(s*91,-5),point(s*111,-11),point(s*139,-7),point(s*142,4),point(s*112,10),point(s*91,5)],'#8fb3aa','#4f746b');
  c.restore();
 }
 if(o.rod){
  const d=o.rod;line(c,[d.grip,d.tip],'#b7ba91',3);line(c,[point(d.grip.x-5,d.grip.y+5),d.grip],'#836c50',6);
  oval(c,d.reel.x,d.reel.y,6,6,'#a5b7a1');line(c,[d.reel,r.arms[0].wrist],'#d9c8a6',2);
  c.beginPath();c.moveTo(d.tip.x,d.tip.y);c.quadraticCurveTo(o.float.x+8,30,o.float.x,o.float.y);c.strokeStyle='#cdd5b1aa';c.lineWidth=.9;c.stroke();
  oval(c,o.float.x,o.float.y,4,6,'#d9a087');line(c,[point(o.float.x,o.float.y-10),point(o.float.x,o.float.y-4)],'#d9d4ab',1);
  oval(c,o.float.x,o.float.y+4,12+Math.sin(o.p)**2*6,3,'#a4cfbc22','#83b4a766',.8);
 }
 if(o.fins){
  for(const f of o.fins){c.save();c.translate(f.ankle.x,f.ankle.y);c.rotate(f.angle);
   shape(c,[point(-9,5),point(9,5),point(17,f.length),point(0,f.length+5),point(-17,f.length)],o.sport==='freediving'?'#7eaaa0':'#b7ad7c','#46675c',1.8);
   for(const x of [-6,6])line(c,[point(x,15),point(x*1.5,f.length-4)],'#d1d8b07a',1);c.restore();
  }
  const h=point(r.neck.x,r.neck.y-27);
  line(c,[point(h.x-31,h.y-3),point(h.x+31,h.y-3)],'#4f7468',3);
  for(const s of [-1,1]){oval(c,h.x+s*12,h.y-2,11,9,'#9ad4d544','#cddcc0',2);line(c,[point(h.x+s*12-5,h.y-6),point(h.x+s*12+1,h.y-8)],'#e9f4d9aa',1);}
  if(o.sport==='scubadiving'){
   oval(c,h.x,h.y+14,6,5,'#6f8f80','#d7d3ae',1.5);
   c.beginPath();c.moveTo(h.x+5,h.y+14);c.bezierCurveTo(h.x+47,h.y+24,h.x+42,h.y+70,h.x+22,h.y+68);c.strokeStyle='#536b61';c.lineWidth=4;c.stroke();
  }
 }
 if(o.sport==='surfing')line(c,[r.legs[1].ankle,point(64,143),point(-80,141)],'#8b9f89',1.2);
 if(o.poles||o.hammer||o.paddle||o.rod||o.sport==='climbing')for(const a of r.arms)oval(c,a.wrist.x,a.wrist.y,5,4.3,colors.skin,colors.skinInk,1.2);
 c.restore();
}
