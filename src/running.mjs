// SPDX-License-Identifier: GPL-3.0-or-later
import {sampleAnglePath} from '../vendor/stykanimate/motion.mjs';
const TAU = Math.PI * 2;
// Sagittal thigh angle and knee flexion: contact, stance, push-off,
// heel recovery, forward swing, then extension before the next contact.
const STRIDE = [
  [0, .35, .4, 0], [.15*TAU, -.10, .30, 0], [.32*TAU, -.50, .55, 0],
  [.48*TAU, -.28, 1.12, 0], [.68*TAU, .67, 1.16, 0], [.84*TAU, .60, .74, 0]
];
const project = p => ({x:p.x*(1+p.z*.0012), y:p.y, z:p.z});
function endpoint(start, length, angle, x = start.x) {
  // x stays in its own anatomical lane; depth carries the forward/back swing.
  const span = Math.sqrt(length*length-(x-start.x)**2);
  return {x, y:start.y+Math.cos(angle)*span, z:start.z+Math.sin(angle)*span};
}
export function frontRunPose(phase, resting = false) {
  const legs = [-1, 1].map(side => {
    const localPhase=phase+(side===1?Math.PI:0);
    const [thigh,flex]=resting?[0,.08]:sampleAnglePath(STRIDE,localPhase);
    const hip={x:side*13,y:0,z:0};
    const knee=endpoint(hip,62,thigh,side*15);
    const ankle=endpoint(knee,60,thigh-flex,side*15);
    return {side,hip,knee,ankle,thigh,flex,scale:1+ankle.z*.0015};
  });
  // Keep the support sole at a stable ground line; spring gently at each step.
  const support=Math.max(...legs.map(l=>l.ankle.y));
  const hipY=resting?0:122-support-2*(1-Math.cos(phase*2));
  const sway=resting?0:Math.sin(phase)*1.2;
  const hip={x:sway,y:hipY},neck={x:-sway*.5,y:hipY-78};
  const shift=p=>({...project(p),x:project(p).x+sway,y:p.y+hipY});
  const arms=legs.map(leg=>{
    const upper=resting?.10:-leg.thigh*.65;
    const forearm=resting?2.1:2.05-leg.thigh*.65;
    const shoulder={x:leg.side*25,y:-62,z:0};
    const elbow=endpoint(shoulder,39,upper,leg.side*34);
    const wrist=endpoint(elbow,33,forearm,leg.side*(resting?24:22));
    return {side:leg.side,shoulder:shift(shoulder),elbow:shift(elbow),wrist:shift(wrist),world:{shoulder,elbow,wrist},depth:wrist.z};
  });
  return {
    front:true,hip,neck,phase,resting,
    legs:legs.map(l=>({...l,world:{hip:l.hip,knee:l.knee,ankle:l.ankle},hip:shift(l.hip),knee:shift(l.knee),ankle:shift(l.ankle)})),
    arms,
    legOrder:[...legs].sort((a,b)=>a.ankle.z-b.ankle.z).map(l=>l.side),
    armOrder:[...arms].sort((a,b)=>a.depth-b.depth).map(a=>a.side)
  };
}
