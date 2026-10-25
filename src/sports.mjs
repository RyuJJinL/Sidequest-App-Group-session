import {drawFrontPart} from './arm-depth.mjs';
// SPDX-License-Identifier: GPL-3.0-or-later
import {frontWalkPose,courtPose} from './actions.mjs';
import {frontRunPose} from './running.mjs';
import {drawIllustratedFigure} from './character.mjs';
export const SPORTS = {
  running: {name: 'Running', icon: '↗', verb: 'Find your stride', detail: 'One step. One task. A little further.', period: .85, color: '#c4f17b'},
  pickleball: {name: 'Pickleball', icon: '◒', verb: 'Get in the zone', detail: 'Small wins make a great rally.', period: 1.9, color: '#f2ca81'},
  tennis: {name: 'Tennis', icon: '◉', verb: 'Make every minute count', detail: 'Stay present. Play the long game.', period: 2.2, color: '#b6c9ff'},
  badminton: {name: 'Badminton', icon: '⌁', verb: 'Keep your focus flying', detail: 'Light on your feet. Clear in your mind.', period: 2.8, color: '#f1b9d4'},
  walking: {name: 'Walking', icon: '↝', verb: 'Move at your own pace', detail: 'Steady progress is still progress.', period: 1.7, color: '#91ddcd'}
};
export function pose(sport, phase, resting = false) {
  if (!SPORTS[sport]) throw new Error('Unknown sport');
  const front=sport==='running'?frontRunPose(phase,resting):sport==='walking'?frontWalkPose(phase,resting):courtPose(sport,phase,resting);
  return {front,bob:0};
}
export function drawCharacter(ctx, sport, phase, resting = false, color = SPORTS[sport].color, outfit = 'sage') {
  const {front}=pose(sport,phase,resting);
  ctx.save();
  if(front.equipment&&(front.shoulderRig||front.equipment.depth<0))drawEquipment(ctx,front.equipment,color);
  drawIllustratedFigure(ctx,front,phase,outfit);
  if(front.equipment){
   const e=front.equipment;
   if(front.shoulderRig)drawFrontPart(ctx,e.worldGrip,e.worldHead,e.grip,e.head,()=>drawEquipment(ctx,e,color));
   else if(e.depth>=0)drawEquipment(ctx,e,color);
  }
  if(front.projectile)drawProjectile(ctx,front.projectile,sport,color);
  ctx.restore();
}
function drawEquipment(ctx,e,color){
  ctx.save();ctx.translate(e.grip.x,e.grip.y);ctx.rotate(e.angle);
  ctx.lineCap='round';ctx.strokeStyle='#eedfbd';ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(e.headDistance*.7,0);ctx.stroke();
  const paddle=e.sport==='pickleball',rx=paddle?15:e.sport==='badminton'?23:25,ry=paddle?18:e.sport==='badminton'?16:19;
  ctx.translate(e.headDistance,0);ctx.scale(e.scale,e.scale*e.faceScale);ctx.lineWidth=2.5;ctx.strokeStyle='#f2dfbd';
  ctx.beginPath();
  if(paddle){ctx.moveTo(-rx,-ry+5);ctx.quadraticCurveTo(-rx,-ry,-rx+6,-ry);ctx.lineTo(rx-6,-ry);ctx.quadraticCurveTo(rx,-ry,rx,-ry+6);ctx.lineTo(rx,ry-6);ctx.quadraticCurveTo(rx,ry,rx-6,ry);ctx.lineTo(-rx+6,ry);ctx.quadraticCurveTo(-rx,ry,-rx,ry-6);ctx.closePath();ctx.fillStyle='#9fac86';ctx.fill();ctx.stroke();ctx.strokeStyle='#e9dfb7';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-6,-ry+2);ctx.lineTo(9,ry-2);ctx.stroke();}
  else{ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.save();ctx.clip();ctx.lineWidth=.8;ctx.strokeStyle='#f2dfbd99';for(let i=-24;i<=24;i+=6){ctx.beginPath();ctx.moveTo(-rx,i);ctx.lineTo(rx,i);ctx.moveTo(i,-ry);ctx.lineTo(i,ry);ctx.stroke();}ctx.restore();}
  ctx.restore();
  // Fingers overlap the grip, rather than leaving the equipment floating.
  ctx.save();ctx.translate(e.grip.x,e.grip.y);ctx.rotate(e.angle);ctx.fillStyle='#efb59b';ctx.strokeStyle='#543c35';ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,5,7,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
}
function drawProjectile(ctx,p,sport,color){
 ctx.save();ctx.globalAlpha=p.opacity;ctx.translate(p.x,p.y);
 if(p.shuttle){ctx.rotate(p.angle);ctx.fillStyle='#f4ead6';ctx.strokeStyle='#b7bda4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-21,-10);ctx.quadraticCurveTo(-26,0,-21,10);ctx.closePath();ctx.fill();ctx.stroke();for(const y of [-6,0,6]){ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(-21,y);ctx.stroke();}ctx.fillStyle='#fff8e8';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();}
 else{ctx.fillStyle=sport==='tennis'?'#d6ee73':color;ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='#fff4d5';if(sport==='tennis'){ctx.beginPath();ctx.arc(-7,0,7,-1,1);ctx.stroke();ctx.beginPath();ctx.arc(7,0,7,2.14,4.14);ctx.stroke();}else{ctx.fillStyle='#697947';for(const [x,y] of [[-2,-2],[3,0],[0,3]]){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}}}
 ctx.restore();
}
