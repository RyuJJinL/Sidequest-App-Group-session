// SPDX-License-Identifier: GPL-3.0-or-later
// Original vector face and hair artwork. Shapes follow the head anchor; all
// hair fills, texture, brows and exposed skin use the chosen appearance colors.
import {FACES} from './wardrobe.mjs';
const INK='#543c35',CREAM='#f1dfbf',PEACH='#e9aa8e';
function oval(c,x,y,rx,ry,fill,stroke=INK,width=2){c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function shape(c,fill,stroke=INK,width=2.5){c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
function polygon(c,points,fill,stroke=INK){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));shape(c,fill,stroke);}
export function drawHairBack(c,head,phase,a,colors){
 c.save();c.translate(head.x,head.y);c.lineJoin='round';
 const {hair,hairLight,hairShade}=colors;
 if(a.hair==='ponytail'){
  c.translate(22,-22);c.rotate(Math.sin(phase-.5)*.09);
  c.beginPath();c.moveTo(-6,9);c.bezierCurveTo(-11,-32,28,-48,44,-14);c.bezierCurveTo(60,4,30,35,54,52);c.bezierCurveTo(30,66,29,39,14,56);c.bezierCurveTo(20,26,1,26,-6,9);shape(c,hair,INK,3);
  c.strokeStyle=hairLight;c.lineWidth=3;c.beginPath();c.moveTo(12,-14);c.bezierCurveTo(35,-18,35,12,28,26);c.stroke();oval(c,2,0,9,5,PEACH);
 }else if(a.hair==='bun'){
  c.translate(18,-48);c.rotate(Math.sin(phase-.5)*.035);oval(c,0,0,19,18,hair);
  c.strokeStyle=hairLight;c.lineWidth=2.5;c.beginPath();c.moveTo(-12,-5);c.bezierCurveTo(-7,-14,9,-14,12,-4);c.moveTo(-11,3);c.quadraticCurveTo(0,12,11,3);c.stroke();oval(c,-3,13,12,4,PEACH);
 }else if(a.hair==='bob'){
  c.beginPath();c.moveTo(-32,-17);c.bezierCurveTo(-38,-57,33,-57,35,-16);c.lineTo(39,30);c.quadraticCurveTo(21,43,0,31);c.quadraticCurveTo(-21,43,-39,30);c.closePath();shape(c,hair);
  c.strokeStyle=hairLight;c.lineWidth=2;c.beginPath();c.moveTo(-30,-10);c.quadraticCurveTo(-33,16,-29,28);c.moveTo(29,-10);c.quadraticCurveTo(33,16,30,29);c.stroke();
 }else if(a.hair==='waves'){
  c.translate(0,0);c.rotate(Math.sin(phase-.6)*.018);
  c.beginPath();c.moveTo(-32,-18);c.bezierCurveTo(-43,-61,38,-60,36,-16);c.bezierCurveTo(34,13,48,26,39,40);c.bezierCurveTo(28,51,52,61,36,70);c.quadraticCurveTo(15,75,0,61);c.quadraticCurveTo(-17,77,-38,69);c.bezierCurveTo(-50,57,-28,48,-39,34);c.bezierCurveTo(-47,21,-30,7,-32,-18);shape(c,hair);
  c.strokeStyle=hairLight;c.lineWidth=2.5;c.beginPath();c.moveTo(-29,-17);c.bezierCurveTo(-39,10,-26,22,-32,40);c.quadraticCurveTo(-39,54,-29,62);c.moveTo(28,-16);c.bezierCurveTo(39,8,27,23,33,40);c.quadraticCurveTo(41,54,29,63);c.stroke();
 }else if(a.hair==='braid'){
  c.translate(29,8);c.rotate(Math.sin(phase-.6)*.045);
  c.beginPath();c.moveTo(-8,-17);c.quadraticCurveTo(19,-16,16,9);c.lineTo(9,49);c.lineTo(-2,51);c.lineTo(-8,7);shape(c,hairShade);
  for(let i=0;i<7;i++){
   const y=i*7,x=4+(i%2?2:-2);c.save();c.translate(x,y);c.rotate(i%2?.38:-.38);oval(c,0,0,7.8,5.6,hair,colors.hairShade,1.5);c.restore();
  }
  oval(c,5,49,7,3,PEACH);c.beginPath();c.moveTo(0,51);c.lineTo(-1,61);c.quadraticCurveTo(7,66,11,59);c.lineTo(10,51);shape(c,hair);
 }
 c.restore();
}
function hairCap(c,a,colors){
 const {hair,hairLight,hairShade}=colors;
 c.beginPath();
 if(['ponytail','bun'].includes(a.hair)){
  c.moveTo(-30,-2);c.bezierCurveTo(-41,-44,-9,-51,12,-39);c.bezierCurveTo(38,-39,38,-8,29,9);c.bezierCurveTo(25,-8,9,-9,2,-26);c.bezierCurveTo(5,-7,17,-4,19,-3);c.bezierCurveTo(-1,-6,-9,-19,-10,-24);c.bezierCurveTo(-21,-23,-25,-12,-30,-2);
 }else if(a.hair==='bob'){
  c.moveTo(-32,13);c.lineTo(-34,-18);c.bezierCurveTo(-34,-52,29,-56,33,-20);c.lineTo(34,15);c.lineTo(27,6);c.lineTo(24,-19);c.quadraticCurveTo(7,-9,-2,-22);c.lineTo(-7,-15);c.lineTo(-14,-22);c.quadraticCurveTo(-26,-15,-28,7);
 }else if(a.hair==='waves'||a.hair==='braid'){
  c.moveTo(-31,8);c.bezierCurveTo(-43,-39,-17,-51,5,-43);c.bezierCurveTo(34,-48,42,-13,31,11);c.quadraticCurveTo(27,-12,4,-22);c.quadraticCurveTo(-3,-26,-4,-33);c.quadraticCurveTo(-15,-11,-28,-6);
 }else if(a.hair==='buzz'){
  c.moveTo(-30,4);c.lineTo(-31,-12);c.bezierCurveTo(-31,-46,28,-46,31,-12);c.lineTo(30,4);c.lineTo(26,-10);c.quadraticCurveTo(0,-29,-26,-10);
 }else if(a.hair==='crop'){
  c.moveTo(-30,5);c.lineTo(-33,-25);c.quadraticCurveTo(-34,-37,-24,-39);c.lineTo(-18,-46);c.lineTo(-10,-42);c.lineTo(-2,-49);c.lineTo(6,-43);c.lineTo(16,-46);c.lineTo(23,-38);c.quadraticCurveTo(36,-38,32,-17);c.lineTo(29,5);c.lineTo(25,-15);c.lineTo(16,-16);c.lineTo(12,-22);c.lineTo(5,-17);c.lineTo(-3,-23);c.lineTo(-12,-18);c.lineTo(-23,-21);c.lineTo(-26,-7);
 }else if(a.hair==='side-part'){
  c.moveTo(-30,5);c.bezierCurveTo(-42,-28,-28,-46,-10,-46);c.bezierCurveTo(15,-53,40,-34,32,-10);c.lineTo(29,5);c.lineTo(25,-14);c.quadraticCurveTo(7,-15,-11,-31);c.quadraticCurveTo(-19,-20,-26,-18);c.lineTo(-26,-2);
 }else if(a.hair==='quiff'){
  c.moveTo(-30,5);c.lineTo(-32,-21);c.quadraticCurveTo(-37,-36,-30,-44);c.quadraticCurveTo(-17,-49,-12,-61);c.quadraticCurveTo(0,-52,18,-55);c.bezierCurveTo(39,-52,39,-26,31,-11);c.lineTo(29,5);c.lineTo(25,-15);c.quadraticCurveTo(3,-13,-15,-29);c.quadraticCurveTo(-25,-23,-26,-9);
 }else{
  c.moveTo(-30,5);c.lineTo(-33,-21);c.bezierCurveTo(-35,-49,32,-49,33,-20);c.lineTo(29,5);c.lineTo(25,-16);c.quadraticCurveTo(0,-28,-25,-16);
 }
 shape(c,hair);
 if(a.hair==='curls'){
  for(const [x,y,r] of [[-25,-29,9],[-20,-39,10],[-7,-46,11],[8,-47,11],[22,-40,11],[28,-27,8],[-13,-28,10],[2,-31,10],[17,-28,9]]){
   oval(c,x,y,r,r*.85,hair,hairShade,1.3);c.strokeStyle=hairLight;c.lineWidth=1.3;c.beginPath();c.arc(x,y,r*.5,3.4,5.7);c.stroke();
  }
 }else if(a.hair==='buzz'){
  c.save();c.clip();c.fillStyle=hairLight;
  for(let x=-25;x<=25;x+=6)for(let y=-36;y<=-13;y+=6){c.beginPath();c.arc(x+(y%12?2:0),y,.65,0,Math.PI*2);c.fill();}c.restore();
 }else{
  c.strokeStyle=hairLight;c.lineWidth=2;c.beginPath();
  if(a.hair==='quiff'){c.moveTo(-20,-35);c.bezierCurveTo(-13,-47,14,-36,24,-43);c.moveTo(-10,-33);c.quadraticCurveTo(9,-24,25,-30);}
  else if(a.hair==='side-part'){c.moveTo(-11,-39);c.quadraticCurveTo(-14,-31,-17,-25);c.moveTo(-5,-38);c.quadraticCurveTo(9,-25,25,-25);}
  else if(a.hair==='crop'){c.moveTo(-21,-33);c.lineTo(-14,-36);c.moveTo(-6,-37);c.lineTo(1,-40);c.moveTo(9,-35);c.lineTo(17,-35);}
  else{c.moveTo(-22,-30);c.quadraticCurveTo(-11,-41,0,-36);c.moveTo(8,-34);c.quadraticCurveTo(20,-30,24,-20);}
  c.stroke();
 }
}
function faceOutline(c,f,colors){
 const w=f.width;
 if(f.id==='soft')oval(c,0,0,30,36,colors.skin,colors.skinInk,2.5);
 else{
  c.beginPath();c.moveTo(0,-36);c.bezierCurveTo(-w,-39,-w-3,-18,-w,2);c.bezierCurveTo(-w,16,-w*.92,24,-w*f.jaw,29);
  if(f.id==='male-angular'){c.lineTo(-10,f.chin);c.quadraticCurveTo(0,f.chin+1,10,f.chin);c.lineTo(w*f.jaw,29);}
  else{c.quadraticCurveTo(-w*.35,f.chin+2,0,f.chin);c.quadraticCurveTo(w*.35,f.chin+2,w*f.jaw,29);}
  c.bezierCurveTo(w*.92,24,w,16,w,2);c.bezierCurveTo(w+3,-18,w,-39,0,-36);shape(c,colors.skin,colors.skinInk);
 }
}
function features(c,f,phase,colors){
 const male=f.group==='male',ink=colors.skinInk,blink=Math.sin(phase*.23)>.998,eyeX=male?12.5:12;
 c.strokeStyle=ink;c.lineCap='round';
 for(const side of [-1,1]){
  const x=side*eyeX;
  if(f.smile==='crescent'&&!blink){c.lineWidth=2.5;c.beginPath();c.moveTo(x-4,3);c.quadraticCurveTo(x,-3,x+4,3);c.stroke();}
  else {oval(c,x,2,male?3.4:3,blink?1:f.eyes,ink,null);if(!blink)oval(c,x-.7,.5,.7,1,'#fff2db',null);}
  if(!male&&['female-heart','female-oval'].includes(f.id)){c.lineWidth=1.4;c.beginPath();c.moveTo(x+side*2,-1);c.lineTo(x+side*5,-3);c.stroke();}
  oval(c,side*19,13,male?5:7,male?2.5:4,colors.blush,null);
 }
 c.strokeStyle=colors.hairShade;c.lineWidth=f.brows;c.beginPath();c.moveTo(-18,-10);c.quadraticCurveTo(-12,-14,-7,-11);c.moveTo(7,-11);c.quadraticCurveTo(12,-14,18,-10);c.stroke();
 c.lineWidth=male?1.7:1.5;c.strokeStyle=colors.skinShade;c.beginPath();c.moveTo(male?1:0,8);c.quadraticCurveTo(-3,13,male?2:1,15);if(male)c.lineTo(4,14);c.stroke();
 c.lineWidth=2;c.strokeStyle=ink;
 if(f.smile==='open'){
  c.beginPath();c.moveTo(-11,18);c.quadraticCurveTo(0,23,12,17);c.quadraticCurveTo(8,33,-4,29);c.quadraticCurveTo(-10,26,-11,18);shape(c,ink,null);
  polygon(c,[[-8,20],[8,20],[6,23],[-6,23]],'#fff2db',null);
 }else{c.beginPath();c.moveTo(-10,21);c.quadraticCurveTo(0,male?27:28,12,20);c.stroke();}
 if(f.freckles){c.fillStyle=colors.skinShade;for(const side of [-1,1])for(const [x,y] of [[13,11],[18,9],[22,12]]){c.beginPath();c.arc(side*x,y,.85,0,Math.PI*2);c.fill();}}
}
function accessory(c,id){
 if(id==='none')return;
 polygon(c,[[-30,-25],[-27,-39],[8,-43],[32,-33],[32,-18],[7,-28]],id==='sage'?'#94a68a':PEACH);
 polygon(c,[[-29,-30],[-28,-35],[7,-39],[32,-29],[32,-24],[7,-34]],CREAM,null);
 if(id==='striped')polygon(c,[[-29,-27],[-29,-30],[7,-34],[32,-24],[32,-21],[7,-31]],'#657080',null);
}
export function drawHead(c,head,phase,a,colors){
 const f=FACES.find(face=>face.id===a.face);
 c.save();c.translate(head.x,head.y);c.lineJoin='round';c.lineCap='round';
 oval(c,-f.width+1,3,6,10,colors.skin,colors.skinInk);oval(c,f.width-1,3,6,10,colors.skin,colors.skinInk);
 faceOutline(c,f,colors);hairCap(c,a,colors);accessory(c,a.headAccessory);
 if(['ponytail','bun','waves','braid'].includes(a.hair)){
  const sway=Math.sin(phase)*1;
  c.beginPath();c.moveTo(-28,-4);c.quadraticCurveTo(-38,26,-27+sway,28);c.strokeStyle=INK;c.lineWidth=6;c.stroke();c.strokeStyle=colors.hair;c.lineWidth=3.3;c.stroke();
 }
 features(c,f,phase,colors);c.restore();
}
