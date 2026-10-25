# StykAnimate source attribution

Source: https://github.com/filippocalippo/StykAnimate-App
License: GNU General Public License v3.0 or later, reproduced in ../../LICENSE.
Original authors: StykAnimate contributors; original file headers are retained where applicable.

Adapted on 2026-10-25 for Sidequest:

- `src/demo.mjs`: copied `segment` and `defaultFigure`; omitted unrelated demo and editor initialization dependencies.
- `src/rig-angle-path.mjs`: copied `sampleAnglePath` unchanged; omitted validation, comparison and localization dependencies.
- Added an SPDX header and combined the independent functions into `motion.mjs`.

Pinned Git blob IDs:
- `src/demo.mjs`: bacc563f78c7c6553af10b25d46317d448552c14
- `src/rig-angle-path.mjs`: bd066bd08b3b05eb1b7653adea28cd6b294d7037

The application supplies its own sport poses, Canvas renderer and timer. No StykAnimate trademarks or logo artwork are reused.
