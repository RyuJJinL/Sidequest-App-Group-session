import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GAME_IDS,gamePose} from '../src/games.mjs';
import {SPORTS,pose} from '../src/sports.mjs';
const TAU=2*Math.PI;
const at=(id,t,rest=false)=>gamePose(id,t*TAU,rest);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y,(a.z??0)-(b.z??0));
test('all six activities are selectable and have their own scene and pace',()=>{
 assert.equal(Object.keys(SPORTS).length,13);
 for(const id of GAME_IDS){assert.ok(SPORTS[id]);assert.equal(pose(id,0).front.game.sport,id);}
 assert.ok(SPORTS.chess.period>SPORTS.basketball.period*3);
 assert.ok(at('chess',0).game.seated&&at('boardgames',0).game.seated);
 assert.equal(at('bowling',0).game.seated,false);
});
test('basketball releases from the palm, bounces at the floor, and returns to the same hand',()=>{
 const release=at('basketball',.18),bounce=at('basketball',.47),catchPose=at('basketball',.82);
 assert.ok(Math.abs(release.game.ball.x-release.arms[1].wrist.x)<1e-8);
 assert.ok(Math.abs(release.game.ball.y-release.arms[1].wrist.y-15)<1e-8);
 assert.equal(bounce.game.ball.y,116);
 assert.ok(bounce.game.ball.y>release.game.ball.y+60);
 assert.ok(Math.abs(catchPose.game.ball.y-catchPose.arms[1].wrist.y-15)<1e-8);
 for(let t=0;t<1;t+=.01)assert.ok(at('basketball',t).game.ball.y+15<=132);
});
test('volleyball uses two raised hands and releases upward from their shared contact',()=>{
 const r=at('volleyball',.4),b=r.game.ball;
 for(const a of r.arms)assert.ok(a.wrist.y<r.neck.y-40);
 assert.ok(Math.abs(b.x-(r.arms[0].wrist.x+r.arms[1].wrist.x)/2)<1e-8);
 assert.ok(Math.abs(b.y-(r.arms[0].wrist.y+r.arms[1].wrist.y)/2+14)<1e-8);
 assert.ok(at('volleyball',.7).game.ball.y<at('volleyball',.44).game.ball.y-25);
});
test('football keeps a support foot planted while the kicking foot sends the ball forward',()=>{
 const load=at('football',.25),hit=at('football',.43),after=at('football',.7);
 assert.ok(hit.legs[1].world.ankle.z>load.legs[1].world.ankle.z+70);
 assert.ok(hit.legs[1].ankle.y<hit.legs[0].ankle.y);
 assert.ok(Math.abs(hit.game.ball.x-hit.legs[1].ankle.x)<1e-8);
 assert.ok(Math.abs(hit.game.ball.y-hit.legs[1].ankle.y-22)<1e-8);
 assert.ok(after.game.ball.y>hit.game.ball.y+20&&after.game.ball.radius>hit.game.ball.radius);
 for(let t=0;t<1;t+=.02)assert.ok(Math.abs(at('football',t).legs[0].ankle.y-122)<1e-8);
});
test('bowling releases low, rolls away toward the pins, then resets without a visible pop',()=>{
 const ready=at('bowling',0),release=at('bowling',.46),pins=at('bowling',.84);
 assert.ok(release.arms[1].wrist.y>ready.arms[1].wrist.y+40);
 assert.ok(Math.abs(release.game.ball.y-release.arms[1].wrist.y-14)<1e-8);
 assert.ok(pins.game.ball.x>release.game.ball.x+90&&pins.game.ball.radius<7);
 assert.ok(pins.game.pinFall>0);
 assert.equal(at('bowling',0).game.ball.opacity,0);
 assert.equal(at('bowling',.99999).game.ball.opacity,0);
 assert.equal(at('bowling',.99999).game.pinOpacity,0);
});
test('tabletop pieces follow the hand while lifted and rest on the board when placed',()=>{
 for(const id of ['chess','boardgames'])for(let t=.001;t<1;t+=.003){
  const r=at(id,t),piece=r.game.piece;
  if(piece.held){
   assert.ok(Math.abs(piece.x-r.arms[1].wrist.x)<.001,'hand must reach the moving piece');
   assert.ok(Math.abs(piece.y-r.arms[1].wrist.y-(id==='chess'?16:12))<.001);
  }
 }
 const dice=at('boardgames',.1),settled=at('boardgames',.45);
 assert.ok(dice.game.die.held&&!settled.game.die.held);
 assert.ok(Math.abs(dice.game.die.y-dice.arms[1].wrist.y-6)<1e-8);
 assert.equal(settled.game.die.x,60);assert.equal(settled.game.die.y,34);
});
test('activity joints and visible props remain continuous through every release and the loop seam',()=>{
 const step=.00001;
 for(const id of GAME_IDS)for(let t=0;t<1;t+=.001){
  const a=at(id,t),b=at(id,t+step);
  for(let i=0;i<2;i++)for(const part of ['shoulder','elbow','wrist'])assert.ok(distance(a.arms[i].world[part],b.arms[i].world[part])<.2,`${id} ${part} must not snap`);
  for(const prop of ['ball','piece','die'])if(a.game[prop]&&b.game[prop]&&(a.game[prop].opacity??1)>.01&&(b.game[prop].opacity??1)>.01){
   assert.ok(distance(a.game[prop],b.game[prop])<.3,`${id} ${prop} must not teleport at a hand-off`);
  }
 }
 for(const id of GAME_IDS){
  const a=at(id,0),b=at(id,1-1e-8);
  for(let i=0;i<2;i++)assert.ok(distance(a.arms[i].world.wrist,b.arms[i].world.wrist)<.001);
 }
});
test('stopped sessions and breaks hold a stable activity pose with stable props',()=>{
 for(const id of GAME_IDS){
  const a=at(id,0,true);
  for(let t=.1;t<1;t+=.1){
   const b=at(id,t,true);
   assert.deepEqual(b.game,a.game);
   for(let i=0;i<2;i++)assert.deepEqual(b.arms[i].world,a.arms[i].world);
  }
 }
});
