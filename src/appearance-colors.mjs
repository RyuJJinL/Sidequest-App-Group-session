// SPDX-License-Identifier: GPL-3.0-or-later
import {normalizeAppearance,SKIN_COLORS,HAIR_COLORS} from './wardrobe.mjs';
export function blendColor(a,b,t){
 const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
 return '#'+rgb(a).map((v,i)=>Math.round(v+(rgb(b)[i]-v)*t).toString(16).padStart(2,'0')).join('');
}
export function appearanceColors(value){
 const a=normalizeAppearance(value),skin=SKIN_COLORS.find(c=>c.id===a.skinColor).hex,hair=HAIR_COLORS.find(c=>c.id===a.hairColor).hex;
 return {skin,hair,hairLight:blendColor(hair,'#f3d7ab',.27),hairShade:blendColor(hair,'#201c21',.34),
  skinShade:blendColor(skin,'#643c31',.42),skinInk:blendColor(skin,'#2c201e',.78),blush:blendColor(skin,'#c46e67',.38)};
}
