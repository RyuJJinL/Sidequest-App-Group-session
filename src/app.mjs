// SPDX-License-Identifier: GPL-3.0-or-later
import {FocusTimer, formatTime, DEFAULTS} from './timer.mjs';
import {SPORTS, drawCharacter} from './sports.mjs';
import {restoreAppearance} from './wardrobe.mjs';
import {mountWardrobe} from './wardrobe-ui.mjs';
const $ = s => document.querySelector(s);
let saved = {};
try {saved = JSON.parse(localStorage.getItem('sidequest-v1')) || {};} catch {}
const timer = new FocusTimer(saved.settings);
let sport = Object.hasOwn(SPORTS, saved.sport) ? saved.sport : 'running';
let appearance = restoreAppearance(saved);
let sound = saved.sound !== false;
let audio;
function save() {
  try {localStorage.setItem('sidequest-v1', JSON.stringify({settings: timer.settings, sport, appearance, sound, task: $('#task').value}));return true;} catch {return false;}
}
$('#task').value = typeof saved.task === 'string' ? saved.task.slice(0,120) : '';
$('#task').addEventListener('input', save);
function announce(message) {$('#announcement').textContent = message;}
function render() {
  const time = formatTime(timer.remaining);
  $('#clock').textContent = time;
  $('#clock').setAttribute('aria-label', `${time} remaining`);
  document.title = `${time} · ${timer.mode === 'focus' ? 'Focus' : 'Break'} — Sidequest`;
  document.querySelectorAll('[data-mode]').forEach(b => {const active=b.dataset.mode === timer.mode;b.setAttribute('aria-selected', active);b.tabIndex=active?0:-1;});
  $('#toggle').textContent = timer.running ? 'Ⅱ   Pause session' : timer.remaining < timer.duration ? '▶   Resume session' : timer.mode === 'focus' ? '▶   Start focusing' : '▶   Start break';
  $('#scene-status').textContent = timer.running ? timer.mode === 'focus' ? 'IN YOUR ELEMENT' : 'TAKE A BREATHER' : timer.remaining < timer.duration ? 'TAKE YOUR TIME' : 'READY WHEN YOU ARE';
  $('#timer-label').textContent = timer.mode === 'focus' ? 'TIME TO DO YOUR THING' : 'YOU’VE EARNED A BREATHER';
  $('#timer-note').textContent = timer.mode === 'focus' ? 'One focused round is a win.' : 'Rest is part of making progress.';
  $('#progress').style.width = `${(1-timer.remaining/timer.duration)*100}%`;
  const nextMode = timer.mode === 'focus' ? (timer.completed % 4 === 3 ? 'long' : 'short') : 'focus';
  $('#next-up strong').textContent = `${timer.settings[nextMode]} min ${nextMode === 'focus' ? 'focus' : nextMode === 'long' ? 'long break' : 'break'}`;
  $('#session-count').textContent = timer.completed;
  $('#round-dots').replaceChildren(...Array.from({length:4},(_,i)=>{const el=document.createElement('i');el.className=i<(timer.completed%4 || (timer.completed>0?4:0))?'filled':'';return el;}));
}
let lastFrame = null, phase = 0;
const canvas = $('#character'), ctx = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function paint() {
  ctx.clearRect(0,0,960,620);
  ctx.save();ctx.translate(430,330);ctx.scale(1.35,1.35);
  if(sport!=='swimming'){
   ctx.fillStyle='#102a2266';ctx.beginPath();ctx.ellipse(0,136,83,9,0,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='#8dbd8155';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-260,145);ctx.lineTo(320,145);ctx.stroke();
  }
  drawCharacter(ctx,sport,phase,timer.mode!=='focus'||!timer.running,SPORTS[sport].color,appearance);
  ctx.restore();
}
const wardrobe=mountWardrobe({
 getAppearance:()=>appearance,
 onChange:next=>{appearance=next;paint();return save();},
 getSport:()=>sport,
 onSportChange:key=>selectSport(key)
});
function animate(timestamp) {
  const elapsed = lastFrame === null ? 0 : Math.min(.08,(timestamp-lastFrame)/1000);
  lastFrame = timestamp;
  if (!reducedMotion.matches && !document.hidden) phase += elapsed * Math.PI * 2 / SPORTS[sport].period;
  paint();
  wardrobe.paintPreview(phase,reducedMotion.matches);
  requestAnimationFrame(animate);
}
function selectSport(key) {
  sport=key;phase=0;
  const s=SPORTS[key];
  document.documentElement.style.setProperty('--mint',s.color);
  $('#sport-badge').textContent = `${s.icon} ${s.name.toUpperCase()}`;
  $('#sport-heading').textContent=s.verb;$('#sport-detail').textContent=s.detail;
  canvas.setAttribute('aria-label',`Animated ${s.name.toLowerCase()} companion`);
  for(const b of document.querySelectorAll('[data-sport]')) {const active=b.dataset.sport===key;b.setAttribute('aria-pressed',active);b.querySelector('.selected').textContent=active?'✓':'';}
  paint();save();
}
for (const [key,s] of Object.entries(SPORTS)) {
  const b=document.createElement('button');b.className='sport-card';b.dataset.sport=key;b.style.setProperty('--sport-color',s.color);
  b.innerHTML=`<span class="sport-icon" aria-hidden="true">${s.icon}</span><span>${s.name}</span><span class="selected" aria-hidden="true"></span>`;
  b.addEventListener('click',()=>selectSport(key));$('#sports').append(b);
}
function unlockAudio() {
  if(!sound)return;
  try {audio??=new (window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume().catch(()=>{});} catch {}
}
function chime() {
  if(!sound || !audio || audio.state!=='running')return;
  for(const [i,note] of [523.25,659.25,783.99].entries()) {
    const oscillator=audio.createOscillator(), gain=audio.createGain(),at=audio.currentTime+i*.16;
    oscillator.frequency.value=note;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.08,at+.02);gain.gain.exponentialRampToValueAtTime(.001,at+.5);
    oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(at);oscillator.stop(at+.55);
  }
}
function checkTimer() {
  const finished=timer.tick();
  if(finished){chime();announce(finished==='focus'?'Focus round complete. Your break is ready when you are.':'Break complete. Ready for your next sidequest?');}
  render();
}
$('#toggle').addEventListener('click',()=>{unlockAudio();if(timer.running)timer.pause();else timer.start();render();});
$('#reset').addEventListener('click',()=>{timer.reset();announce('Timer reset. A fresh start.');render();});
const tabs=[...document.querySelectorAll('[data-mode]')];
for(const b of tabs){
  b.addEventListener('click',()=>{timer.setMode(b.dataset.mode);announce('');render();});
  b.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const i=tabs.indexOf(b),next=event.key==='Home'?0:event.key==='End'?2:(i+(event.key==='ArrowRight'?1:2))%3;tabs[next].click();tabs[next].focus();});
}
const dialog=$('#settings'),form=$('#settings-form');
$('#settings-open').addEventListener('click',()=>{for(const mode of Object.keys(DEFAULTS))form.elements[mode].value=timer.settings[mode];form.elements.sound.checked=sound;dialog.showModal();});
$('#settings-close').addEventListener('click',()=>dialog.close());
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;timer.configure(Object.fromEntries(new FormData(form)));timer.reset();sound=form.elements.sound.checked;save();render();dialog.close();announce('Your timer settings are saved.');});
document.addEventListener('visibilitychange',()=>{lastFrame=null;checkTimer();});
window.addEventListener('pageshow',checkTimer);
selectSport(sport);render();requestAnimationFrame(animate);setInterval(checkTimer,250);
