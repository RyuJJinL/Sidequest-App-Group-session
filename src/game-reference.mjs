// Private reference prototype. Original game art stays in private-reference/.
// Badminton is an authored adaptation, not a recovered original game clip.
import {courtPose} from './actions.mjs';
export async function mountGameReference(canvas,options={}){
 const {mountGameReference:mount}=await import('../private-reference/game-runtime.mjs');
 const player=await mount(canvas,options),draw=player.draw;
 let activeMode='badminton',activeClip='待机动画/待机';
 return {...player,
  setMode(mode,clip){activeMode=mode;if(clip)activeClip=clip;player.setMode(mode,clip);},
  draw(time=0,settings={}){const mode=settings.mode??activeMode;draw(time,{...settings,mode,clip:settings.clip??activeClip,pose:mode==='badminton'?courtPose('badminton',time/3.2*Math.PI*2):null});}
 };
}
