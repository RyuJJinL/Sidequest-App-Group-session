// SPDX-License-Identifier: GPL-3.0-or-later
// A small weighted 2D clothing mesh on the avatar's existing depth-aware rig.
// Shared armhole vertices stitch the sleeves to the bodice. Bone weights also
// drive the colour panels, hems and seams; no decoration has its own animation.
import {normalizeAppearance} from './wardrobe.mjs';
import {appearanceColors} from './appearance-colors.mjs';
const INK='#543c35',CREAM='#f1dfbf',SAGE='#94a68a',PEACH='#e9aa8e',SLATE='#657080';
const mix=(a,b,t)=>a+(b-a)*t;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const lerp=(a,b,t)=>({x:mix(a.x,b.x,t),y:mix(a.y,b.y,t),z:mix(a.z??0,b.z??0,t)});
const project=p=>({x:p.x*(1+p.z*.0012),y:p.y,z:p.z});
const point=(x,y,z=0)=>({x,y,z});

// Running stores its joints in body-local coordinates; the court and walking
// rigs store world coordinates. Resolve either convention without changing the
// accepted choreography or calculating a second skeleton for the clothing.
function worldChain(limb,names){
 const source=limb.world,base=names[0],p=project(source[base]);
 const dx=limb[base].x-p.x,dy=limb[base].y-p.y;
 return Object.fromEntries(names.map(name=>[name,{...source[name],x:source[name].x+dx,y:source[name].y+dy}]));
}
function bone(bind,start,end){
 const dx=end.x-start.x,dy=end.y-start.y,dz=end.z-start.z,length=Math.hypot(dx,dy,dz);
 const d=point(dx/length,dy/length,dz/length),screen=Math.hypot(d.x,d.y);
 // A camera-facing cross section preserves the illustrated limb's volume when
 // the bone points toward the camera. All authored poses stay clear of zero.
 const n=point(d.y/screen,-d.x/screen,0);
 const depth=point(-n.y*d.z,n.x*d.z,n.x*d.y-n.y*d.x);
 return p=>{
  const x=p.x-bind.x,y=p.y-bind.y,z=p.z??0;
  return point(start.x+n.x*x+d.x*y+depth.x*z,start.y+n.y*x+d.y*y+depth.y*z,start.z+d.z*y+depth.z*z);
 };
}
export function createClothingRig(motion){
 const bones={},arms={},legs={};
 const torso=(center,yaw,bindY)=>p=>({x:center.x+p.x*Math.cos(yaw)-(p.z??0)*Math.sin(yaw),y:center.y+p.y-bindY,z:p.x*Math.sin(yaw)+(p.z??0)*Math.cos(yaw)});
 bones.chest=torso({x:motion.neck.x,y:motion.neck.y+16},motion.torso?.chestYaw??0,-62);
 bones.pelvis=torso(motion.hip,motion.torso?.hipYaw??0,0);
 for(const a of motion.arms){
  const w=worldChain(a,['shoulder','elbow','wrist']),s=a.side;
  arms[s]={...a,world:w};
  bones[`upper${s}`]=bone(point(s*25,-62),w.shoulder,w.elbow);
  bones[`fore${s}`]=bone(point(s*25,-23),w.elbow,w.wrist);
 }
 for(const l of motion.legs){
  const w=worldChain(l,['hip','knee','ankle']),s=l.side;
  legs[s]={...l,world:w};
  bones[`thigh${s}`]=bone(point(s*13,0),w.hip,w.knee);
  bones[`shin${s}`]=bone(point(s*13,62),w.knee,w.ankle);
 }
 // The torso has volume and rotates with the chest. Comparing to a fixed
 // world z=0 plane would paint the near shoulder's folded sleeve over its own
 // armhole during a cross-body stroke. Test against the chest's local plane.
 const depth=p=>p.z-(p.x-motion.neck.x)*Math.tan(motion.torso?.chestYaw??0)-7;
 return {bones,arms,legs,depth};
}
export function skinVertex(rig,rest,weights){
 let x=0,y=0,z=0,total=0;
 for(const [name,weight] of Object.entries(weights)){
  if(!weight)continue;
  const p=rig.bones[name](rest);x+=p.x*weight;y+=p.y*weight;z+=p.z*weight;total+=weight;
 }
 if(Math.abs(total-1)>1e-6)throw new Error('Clothing weights must sum to one');
 const world=point(x,y,z);
 return {...project(world),world,rest,weights};
}
function grid(rows){
 const vertices=rows.flat(),cols=rows[0].length,triangles=[];
 for(let r=0;r<rows.length-1;r++)for(let c=0;c<cols-1;c++){
  const a=r*cols+c,b=a+1,d=a+cols,e=d+1;
  triangles.push([a,b,e],[a,e,d]);
 }
 return {rows,vertices,triangles};
}
// A pose correction for a sleeve aimed across the chest: the flat armhole and
// the camera-facing cuff can project in opposite directions. Their weighted
// rows fold over themselves even though the bone path is sound. Use the outer
// envelope of those same vertices for the shoulder fabric, so an interior fold
// cannot expose a triangular hole or acquire a dark outline.
function shoulderEnvelope(vertices){
 const sorted=[...vertices].sort((a,b)=>a.x-b.x||a.y-b.y);
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const half=points=>{const result=[];for(const p of points){while(result.length>1&&cross(result.at(-2),result.at(-1),p)<=0)result.pop();result.push(p);}return result;};
 return [...half(sorted).slice(0,-1),...half(sorted.toReversed()).slice(0,-1)];
}
function torsoWeights(p){
 const pelvis=smooth((p.y+55)/50);
 const side=p.x<0?-1:1;
 // The outer shoulder follows a little of the upper arm. The inner shoulder
 // and armpit remain mostly chest-bound, preventing an overhead sleeve from
 // pulling the whole shirt into the arm.
 const shoulder=(1-pelvis)*smooth((Math.abs(p.x)-14)/11)*.18*(1-smooth((p.y+49)/15));
 return {chest:1-pelvis-shoulder,pelvis,[`upper${side}`]:shoulder};
}
function torsoVertex(rig,x,y){const p=point(x,y);return skinVertex(rig,p,torsoWeights(p));}
function sleeve(rig,side,jacket,root){
 const shoulder=rig.arms[side].world.shoulder,elbow=rig.arms[side].world.elbow;
 const lift=smooth((shoulder.y-elbow.y+3)/33);
 // Additional cloth ease under an elevated arm, rather than stretching a
 // single shoulder polygon. This correction fades continuously with the pose.
 const makeRing=(y,width)=>{
  const flex=smooth((y+32)/17),weights=jacket?{[`upper${side}`]:1-flex,[`fore${side}`]:flex}:{[`upper${side}`]:1};
  const center=skinVertex(rig,point(side*25,y),weights);
  const ring=[-1,-.5,0,.5,1].map(u=>skinVertex(rig,point(side*(25+u*width),y),weights));
  // Correct the loss of volume caused by blending two bent bone transforms.
  // The shared armhole ring is deliberately excluded from this correction.
  const outer=ring[4],inner=ring[0],span=Math.hypot(outer.x-inner.x,outer.y-inner.y),scale=2*width/Math.max(1e-6,span);
  for(const v of ring){v.x=center.x+(v.x-center.x)*scale;v.y=center.y+(v.y-center.y)*scale;}
  return ring.reverse();
 };
 // Rows run from outer to inner for both sides. Both root endpoints are the
 // very same objects used by the torso mesh, not approximately matching copies.
 const first=[root.outer,...[.25,.5,.75].map(t=>{
  const rest=lerp(root.outer.rest,root.inner.rest,t),v=skinVertex(rig,rest,torsoWeights(rest));
  return {...v,...lerp(root.outer,root.inner,t),world:lerp(root.outer.world,root.inner.world,t)};
 }),root.inner];
 const rows=[first];
 for(const t of [.3,.65]){
  const ring=makeRing(-41,10.5);
  rows.push(ring.map((end,i)=>{
   const rest=lerp(first[i].rest,end.rest,t);
   rest.y-=lift*Math.sin(Math.PI*t)*1.5;
   const rootWeight=torsoWeights(first[i].rest),weights={};
   for(const name of new Set([...Object.keys(rootWeight),`upper${side}`]))weights[name]=(rootWeight[name]??0)*(1-smooth(t))+(name===`upper${side}`?smooth(t):0);
   return skinVertex(rig,rest,weights);
  }));
 }
 rows.push(makeRing(-41,10.5));
 if(jacket)for(const [y,w] of [[-33,9.7],[-27,9.2],[-23,9],[-19,8.7],[-13,8.2],[-3,7.6],[7,6.8]])rows.push(makeRing(y,w));
 const mesh={...grid(rows),side,jacket};
 for(const v of mesh.vertices)v.visibility=rig.depth(v.world);
 mesh.shoulderPatch=shoulderEnvelope(rows.slice(0,4).flat());
 return mesh;
}
function legSurface(rig,side){
 const rows=[0,8,20,35,49,56,62,68,76,92,108,115,122].map(y=>{
  const t=smooth((y-51)/22),weights={[`thigh${side}`]:1-t,[`shin${side}`]:t};
  const width=y<62?mix(11.7,8.5,y/62):mix(8.5,6.4,(y-62)/60);
  const center=skinVertex(rig,point(side*13,y),weights);
  const ring=[-1,0,1].map(u=>skinVertex(rig,point(side*13+u*width,y),weights));
  const span=Math.hypot(ring[2].x-ring[0].x,ring[2].y-ring[0].y),scale=2*width/Math.max(span,1e-6);
  for(const v of ring){v.x=center.x+(v.x-center.x)*scale;v.y=center.y+(v.y-center.y)*scale;}
  return ring;
 });
 return {...grid(rows),side};
}
function shortsWeights(p,side){
 const thigh=smooth((p.y-1)/25)*(.55+.4*smooth(Math.abs(p.x)/16));
 return {pelvis:1-thigh,[`thigh${side}`]:thigh};
}
export function buildClothing(motion,outfit='sage'){
 const appearance=normalizeAppearance(outfit),rig=createClothingRig(motion),jacket=appearance.top==='jacket',leggings=appearance.bottom==='leggings';
 const torso=grid([-68,-49,-35,-19,-5].map((y,r)=>[-1,-.5,0,.5,1].map(u=>{
  const width=[25,21,22.5,23,23][r],top=r===0?-5*(1-Math.abs(u)):0;
  return torsoVertex(rig,u*width,y+top);
 })));
 const sleeves=[-1,1].map(side=>sleeve(rig,side,jacket,{outer:torso.rows[0][side===-1?0:4],inner:torso.rows[1][side===-1?0:4]}));
 const waistband=grid([-9,1,8].map(y=>[-1,-.5,0,.5,1].map(u=>skinVertex(rig,point(u*(y===-9?23.5:25),y),{pelvis:1}))));
 const shorts=[-1,1].map(side=>grid([0,.5,1].map(t=>[0,.25,.5,.75,1].map(u=>{
  const p=point(side*mix(mix(25,26,t),3*t,u),8+18*t);
  if(t===0)return waistband.rows[2].find(v=>Math.abs(v.rest.x-p.x)<1e-8)??skinVertex(rig,p,{pelvis:1});
  return skinVertex(rig,p,shortsWeights(p,side));
 }))));
 const legs=[-1,1].map(side=>legSurface(rig,side));
 const bareArms=jacket?[]:[-1,1].map(side=>{
  const mesh=grid([-45,-34,-27,-23,-18,-9,2,10].map(y=>{
   const t=smooth((y+31)/16),weights={[`upper${side}`]:1-t,[`fore${side}`]:t};
   const width=mix(7.8,5.8,(y+45)/55);
   return [-1,0,1].map(u=>skinVertex(rig,point(side*25+u*width,y),weights));
  }));
  for(const v of mesh.vertices)v.visibility=rig.depth(v.world);
  return {...mesh,side};
 });
 return {rig,torso,sleeves,waistband,shorts,legs,bareArms,jacket,leggings,appearance,colors:appearanceColors(appearance),torsoPoint:(x,y)=>torsoVertex(rig,x,y)};
}

function polygonPath(ctx,points,close=true){ctx.moveTo(points[0].x,points[0].y);for(const p of points.slice(1))ctx.lineTo(p.x,p.y);if(close)ctx.closePath();}
function line(ctx,points,color=INK,width=2){ctx.beginPath();polygonPath(ctx,points,false);ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
function fill(ctx,points,color){ctx.beginPath();polygonPath(ctx,points);ctx.fillStyle=color;ctx.fill();}
// Split individual mesh triangles at the depth plane. A partially occluded
// sleeve is revealed continuously; no whole-garment or whole-arm layer switch.
export function clipClothDepth(vertices){
 const result=[];
 for(let i=0;i<vertices.length;i++){
  const a=vertices[i],b=vertices[(i+1)%vertices.length],az=a.visibility??a.world.z,bz=b.visibility??b.world.z;
  if(az>=0)result.push(a);
  if((az<0)!==(bz<0)){
   const t=-az/(bz-az),world=lerp(a.world,b.world,t);
   result.push({...lerp(a,b,t),world,visibility:0});
  }
 }
 return result;
}
function meshFill(ctx,mesh,color,front=false,minRow=0,maxRow=mesh.rows.length-1){
 ctx.beginPath();const cols=mesh.rows[0].length;
 for(let r=minRow;r<maxRow;r++)for(let c=0;c<cols-1;c++)for(const ids of [[r*cols+c,r*cols+c+1,(r+1)*cols+c+1],[r*cols+c,(r+1)*cols+c+1,(r+1)*cols+c]]){
  let p=ids.map(i=>mesh.vertices[i]);if(front)p=clipClothDepth(p);
  // Consistent winding unions projected folds instead of punching little
  // holes where a foreshortened sleeve folds back over another triangle.
  if(p.length>=3){const area=p.reduce((sum,a,i)=>{const b=p[(i+1)%p.length];return sum+a.x*b.y-b.x*a.y;},0);if(area<0)p.reverse();polygonPath(ctx,p);}
 }
 ctx.fillStyle=color;ctx.fill();
}
function meshLine(ctx,points,front,color=INK,width=2){
 if(!front){line(ctx,points,color,width);return;}
 ctx.beginPath();
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],az=a.visibility??a.world.z,bz=b.visibility??b.world.z;
  if(az<0&&bz<0)continue;
  const cross=(az<0)!==(bz<0)?lerp(a,b,-az/(bz-az)):null;
  ctx.moveTo((az<0?cross:a).x,(az<0?cross:a).y);ctx.lineTo((bz<0?cross:b).x,(bz<0?cross:b).y);
 }
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke();
}
const boundary=mesh=>[...mesh.rows.map(r=>r[0]),...mesh.rows.toReversed().map(r=>r.at(-1))];
export function drawClothedLeg(ctx,model,side){
 const mesh=model.legs.find(l=>l.side===side),{rows}=mesh;
 meshFill(ctx,mesh,model.leggings?'#55545a':model.colors.skin);
 line(ctx,rows.map(r=>r[0]),model.leggings?INK:model.colors.skinInk);line(ctx,rows.map(r=>r.at(-1)),model.leggings?INK:model.colors.skinInk);
 // Sock / exposed ankle rings use the same vertices as the leg surface.
 const sock=model.leggings?11:10;
 meshFill(ctx,mesh,model.leggings?model.colors.skin:'#f3e9d9',false,sock);
 line(ctx,rows[sock],model.leggings?INK:'#b7aa96',1.4);
 if(model.leggings){
  const knee=rows[6],lower=rows[7];
  line(ctx,[lerp(knee[0],knee[1],.5),lerp(lower[0],lower[1],.55)],'#777078',1.1);
 }
}
export function drawClothedShorts(ctx,model){
 const color=model.leggings?'#be8c8d':CREAM,trim=model.leggings?'#e6b5aa':'#c6b397';
 meshFill(ctx,model.waistband,color);
 for(const mesh of model.shorts){
  meshFill(ctx,mesh,color);
  line(ctx,mesh.rows.map(r=>r[0]));
  line(ctx,mesh.rows.slice(1).map(r=>r.at(-1)));
  line(ctx,mesh.rows.at(-1),INK,2.2);
  line(ctx,mesh.rows.at(-1).map(v=>({...v,y:v.y-2.5})),trim,1.4);
 }
 const center=model.waistband.rows.map(r=>r[2]);
 line(ctx,[...center,{...center.at(-1),y:center.at(-1).y+6}],trim,1.2);
}
export function drawClothedTorso(ctx,model){
 const {torso,jacket,torsoPoint:p}=model;
 meshFill(ctx,torso,jacket?SLATE:SAGE);
 // Only the outside silhouette is outlined. The shared shoulder/armhole
 // edges are internal fabric and must never become dark socket outlines.
 line(ctx,torso.rows[0]);
 for(const i of [0,4])line(ctx,torso.rows.slice(1).map(r=>r[i]));
 line(ctx,torso.rows.at(-1),INK,2.5);
 ctx.save();ctx.beginPath();polygonPath(ctx,boundary(torso));ctx.clip();
 if(jacket){
  const panel=(top,bottom,color)=>{
   const us=[-1,-.75,-.5,-.25,0,.25,.5,.75,1];
   fill(ctx,[...us.map(u=>p(u*27,top+13*(1-Math.abs(u)))),...us.toReversed().map(u=>p(u*27,bottom+13*(1-Math.abs(u))))],color);
  };
  panel(-77,-47,PEACH);panel(-47,-33,CREAM);
  line(ctx,[-72,-60,-48,-36,-24,-7].map(y=>p(0,y)),INK,2);
  fill(ctx,[p(-2,-70),p(2,-70),p(3,-62),p(-3,-62)],SLATE);
 }else{
  fill(ctx,[p(-13,-73),p(0,-61),p(13,-73),p(15,-59),p(5,-62),p(0,-53),p(-5,-62),p(-15,-59)],CREAM);
  line(ctx,[p(0,-56),p(0,-44)],CREAM,3.5);
 }
 // Small pose-driven folds follow the same surface as the shirt. They do not
 // wobble on their own or cross the sleeve/torso seam.
 for(const side of [-1,1]){
  const arm=model.rig.arms[side].world;
  const amount=clamp((arm.shoulder.y-arm.elbow.y+15)/45);
  if(amount>.03)line(ctx,[p(side*20,-43),p(side*(20-5*amount),-36)],jacket?'#777481':'#7d9279',1);
 }
 ctx.restore();
}
export function drawClothedArm(ctx,model,side,front=false){
 const mesh=model.sleeves.find(s=>s.side===side),{rows}=mesh;
 const arm=model.rig.arms[side];
 if(!model.jacket){
  // Bare arm is another continuous weighted ribbon, including a blended elbow.
  const skin=model.bareArms.find(a=>a.side===side);
  meshFill(ctx,skin,model.colors.skin,front);
  for(const i of [0,2])meshLine(ctx,skin.rows.map(r=>r[i]),front,model.colors.skinInk);
 }
 const shoulder=front?clipClothDepth(mesh.shoulderPatch):mesh.shoulderPatch;
 if(shoulder.length>=3)fill(ctx,shoulder,model.jacket?PEACH:SAGE);
 if(model.jacket)meshFill(ctx,mesh,PEACH,front,3);
 if(model.jacket){
  meshFill(ctx,mesh,CREAM,front,3,5);
  meshFill(ctx,mesh,SLATE,front,5);
 }
 for(let i=0;i<mesh.shoulderPatch.length;i++){
  const a=mesh.shoulderPatch[i],b=mesh.shoulderPatch[(i+1)%mesh.shoulderPatch.length];
  if(rows[0].includes(a)&&rows[0].includes(b))continue;
  if(rows[3].includes(a)&&rows[3].includes(b))continue;
  meshLine(ctx,[a,b],front);
 }
 if(model.jacket)for(const i of [0,4])meshLine(ctx,rows.slice(3).map(r=>r[i]),front);
 meshLine(ctx,rows.at(-1),front,INK,1.6);
 // The grip/palm follows the same forearm transform as the sleeve cuff.
 const wrist=arm.wrist;
 if(!front||model.rig.depth(arm.world.wrist)>=0){
  const dx=wrist.x-arm.elbow.x,dy=wrist.y-arm.elbow.y;
  ctx.save();ctx.translate(wrist.x,wrist.y);ctx.rotate(Math.atan2(dy,dx)-Math.PI/2);
  ctx.beginPath();ctx.ellipse(0,0,arm.handOpen?5.8:6.8,arm.handOpen?9:7.7,0,0,Math.PI*2);ctx.fillStyle=model.colors.skin;ctx.fill();ctx.strokeStyle=model.colors.skinInk;ctx.lineWidth=1.6;ctx.stroke();
  line(ctx,[point(-2,0),point(2.5,1)],model.colors.skinShade,1);ctx.restore();
 }
}
