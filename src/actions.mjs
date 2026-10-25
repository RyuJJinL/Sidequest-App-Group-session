// SPDX-License-Identifier: GPL-3.0-or-later
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
const TAU=Math.PI*2;
const add=(a,b)=>({x:a.x+b.x,y:a.y+b.y,z:a.z+b.z});
const mul=(a,s)=>({x:a.x*s,y:a.y*s,z:a.z*s});
const sub=(a,b)=>add(a,mul(b,-1));
const dot=(a,b)=>a.x*b.x+a.y*b.y+a.z*b.z;
const unit=a=>mul(a,1/Math.max(1e-9,Math.hypot(a.x,a.y,a.z)));
const project=p=>({x:p.x*(1+p.z*.0012),y:p.y,z:p.z});
// Analytic two-bone IK. The pole fixes a natural bend direction, rather than
// changing the limb's length to reach an authored hand or foot target.
function chain(start,target,a,b,pole){
 const delta=sub(target,start),axis=unit(delta);
 const distance=Math.max(Math.abs(a-b)+.001,Math.min(a+b-.001,Math.hypot(delta.x,delta.y,delta.z)));
 const along=(a*a-b*b+distance*distance)/(2*distance);
 const bend=unit(sub(pole,mul(axis,dot(pole,axis))));
 return {middle:add(add(start,mul(axis,along)),mul(bend,Math.sqrt(Math.max(0,a*a-along*along)))),end:add(start,mul(axis,distance))};
}
function limb(start,middle,end,side,type){
 const world=type==='leg'?{hip:start,knee:middle,ankle:end}:{shoulder:start,elbow:middle,wrist:end};
 return type==='leg'?{side,world,hip:project(start),knee:project(middle),ankle:project(end),scale:1+end.z*.0015}:
  {side,world,shoulder:project(start),elbow:project(middle),wrist:project(end),depth:end.z};
}
function rig(hip,neck,legs,arms,phase,resting){return {front:true,hip,neck,legs,arms,phase,resting,
 legOrder:[...legs].sort((a,b)=>a.ankle.z-b.ankle.z).map(l=>l.side),
 armOrder:[...arms].sort((a,b)=>a.depth-b.depth).map(a=>a.side)};}
function sagittal(start,length,angle,x){const span=Math.sqrt(length*length-(x-start.x)**2);return {x,y:start.y+span*Math.cos(angle),z:start.z+span*Math.sin(angle)};}
const WALK=[
 [0,.27,.13,0],[TAU*.2,.06,.12,0],[TAU*.4,-.28,.18,0],
 [TAU*.56,-.21,.52,0],[TAU*.74,.22,.48,0],[TAU*.9,.32,.24,0]
];
export function frontWalkPose(phase,resting=false){
 const raw=[-1,1].map(side=>{
  const [thigh,flex]=resting?[0,.06]:sampleAnglePath(WALK,phase+(side===1?Math.PI:0));
  const hip={x:side*13,y:0,z:0},knee=sagittal(hip,62,thigh,side*15),ankle=sagittal(knee,60,thigh-flex,side*15);
  return {side,hip,knee,ankle,thigh};
 });
 const y=122-Math.max(...raw.map(l=>l.ankle.y)),sway=resting?0:Math.sin(phase)*1.2;
 const shift=p=>({...p,x:p.x+sway,y:p.y+y});
 const legs=raw.map(l=>limb(shift(l.hip),shift(l.knee),shift(l.ankle),l.side,'leg'));
 const arms=raw.map(l=>{
  const upper=resting?0:-l.thigh*1.3,lower=upper+.5;
  const shoulder={x:l.side*25,y:-62,z:0},elbow=sagittal(shoulder,39,upper,l.side*31),wrist=sagittal(elbow,33,lower,l.side*29);
  return {...limb(shift(shoulder),shift(elbow),shift(wrist),l.side,'arm'),handOpen:true};
 });
 return rig({x:sway,y},{x:sway*.25,y:y-78},legs,arms,phase,resting);
}
// Each sport has its own ready / preparation / contact / follow-through /
// recovery poses. Wrist targets are relative to the torso, in world space.
const COURT={
 pickleball:{contact:.42,head:40,body:5,
  keys:[[0,34,-16,12,-1.05],[.20,53,-4,-16,-.35],[.42,52,-14,26,-.55],[.60,3,-22,34,-.4],[.82,23,-18,18,-.8]],
  free:[-30,-9,12],incoming:[180,-75],outgoing:[-170,-62]},
 tennis:{contact:.42,head:52,body:9,
  keys:[[0,42,-30,12,-1.2],[.22,69,-27,-20,.4],[.42,60,-20,23,-.25],[.62,-8,-43,39,-2.9],[.75,8,-12,30,-.2],[.86,42,-26,20,-.9]],
  free:[-56,-32,5],incoming:[205,-61],outgoing:[-190,-85]},
 badminton:{contact:.42,head:57,body:6,
  keys:[[0,38,-26,10,-1.1],[.22,47,-96,-25,-1.9],[.42,40,-123,10,-1.4],[.60,0,-45,36,-2.9],[.82,38,-26,15,-1.1]],
  free:[-47,-43,5],incoming:[165,-225],outgoing:[-150,-15]}
};
export function courtPose(sport,phase,resting=false,withProjectile=true){
 const c=COURT[sport];if(!c)throw new Error('Unknown court sport');
 const t=((phase/TAU)%1+1)%1;
 const [wx,wy,wz]=sampleAnglePath(c.keys.map(k=>[k[0]*TAU,...k.slice(1,4)]),resting?0:phase);
 const angle=sampleAnglePath(c.keys.map(k=>[k[0]*TAU,k[4],0,0]),resting?0:phase)[0];
 const transfer=resting?0:Math.sin((t-.15)*TAU);
 const hip={x:transfer*c.body,y:8+(resting?0:2*Math.sin(phase)**2)};
 const neck={x:hip.x-transfer*3,y:hip.y-78};
 const legs=[-1,1].map(side=>{
  const start={x:hip.x+side*13,y:hip.y,z:side*transfer*3};
  const ankle={x:side*30,y:122,z:side*5};
  const solved=chain(start,ankle,62,60,{x:side*.15,y:0,z:1});
  return limb(start,solved.middle,solved.end,side,'leg');
 });
 const balance=resting?0:Math.sin(Math.PI*Math.max(0,Math.min(1,(t-.08)/.62)))**2;
 const arms=[-1,1].map(side=>{
  const start={x:neck.x+side*25,y:neck.y+16,z:-side*transfer*6};
  const target=side===1?{x:hip.x+wx,y:hip.y+wy,z:wz}:
   {x:hip.x-30+(c.free[0]+30)*balance,y:hip.y-6+(c.free[1]+6)*balance,z:12+(c.free[2]-12)*balance};
  const solved=chain(start,target,39,33,side===1?{x:.65,y:.8,z:-.3}:{x:-.35,y:1,z:-.15});
  return {...limb(start,solved.middle,solved.end,side,'arm'),handOpen:side===-1};
 });
 const result=rig(hip,neck,legs,arms,phase,resting),grip=arms.find(a=>a.side===1).wrist;
 const head={x:grip.x+Math.cos(angle)*c.head,y:grip.y+Math.sin(angle)*c.head};
 result.equipment={sport,grip,angle,head,headDistance:c.head};
 if(!resting&&withProjectile){
  // The contact point comes from the same rig, so projectiles meet the strings.
  const contactHead=courtPose(sport,c.contact*TAU,false,false).equipment.head;
  const start=.10,end=.76;
  if(t>=start&&t<=end){
   const before=t<=c.contact,u=before?(t-start)/(c.contact-start):(t-c.contact)/(end-c.contact);
   const a=before?{x:c.incoming[0],y:c.incoming[1]}:contactHead;
   const b=before?contactHead:{x:c.outgoing[0],y:c.outgoing[1]};
   const arc=sport==='badminton'?12:18;
   result.projectile={x:a.x+(b.x-a.x)*u,y:a.y+(b.y-a.y)*u-arc*Math.sin(Math.PI*u),
    angle:Math.atan2(b.y-a.y,b.x-a.x),opacity:Math.min(1,(t-start)/.055,(end-t)/.055),shuttle:sport==='badminton'};
  }
 }
 return result;
}
