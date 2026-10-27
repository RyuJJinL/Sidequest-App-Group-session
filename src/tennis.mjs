// SPDX-License-Identifier: GPL-3.0-or-later
// Original pilot architecture informed by the observed layered rig. No game code.
import {courtPose} from './actions.mjs';
export const TENNIS_LAYERS=Object.freeze(['body','support-hand','head','hair','clothing','grip']);
export const TENNIS_SLOTS=Object.freeze([
 'hair-back','leg-left','shoe-left','leg-right','shoe-right','arm-back',
 'neck','waist','torso','sleeve-front','hand-front','head','racket-grip'
]);
export const settle=(current,target,dt)=>target+(current-target)*Math.exp(-Math.max(0,Math.min(dt,.1))/ .085);
export function tennisPose(phase,resting=false,{weight=resting?0:1,time=phase,headSize=1}={}){
 const motion=courtPose('tennis',phase,false,true,{weight});
 // The head counterbalances the torso; the hair layer trails it independently.
 motion.headRig={scale:.82*headSize,tilt:-motion.torso.chestYaw*.055,
  phase:time*.85,hairPhase:time*2.6-.4,eyePhase:time*2.4};
 motion.layers={body:weight,supportHand:weight,head:1,hair:1,clothing:1,grip:1};
 motion.resting=resting;motion.tennis=true;
 if(weight<.999)delete motion.projectile;
 return motion;
}
