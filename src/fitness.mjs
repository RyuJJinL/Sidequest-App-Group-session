// SPDX-License-Identifier: GPL-3.0-or-later
// Original exercise loops on the shared clothed rig. Equipment contacts use
// the same solved joints as the body, including pedals, handles and weights.
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
import {chain,limb} from './actions.mjs';
export const FITNESS_IDS=['gym','pilates','yoga','cycling','dance','swimming','crossfit'];
const TAU=Math.PI*2,INK='#543c35';
const point=(x,y,z=0)=>({x,y,z});
const mix=(a,b,t)=>a+(b-a)*t;
const sample=(keys,t)=>sampleAnglePath(keys.map(([p,...v])=>[p*TAU,...v]),t*TAU);
const target=(x,y,z=24)=>point(x/(1+z*.0012),y,z);
function solve(start,end,side,type,pole){
 const [a,b]=type==='leg'?[62,60]:[39,33];
 const c=chain(start,end,a,b,pole??point(side,0,.35));
 return {...limb(start,c.middle,c.end,side,type),handOpen:true};
}
function extend(start,length,x,y,z){
 const k=length/Math.hypot(x,y,z);return point(start.x+x*k,start.y+y*k,start.z+z*k);
}
const swing=t=>sample([[0,12,0,0],[.18,40,0,0],[.43,8,1,0],[.56,8,1,0],[.80,32,.12,0]],t);
function setup(id,t,resting){
 const p=t*TAU,beat=resting?0:Math.sin(p),pulse=resting?0:(1-Math.cos(p))/2;
 let x=0,y=8,lean=0;
 if(id==='pilates'){x=-pulse*2;y=1;}
 if(id==='yoga'){x=-8+(resting?0:Math.sin(p)*.6);y=2+pulse*1.2;}
 if(id==='cycling')y=18+(resting?0:Math.sin(p*2)*.5);
 if(id==='dance'){x=12*beat;y=8+(resting?0:Math.sin(p*2)**2*5);}
 if(id==='swimming'){y=0;x=resting?0:Math.sin(p*2)*1.4;}
 if(id==='crossfit'){y=swing(t)[0];lean=(y-8)*.22;}
 const hip=point(x,y),neck=point(x*.7,y-78+lean);
 return {hip,neck,p,pulse,beat};
}
export function fitnessPose(id,phase,resting=false){
 if(!FITNESS_IDS.includes(id))throw new Error('Unknown fitness activity');
 const t=resting?0:((phase/TAU)%1+1)%1,{hip,neck,p,pulse,beat}=setup(id,t,resting);
 const legs=[-1,1].map(side=>{
  const root=point(hip.x+side*13,hip.y);
  if(id==='swimming'){
   const kick=resting?0:Math.sin(p*2+(side===1?Math.PI:0))*.14;
   const knee=extend(root,62,side*2,62*Math.cos(kick),62*Math.sin(kick));
   const ankle=extend(knee,60,side*1,60*Math.cos(kick-.10),60*Math.sin(kick-.10));
   return {...limb(root,knee,ankle,side,'leg'),scale:1+ankle.z*.0015};
  }
  if(id==='pilates'&&side===1){
   const angle=.14+pulse*.60;
   const knee=extend(root,62,62*Math.sin(angle),62*Math.cos(angle),3);
   const ankle=extend(knee,60,60*Math.sin(angle-.035),60*Math.cos(angle-.035),1);
   return {...limb(root,knee,ankle,side,'leg'),scale:1+ankle.z*.0015};
  }
  if(id==='yoga'&&side===1)return solve(root,point(hip.x-6,58,8),side,'leg',point(1,0,.08));
  if(id==='cycling'){
   const angle=p+(side===1?0:Math.PI);
   const ankle=point(side*25,96+21*Math.cos(angle),24+21*Math.sin(angle));
   return solve(root,ankle,side,'leg',point(side*.45,0,1));
  }
  if(id==='dance'){
   const lift=resting?0:Math.max(0,side*beat)*10;
   return solve(root,point(side*(25+8*Math.abs(beat)),122-lift,4),side,'leg',point(side*.15,0,1));
  }
  return solve(root,point(id==='yoga'?-20:side*(id==='crossfit'?32:25),122,4),side,'leg',point(side*.15,0,1));
 });
 const arms=[-1,1].map(side=>{
  const shoulder=point(neck.x+side*25,neck.y+16);
  if(id==='gym'){
   const curl=resting?.1:(1-Math.cos(p+(side===1?0:Math.PI)))/2;
   const flex=.18+curl*2.18,elbow=extend(shoulder,39,side*5,37,10);
   const wrist=extend(elbow,33,side*3,33*Math.cos(flex),33*Math.sin(flex));
   return {...limb(shoulder,elbow,wrist,side,'arm'),handOpen:false};
  }
  if(id==='swimming'){
   const angle=resting?side*.25:p+(side===1?Math.PI:0);
   // Nonzero lateral reach avoids a camera-axis singularity as each arm
   // reaches past the head, pulls through the water, then recovers overhead.
   const elbow=extend(shoulder,39,side*(12+15*Math.sin(angle)**2),-30*Math.cos(angle),22*Math.sin(angle));
   const wrist=extend(elbow,33,side*8,-28*Math.cos(angle-.48),16*Math.sin(angle-.48));
   return {...limb(shoulder,elbow,wrist,side,'arm'),handOpen:true};
  }
  let end;
  if(id==='pilates')end=target(hip.x+side*(36+pulse*18),hip.y-14-pulse*22,22);
  if(id==='yoga')end=target(neck.x+side*4,neck.y+36,25);
  if(id==='cycling')end=target(side*34,-29,36);
  if(id==='dance'){
   const wave=resting?0:Math.sin(p+(side===1?Math.PI:0));
   end=target(hip.x+side*(42+10*wave),hip.y-30-27*wave,28);
  }
  if(id==='crossfit'){
   const lift=swing(t)[1];end=target(side*6, mix(hip.y-6,neck.y+26,lift),mix(24,61,lift));
  }
  const arm=solve(shoulder,end,side,'arm');
  return {...arm,handOpen:!['crossfit','cycling'].includes(id)};
 });
 const r={front:true,hip,neck,legs,arms,phase,resting,
  torso:{chestYaw:0,hipYaw:0,chestScale:1},
  legOrder:[...legs].sort((a,b)=>a.ankle.z-b.ankle.z).map(l=>l.side),armOrder:[-1,1],
  shoulderRig:{left:arms[0].shoulder,right:arms[1].shoulder,roots:arms.map(a=>({side:a.side,root:{x:mix(a.shoulder.x,neck.x,.23),y:a.shoulder.y-3}}))},
  fitness:{sport:id,t,p,resting}};
 const f=r.fitness;
 if(id==='gym')f.weights=arms.map(a=>({...a.wrist,angle:0}));
 if(id==='crossfit')f.kettlebell=point((arms[0].wrist.x+arms[1].wrist.x)/2,(arms[0].wrist.y+arms[1].wrist.y)/2+4);
 if(id==='cycling'){
  f.pedals=legs.map(l=>point(l.ankle.x,l.ankle.y+18,l.ankle.z));
  f.handles=arms.map(a=>({...a.wrist}));
 }
 return r;
}
function line(c,points,color=INK,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function shape(c,points,fill,stroke=INK){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}}
function mat(c,color){
 shape(c,[point(-100,136),point(93,136),point(118,153),point(-120,153)],color,'#8da993');
 line(c,[point(-116,153),point(118,153)],'#416859',3);
}
export function drawFitnessBack(c,r){
 const f=r.fitness;if(!f)return;c.save();
 if(f.sport==='pilates'||f.sport==='yoga')mat(c,f.sport==='pilates'?'#a889a6':'#88a99b');
 if(f.sport==='gym'||f.sport==='crossfit'){
  for(const x of [-75,-25,25,75])line(c,[point(x-24,150),point(x+24,150)],'#81a18a44',2);
 }
 if(f.sport==='dance'){
  oval(c,0,142,92,8,'#d0a3b51b',null);
  for(const [x,y] of [[-98,-12],[94,-57]]){
   line(c,[point(x,y+12),point(x,y-10),point(x+9,y-13)],'#cda9be',2);
   oval(c,x-3,y+12,4,3,'#cda9be',null);
  }
 }
 if(f.sport==='cycling'){
  // Front view of a compact indoor cycle: one flywheel, saddle, bar and cranks.
  line(c,[point(-53,148),point(53,148)],'#536d67',8);
  line(c,[point(0,132),point(0,22)],'#9aafa3',7);
  line(c,[point(-21,25),point(21,25)],'#ddc5a1',9);
  oval(c,0,107,19,33,'#243d37','#a9baab',3);
  oval(c,0,107,12,25,'#668a7f','#49665d',2);
  line(c,[point(0,113),point(0,-16)],'#b8b7a2',5);
  line(c,[point(0,-16),point(0,-29)],'#b8b7a2',5);
  line(c,[f.handles[0],point(0,-29),f.handles[1]],'#d7d2b8',6);
  for(const h of f.handles)line(c,[point(h.x-5,h.y),point(h.x+5,h.y)],'#506e65',8);
  for(const p of f.pedals)line(c,[point(0,114),p],'#90a99a',3);
  oval(c,0,114,5,5,'#d3c5a4');
 }
 c.restore();
}
export function drawFitnessFront(c,r,colors){
 const f=r.fitness;if(!f)return;c.save();
 if(f.weights)for(const w of f.weights){
  c.save();c.translate(w.x,w.y);c.rotate(w.angle);
  line(c,[point(-16,0),point(16,0)],'#d5ccad',5);
  for(const x of [-16,16]){
   shape(c,[point(x-5,-12),point(x+5,-12),point(x+7,-7),point(x+7,7),point(x+5,12),point(x-5,12),point(x-7,7),point(x-7,-7)],'#738c88');
   line(c,[point(x,-8),point(x,8)],'#a5b6a4',1.5);
  }
  oval(c,0,0,5.4,4.5,colors.skin,colors.skinInk);c.restore();
 }
 if(f.kettlebell){
  const k=f.kettlebell;
  c.beginPath();c.ellipse(k.x,k.y+7,11,12,0,Math.PI,TAU);c.strokeStyle='#d8c7a3';c.lineWidth=5;c.stroke();
  oval(c,k.x,k.y+24,17,18,'#839f96');
  oval(c,k.x-4,k.y+20,4,7,'#a9bbae',null);
  for(const a of r.arms)oval(c,a.wrist.x,a.wrist.y,5,4,colors.skin,colors.skinInk,1.2);
 }
 if(f.pedals)for(const p of f.pedals)line(c,[point(p.x-11,p.y),point(p.x+11,p.y)],'#d1c19c',4);
 c.restore();
}
export function drawSwimWater(c,r,front=false){
 if(r.fitness?.sport!=='swimming')return;
 const p=r.fitness.p;c.save();
 if(!front){
  shape(c,[point(-207,-48),point(208,-48),point(224,102),point(-222,102)],'#4c909b2b','#7bb7bd66');
  for(const y of [-32,83])line(c,[point(-206,y),point(210,y)],'#d2d9b177',2);
 }else{
  for(const y of [-25,24,64]){
   c.beginPath();
   for(let x=-210;x<=210;x+=5){const h=y+Math.sin(x*.055-p*2)*3;x===-210?c.moveTo(x,h):c.lineTo(x,h);}
   c.strokeStyle='#9bd1d67a';c.lineWidth=y===24?3:1.5;c.stroke();
  }
  for(const side of [-1,1])oval(c,side*155,20+Math.sin(p+side)*5,16,3,'#acd8d433',null);
 }
 c.restore();
}
