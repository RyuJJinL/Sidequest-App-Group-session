// SPDX-License-Identifier: GPL-3.0-or-later
import {SPORTS} from './sports.mjs';
import {ACTIVITY_GROUPS,groupFor,visibleGroups} from './activity-groups.mjs';
export function mountActivityPicker({getSelected,onSelect}){
 const root=document.querySelector('#sports'),category=document.querySelector('#activity-category'),search=document.querySelector('#activity-search'),status=document.querySelector('#activity-results');
 const groups=new Map(),cards=new Map();
 for(const group of ACTIVITY_GROUPS){
  const option=document.createElement('option');option.value=group.id;option.textContent=group.label;category.append(option);
  const section=document.createElement('section');section.className='activity-group';section.dataset.activityGroup=group.id;section.setAttribute('aria-labelledby',`activity-group-${group.id}`);
  const title=document.createElement('h3');title.id=`activity-group-${group.id}`;title.className='activity-group-title';title.textContent=group.label;
  const grid=document.createElement('div');grid.className='activity-group-grid';
  for(const id of group.ids){const activity=SPORTS[id],b=document.createElement('button');b.type='button';b.className='sport-card';b.dataset.sport=id;b.style.setProperty('--sport-color',activity.color);
   const icon=document.createElement('span');icon.className='sport-icon';icon.setAttribute('aria-hidden','true');icon.textContent=activity.icon;
   const label=document.createElement('span');label.textContent=activity.name;
   const check=document.createElement('span');check.className='selected';check.setAttribute('aria-hidden','true');b.append(icon,label,check);b.setAttribute('aria-pressed','false');
   b.addEventListener('click',()=>onSelect(id));cards.set(id,b);grid.append(b);
  }
  section.append(title,grid);root.append(section);groups.set(group.id,section);
 }
 function apply(){
  const visible=visibleGroups(category.value,search.value),ids=new Set(visible.flatMap(g=>g.ids));
  for(const [id,b]of cards)b.hidden=!ids.has(id);
  for(const [id,section]of groups)section.hidden=!visible.some(g=>g.id===id);
  status.textContent=ids.size?`${ids.size} ${ids.size===1?'activity':'activities'}${search.value.trim()?' found':''}`:'No activities found. Try another search or category.';
 }
 function syncSelection(){
  const selected=getSelected();
  if(!visibleGroups(category.value,search.value).some(g=>g.ids.includes(selected))){category.value=groupFor(selected)?.id??'all';search.value='';apply();}
  for(const [id,b]of cards){const active=id===selected;b.setAttribute('aria-pressed',String(active));b.querySelector('.selected').textContent=active?'✓':'';}
 }
 category.addEventListener('change',apply);search.addEventListener('input',apply);apply();syncSelection();
 return {syncSelection};
}
