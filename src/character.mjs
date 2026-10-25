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

function taperedLimb(ctx,a,b,ra,rb,color){
 const angle=Math.atan2(b.y-a.y,b.x-a.x),x=Math.sin(angle),y=-Math.cos(angle);
 ctx.beginPath();ctx.moveTo(a.x+x*ra,a.y+y*ra);ctx.lineTo(b.x+x*rb,b.y+y*rb);
 ctx.quadraticCurveTo(b.x+Math.cos(angle)*rb,b.y+Math.sin(angle)*rb,b.x-x*rb,b.y-y*rb);
 ctx.lineTo(a.x-x*ra,a.y-y*ra);ctx.quadraticCurveTo(a.x-Math.cos(angle)*ra,a.y-Math.sin(angle)*ra,a.x+x*ra,a.y+y*ra);
 ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
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
function frontArm(ctx,arm,jacket){
 const {shoulder,elbow,wrist}=arm;
 taperedLimb(ctx,shoulder,elbow,10,8,jacket?PEACH:SKIN);
 taperedLimb(ctx,elbow,wrist,8,6,jacket?SLATE:SKIN);
 const sleeve={x:shoulder.x+(elbow.x-shoulder.x)*.46,y:shoulder.y+(elbow.y-shoulder.y)*.46};
 taperedLimb(ctx,shoulder,sleeve,12,10,jacket?PEACH:SAGE);
 if(jacket){ctx.strokeStyle=CREAM;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(sleeve.x,sleeve.y+4);ctx.lineTo(elbow.x,elbow.y-8);ctx.stroke();}
 ctx.save();ctx.translate(wrist.x,wrist.y);ctx.rotate(-arm.side*.18);
 oval(ctx,0,0,arm.handOpen?6:7,arm.handOpen?10:8,SKIN);ctx.lineWidth=1;ctx.strokeStyle='#b67664';ctx.beginPath();if(arm.handOpen){ctx.moveTo(0,-2);ctx.lineTo(0,6);}else{ctx.moveTo(-3,-2);ctx.lineTo(3,-2);ctx.moveTo(-3,1);ctx.lineTo(3,1);}ctx.stroke();ctx.restore();
}
function drawFrontBody(ctx,motion,jacket){
 const {hip,neck}=motion;
 for(const side of motion.legOrder){
  const leg=motion.legs.find(l=>l.side===side),{knee,ankle}=leg;
  taperedLimb(ctx,leg.hip,knee,12,8.5,jacket?'#55545a':SKIN);
  taperedLimb(ctx,knee,ankle,8.5,6.5,jacket?'#55545a':SKIN);
  // Paint over the limb junction; a single skin surface avoids ball joints.
  oval(ctx,knee.x,knee.y,7.3,8,jacket?'#55545a':SKIN,null);
  const sock={x:ankle.x+(knee.x-ankle.x)*.24,y:ankle.y+(knee.y-ankle.y)*.24};
  taperedLimb(ctx,sock,ankle,7,7,jacket?SKIN:'#f3e9d9');
  frontShoe(ctx,leg,jacket?'#bb8788':SAGE);
 }
 // Neck goes behind the shirt and its collar.
 capsule(ctx,{x:neck.x,y:neck.y-12},{x:neck.x,y:neck.y+12},17,SKIN);
 path(ctx,[[hip.x-23,hip.y-10],[hip.x+23,hip.y-10],[hip.x+26,hip.y+25],[hip.x+3,hip.y+27],[hip.x,hip.y+14],[hip.x-3,hip.y+27],[hip.x-26,hip.y+25]],jacket?'#be8c8d':CREAM);
 ctx.strokeStyle=jacket?'#d9a4a1':'#c6b397';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(hip.x,hip.y-2);ctx.lineTo(hip.x,hip.y+14);ctx.stroke();
 ctx.save();ctx.translate(neck.x,neck.y);ctx.scale(motion.torso?.chestScale??1,1);ctx.translate(-neck.x,-neck.y);
 path(ctx,[[neck.x-20,neck.y+6],[neck.x-27,neck.y+18],[hip.x-23,hip.y-6],[hip.x+23,hip.y-6],[neck.x+27,neck.y+18],[neck.x+20,neck.y+6]],jacket?SLATE:SAGE);
 if(jacket){
  path(ctx,[[neck.x-20,neck.y+6],[neck.x-26,neck.y+26],[neck.x,neck.y+42],[neck.x+26,neck.y+26],[neck.x+20,neck.y+6]],PEACH);
  path(ctx,[[neck.x-26,neck.y+27],[neck.x,neck.y+43],[neck.x+26,neck.y+27],[neck.x+25,neck.y+44],[neck.x,neck.y+56],[neck.x-25,neck.y+44]],CREAM);
  ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(neck.x,neck.y+7);ctx.lineTo(hip.x,hip.y-7);ctx.stroke();
 }else{
  path(ctx,[[neck.x-13,neck.y+4],[neck.x,neck.y+20],[neck.x+13,neck.y+4],[neck.x+15,neck.y+19],[neck.x+5,neck.y+16],[neck.x,neck.y+27],[neck.x-5,neck.y+16],[neck.x-15,neck.y+19]],CREAM);
  ctx.strokeStyle=CREAM;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(neck.x,neck.y+24);ctx.lineTo(neck.x,neck.y+39);ctx.stroke();
 }
 ctx.restore();
 for(const side of motion.armOrder) frontArm(ctx,motion.arms.find(a=>a.side===side),jacket);
}
