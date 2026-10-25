# Sidequest · Sports Focus

A browser Pomodoro app with animated running, pickleball, tennis, badminton and walking companions. Built using the articulated figure and cyclic motion interpolation from [StykAnimate](https://github.com/filippocalippo/StykAnimate-App).

## Run

Requires Node.js 22 or newer. No dependency installation or desktop app is needed.

```sh
npm start
```

Open http://localhost:3000. This is also a static web app: serve the repository directory from any static host. Keep `index.html`, `style.css`, `src/` and `vendor/` together.

```sh
npm run check
npm test
```

## Features

- Two illustrated outfits based on the supplied character photos and videos: sage court wear and peach/slate track wear. Ponytail, striped headband, facial details and sneakers follow the articulated rig.
- Front-facing running with separate shoulder and hip anchors, opposite arm/leg timing, depth-based knee recovery and forward-facing shoes.
- Forward walking with relaxed opposite arm swings, low foot lift and continuous ground contact.
- Joint-driven pickleball and tennis forehands and a badminton overhead stroke: hips/chest load before the elbow opens into contact, the racket releases its wrist lag, and the arm decelerates across the body. Supporting arms balance or guide the stroke; racket faces rotate with the forearm.
- Tennis and badminton shoulder sockets and sleeves share the projected collarbone anchors. Arm segments and rackets reveal progressively across the chest, avoiding whole-limb front/back layer switches. The tennis free arm follows a continuous shoulder-led path.
- Badminton uses the supplied compact-stroke references: chest-height support hand, a stable elbow-relative racket frame, and a slower 2.8-second preparation/contact/follow-through/recovery cycle.
- Balls and shuttlecocks meet the paddle or strings at contact; the shuttle feathers follow its flight direction.
- Focus, short break and long break timers; pause, resume and reset.
- A long break after every fourth completed focus round. New rounds start manually.
- Deadline-based countdown catches up after background-tab throttling or device sleep while the page remains open.
- Custom durations (1–120 minutes), optional completion chime and a session-purpose note.
- Sport, settings and purpose note are saved locally when browser storage is available.
- Responsive layout, keyboard-accessible controls and reduced-motion support.

Completed rounds and active countdown are per page session; reloading resets them. Reduced motion shows a static character pose. Completion sounds require a user interaction and browser audio support. There is no account, backend, online group session or notification service in this first version.

## StykAnimate integration

`vendor/stykanimate/motion.mjs` includes the upstream `defaultFigure` topology from `src/demo.mjs` and `sampleAnglePath` from `src/rig-angle-path.mjs`. The illustrated runtime uses depth-based frontal rigs with fixed limb lengths. Running and walking interpolate thigh/knee cycles; racket sports interpolate shoulder elevation/sweep, elbow flexion, forearm swivel, wrist cock and roll. Forward kinematics determines the hitting arms and the tennis/badminton supporting arms; two-bone inverse kinematics positions the pickleball supporting arm and planted legs. Continuous depth clipping reveals arm and racket portions through the chest plane. Badminton keeps its racket orientation relative to the elbow frame through overhead poses. Racket direction derives from the forearm, with depth projection and forearm roll controlling its appearance. These cyclic curves use the upstream periodic interpolator. The upstream figure topology is retained in the vendor source as a reference. The sport choreography, props and timer interface are new Sidequest code. This is a small runtime adaptation, not the full StykAnimate editor, and does not import/export `.styk` projects.

See [upstream attribution and pinned source references](vendor/stykanimate/NOTICE.md). This project is distributed under GPL-3.0-or-later; see [LICENSE](LICENSE). Sidequest is independently developed and is not an official StykAnimate product.
