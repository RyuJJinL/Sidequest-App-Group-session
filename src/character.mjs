// SPDX-License-Identifier: GPL-3.0-or-later
// Original Canvas artwork, interpreted from the user's two character references.
// The joint coordinates are evaluated from StykAnimate's articulated figure.
const INK='#543c35',SKIN='#efb59b',CREAM='#f1dfbf',SAGE='#94a68a',PEACH='#e9aa8e',SLATE='#657080';
function path(ctx,points,fill,stroke=INK,width=2.5){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=width;ctx.stroke();}}
function capsule(ctx,a,b,width,color){ctx.lineCap='round';ctx.lineWidth=width+4;ctx.strokeStyle=INK;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.lineWidth=width;ctx.strokeStyle=color;ctx.stroke();}
function oval(ctx,x,y,rx,ry,color,stroke=INK){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=2.5;ctx.stroke();}}
function shoe(ctx,ankle,side,color){ctx.save();ctx.translate(ankle.x,ankle.y);ctx.scale(side,1);path(ctx,[[-10,-2],[7,-5],[13,3],[27,11],[28,19],[-13,19],[-15,12]],CREAM);path(ctx,[[-14,11],[2,9],[13,13],[27,11],[28,19],[-13,19]],color);ctx.strokeStyle=INK;ctx.lineWidth=1.5;for(let y=1;y<9;y+=4){ctx.beginPath();ctx.moveTo(-4,y);ctx.lineTo(10,y+3);ctx.stroke();}ctx.restore();}
export function drawIllustratedFigure(ctx,points,phase,outfit='sage'){
 const jacket=outfit==='peach',cloth=jacket?SLATE:SAGE;
 const hip=points.get(0),neck=points.get(1),head={x:neck.x,y:neck.y-27};
 const sway=Math.sin(phase)*5;
 ctx.save();ctx.lineJoin='round';
 // Ponytail follows the movement with a little lag.
 ctx.save();ctx.translate(head.x+22,head.y-22);ctx.rotate(Math.sin(phase-.5)*.09);
 ctx.beginPath();ctx.moveTo(-6,9);ctx.bezierCurveTo(-11,-32,28,-48,44,-14);ctx.bezierCurveTo(60,4,30,35,54,52);ctx.bezierCurveTo(30,66,29,39,14,56);ctx.bezierCurveTo(20,26,1,26,-6,9);ctx.fillStyle='#65483e';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=3;ctx.stroke();
 ctx.strokeStyle='#876052';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,-14);ctx.bezierCurveTo(35,-18,35,12,28,26);ctx.stroke();oval(ctx,2,0,9,5,PEACH);ctx.restore();
 const legs=[[9,10,-1],[7,8,1]];
 for(const [kneeId,ankleId,side] of legs){
  const knee=points.get(kneeId),ankle=points.get(ankleId),start={x:hip.x+side*10,y:hip.y-1};
  capsule(ctx,start,knee,20,jacket?'#55545a':SKIN);capsule(ctx,knee,ankle,16,jacket?'#55545a':SKIN);
  const sockTop={x:ankle.x+(knee.x-ankle.x)*.23,y:ankle.y+(knee.y-ankle.y)*.23};capsule(ctx,sockTop,ankle,16,jacket?SKIN:'#f3e9d9');shoe(ctx,ankle,1,jacket?'#bb8788':SAGE);
 }
 function arm(elbowId,handId,side){const elbow=points.get(elbowId),hand=points.get(handId),shoulder={x:neck.x+side*13,y:neck.y+11};capsule(ctx,shoulder,elbow,jacket?20:16,jacket?PEACH:SKIN);capsule(ctx,elbow,hand,jacket?17:13,jacket?SLATE:SKIN);const sleeveEnd={x:shoulder.x+(elbow.x-shoulder.x)*.49,y:shoulder.y+(elbow.y-shoulder.y)*.49};capsule(ctx,shoulder,sleeveEnd,22,jacket?PEACH:SAGE);if(jacket){const mid={x:elbow.x+(hand.x-elbow.x)*.12,y:elbow.y+(hand.y-elbow.y)*.12};capsule(ctx,elbow,mid,18,CREAM);}oval(ctx,hand.x,hand.y+2,7,9,SKIN);}
 arm(5,6,-1);
 // Shorts and torso use the original hip/neck anchors.
 path(ctx,[[hip.x-23,hip.y-11],[hip.x+23,hip.y-11],[hip.x+28,hip.y+28],[hip.x+3,hip.y+30],[hip.x,hip.y+14],[hip.x-3,hip.y+30],[hip.x-27,hip.y+27]],jacket?'#be8c8d':CREAM);
 ctx.strokeStyle=jacket?'#d9a4a1':'#d2c1a5';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(hip.x-23,hip.y+22);ctx.lineTo(hip.x-6,hip.y+25);ctx.moveTo(hip.x+6,hip.y+25);ctx.lineTo(hip.x+24,hip.y+22);ctx.stroke();
 path(ctx,[[neck.x-20,neck.y+5],[neck.x-29,neck.y+21],[hip.x-23,hip.y-5],[hip.x+23,hip.y-5],[neck.x+29,neck.y+21],[neck.x+19,neck.y+5]],cloth);
 if(jacket){path(ctx,[[neck.x-20,neck.y+5],[neck.x-27,neck.y+24],[neck.x,neck.y+42],[neck.x+27,neck.y+24],[neck.x+20,neck.y+5]],PEACH);path(ctx,[[neck.x-26,neck.y+27],[neck.x,neck.y+43],[neck.x+26,neck.y+27],[neck.x+25,neck.y+46],[neck.x,neck.y+59],[neck.x-25,neck.y+46]],CREAM);ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(neck.x,neck.y+8);ctx.lineTo(hip.x,hip.y-6);ctx.stroke();}
 else {path(ctx,[[neck.x-14,neck.y+3],[neck.x,neck.y+21],[neck.x+14,neck.y+3],[neck.x+15,neck.y+20],[neck.x+5,neck.y+16],[neck.x,neck.y+29],[neck.x-6,neck.y+16],[neck.x-17,neck.y+20]],CREAM);ctx.strokeStyle=CREAM;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(neck.x,neck.y+24);ctx.lineTo(neck.x,neck.y+41);ctx.stroke();}
 capsule(ctx,{x:neck.x,y:neck.y-10},{x:neck.x,y:neck.y+7},17,SKIN);
 arm(3,4,1);
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
