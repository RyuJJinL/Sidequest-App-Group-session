// SPDX-License-Identifier: GPL-3.0-or-later
// Every attachment is a named slot on the evaluated body rig. Arm slots have
// clipped back/front passes so occlusion never flips a complete limb at once.
export function figureSlots(motion){
 return [
  ...motion.legOrder.flatMap(side=>[{id:`leg:${side}`,kind:'leg',side,bone:`shin${side}`},{id:`shoe:${side}`,kind:'shoe',side,bone:`shin${side}`}]),
  ...motion.arms.map(a=>({id:`arm:${a.side}:back`,kind:'arm',side:a.side,front:false,bone:`fore${a.side}`})),
  {id:'neck',kind:'neck',bone:'chest'},{id:'waist',kind:'waist',bone:'pelvis'},
  {id:'middle-prop',kind:'middle',bone:'chest'},{id:'top',kind:'torso',bone:'chest'},
  {id:'torso-prop',kind:'overlay',bone:'chest'},
  ...motion.arms.map(a=>({id:`arm:${a.side}:front`,kind:'arm',side:a.side,front:true,bone:`fore${a.side}`}))
 ];
}
