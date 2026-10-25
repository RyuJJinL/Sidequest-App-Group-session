// SPDX-License-Identifier: GPL-3.0-or-later
// Visible interval of a bone crossing the chest plane. Unlike a midpoint
// switch, the interval changes continuously as the arm passes the torso.
export function frontSpan(startZ,endZ){
 if(startZ>=0&&endZ>=0)return [0,1];
 if(startZ<0&&endZ<0)return null;
 const crossing=-startZ/(endZ-startZ);
 return startZ<0?[crossing,1]:[0,crossing];
}
export function drawFrontPart(ctx,worldA,worldB,a,b,draw){
 const span=frontSpan(worldA.z,worldB.z);
 if(!span)return;
 if(span[0]===0&&span[1]===1){draw();return;}
 const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);
 if(length<1e-6)return;
 const forward=span[0]>0?1:-1,t=forward===1?span[0]:span[1];
 const x=a.x+dx*t,y=a.y+dy*t,nx=forward*dx/length,ny=forward*dy/length,tx=-ny,ty=nx,M=1000;
 ctx.save();ctx.beginPath();ctx.moveTo(x+tx*M,y+ty*M);ctx.lineTo(x-tx*M,y-ty*M);
 ctx.lineTo(x-tx*M+nx*M,y-ty*M+ny*M);ctx.lineTo(x+tx*M+nx*M,y+ty*M+ny*M);ctx.closePath();ctx.clip();draw();ctx.restore();
}
