import {drawFrontPart} from './arm-depth.mjs';
import {appearanceColors} from './appearance-colors.mjs';
// SPDX-License-Identifier: GPL-3.0-or-later
import {frontWalkPose,courtPose} from './actions.mjs';
import {frontRunPose} from './running.mjs';
import {drawIllustratedFigure} from './character.mjs';
import {GAME_IDS,gamePose,drawGameBack,drawGameTable,drawGameFront} from './games.mjs';
export const SPORTS = {
  running: {name: 'Running', icon: '↗', verb: 'Find your stride', detail: 'One step. One task. A little further.', period: .85, color: '#c4f17b'},
  pickleball: {name: 'Pickleball', icon: '◒', verb: 'Get in the zone', detail: 'Small wins make a great rally.', period: 1.9, color: '#f2ca81'},
  tennis: {name: 'Tennis', icon: '◉', verb: 'Make every minute count', detail: 'Stay present. Play the long game.', period: 2.2, color: '#b6c9ff'},
  padel: {name: 'Padel', icon: '⠿', verb: 'Find your sweet spot', detail: 'A steady rhythm. A stronger rally.', period: 2.1, color: '#e6b78b'},
  tabletennis: {name: 'Table tennis', icon: '◕', verb: 'Keep your momentum', detail: 'Quick rallies. One focused thought at a time.', period: 1.6, color: '#f0a69d'},
  badminton: {name: 'Badminton', icon: '⌁', verb: 'Keep your focus flying', detail: 'Light on your feet. Clear in your mind.', period: 2.8, color: '#f1b9d4'},
  walking: {name: 'Walking', icon: '↝', verb: 'Move at your own pace', detail: 'Steady progress is still progress.', period: 1.7, color: '#91ddcd'},
  basketball: {name:'Basketball',icon:'◍',verb:'Find your bounce',detail:'Keep a steady rhythm. Take the next shot.',period:3.8,color:'#edba7c',previewScale:1.8},
  volleyball: {name:'Volleyball',icon:'◓',verb:'Be ready for the next ball',detail:'Stay grounded. Keep your momentum.',period:3.2,color:'#e8d989',previewScale:1.6},
  football: {name:'Football',icon:'⬡',verb:'Keep moving forward',detail:'One touch at a time. Find your goal.',period:2.6,color:'#a8d6a0',previewScale:1.6},
  bowling: {name:'Bowling',icon:'∴',verb:'Find your follow-through',detail:'A calm approach. A smooth release.',period:3.6,color:'#c3b5e8',previewScale:1.65},
  chess: {name:'Chess',icon:'♞',verb:'Make your next move',detail:'Give one good thought your full attention.',period:6.4,color:'#d4c7a3',previewScale:1.65},
  boardgames: {name:'Board games',icon:'⚄',verb:'Enjoy your turn',detail:'Roll with it. Small moves add up.',period:6.2,color:'#e4b7cd',previewScale:1.65}
};
export function pose(sport, phase, resting = false) {
  if (!SPORTS[sport]) throw new Error('Unknown sport');
  const front=GAME_IDS.includes(sport)?gamePose(sport,phase,resting):sport==='running'?frontRunPose(phase,resting):sport==='walking'?frontWalkPose(phase,resting):courtPose(sport,phase,resting);
  return {front,bob:0};
}
export function drawCharacter(ctx, sport, phase, resting = false, color = SPORTS[sport].color, outfit = 'sage') {
  const {front}=pose(sport,phase,resting),colors=appearanceColors(outfit);
  ctx.save();
  if(front.game)drawGameBack(ctx,front);
  if(front.equipment&&(front.shoulderRig||front.equipment.depth<0))drawEquipment(ctx,front.equipment,color,colors);
  drawIllustratedFigure(ctx,front,phase,outfit,front.game?.seated?{middle:()=>drawGameTable(ctx,front)}:undefined);
  if(front.equipment){
   const e=front.equipment;
   if(front.shoulderRig)drawFrontPart(ctx,e.worldGrip,e.worldHead,e.grip,e.head,()=>drawEquipment(ctx,e,color,colors));
   else if(e.depth>=0)drawEquipment(ctx,e,color,colors);
  }
  if(front.projectile)drawProjectile(ctx,front.projectile,sport,color);
  if(front.game)drawGameFront(ctx,front,colors);
  ctx.restore();
}
function drawEquipment(ctx,e,color,colors){
  ctx.save();ctx.translate(e.grip.x,e.grip.y);ctx.rotate(e.angle);
  ctx.lineCap='round';ctx.strokeStyle='#eedfbd';ctx.lineWidth=5;
  ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(e.headDistance*.7,0);ctx.stroke();
  const paddle=e.sport==='pickleball',padel=e.sport==='padel',table=e.sport==='tabletennis';
  const rx=paddle?15:table?14:padel?22:e.sport==='badminton'?23:25,ry=paddle?18:table?12:padel?18:e.sport==='badminton'?16:19;
  ctx.translate(e.headDistance,0);ctx.scale(e.scale,e.scale*e.faceScale);ctx.lineWidth=2.5;ctx.strokeStyle='#f2dfbd';
  ctx.beginPath();
  if(table){
   // Short wooden handle, dark rubber edge and a red oval hitting surface.
   ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.fillStyle='#292b2d';ctx.fill();ctx.strokeStyle='#eedfbd';ctx.lineWidth=2;ctx.stroke();
   ctx.beginPath();ctx.ellipse(1,-.4,rx-2.3,ry-2,0,0,Math.PI*2);ctx.fillStyle='#c9544f';ctx.fill();
   ctx.beginPath();ctx.moveTo(-6,-6);ctx.quadraticCurveTo(2,-10,8,-5);ctx.strokeStyle='#ed8f7a';ctx.lineWidth=1.2;ctx.stroke();
  }else if(padel){
   // Solid teardrop face and through-holes distinguish padel from strings
   // and the rectangular pickleball paddle.
   ctx.moveTo(-rx-6,0);ctx.bezierCurveTo(-rx,-8,-16,-ry,0,-ry);ctx.bezierCurveTo(rx,-ry,rx,ry,0,ry);ctx.bezierCurveTo(-16,ry,-rx,8,-rx-6,0);ctx.closePath();ctx.fillStyle='#687b79';ctx.fill();ctx.stroke();
   ctx.save();ctx.clip();ctx.fillStyle='#203b31';
   for(let x=-12;x<=12;x+=8)for(let y=-10;y<=10;y+=7){ctx.beginPath();ctx.arc(x,y,1.9,0,Math.PI*2);ctx.fill();}
   ctx.restore();ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-17,-8);ctx.quadraticCurveTo(-24,0,-17,8);ctx.stroke();
  }else if(paddle){ctx.moveTo(-rx,-ry+5);ctx.quadraticCurveTo(-rx,-ry,-rx+6,-ry);ctx.lineTo(rx-6,-ry);ctx.quadraticCurveTo(rx,-ry,rx,-ry+6);ctx.lineTo(rx,ry-6);ctx.quadraticCurveTo(rx,ry,rx-6,ry);ctx.lineTo(-rx+6,ry);ctx.quadraticCurveTo(-rx,ry,-rx,ry-6);ctx.closePath();ctx.fillStyle='#9fac86';ctx.fill();ctx.stroke();ctx.strokeStyle='#e9dfb7';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-6,-ry+2);ctx.lineTo(9,ry-2);ctx.stroke();}
  else{ctx.ellipse(0,0,rx,ry,0,0,Math.PI*2);ctx.stroke();ctx.save();ctx.clip();ctx.lineWidth=.8;ctx.strokeStyle='#f2dfbd99';for(let i=-24;i<=24;i+=6){ctx.beginPath();ctx.moveTo(-rx,i);ctx.lineTo(rx,i);ctx.moveTo(i,-ry);ctx.lineTo(i,ry);ctx.stroke();}ctx.restore();}
  ctx.restore();
  // Fingers overlap the grip, rather than leaving the equipment floating.
  ctx.save();ctx.translate(e.grip.x,e.grip.y);ctx.rotate(e.angle);ctx.fillStyle=colors.skin;ctx.strokeStyle=colors.skinInk;ctx.lineWidth=1.2;ctx.beginPath();ctx.ellipse(0,0,5,7,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();
}
function drawProjectile(ctx,p,sport,color){
 ctx.save();ctx.globalAlpha=p.opacity;ctx.translate(p.x,p.y);
 if(p.shuttle){ctx.rotate(p.angle);ctx.fillStyle='#f4ead6';ctx.strokeStyle='#b7bda4';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-21,-10);ctx.quadraticCurveTo(-26,0,-21,10);ctx.closePath();ctx.fill();ctx.stroke();for(const y of [-6,0,6]){ctx.beginPath();ctx.moveTo(-3,0);ctx.lineTo(-21,y);ctx.stroke();}ctx.fillStyle='#fff8e8';ctx.beginPath();ctx.arc(0,0,4,0,Math.PI*2);ctx.fill();}
 else{const table=sport==='tabletennis',felt=sport==='tennis'||sport==='padel';ctx.fillStyle=table?'#fff8e9':felt?'#d6ee73':color;ctx.beginPath();ctx.arc(0,0,table?4:7,0,Math.PI*2);ctx.fill();ctx.lineWidth=1;ctx.strokeStyle='#fff4d5';if(felt){ctx.beginPath();ctx.arc(-7,0,7,-1,1);ctx.stroke();ctx.beginPath();ctx.arc(7,0,7,2.14,4.14);ctx.stroke();}else if(!table){ctx.fillStyle='#697947';for(const [x,y] of [[-2,-2],[3,0],[0,3]]){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}}}
 ctx.restore();
}
