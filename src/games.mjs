// SPDX-License-Identifier: GPL-3.0-or-later
// Six original cyclic activities on the shared body rig. Props are sampled
// from the same contact/release poses as the hands and feet, not a second clock.
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
import {chain,limb} from './actions.mjs';
const TAU=Math.PI*2,INK='#543c35';
export const GAME_IDS=['basketball','volleyball','football','bowling','chess','boardgames'];
const mix=(a,b,t)=>a+(b-a)*t;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const point=(x,y,z=0)=>({x,y,z});
const lerp=(a,b,t)=>point(mix(a.x,b.x,t),mix(a.y,b.y,t),mix(a.z??0,b.z??0,t));
const sample=(keys,t)=>sampleAnglePath(keys.map(([p,...v])=>[p*TAU,...v]),t*TAU);
const project=p=>({x:p.x*(1+p.z*.0012),y:p.y,z:p.z});
const target=(x,y,z=24)=>point(x/(1+z*.0012),y,z);
const fade=(t,a,b)=>Math.min(smooth((t-a)/.055),smooth((b-t)/.055));
const setLift=t=>sample([[0,0,14,0],[.18,0,14,0],[.30,4,13,0],[.43,16,12,0],[.56,10,13,0],[.76,0,14,0]],t);
function solve(start,end,side,type){
 const lengths=type==='leg'?[62,60]:[39,33];
 const pole=type==='leg'?point(side*.12,0,1):point(side,0,.32);
 const c=chain(start,end,...lengths,pole);
 return {...limb(start,c.middle,c.end,side,type),handOpen:true};
}
function sagittal(start,length,angle,x){const span=Math.sqrt(length*length-(x-start.x)**2);return point(x,start.y+span*Math.cos(angle),start.z+span*Math.sin(angle));}
function body(sport,t,resting){
 const p=t*TAU,seated=sport==='chess'||sport==='boardgames';
 const load=sport==='bowling'?sample([[0,14,0,0],[.24,23,3,0],[.46,45,-4,20],[.65,38,-4,14],[.85,14,0,0]],t):[0,0,0];
 const hip=point(load[1],seated?34:sport==='bowling'?load[0]:sport==='volleyball'?mix(13,4,Math.sin(Math.PI*clamp((t-.1)/.45))**2):12+(resting?0:Math.sin(p)**2));
 const neck=point(hip.x,hip.y-78+(sport==='bowling'?load[2]:0));
 const legs=[-1,1].map(side=>{
  const root=point(hip.x+side*13,hip.y,0);
  if(sport==='football'&&side===1){
   const [thigh,flex]=sample([[0,.02,.12],[.18,-.34,.65],[.31,-.43,.8],[.43,.70,.12],[.55,.92,.26],[.70,.32,.60],[.88,.02,.12]],t);
   const knee=sagittal(root,62,thigh,side*17),ankle=sagittal(knee,60,thigh-flex,side*19);
   return {...limb(root,knee,ankle,side,'leg'),scale:1+ankle.z*.0015};
  }
  const x=seated?side*29:side*25;
  return solve(root,point(x,122,side*4),side,'leg');
 });
 const shrug=sport==='volleyball'?setLift(t)[0]*.5:0;
 const shoulders=[-1,1].map(s=>point(neck.x+s*25,neck.y+16-shrug,0));
 return {hip,neck,legs,shoulders,seated};
}
function chessMove(t){
 const [x,y,lift]=sample([[0,24,54,0],[.13,24,54,0],[.22,24,54,15],[.39,48,44,15],[.47,48,44,0],[.65,48,44,0],[.73,48,44,15],[.84,24,54,15],[.90,24,54,0]],t);
 return {x,y:y-lift,lift,held:(t>.13&&t<.47)||(t>.65&&t<.90)};
}
function boardMove(t){
 const [x,y,lift]=sample([[0,16,49,0],[.43,16,49,0],[.49,16,49,10],[.57,47,49,10],[.65,47,29,10],[.73,16,29,10],[.81,16,49,10],[.87,16,49,0]],t);
 return {x,y:y-lift,lift,held:t>.43&&t<.87};
}
function handTargets(sport,t,b){
 const {hip,neck}=b;
 if(sport==='volleyball'){
  const [lift,width]=setLift(t);
  return [-1,1].map(s=>target(s*width,neck.y-33-lift*1.5,18));
 }
 if(sport==='basketball'){
  const [down]=sample([[0,0,0,0],[.18,14,0,0],[.45,10,0,0],[.70,2,0,0],[.82,0,0,0]],t);
  return [target(-34,hip.y-12,24),target(47,hip.y-14+down,27)];
 }
 if(sport==='football'){
  const [spread]=sample([[0,0,0,0],[.24,7,0,0],[.43,15,0,0],[.65,9,0,0],[.88,0,0,0]],t);
  return [target(-40-spread,hip.y-19,22),target(40+spread*.6,hip.y-10,20)];
 }
 if(sport==='bowling')return [target(-35,hip.y-10,25),null];
 if(sport==='chess'){
  const m=chessMove(t),reach=smooth(t/.12)*(1-smooth((t-.90)/.10));
  const move=target(m.x,m.y-16,24);
  return [target(-32,14,26),lerp(target(35,10,25),move,reach)];
 }
 const m=boardMove(t);
 if(t<.24){
  const [x,y]=sample([[0,40,6,0],[.08,45,4,0],[.15,39,6,0],[.24,45,10,0],[.96,40,6,0]],t);
  return [target(-32,14,26),target(x,y,28)];
 }
 if(t>.87){
  const end=t<.92?lerp(point(16,37),point(60,28),smooth((t-.87)/.05)):lerp(point(60,28),point(40,6),smooth((t-.92)/.06));
  return [target(-32,14,26),target(end.x,end.y,mix(24,28,smooth((t-.87)/.05)))];
 }
 const reach=smooth((t-.38)/.05);
 return [target(-32,14,26),lerp(target(45,10,28),target(m.x,m.y-12,24),reach)];
}
export function gamePose(sport,phase,resting=false,withProps=true){
 if(!GAME_IDS.includes(sport))throw new Error('Unknown activity');
 const t=resting?0:((phase/TAU)%1+1)%1,b=body(sport,t,resting),targets=handTargets(sport,t,b);
 const arms=[-1,1].map((side,i)=>{
  if(sport==='bowling'&&side===1){
   const [angle]=sample([[0,.03,0,0],[.24,-.72,0,0],[.45,.17,0,0],[.57,.68,0,0],[.72,.45,0,0],[.90,.03,0,0]],t);
   const shoulder=b.shoulders[i],elbow=sagittal(shoulder,39,angle,35+b.hip.x),wrist=sagittal(elbow,33,angle+.12,39+b.hip.x);
   return {...limb(shoulder,elbow,wrist,side,'arm'),handOpen:true};
  }
  return solve(b.shoulders[i],targets[i],side,'arm');
 });
 const r={front:true,hip:b.hip,neck:b.neck,legs:b.legs,arms,phase,resting,
  torso:{chestYaw:0,hipYaw:0,chestScale:1},
  legOrder:[...b.legs].sort((a,b)=>a.ankle.z-b.ankle.z).map(l=>l.side),armOrder:[-1,1],
  shoulderRig:{left:arms[0].shoulder,right:arms[1].shoulder,roots:arms.map(a=>({side:a.side,root:{x:mix(a.shoulder.x,b.neck.x,.23),y:a.shoulder.y-3}}))},
  game:{sport,t,seated:b.seated}};
 if(!withProps)return r;
 const hand=arms[1].wrist;
 if(sport==='basketball'){
  const release=.18,catchAt=.82,ground=116;
  if(resting||t<release||t>catchAt)r.game.ball={x:hand.x,y:hand.y+15,radius:15,held:true,opacity:1,rotation:t*4};
  else{
   const a=gamePose(sport,release*TAU,false,false).arms[1].wrist,c=gamePose(sport,catchAt*TAU,false,false).arms[1].wrist;
   const bounce=.47,u=t<bounce?(t-release)/(bounce-release):(t-bounce)/(catchAt-bounce);
   const y=t<bounce?mix(a.y+15,ground,.5*u+.5*u*u):mix(ground,c.y+15,2*u-u*u);
   r.game.ball={x:mix(a.x,c.x,(t-release)/(catchAt-release)),y,radius:15,held:false,opacity:1,rotation:t*4};
  }
 }else if(sport==='volleyball'){
  const contact=point((arms[0].wrist.x+hand.x)/2,(arms[0].wrist.y+hand.y)/2-14);
  let ball=contact,held=true;
  if(!resting&&t<.28){const c=gamePose(sport,.28*TAU,false,false).arms;const end=point((c[0].wrist.x+c[1].wrist.x)/2,(c[0].wrist.y+c[1].wrist.y)/2-14);ball=lerp(point(0,-205),end,smooth((t-.06)/.22));held=false;}
  else if(!resting&&t>.44){const c=gamePose(sport,.44*TAU,false,false).arms;const start=point((c[0].wrist.x+c[1].wrist.x)/2,(c[0].wrist.y+c[1].wrist.y)/2-14);ball=lerp(start,point(32,-211),smooth((t-.44)/.42));held=false;}
  r.game.ball={...ball,radius:16,held,opacity:resting?1:fade(t,.06,.91),rotation:t*2};
 }else if(sport==='football'){
  const contact=gamePose(sport,.43*TAU,false,false).legs[1].ankle;
  const start=point(contact.x,contact.y+22),u=smooth((t-.43)/.40);
  r.game.ball={x:mix(start.x,start.x+39,u),y:mix(start.y,168,u),radius:mix(13,24,u),rotation:t<.43?0:u*6,opacity:resting?1:t<.43?smooth(t/.07):1-smooth((t-.76)/.10),held:false};
 }else if(sport==='bowling'){
  if(resting||t<.46)r.game.ball={x:hand.x,y:hand.y+14,radius:15,held:true,opacity:resting?1:smooth(t/.07),rotation:0};
  else{
   const release=gamePose(sport,.46*TAU,false,false).arms[1].wrist,u=clamp((t-.46)/.36),land=smooth(u/.26),roll=smooth((u-.26)/.74);
   r.game.ball={x:mix(mix(release.x,release.x+14,land),147,roll),y:mix(mix(release.y+14,122,land),74,roll),radius:mix(15,5,roll),held:false,opacity:1-smooth((t-.88)/.08),rotation:u*7,shadowY:mix(133,79,roll)};
  }
  r.game.pinFall=resting?0:smooth((t-.79)/.10);
  r.game.pinOpacity=resting?1:Math.min(smooth(t/.07),1-smooth((t-.92)/.07));
 }else if(sport==='chess')r.game.piece={...chessMove(t),kind:'knight'};
 else{
  r.game.piece={...boardMove(t),kind:'pawn'};
  let die=point(hand.x,hand.y+6),angle=0;
  if(!resting&&t>=.24&&t<=.92){const u=clamp((t-.24)/.18),release=gamePose(sport,.24*TAU,false,false).arms[1].wrist;
   die=lerp(point(release.x,release.y+6),point(60,34),u);die.y-=Math.sin(Math.PI*u)*14;angle=u*TAU;
  }
  r.game.die={...die,angle,held:resting||t<.24||t>.92};
 }
 return r;
}

function path(c,points,fill,stroke=INK,width=2){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function line(c,points,color=INK,width=1.5){c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.stroke();}
function oval(c,x,y,rx,ry,fill,stroke=INK,width=1.5){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function boardPoint(u,v){return point(mix(mix(-66,-83,v),mix(88,105,v),u),24+38*v);}
function pin(c,x,y,angle=0){c.save();c.translate(x,y);c.rotate(angle);c.beginPath();c.moveTo(-3,0);c.quadraticCurveTo(-6,-7,-2,-12);c.lineTo(-2,-17);c.bezierCurveTo(-6,-23,6,-23,2,-17);c.lineTo(2,-12);c.quadraticCurveTo(6,-7,3,0);c.closePath();c.fillStyle='#f5ead7';c.fill();c.strokeStyle=INK;c.lineWidth=1;c.stroke();line(c,[point(-2,-13),point(2,-13)],'#d8796b',2);c.restore();}
function chessPiece(c,x,y,kind,light=true,scale=1){
 c.save();c.translate(x,y);c.scale(scale,scale);const fill=light?'#f1dfbf':'#596c63';
 oval(c,0,0,7,2.8,fill);
 if(kind==='knight')path(c,[point(-5,-2),point(-5,-9),point(-1,-17),point(-3,-21),point(2,-20),point(7,-12),point(2,-10),point(0,-5),point(5,-2)],fill);
 else if(kind==='rook'){path(c,[point(-5,-2),point(-3,-13),point(-6,-15),point(-6,-20),point(-3,-20),point(-3,-17),point(0,-17),point(0,-20),point(3,-20),point(3,-17),point(6,-17),point(6,-13),point(3,-12),point(5,-2)],fill);}
 else{path(c,[point(-5,-2),point(-2,-12),point(2,-12),point(5,-2)],fill);oval(c,0,-15,4,4,fill);}
 c.restore();
}
export function drawGameBack(c,r){
 const g=r.game;if(!g)return;c.save();
 if(g.seated){
  path(c,[point(-40,-56),point(40,-56),point(43,57),point(-43,57)],'#49634e');
  for(const x of [-30,30])line(c,[point(x,-42),point(x,48)],'#789075',3);
  path(c,[point(-46,49),point(46,49),point(46,59),point(-46,59)],'#668060');
  for(const x of [-38,38])line(c,[point(x,57),point(x,130)],'#7d8d6c',5);
  for(const x of [-76,96])line(c,[point(x,57),point(x,128)],'#896d52',6);
 }else if(g.sport==='bowling'){
  path(c,[point(4,150),point(96,150),point(177,54),point(137,54)],'#9c8560','#c5b88d',1.5);
  for(const u of [.25,.5,.75])line(c,[lerp(point(4,150),point(96,150),u),lerp(point(137,54),point(177,54),u)],'#77695088',.8);
  c.save();c.globalAlpha=g.pinOpacity;
  for(const [i,[x,y]] of [[137,69],[147,69],[157,69],[141,76],[151,76],[146,83]].entries())pin(c,x,y,g.pinFall*(i%2?1:-1)*1.15);
  c.restore();
 }else if(g.sport==='volleyball'){
  line(c,[point(95,140),point(95,-35),point(185,-35),point(185,140)],'#8da68a',2);
  for(let x=95;x<=185;x+=15)line(c,[point(x,-35),point(x,10)],'#86a38555',.8);
  for(let y=-35;y<=10;y+=15)line(c,[point(95,y),point(185,y)],'#86a38555',.8);
 }
 c.restore();
}
export function drawGameTable(c,r){
 const g=r.game;if(!g?.seated)return;
 c.save();path(c,[point(-86,20),point(108,20),point(127,68),point(-104,68)],'#987855');
 path(c,[point(-104,68),point(127,68),point(127,76),point(-104,76)],'#745c46');
 const size=g.sport==='chess'?8:6,track=['#c6aa75','#759d88','#b68aa4','#8b9fc3'];
 for(let row=0;row<size;row++)for(let col=0;col<size;col++){
  const u=col/size,v=row/size,du=1/size;
  const fill=g.sport==='chess'?((row+col)%2?'#66816c':'#eee0bd'):(row===0||row===size-1||col===0||col===size-1?track[(row+col)%4]:'#d8c99e');
  path(c,[boardPoint(u,v),boardPoint(u+du,v),boardPoint(u+du,v+du),boardPoint(u,v+du)],fill,null);
 }
 if(g.sport==='chess'){
  for(const [col,row,kind,light] of [[1,1,'rook',false],[3,1,'pawn',false],[6,1,'rook',false],[2,2,'pawn',false],[6,3,'pawn',false],[1,6,'rook',true],[6,6,'pawn',true]]){
   const p=boardPoint((col+.5)/8,(row+.5)/8);chessPiece(c,p.x,p.y,kind,light,.66+row*.035);
  }
 }else{
  for(const [x,y,color] of [[-51,49,'#bb7e87'],[76,30,'#6d8bab'],[-34,30,'#9eae69']]){oval(c,x,y,5,2.5,color);path(c,[point(x-4,y),point(x-2,y-9),point(x+2,y-9),point(x+4,y)],color);oval(c,x,y-11,3.5,3.5,color);}
 }
 c.restore();
}
function ball(c,b,sport){
 c.save();c.globalAlpha=b.opacity;c.translate(b.x,b.y);c.rotate(b.rotation??0);const radius=b.radius;
 oval(c,0,0,radius,radius,sport==='basketball'?'#d69454':sport==='volleyball'?'#f0d477':sport==='football'?'#f4eddb':'#8581b8',INK,1.6);
 c.save();c.clip();
 if(sport==='basketball'){
  line(c,[point(-radius,0),point(radius,0)],'#694c37',1.4);line(c,[point(0,-radius),point(0,radius)],'#694c37',1.4);
  c.strokeStyle='#694c37';c.lineWidth=1.3;for(const x of [-radius,radius]){c.beginPath();c.ellipse(x,0,radius*.8,radius*1.2,0,0,TAU);c.stroke();}
 }else if(sport==='volleyball'){
  for(let i=0;i<3;i++){c.save();c.rotate(i*TAU/3);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(radius*.7,-radius*.65,radius,-radius*.2);c.lineTo(radius,radius*.7);c.quadraticCurveTo(radius*.2,radius*.5,0,0);c.fillStyle=i%2?'#f7f0d8':'#799cae';c.fill();c.strokeStyle='#a48f60';c.lineWidth=.8;c.stroke();c.restore();}
 }else if(sport==='football'){
  for(const [x,y,scale] of [[0,0,.35],[-.8,-.5,.3],[.75,-.65,.3],[.65,.7,.3],[-.65,.8,.3]]){
   const p=Array.from({length:5},(_,i)=>point((x+Math.cos(i*TAU/5-.3)*scale)*radius,(y+Math.sin(i*TAU/5-.3)*scale)*radius));path(c,p,'#4d5b52',null);
  }
 }else{
  for(const [x,y] of [[-3,-4],[3,-4],[0,2]])oval(c,x*b.radius/15,y*b.radius/15,1.6*b.radius/15,1.9*b.radius/15,'#353b50',null);
 }
 c.restore();c.restore();
}
export function drawGameFront(c,r,colors){
 const g=r.game;if(!g)return;c.save();
 if(g.ball&&g.ball.opacity>0){
  const b=g.ball;
  if(g.sport==='basketball'||g.sport==='football'||g.sport==='bowling'){
   c.save();c.globalAlpha=b.opacity;oval(c,b.x,g.sport==='football'?b.y+b.radius*.95:(b.shadowY??133),Math.max(5,b.radius*.8),2,'#10291f55',null);c.restore();
  }
  ball(c,b,g.sport);
  if(b.held){
   const hands=g.sport==='volleyball'?r.arms:[r.arms[1]];
   for(const a of hands)oval(c,a.wrist.x,a.wrist.y,5.2,4.2,colors.skin,colors.skinInk,1.2);
  }
 }
 if(g.piece){
  const p=g.piece;
  if(p.kind==='knight')chessPiece(c,p.x,p.y,p.kind);
  else{oval(c,p.x,p.y,6,2.6,'#e4bd69');path(c,[point(p.x-4,p.y-1),point(p.x-2,p.y-10),point(p.x+2,p.y-10),point(p.x+4,p.y-1)],'#e4bd69');oval(c,p.x,p.y-12,4,4,'#e4bd69');}
  if(p.held)oval(c,r.arms[1].wrist.x,r.arms[1].wrist.y,4.5,3.6,colors.skin,colors.skinInk,1.1);
 }
 if(g.die){
  const d=g.die;c.save();c.translate(d.x,d.y);c.rotate(d.angle);path(c,[point(-7,-7),point(7,-7),point(7,7),point(-7,7)],'#f5e8cd',INK,1.4);
  for(const [x,y] of [[-3,-3],[3,-3],[-3,3],[3,3]])oval(c,x,y,1.2,1.2,'#5c5546',null);c.restore();
  if(d.held)oval(c,r.arms[1].wrist.x,r.arms[1].wrist.y,4,3,colors.skin,colors.skinInk,1.1);
 }
 c.restore();
}
