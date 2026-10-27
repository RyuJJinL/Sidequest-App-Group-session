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
export function chain(start,target,a,b,pole){
 const delta=sub(target,start),axis=unit(delta);
 const distance=Math.max(Math.abs(a-b)+.001,Math.min(a+b-.001,Math.hypot(delta.x,delta.y,delta.z)));
 const along=(a*a-b*b+distance*distance)/(2*distance);
 const bend=unit(sub(pole,mul(axis,dot(pole,axis))));
 return {middle:add(add(start,mul(axis,along)),mul(bend,Math.sqrt(Math.max(0,a*a-along*along)))),end:add(start,mul(axis,distance))};
}
export function limb(start,middle,end,side,type){
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
// Joint-space strokes: upper-arm elevation/sweep and elbow flexion determine
// the hand. Racket lag is relative to the forearm, never an independent path.
// Slow preparation, a short acceleration window, then a longer deceleration.
const STROKES={
 padel:{head:38,contact:.42,
  arm:[[0,.40,.55,1.45],[.18,.45,-.25,1.50],[.28,.48,-.45,1.45],[.34,.54,-.15,1.25],[.42,.85,.65,.68],[.53,1.05,1.50,.95],[.64,1.15,1.85,1.30],[.83,.46,.85,1.45]],
  wrist:[[0,.85,.70,1.55],[.18,1.0,.45,1.65],[.28,1.05,.35,1.70],[.34,.95,.40,1.65],[.42,.58,.70,1.45],[.53,.70,.65,1.15],[.64,.85,.65,1.05],[.83,.85,.70,1.55]],
  body:[[0,0,0,0],[.18,4,-.20,-.40],[.28,5,-.24,-.50],[.34,3,-.05,-.35],[.42,0,.12,.10],[.53,-3,.23,.36],[.64,-4,.25,.42],[.83,0,.02,.06]],
  support:[[0,.32,.95,1.55],[.18,.42,1.20,1.50],[.28,.48,1.30,1.45],[.42,.45,.80,1.25],[.64,.35,1.0,1.50],[.83,.32,.95,1.55]],
  supportSwivel:[[0,1.80,0,0],[.28,1.70,0,0],[.42,1.55,0,0],[.64,1.80,0,0]],
  incoming:[185,-55],outgoing:[-180,-65]},
 tabletennis:{head:25,contact:.42,crouch:6,
  arm:[[0,.40,.65,1.45],[.16,.43,.15,1.50],[.28,.46,-.10,1.50],[.34,.55,.20,1.20],[.42,.80,.80,.75],[.52,.96,1.50,.95],[.62,1.02,1.70,1.25],[.80,.44,.85,1.45],[.92,.40,.65,1.45]],
  wrist:[[0,.62,.80,1.50],[.16,.72,.60,1.55],[.28,.78,.50,1.60],[.34,.72,.55,1.50],[.42,.40,.65,1.30],[.52,.45,.55,1.15],[.62,.55,.65,1.15],[.80,.62,.80,1.50]],
  body:[[0,0,0,0],[.16,2,-.10,-.20],[.28,3,-.14,-.32],[.34,2,-.04,-.20],[.42,0,.07,.08],[.52,-2,.12,.24],[.62,-2,.13,.28],[.80,0,.02,.05],[.92,0,0,0]],
  support:[[0,.28,.95,1.60],[.28,.34,1.10,1.55],[.42,.34,.85,1.45],[.62,.30,1.0,1.55],[.80,.28,.95,1.60]],
  supportSwivel:[[0,1.80,0,0],[.28,1.75,0,0],[.42,1.60,0,0],[.62,1.80,0,0]],
  incoming:[150,-20],outgoing:[-150,-28]},
 pickleball:{head:40,contact:.42,
  arm:[[0,.42,.55,1.35],[.20,.40,-.65,1.30],[.33,.48,-.40,1.15],[.42,.74,.55,.65],[.49,.80,1.10,.85],[.61,.95,1.80,1.20],[.80,.50,.90,1.30]],
  wrist:[[0,.80,.65,1.65],[.20,.85,.50,1.80],[.33,1.0,.40,1.75],[.42,.65,.60,1.65],[.49,.90,.65,1.20],[.61,1.0,.70,.95],[.80,.80,.65,1.65]],
  body:[[0,0,0,0],[.20,5,-.20,-.38],[.33,3,-.04,-.28],[.42,0,.12,.06],[.61,-4,.22,.36],[.80,0,.04,.10]],
  free:[[0,-20,-26,28],[.20,-28,-28,23],[.42,-30,-25,25],[.61,-20,-22,25],[.80,-20,-26,28]],
  incoming:[180,-65],outgoing:[-170,-62]},
 tennis:{head:52,contact:.42,
  arm:[[0,.45,.55,1.40],[.12,.48,.10,1.42],[.23,.52,-.45,1.40],[.33,.60,-.35,1.15],[.42,1.05,.65,.40],[.49,1.25,1.65,.70],[.62,1.45,2.10,1.25],[.78,.60,.95,1.40],[.91,.45,.55,1.40]],
  wrist:[[0,1.10,.65,1.65],[.20,1.20,.30,1.80],[.33,1.25,.15,1.75],[.42,.65,.65,1.65],[.49,.85,.20,1.10],[.62,1.10,.65,.90],[.78,1.0,.60,1.65],[.91,1.10,.65,1.65]],
  body:[[0,0,0,0],[.12,3,-.17,-.30],[.23,7,-.34,-.78],[.33,4,-.02,-.60],[.42,0,.16,.08],[.49,-3,.25,.35],[.62,-6,.34,.65],[.78,0,.05,.18],[.91,0,0,0]],
  support:[[0,.30,1.05,1.60],[.12,.40,1.40,1.50],[.23,.48,1.50,1.45],[.36,.55,1.10,1.20],[.46,.50,.65,1.15],[.64,.35,1.1,1.60],[.82,.30,1.05,1.60]],
  supportSwivel:[[0,1.85,0,0],[.23,1.85,0,0],[.36,1.50,0,0],[.46,1.65,0,0],[.64,1.85,0,0]],
  incoming:[205,-65],outgoing:[-190,-85]},
 badminton:{head:57,contact:.42,
  arm:[[0,.60,.55,1.50],[.18,1.25,.30,1.75],[.30,1.45,.25,1.90],[.36,1.65,.45,1.45],[.42,2.10,.85,.60],[.54,1.15,1.90,.75],[.68,.45,2.10,1.05],[.88,.60,.55,1.50]],
  wrist:[[0,.80,1.25,1.20],[.18,.95,1.80,.45],[.30,.90,2.0,.35],[.36,.65,1.30,.25],[.42,.22,.45,.10],[.54,.35,.90,.70],[.68,.50,1.0,.95],[.88,.80,1.25,1.20]],
  body:[[0,0,0,0],[.18,3,-.20,-.32],[.30,3,-.18,-.38],[.36,2,-.04,-.22],[.42,0,.12,.06],[.54,-3,.22,.35],[.68,-2,.15,.22],[.88,0,0,0]],
  support:[[0,.38,.90,1.45],[.18,.50,.65,1.50],[.30,.55,.60,1.45],[.42,.40,.90,1.40],[.54,.45,1.0,1.20],[.68,.35,1.05,1.40],[.88,.38,.90,1.45]],
  supportSwivel:[[0,1.65,0,0],[.18,1.40,0,0],[.30,1.35,0,0],[.42,1.65,0,0],[.68,1.65,0,0]],
  incoming:[165,-205],outgoing:[-150,-15]}
};
const sample=(keys,phase)=>sampleAnglePath(keys.map(([t,...v])=>[t*TAU,...v]),phase);
const cross=(a,b)=>({x:a.y*b.z-a.z*b.y,y:a.z*b.x-a.x*b.z,z:a.x*b.y-a.y*b.x});
function turn(v,yaw){return {x:v.x*Math.cos(yaw)-v.z*Math.sin(yaw),y:v.y,z:v.x*Math.sin(yaw)+v.z*Math.cos(yaw)};}
function articulatedArm(start,elevation,sweep,flex,swivel,chestYaw,side=1){
 const upper={x:Math.sin(elevation)*Math.cos(sweep),y:Math.cos(elevation),z:Math.sin(elevation)*Math.sin(sweep)};
 // This orthonormal hinge frame follows the upper arm continuously, avoiding
 // the elbow flips caused by solving a moving hand against a fixed IK pole.
 const tangent={x:Math.cos(elevation)*Math.cos(sweep),y:-Math.sin(elevation),z:Math.cos(elevation)*Math.sin(sweep)};
 const lateral={x:-Math.sin(sweep),y:0,z:Math.cos(sweep)};
 const bend=add(mul(tangent,Math.cos(swivel)),mul(lateral,Math.sin(swivel)));
 const mirror=v=>({...v,x:v.x*side});
 const forearm=turn(mirror(add(mul(upper,Math.cos(flex)),mul(bend,Math.sin(flex)))),chestYaw);
 const wristUp=turn(mirror(add(mul(upper,-Math.sin(flex)),mul(bend,Math.cos(flex)))),chestYaw);
 const elbow=add(start,mul(turn(mirror(upper),chestYaw),39)),wrist=add(elbow,mul(forearm,33));
 return {...limb(start,elbow,wrist,side,'arm'),forearm,wristUp,elbowFlex:flex};
}
function racketFrame(arm,cock,roll,length,sport){
 const v=arm.forearm;
 const up=['badminton','padel','tabletennis'].includes(sport)?arm.wristUp:unit(sub({x:0,y:-1,z:0},mul(v,-v.y)));
 // Badminton inherits the elbow frame through vertical; global-up projection
 // would spin abruptly as the forearm approaches a vertical overhead reach.
 const sideways=unit(cross(v,up));
 const cockPlane=add(mul(up,Math.cos(roll)),mul(sideways,Math.sin(roll)));
 const direction=add(mul(v,Math.cos(cock)),mul(cockPlane,Math.sin(cock)));
 const worldHead=add(arm.world.wrist,mul(direction,length)),head=project(worldHead),grip=arm.wrist;
 const span=Math.hypot(head.x-grip.x,head.y-grip.y);
 return {sport,grip,head,worldGrip:arm.world.wrist,worldHead,shaftLength:length,direction,depth:worldHead.z,
  angle:Math.atan2(head.y-grip.y,head.x-grip.x),headDistance:span,
  scale:.65+.35*Math.min(1,span/length),faceScale:.4+.6*Math.abs(Math.cos(roll-.65))};
}
export function courtPose(sport,phase,resting=false,withProjectile=true,options={}){
 const c=STROKES[sport];if(!c)throw new Error('Unknown court sport');
 const t=((phase/TAU)%1+1)%1,p=resting?0:phase;
 const layerWeight=Math.max(0,Math.min(1,options.weight??1));
 const layer=keys=>{const a=sample(keys,0),b=sample(keys,p);return b.map((v,i)=>a[i]+(v-a[i])*layerWeight);};
 const [elevation,sweep,flex]=layer(c.arm),[cock,roll,swivel]=layer(c.wrist);
 const [weight,hipYaw,chestYaw]=layer(c.body);
 const hip={x:weight,y:8+(c.crouch??0)+(resting?0:layerWeight*1.5*Math.sin(phase)**2)};
 const neck={x:hip.x-(sport==='badminton'?2:1)*Math.sin(chestYaw),y:hip.y-78};
 const legs=[-1,1].map(side=>{
  const start=add({x:hip.x,y:hip.y,z:0},turn({x:side*13,y:0,z:0},hipYaw));
  const solved=chain(start,{x:side*30,y:122,z:side*5},62,60,{x:side*.15,y:0,z:1});
  return limb(start,solved.middle,solved.end,side,'leg');
 });
 const shoulders=[-1,1].map(side=>add({x:neck.x,y:neck.y+16,z:0},turn({x:side*25,y:0,z:0},chestYaw)));
 const dominant=articulatedArm(shoulders[1],elevation,sweep,flex,swivel,chestYaw);
 let free;
 if(c.support){
  const [e,s,f]=layer(c.support),sw=layer(c.supportSwivel)[0];
  free={...articulatedArm(shoulders[0],e,s,f,sw,chestYaw,-1),handOpen:true};
 }else{
  const [fx,fy,fz]=layer(c.free),freeTarget={x:hip.x+fx,y:hip.y+fy,z:fz};
  const solved=chain(shoulders[0],freeTarget,39,33,{x:-.35,y:1,z:-.15});
  free={...limb(shoulders[0],solved.middle,solved.end,-1,'arm'),handOpen:true};
 }
 const result=rig(hip,neck,legs,[free,dominant],phase,resting);
 result.torso={chestScale:Math.cos(chestYaw),hipYaw,chestYaw};
 if(c.support){
  // The shirt and sleeves use the actual projected clavicle anchors, rather
  // than scaling an unrelated front-facing shirt over rotating shoulders.
  result.shoulderRig={
   left:free.shoulder,right:dominant.shoulder,
   roots:[free,dominant].map(arm=>({side:arm.side,
    root:{x:arm.shoulder.x+(neck.x-arm.shoulder.x)*.23,y:arm.shoulder.y-3}}))
  };
 }

 result.stroke={elevation,sweep,flex,cock,roll,swivel};
 result.equipment=racketFrame(dominant,cock,roll,c.head,sport);
 if(!resting&&withProjectile){
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
