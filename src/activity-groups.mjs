// SPDX-License-Identifier: GPL-3.0-or-later
import {SPORTS} from './sports.mjs';
export const ACTIVITY_GROUPS=[
 {id:'sports',label:'Sports & Fitness',ids:['running','pickleball','tennis','padel','tabletennis','badminton','walking','basketball','volleyball','football','bowling','gym','pilates','yoga','cycling','dance','swimming','crossfit']},
 {id:'outdoors',label:'Outdoors & Adventure',ids:['hiking','camping','trailrunning','climbing','surfing','freediving','scubadiving','kayaking','fishing']},
 {id:'creative',label:'Arts & Creativity',ids:['painting','drawing','pottery','photography','crafts','music','writing','filmmaking']},
 {id:'food',label:'Food & Lifestyle',ids:['cafe','foodtrips','cooking','baking','picnics']},
 {id:'social',label:'Social & Connections',ids:['karaoke','trivianights','communitymeetups']},
 {id:'entertainment',label:'Entertainment & Fandom',ids:['chess','boardgames','moviewatchparties','sportswatchparties','concertmeetups','anime','gaming','theater']},
 {id:'learning',label:'Learning & Skills',ids:['languageexchange','coding','workshops','reading','skillclasses','publicspeaking','financialliteracy','diy']},
 {id:'wellness',label:'Wellness & Mindfulness',ids:['meditation','breathwork','recovery','wellnessactivities']},
 {id:'causes',label:'Community & Causes',ids:['volunteering','cleanups','charityactivities','animalwelfare','communityprojects']},
 {id:'travel',label:'Travel & Exploration',ids:['daytrips','citywalks','heritagetours','roadtrips','islandhopping']}
];
export const groupFor=id=>ACTIVITY_GROUPS.find(g=>g.ids.includes(id));
const normalized=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function visibleGroups(category='all',query=''){
 const valid=ACTIVITY_GROUPS.some(g=>g.id===category)?category:'all';
 const words=normalized(query).trim().split(/\s+/).filter(Boolean);
 return ACTIVITY_GROUPS.filter(g=>valid==='all'||g.id===valid).map(g=>({...g,ids:g.ids.filter(id=>{
  const haystack=normalized(`${SPORTS[id].name} ${g.label}`);return words.every(w=>haystack.includes(w));
 })})).filter(g=>g.ids.length);
}
