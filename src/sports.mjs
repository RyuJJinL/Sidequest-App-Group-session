// SPDX-License-Identifier: GPL-3.0-or-later
import {defaultFigure, sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
import {frontRunPose} from './running.mjs';
import {drawIllustratedFigure} from './character.mjs';
export const SPORTS = {
  running: {name: 'Running', icon: '↗', verb: 'Find your stride', detail: 'One step. One task. A little further.', period: .85, color: '#c4f17b'},
  pickleball: {name: 'Pickleball', icon: '◒', verb: 'Get in the zone', detail: 'Small wins make a great rally.', period: 1.65, color: '#f2ca81'},
  tennis: {name: 'Tennis', icon: '◉', verb: 'Make every minute count', detail: 'Stay present. Play the long game.', period: 1.8, color: '#b6c9ff'},
  badminton: {name: 'Badminton', icon: '⌁', verb: 'Keep your focus flying', detail: 'Light on your feet. Clear in your mind.', period: 1.6, color: '#f1b9d4'},
  walking: {name: 'Walking', icon: '↝', verb: 'Move at your own pace', detail: 'Steady progress is still progress.', period: 1.7, color: '#91ddcd'}
};
const TAU = Math.PI * 2;
const figure = defaultFigure();
// Native StykAnimate segment topology; all angles are absolute screen angles.
export function pose(sport, phase, resting = false) {
  if (!SPORTS[sport]) throw new Error('Unknown sport');
  if (sport === 'running') return {front:frontRunPose(phase,resting),bob:0};
  const s = Math.sin(phase);
  let angles;
  if (resting) angles = [-1.57, -1.57, 1.35, 1.1, 1.8, 1.95, 1.42, 1.57, 1.72, 1.57];
  else if (sport === 'walking') angles = [-1.57 + .035, -1.57,
    1.57 - s * .65, .35 - s * .5, 1.57 + s * .65, .35 + s * .5,
    1.57 + s * .48, 1.57 + Math.max(0, -s) * .7,
    1.57 - s * .48, 1.57 + Math.max(0, s) * .7];
  else {
    // Use upstream's periodic monotone Hermite sampler for the racket swing.
    const overhead = sport === 'badminton';
    const swing = sampleAnglePath([
      [0, -.15, -.5, 0], [TAU * .25, overhead ? -2.3 : -.9, overhead ? -2 : -1.2, 0],
      [TAU * .5, .5, .3, 0], [TAU * .75, 1.1, 1.2, 0]
    ], phase);
    angles = [-1.5 + s * .07, -1.5, swing[0], swing[1], 2.3, 1.6,
      1.12 + s * .12, 1.7, 2.0 + s * .12, 1.35];
  }
  return {figure, angles, bob: resting ? Math.sin(phase) * 1.5 : Math.cos(phase * 2) * 2};
}
export function jointPositions({figure, angles}) {
  const points = new Map([[0, {x: 0, y: 0}]]);
  for (const [i, segment] of figure.segments.entries()) {
    const start = points.get(segment.parent_id);
    points.set(segment.segment_id, {x: start.x + Math.cos(angles[i]) * segment.length, y: start.y + Math.sin(angles[i]) * segment.length});
  }
  return points;
}
export function drawCharacter(ctx, sport, phase, resting = false, color = SPORTS[sport].color, outfit = 'sage') {
  const p = pose(sport, phase, resting), points = p.front ? null : jointPositions(p);
  ctx.save(); ctx.translate(0, p.front ? 0 : p.bob);
  drawIllustratedFigure(ctx, points, phase, outfit, p.front);
  if (!['running', 'walking'].includes(sport)) {
    const hand = points.get(4), direction = p.angles[3] - .5;
    ctx.save();ctx.translate(hand.x,hand.y);ctx.rotate(direction);
    ctx.strokeStyle = '#f5f3df';ctx.lineWidth = 5;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(26,0);ctx.stroke();
    ctx.beginPath();ctx.ellipse(45,0,sport==='pickleball'?21:26,sport==='pickleball'?16:19,0,0,TAU);
    if(sport==='pickleball'){ctx.fillStyle=color;ctx.fill();}else{ctx.stroke();ctx.lineWidth=1;for(let i=-12;i<=12;i+=6){ctx.beginPath();ctx.moveTo(25,i);ctx.lineTo(65,i);ctx.stroke();}}
    ctx.restore();
    if (!resting) {
      const x=150+Math.cos(phase)*70,y=-85-Math.abs(Math.sin(phase))*70;
      ctx.fillStyle=sport==='badminton'?'#fff5e0':color;ctx.beginPath();ctx.arc(x,y,sport==='badminton'?5:8,0,TAU);ctx.fill();
      if(sport==='badminton'){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+17,y-13);ctx.lineTo(x+21,y+5);ctx.closePath();ctx.fill();}
    }
  }
  ctx.restore();
}
