import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FocusTimer,formatTime} from '../src/timer.mjs';
test('pause and resume retain time and delayed ticks use wall clock',()=>{
 let now=1000;const t=new FocusTimer({},()=>now);t.start();now+=10000;t.pause();assert.equal(t.remaining,1490000);now+=90000;t.start();now+=1490000;assert.equal(t.tick(),'focus');assert.equal(t.completed,1);assert.equal(t.mode,'short');assert.equal(t.running,false);assert.equal(t.remaining,300000);assert.equal(t.tick(),null);
});
test('four completed focus rounds earn long break; skipped rounds do not count',()=>{
 let now=0;const t=new FocusTimer({focus:1},()=>now);
 for(let i=1;i<=4;i++){t.setMode('focus');t.start();now+=60000;assert.equal(t.tick(),'focus');assert.equal(t.mode,i===4?'long':'short');}
 assert.equal(t.completed,4);t.setMode('focus');t.reset();assert.equal(t.completed,4);
});
test('break completion returns to stopped focus timer',()=>{let now=0;const t=new FocusTimer({short:1},()=>now);t.setMode('short');t.start();now=60000;assert.equal(t.tick(),'short');assert.equal(t.mode,'focus');assert.equal(t.completed,0);assert.equal(t.running,false);});
test('settings reject invalid values and formatting rounds up',()=>{const t=new FocusTimer({focus:-4,short:'2',long:Infinity});assert.deepEqual(t.settings,{focus:25,short:2,long:15});assert.equal(formatTime(60001),'01:01');assert.equal(formatTime(-1),'00:00');});
