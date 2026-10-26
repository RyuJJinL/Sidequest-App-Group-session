import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SPORTS} from '../src/sports.mjs';
import {ACTIVITY_GROUPS,visibleGroups,groupFor} from '../src/activity-groups.mjs';
test('all 73 activities appear exactly once in ten groups',()=>{
 const ids=ACTIVITY_GROUPS.flatMap(g=>g.ids);assert.equal(ACTIVITY_GROUPS.length,10);assert.equal(ids.length,73);assert.equal(new Set(ids).size,73);assert.deepEqual(ids.toSorted(),Object.keys(SPORTS).toSorted());
 assert.equal(groupFor('reading').id,'learning');assert.equal(groupFor('animalwelfare').id,'causes');
});
test('search matches multiple words, ignores case and combines with category',()=>{
 assert.deepEqual(visibleGroups('all',' WATCH ').flatMap(g=>g.ids),['moviewatchparties','sportswatchparties']);
 assert.deepEqual(visibleGroups('all','book reading').flatMap(g=>g.ids),['reading']);
 assert.equal(visibleGroups('wellness').flatMap(g=>g.ids).length,4);
 assert.equal(visibleGroups('wellness','tennis').length,0);
 assert.equal(visibleGroups('invalid').flatMap(g=>g.ids).length,73);
 assert.equal(visibleGroups('all','nothing-matches').length,0);
});
