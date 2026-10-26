// SPDX-License-Identifier: GPL-3.0-or-later
// Eight authored creative activities, each with its own contact-driven tools.
// All hands and equipment use the same fixed-length rig as the wardrobe.
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
import {chain,limb} from './actions.mjs';
export const CREATIVE_IDS=['painting','drawing','pottery','photography','crafts','music','writing','filmmaking'];
const TAU=Math.PI*2,INK='#543c35';
const point=(x,y,z=0)=>({x,y,z}),mix=(a,b,t)=>a+(b-a)*t;
const sample=(keys,t)=>sampleAnglePath(keys.map(([p,...v])=>[p*TAU,...v]),t*TAU);
const target=(x,y,z=24)=>point(x/(1+z*.0012),y,z);
const seated=id=>['drawing','pottery','crafts','writing'].includes(id);
function solve(start,end,side,type){const [a,b]=type==='leg'?[62,60]:[39,33],c=chain(start,end,a,b,point(side*(type==='leg'?.15:1),0,type==='leg'?1:.35));return {...limb(start,c.middle,c.end,side,type),handOpen:false};}
function writingMove(t){
 const [x,y,lift]=sample([[0,24,43,0],[.16,43,43,0],[.23,45,43,5],[.31,24,49,0],[.48,44,49,0],[.55,45,49,5],[.63,24,55,0],[.80,43,55,0],[.87,42,50,11],[.96,24,43,0]],t);
 return {x,y,lift};
}
const photoLift=t=>sample([[0,0,0,0],[.18,0,0,0],[.37,1,0,0],[.60,1,0,0],[.82,0,0,0]],t)[0];
export function creativePose(id,phase,resting=false){
 if(!CREATIVE_IDS.includes(id))throw new Error('Unknown creative activity');
 const t=resting?0:((phase/TAU)%1+1)%1,p=t*TAU,sin=resting?0:Math.sin(p),pulse=resting?0:(1-Math.cos(p))/2;
 const x=id==='painting'||id==='filmmaking'?-20:id==='music'?sin*2:0,y=seated(id)?43:8;
 const hip=point(x,y),neck=point(x*.7,y-78),c={activity:id,t,p,seated:seated(id),resting};
 const clay={halfWidth:18-pulse*3,height:33+pulse*6,baseY:56};
 const pan=resting?0:sin*.14,video={x:66,y:-44,angle:pan};
 const cameraY=mix(hip.y-24,neck.y-29,photoLift(t));
 const ink=id==='writing'?writingMove(t):{x:31+Math.cos(p)*11,y:48+Math.sin(p*2)*4,lift:0};
 const legs=[-1,1].map(side=>{
  const pedal=id==='pottery'&&side===-1&&!resting?Math.sin(p*2)**2*3:0;
  return solve(point(hip.x+side*13,hip.y),point(x+side*26,122-pedal,4),side,'leg');
 });
 const arms=[-1,1].map(side=>{
  const shoulder=point(neck.x+side*25,neck.y+16);let end;
  if(id==='painting')end=side===1?target(45+Math.cos(p)*11,-23+Math.sin(p)*17,24):target(-52,-3,27);
  if(id==='drawing'||id==='writing')end=side===1?target(ink.x-7,ink.y-9-ink.lift,23):target(-20,31,25);
  if(id==='pottery')end=target(side*clay.halfWidth,clay.baseY-clay.height*.55,25);
  if(id==='photography')end=target(side*21,cameraY+6,28);
  if(id==='crafts')end=side===1?target(32+sin*3,33+Math.sin(p*2)*2,24):target(-8,38,25);
  if(id==='music')end=side===-1?target(hip.x-48-sin*5,hip.y-39-sin*3.79,25):target(hip.x+9,hip.y-12+(resting?0:Math.sin(p*3)*10),28);
  if(id==='filmmaking')end=side===1?target(video.x-34*Math.cos(pan)-9*Math.sin(pan),video.y-34*Math.sin(pan)+9*Math.cos(pan),24):target(-40,-7,24);
  const arm=solve(shoulder,end,side,'arm');return {...arm,handOpen:id==='pottery'};
 });
 const r={front:true,hip,neck,legs,arms,phase,resting,torso:{chestYaw:0,hipYaw:0,chestScale:1},
  legOrder:[...legs].sort((a,b)=>a.ankle.z-b.ankle.z).map(l=>l.side),armOrder:[-1,1],
  shoulderRig:{left:arms[0].shoulder,right:arms[1].shoulder,roots:arms.map(a=>({side:a.side,root:{x:mix(a.shoulder.x,neck.x,.23),y:a.shoulder.y-3}}))},creative:c};
 const hand=arms[1].wrist;
 if(id==='painting'){
  c.brush={grip:{...hand},tip:point(hand.x+25,hand.y-10)};
  c.palette={grip:{...arms[0].wrist},x:arms[0].wrist.x-4,y:arms[0].wrist.y+7};
 }
 if(id==='drawing'||id==='writing')c.pen={grip:{...hand},tip:point(hand.x+7,hand.y+9),lift:ink.lift,kind:id==='drawing'?'pencil':'pen'};
 if(id==='pottery'){c.clay=clay;c.wheelAngle=resting?0:p*3;}
 if(id==='photography')c.camera={x:(arms[0].wrist.x+hand.x)/2,y:(arms[0].wrist.y+hand.y)/2-6,flash:resting?0:Math.max(0,1-Math.abs(t-.48)/.022),lift:photoLift(t)};
 if(id==='crafts')c.scissors={grip:{...hand},pivot:point(hand.x+8,hand.y+7),opening:resting?.18:.12+(1-Math.cos(p*3))*.20};
 if(id==='music')c.guitar={x:hip.x+6,y:hip.y-10,fretting:{...arms[0].wrist},strumming:{...hand}};
 if(id==='filmmaking')c.video={...video,handle:{...hand}};
 return r;
}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function shape(c,points,fill,stroke=INK,width=1.5){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
const rect=(c,x,y,w,h,fill,stroke=INK)=>shape(c,[point(x,y),point(x+w,y),point(x+w,y+h),point(x,y+h)],fill,stroke);
function chair(c){
 shape(c,[point(-39,-43),point(39,-43),point(42,64),point(-42,64)],'#5c7763');
 for(const x of [-28,28])line(c,[point(x,-32),point(x,56)],'#8ba18b',3);
 for(const x of [-35,35])line(c,[point(x,62),point(x,137)],'#7f9078',5);
}
function camera(c,x,y,flash=0){
 rect(c,x-22,y-13,44,28,'#6c827d');rect(c,x-14,y-18,16,7,'#8d9d8c');
 oval(c,x+1,y+1,12,12,'#b6c5b1');oval(c,x+1,y+1,8,8,'#2d4946');oval(c,x-1,y-2,3.5,3.5,'#80aeb0',null);
 rect(c,x+13,y-10,6,4,'#ecdcac');line(c,[point(x-17,y+9),point(x-9,y+9)],'#b9c7af',2);
 if(flash>0){c.save();c.globalAlpha=flash;oval(c,x+17,y-8,5,5,'#fff3c5',null);for(const a of [-.8,-1.5,-2.2])line(c,[point(x+17+Math.cos(a)*10,y-8+Math.sin(a)*10),point(x+17+Math.cos(a)*19,y-8+Math.sin(a)*19)],'#ffeab5',2);c.restore();}
}
export function drawCreativeBack(c,r){
 const a=r.creative;if(!a)return;c.save();
 if(a.seated)chair(c);
 if(['drawing','writing','crafts'].includes(a.activity))for(const x of [-74,79])line(c,[point(x,60),point(x,139)],'#977b5d',6);
 if(a.activity==='painting'){
  for(const x of [39,121])line(c,[point(80,-103),point(x,145)],'#b09a70',5);
  line(c,[point(107,-33),point(139,145)],'#8b7959',4);
  rect(c,37,-93,86,123,'#bca079');rect(c,42,-88,76,112,'#eee2c0');
  oval(c,96,-65,10,10,'#d5a37e',null);
  shape(c,[point(43,-29),point(65,-52),point(90,-22),point(117,-46),point(117,22),point(43,22)],'#8fab9b',null);
  shape(c,[point(43,1),point(77,-20),point(102,-3),point(117,-13),point(117,22),point(43,22)],'#6d8d7c',null);
  line(c,[point(64,-41),point(69,-48),point(76,-40),point(83,-47),point(90,-40)],'#edc79c',3);
  line(c,[point(34,34),point(127,34)],'#c3aa7b',6);
 }
 if(a.activity==='pottery'){
  line(c,[point(0,65),point(0,137)],'#98aa9e',10);line(c,[point(-39,141),point(40,141)],'#6c8177',7);
  line(c,[point(-42,132),point(-25,132)],'#c0b396',4);
 }
 if(a.activity==='filmmaking'){
  line(c,[point(66,-44),point(66,95)],'#a5b5a3',5);
  for(const x of [29,66,104])line(c,[point(66,54),point(x,145)],'#9cab99',4);
  for(const x of [29,66,104])line(c,[point(x-4,145),point(x+4,145)],'#4b6659',4);
 }
 c.restore();
}
export function drawCreativeMiddle(c,r){
 const a=r.creative;if(!a?.seated)return;c.save();
 if(a.activity==='pottery'){
  oval(c,0,66,52,12,'#718d82','#526a5f',2);oval(c,0,61,52,10,'#b3c2ad','#6a8477',2);
  for(let i=0;i<6;i++){const p=a.wheelAngle+i*TAU/6;line(c,[point(Math.cos(p)*29,61+Math.sin(p)*5),point(Math.cos(p)*47,61+Math.sin(p)*8)],'#718d8288',1.2);}
  oval(c,0,61,24,5,'#a7b59e','#7e9585',1);
 }else{
  shape(c,[point(-73,31),point(75,31),point(94,66),point(-90,66)],'#a28a66');
  rect(c,-90,66,184,8,'#77664f');
  if(a.activity==='crafts'){
   shape(c,[point(-56,36),point(64,36),point(78,62),point(-66,62)],'#78998c');
   for(const y of [42,48,54])line(c,[point(-58,y),point(67,y)],'#c2d0af55',.7);
   for(let x=-43;x<60;x+=13)line(c,[point(x,36),point(x+4,61)],'#c2d0af55',.7);
   shape(c,[point(-8,39),point(58,39),point(67,58),point(-2,58)],'#d6a393');
   shape(c,[point(-48,49),point(-35,40),point(-29,55)],'#dfbf8a');
   shape(c,[point(-45,57),point(-33,51),point(-24,60)],'#c7adca');
   oval(c,-51,40,4,4,'#e9d8b5');
  }else{
   shape(c,[point(-11,36),point(64,36),point(75,62),point(-20,62)],'#f1e6c9');
   if(a.activity==='drawing'){
    oval(c,30,49,15,7,'#eee4c9','#9b9b83',.8);
    line(c,[point(13,53),point(26,41),point(38,52),point(48,42),point(61,54)],'#7c927f',1.3);
    line(c,[point(9,57),point(61,57)],'#aaa68b',.8);
   }else{
    for(const y of [43,49,55]){
     line(c,[point(3,y),point(58,y)],'#b9c5ae',.7);
     const marks=[];for(let x=22;x<=44;x+=2)marks.push(point(x,y+Math.sin(x*2.8)*.7));line(c,marks,'#768e86',1);
    }
   }
   rect(c,-56,39,17,18,'#94aaa0');for(const x of [-53,-47,-42])line(c,[point(x,40),point(x-3,24)],'#dabd8e',2);
  }
 }
 c.restore();
}
export function drawCreativeTorso(c,r){
 const a=r.creative;if(!a)return;c.save();
 if(a.camera){
  const k=a.camera;c.beginPath();c.moveTo(k.x-20,k.y+10);c.quadraticCurveTo(r.hip.x-35,r.hip.y+9,r.neck.x-20,r.neck.y+18);c.moveTo(k.x+20,k.y+10);c.quadraticCurveTo(r.hip.x+35,r.hip.y+9,r.neck.x+20,r.neck.y+18);c.strokeStyle='#677c6a';c.lineWidth=3;c.stroke();
 }
 if(a.guitar){
  const g=a.guitar,h=r.hip;
  line(c,[point(r.neck.x+19,r.neck.y+17),point(h.x-15,h.y+10)],'#9c8162',5);
  c.beginPath();c.moveTo(g.x-6,g.y-34);c.bezierCurveTo(g.x-31,g.y-45,g.x-39,g.y-15,g.x-23,g.y-5);c.bezierCurveTo(g.x-55,g.y+18,g.x-27,g.y+49,g.x+8,g.y+36);c.bezierCurveTo(g.x+42,g.y+27,g.x+33,g.y-7,g.x+17,g.y-9);c.bezierCurveTo(g.x+26,g.y-31,g.x+8,g.y-45,g.x-6,g.y-34);c.closePath();c.fillStyle='#caa272';c.fill();c.strokeStyle=INK;c.lineWidth=2;c.stroke();
  const bridge=point(h.x+20,h.y+1),end=point(h.x-76,h.y-61);
  line(c,[point(h.x-18,h.y-17),end],'#8d7559',12);line(c,[point(h.x-18,h.y-17),end],'#b59a72',8);
  oval(c,h.x+7,h.y-15,11,12,'#725b43','#e6ca94',2);
  rect(c,bridge.x-7,bridge.y-3,13,7,'#715c46');
  for(let i=-2;i<=2;i++)line(c,[point(bridge.x,bridge.y+i),point(end.x,end.y+i)],'#e4d6b3',.55);
  for(let i=0;i<5;i++){const f=i/5;line(c,[point(mix(h.x-22,end.x,f)-2,mix(h.y-20,end.y,f)+4),point(mix(h.x-22,end.x,f)+3,mix(h.y-20,end.y,f)-3)],'#d6c4a3',1);}
  oval(c,end.x,end.y,8,7,'#a68a63');for(const s of [-1,1])for(const k of [-1,1])oval(c,end.x+s*7,end.y+k*6,2.5,2,'#d5c9ab');
 }
 c.restore();
}
export function drawCreativeFront(c,r,colors){
 const a=r.creative;if(!a)return;c.save();
 if(a.palette){const q=a.palette;oval(c,q.x,q.y,23,14,'#d4ba88');oval(c,q.x+9,q.y+3,5,4,colors.skin,colors.skinInk,1);for(const [x,y,color]of [[-13,-3,'#92ae98'],[-4,-7,'#d59f83'],[5,-7,'#a2b6ca'],[-9,5,'#d1b46f']])oval(c,q.x+x,q.y+y,4,3,color,null);}
 if(a.brush){const b=a.brush;line(c,[point(b.grip.x-8,b.grip.y+3),b.tip],'#bda375',3);line(c,[point(b.tip.x-8,b.tip.y+3),b.tip],'#bcc2ac',4);shape(c,[point(b.tip.x-3,b.tip.y-2),point(b.tip.x+5,b.tip.y-5),point(b.tip.x+4,b.tip.y+2),point(b.tip.x-2,b.tip.y+3)],'#c6a77a');}
 if(a.pen){const d=a.pen;line(c,[point(d.grip.x-9,d.grip.y-13),d.tip],d.kind==='pencil'?'#d6b07a':'#597f81',3);line(c,[point(d.tip.x-2,d.tip.y-3),d.tip],'#5d6559',1.5);}
 if(a.clay){
  const v=a.clay,y=v.baseY,top=y-v.height,w=v.halfWidth;
  c.beginPath();c.moveTo(-11,top);c.bezierCurveTo(-12,top+11,-w,top+13,-w,y-15);c.quadraticCurveTo(-w,y,-9,y);c.lineTo(9,y);c.quadraticCurveTo(w,y,w,y-15);c.bezierCurveTo(w,top+13,12,top+11,11,top);c.closePath();c.fillStyle='#c9967a';c.fill();c.strokeStyle=INK;c.lineWidth=1.6;c.stroke();
  oval(c,0,top,11,3.4,'#886b56','#e0b18d',1.5);
  for(const yy of [y-8,y-14,y-20])line(c,[point(-w+4,yy),point(w-4,yy)],'#af806788',.8);
 }
 if(a.camera)camera(c,a.camera.x,a.camera.y,a.camera.flash);
 if(a.scissors){
  const s=a.scissors;c.save();c.translate(s.pivot.x,s.pivot.y);
  for(const side of [-1,1]){c.save();c.rotate(side*s.opening);line(c,[point(-7,side*1),point(23,0)],'#bac4b3',3);oval(c,-11,side*4,7,4,'#d9b0ac','#8d7168',2);c.restore();}
  oval(c,0,0,2.6,2.6,'#e3d8b4');c.restore();
 }
 if(a.video){
  const v=a.video;c.save();c.translate(v.x,v.y);c.rotate(v.angle);
  rect(c,-18,-28,38,27,'#7b9186');shape(c,[point(20,-24),point(32,-30),point(32,-4),point(20,-9)],'#526f64');
  rect(c,-14,-40,23,11,'#b7c6ad');rect(c,-11,-38,17,7,'#466f6b');
  line(c,[point(-12,-31),point(11,-31)],'#c0c4a9',4);oval(c,13,-21,2.5,2.5,'#d6a18f',null);
  line(c,[point(0,0),point(-34,9)],'#d0c29f',4);c.restore();
 }
 // Finger overlays keep small tool grips visible without changing the
 // selected skin color or redrawing an arm in a different layer.
 for(const arm of r.arms)oval(c,arm.wrist.x,arm.wrist.y,a.activity==='pottery'?4.2:4.5,a.activity==='pottery'?6:3.8,colors.skin,colors.skinInk,1.2);
 c.restore();
}
