import {buildClothing,drawClothedLeg,drawClothedShorts,drawClothedTorso,drawClothedArm} from './clothing.mjs';
// SPDX-License-Identifier: GPL-3.0-or-later
// Original Canvas artwork, interpreted from the user's two character references.
// The joint coordinates are evaluated from StykAnimate's articulated figure.
const INK='#543c35',SKIN='#efb59b',CREAM='#f1dfbf',SAGE='#94a68a',PEACH='#e9aa8e',SLATE='#657080';
function path(ctx,points,fill,stroke=INK,width=2.5){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function capsule(ctx,a,b,width,color){ctx.lineCap='round';ctx.lineWidth=width+4;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();}
function oval(ctx,x,y,rx,ry,color,stroke=INK){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();}}
export function drawIllustratedFigure(ctx,motion,phase,outfit='sage'){
 const jacket=outfit==='peach';
 const neck=motion.neck,head={x:neck.x,y:neck.y-27};
 const sway=Math.sin(phase)*5;
 ctx.save();ctx.lineJoin='round';
 // Ponytail follows the movement with a little lag.
 ctx.save();ctx.translate(head.x+22,head.y-22);ctx.rotate(Math.sin(phase-.5)*.09);
 ctx.beginPath();ctx.moveTo(-6,9);ctx.bezierCurveTo(-11,-32,28,-48,44,-14);ctx.bezierCurveTo(60,4,30,35,54,52);ctx.bezierCurveTo(30,66,29,39,14,56);ctx.bezierCurveTo(20,26,1,26,-6,9);ctx.fillStyle='#65483e';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();
 ctx.strokeStyle='#876052';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,-14);ctx.bezierCurveTo(35,-18,35,12,28,26);ctx.stroke();oval(ctx,2,0,9,5,PEACH);ctx.restore();
 drawFrontBody(ctx,motion,jacket);
 // Rounded face, chocolate hair and the reference's peach/cream/slate headband.
 oval(ctx,head.x-29,head.y+3,6,10,SKIN);oval(ctx,head.x+29,head.y+3,6,10,SKIN);
 oval(ctx,head.x,head.y,30,36,SKIN);
 ctx.beginPath();ctx.moveTo(head.x-30,head.y-2);ctx.bezierCurveTo(head.x-41,head.y-44,head.x-9,head.y-51,head.x+12,head.y-39);ctx.bezierCurveTo(head.x+38,head.y-39,head.x+38,head.y-8,head.x+29,head.y+9);ctx.bezierCurveTo(head.x+25,head.y-8,head.x+9,head.y-9,head.x+2,head.y-26);ctx.bezierCurveTo(head.x+5,head.y-7,head.x+17,head.y-4,head.x+19,head.y-3);ctx.bezierCurveTo(head.x-1,head.y-6,head.x-9,head.y-19,head.x-10,head.y-24);ctx.bezierCurveTo(head.x-21,head.y-23,head.x-25,head.y-12,head.x-30,head.y-2);ctx.fillStyle='#65483e';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.stroke();
 path(ctx,[[head.x-30,head.y-25],[head.x-27,head.y-39],[head.x+8,head.y-43],[head.x+32,head.y-33],[head.x+32,head.y-18],[head.x+7,head.y-28]],PEACH);
 path(ctx,[[head.x-29,head.y-30],[head.x-28,head.y-35],[head.x+7,head.y-39],[head.x+32,head.y-29],[head.x+32,head.y-24],[head.x+7,head.y-34]],CREAM,null);
 path(ctx,[[head.x-29,head.y-27],[head.x-29,head.y-30],[head.x+7,head.y-34],[head.x+32,head.y-24],[head.x+32,head.y-21],[head.x+7,head.y-31]],SLATE,null);
 // Side locks frame the cheeks.
 ctx.strokeStyle=INK;ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(head.x-28,head.y-4);ctx.quadraticCurveTo(head.x-38,head.y+26,head.x-27+sway*.2,head.y+28);ctx.stroke();
 const blink=Math.sin(phase*.23)> .998;
 oval(ctx,head.x-12,head.y+2,3,blink?1:5,INK,null);oval(ctx,head.x+12,head.y+2,3,blink?1:5,INK,null);
 oval(ctx,head.x-19,head.y+12,7,4,'#e69d8c',null);oval(ctx,head.x+19,head.y+12,7,4,'#e69d8c',null);
 ctx.lineWidth=2;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(head.x-10,head.y+21);ctx.quadraticCurveTo(head.x,head.y+28,head.x+12,head.y+20);ctx.stroke();
 ctx.beginPath();ctx.moveTo(head.x-17,head.y-9);ctx.quadraticCurveTo(head.x-12,head.y-13,head.x-7,head.y-10);ctx.moveTo(head.x+8,head.y-10);ctx.quadraticCurveTo(head.x+13,head.y-13,head.x+18,head.y-9);ctx.stroke();
 ctx.strokeStyle='#b67664';ctx.beginPath();ctx.moveTo(head.x,head.y+8);ctx.lineTo(head.x-2,head.y+13);ctx.lineTo(head.x+1,head.y+15);ctx.stroke();
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
function drawFrontBody(ctx,motion,jacket){
 const clothes=buildClothing(motion,jacket?'peach':'sage');
 for(const side of motion.legOrder){
  drawClothedLeg(ctx,clothes,side);
  frontShoe(ctx,motion.legs.find(l=>l.side===side),jacket?'#bb8788':SAGE);
 }
 // Back pass retains visible portions outside the torso silhouette; the front
 // pass clips the actual mesh triangles, never swapping an entire sleeve.
 for(const arm of motion.arms)drawClothedArm(ctx,clothes,arm.side,false);
 const {neck}=motion;
 capsule(ctx,{x:neck.x,y:neck.y-12},{x:neck.x,y:neck.y+12},17,SKIN);
 drawClothedShorts(ctx,clothes);
 drawClothedTorso(ctx,clothes);
 for(const arm of motion.arms)drawClothedArm(ctx,clothes,arm.side,true);
}
