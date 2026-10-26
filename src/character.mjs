import {buildClothing,drawClothedLeg,drawClothedShorts,drawClothedTorso,drawClothedArm} from './clothing.mjs';
import {normalizeAppearance} from './wardrobe.mjs';
import {appearanceColors} from './appearance-colors.mjs';
import {drawHairBack,drawHead} from './head.mjs';
// SPDX-License-Identifier: GPL-3.0-or-later
// Original Canvas artwork, interpreted from the user's two character references.
// The joint coordinates are evaluated from StykAnimate's articulated figure.
const INK='#543c35',CREAM='#f1dfbf',SAGE='#94a68a';
function path(ctx,points,fill,stroke=INK,width=2.5){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function capsule(ctx,a,b,width,color){ctx.lineCap='round';ctx.lineWidth=width+4;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();}
function oval(ctx,x,y,rx,ry,color,stroke=INK){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();}}
export function drawIllustratedFigure(ctx,motion,phase,outfit='sage',layers={}){
 const appearance=normalizeAppearance(outfit),colors=appearanceColors(appearance);
 const head={x:motion.neck.x,y:motion.neck.y-27};
 ctx.save();ctx.lineJoin='round';
 drawHairBack(ctx,head,phase,appearance,colors);
 drawFrontBody(ctx,motion,appearance,colors,layers);
 drawHead(ctx,head,phase,appearance,colors);
 ctx.restore();
}

function frontShoe(ctx,leg,color){
 const {ankle,side}=leg;
 ctx.save();ctx.translate(ankle.x,ankle.y);ctx.rotate(-side*.055);ctx.scale(leg.scale,leg.scale);
 // Heel above, toe box below: laces and sole face the camera.
 path(ctx,[[-8,-7],[7,-7],[9,1],[12,12],[12,19],[8,23],[-8,23],[-12,19],[-11,10]],CREAM);
 path(ctx,[[-11,12],[-5,9],[5,9],[12,13],[12,19],[8,22],[-8,22],[-12,19]],color);
 ctx.fillStyle=CREAM;ctx.fillRect(-7,-4,14,12);ctx.strokeStyle=INK;ctx.lineWidth=1.3;
 for(let y=-2;y<8;y+=4){ctx.beginPath();ctx.moveTo(-5,y);ctx.lineTo(5,y+1);ctx.stroke();}
 ctx.beginPath();ctx.moveTo(-11,19);ctx.quadraticCurveTo(0,25,11,19);ctx.stroke();ctx.restore();
}
// All outfits use the same skinned surfaces for every sport. The shirt,
// sleeves and shorts share mesh vertices at their attachment boundaries.
function drawFrontBody(ctx,motion,appearance,colors,layers){
 const clothes=buildClothing(motion,appearance);
 for(const side of motion.legOrder){
  drawClothedLeg(ctx,clothes,side);
  frontShoe(ctx,motion.legs.find(l=>l.side===side),appearance.shoes==='rose'?'#bb8788':SAGE);
 }
 // Back pass retains visible portions outside the torso silhouette; the front
 // pass clips the actual mesh triangles, never swapping an entire sleeve.
 for(const arm of motion.arms)drawClothedArm(ctx,clothes,arm.side,false);
 const {neck}=motion;
 capsule(ctx,{x:neck.x,y:neck.y-12},{x:neck.x,y:neck.y+12},17,colors.skin);
 drawClothedShorts(ctx,clothes);
 layers.middle?.();
 drawClothedTorso(ctx,clothes);
 for(const arm of motion.arms)drawClothedArm(ctx,clothes,arm.side,true);
}
