// SPDX-License-Identifier: GPL-3.0-or-later
// Adapted from filippocalippo/StykAnimate-App; see NOTICE.md.
const TAU = Math.PI * 2;
const PI = Math.PI;
const segment = (id, parent, length, angle, thickness = 10, extra = {}) => ({
  segment_id: id, parent_id: parent, length, angle_rad: angle, thickness,
  bend_rad: 0, primitive_code: 0, aux_code: 0, flags: 0, segment_type: 'line',
  segment_kind: 'line', color_rgb: [43, 43, 43], transparency: 0,
  visible: true, z_order: id, ...extra,
});

export function defaultFigure(figure_type_id = 1) {
  const segments = [
    segment(1, 0, 78, -PI / 2, 11),
    segment(2, 1, 44, -PI / 2, 8, {primitive_code: 1, flags: 1, segment_type: 'circle', segment_kind: 'circle'}),
    segment(3, 1, 53, 1.05, 9), segment(4, 3, 48, 1.32, 8),
    segment(5, 1, 53, 2.02, 9), segment(6, 5, 48, 1.65, 8),
    segment(7, 0, 66, 1.12, 11), segment(8, 7, 63, 1.52, 10),
    segment(9, 0, 66, 2.00, 11), segment(10, 9, 63, 1.68, 10),
  ];
  return {figure_type_id, name: 'Walker', segment_count: segments.length, segments,
    polyfills: [], image_assets: [], text_assets: []};
}


/** Periodic cubic Hermite interpolation with monotone component tangents.
 * Limiting the tangents prevents narrow reference shapes from overshooting. */
export function sampleAnglePath(keys,angle){
  let t=((angle%TAU)+TAU)%TAU,i=keys.findLastIndex(k=>k[0]<=t);if(i<0){i=keys.length-1;t+=TAU;}
  const n=keys.length,a=keys[i],b=keys[(i+1)%n],before=keys[(i+n-1)%n],after=keys[(i+2)%n];
  const timeB=b[0]+(i===n-1?TAU:0),span=timeB-a[0],u=(t-a[0])/span;
  const prevSpan=(a[0]-before[0]+TAU)%TAU,nextSpan=(after[0]-b[0]+TAU)%TAU;
  const tangent=(left,right,h0,h1)=>left*right<=0?0:(3*(h0+h1))/((2*h1+h0)/left+(h1+2*h0)/right);
  return [1,2,3].map(k=>{const slope=(b[k]-a[k])/span,m0=tangent((a[k]-before[k])/prevSpan,slope,prevSpan,span),m1=tangent(slope,(after[k]-b[k])/nextSpan,span,nextSpan);
    return (2*u**3-3*u*u+1)*a[k]+(u**3-2*u*u+u)*span*m0+(-2*u**3+3*u*u)*b[k]+(u**3-u*u)*span*m1;});
}

