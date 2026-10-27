# Sidequest · Sports Focus

A browser Pomodoro app with 73 animated activities across ten categories: sports, outdoors, creativity, food, social activities, entertainment, learning, wellness, causes and travel. Built using the articulated figure and cyclic motion interpolation from [StykAnimate](https://github.com/filippocalippo/StykAnimate-App).

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
- A visual wardrobe with six independent categories: five female / three male faces, five female / five male hairstyles, striped/sage/no headband, polo/jacket tops, cream shorts/mauve shorts with leggings, and sage/rose sneakers. Mix and match all parts, preview them in any activity, or start from either original full outfit. Changes apply immediately and save on this browser when storage is available. Existing full-outfit preferences migrate automatically. Eight skin tones and ten hair colors apply independently across the head, exposed body and racket-grip fingers. Outfit set buttons preserve your chosen face, hairstyle and colors.
- Both outfits use weighted 2D clothing meshes on the existing body skeleton. Shirt and sleeves share armhole vertices; the waist follows the pelvis while each shorts opening follows its thigh. Continuous jacket sleeves and leggings blend across elbows and knees, with volume corrections at bends. Collar, zipper and colour panels deform with the shirt surface.
- Front-facing running with separate shoulder and hip anchors, opposite arm/leg timing, depth-based knee recovery and forward-facing shoes.
- Forward walking with relaxed opposite arm swings, low foot lift and continuous ground contact.
- Padel adds a controlled forehand with a short perforated teardrop racket and a felt ball. Table tennis adds a quicker compact drive, a lower ready stance, a small red paddle and a white ball. Both sports use the same weighted outfits, continuous supporting arms and depth-aware equipment as the existing characters.
- Joint-driven pickleball and tennis forehands and a badminton overhead stroke: hips/chest load before the elbow opens into contact, the racket releases its wrist lag, and the arm decelerates across the body. Supporting arms balance or guide the stroke; racket faces rotate with the forearm.
- Tennis and badminton shoulder sockets and sleeves share the projected collarbone anchors. Arm segments and rackets reveal progressively across the chest, avoiding whole-limb front/back layer switches. The tennis free arm follows a continuous shoulder-led path.
- Badminton uses the supplied compact-stroke references: chest-height support hand, a stable elbow-relative racket frame, and a slower 2.8-second preparation/contact/follow-through/recovery cycle.
- Balls and shuttlecocks meet the paddle or strings at contact; the shuttle feathers follow its flight direction.
- Six additional activities: one basketball dribble followed by a frontal shot out of the top of the frame, a joined-hands volleyball forearm receive, a frontal soccer kick, a bowling swing and release toward the viewer, a seated chess knight move, and a seated dice-and-token board-game turn. Ball contact/release and piece pickups share the avatar's pose clock. The table surface is layered between the lower body and arms so hands and clothing remain connected.
- Seven fitness categories: alternating dumbbell curls (Gym), controlled standing side-leg raises on a mat (Pilates), a tree-pose breathing loop (Yoga), front-view stationary cycling with foot-linked pedals, a side-step dance groove, horizontal backstroke with alternating arm recovery and flutter kicks, and a squat-to-kettlebell swing (CrossFit). Weights, handles and pedals follow the same solved joints as the avatar. All seven work with the wardrobe, saved selection, paused sessions and reduced motion.
- Nine outdoor categories with independent choreography: trekking-pole hiking over rocks; kneeling tent-peg tapping; fast trail bounds and obstacle clearance; alternating hand/foot climbing holds with a harness; surfboard crouch and balance; head-first streamlined freediving with long fins; horizontal scuba frog finning with tanks, mask, regulator and exhalation bubbles; seated double-blade kayaking; and rod lifting with reeling. Outdoor props are part of the activity, layered around the selected wardrobe. Freediving has no tank or exhalation bubbles.
- Eight arts and creativity activities: easel painting with a held palette and brush, seated pencil drawing, shaping a vessel on a spinning pottery wheel, raising a camera for a photo, cutting felt with opening scissors, acoustic guitar strumming and fretting, writing lines with lifted pen returns, and panning a video camera on a tripod. Shared desk and instrument layers keep the tools, hands and chosen clothes connected.
- Eight food and social activities: seated coffee sipping at a cafe, tasting a plate of food with a fork, stirring a pot on a stove, rolling dough with both hands, eating a sandwich on a picnic blanket, singing into a wired karaoke microphone, pressing a trivia buzzer and raising an answer card, and a community greeting wave with two nearby participants. Props share the solved hand positions; pause and reduced motion hold the complete scene still.
- Entertainment & Fandom adds popcorn-and-movie watching, sports cheering with a foam finger, concert glowsticks, an original anime hero pose, gamepad play, and theater applause with a bow.
- Learning & Skills adds language flashcards, laptop typing, a woodworking workshop, book page turns, knitting practice for Skill Classes, a presentation at a lectern, coin-and-calculator budgeting for Financial Literacy, and turning a screwdriver for DIY.
- Wellness & Mindfulness adds meditation with calm eyes and a breathing halo, hands-on-chest breathwork, a seated resistance-band recovery loop, and a gentle side stretch.
- Community & Causes adds packing donation cans, picking up litter with a grabber, offering a heart gift box, petting a dog while holding a food bowl, and rolling paint on a community sign.
- Travel & Exploration adds map-and-binocular day trips, a phone-and-tote city stroll, pointing out heritage architecture, steering from inside a car, and waving from a bobbing island boat with a life jacket.
- Category filtering, multiword activity search, result counts, clear empty states and grouped wardrobe options keep the larger collection usable. Changing filters or activities does not reset the timer. Selecting an activity from the wardrobe reveals its category if needed.
- Focus, short break and long break timers; pause, resume and reset.
- A long break after every fourth completed focus round. New rounds start manually.
- Deadline-based countdown catches up after background-tab throttling or device sleep while the page remains open.
- Custom durations (1–120 minutes), optional completion chime and a session-purpose note.
- Sport, appearance, settings and purpose note are saved locally when browser storage is available.
- Responsive layout, keyboard-accessible controls and reduced-motion support.

Completed rounds and active countdown are per page session; reloading resets them. Reduced motion shows a static character pose. Completion sounds require a user interaction and browser audio support. Chess and board games are ambient character animations, not interactive playable boards. There is no account, backend, online group session or notification service in this first version.

## StykAnimate integration

`src/clothing.mjs` adds the original clothing renderer: bone-weighted vertex deformation, shared garment attachment vertices, camera-facing limb cross sections, elbow/knee volume preservation and a shoulder silhouette correction for cross-body poses. Sleeve triangles reveal progressively against the turned chest surface. These are authored mesh deformations, not cloth physics or motion capture; no animation editor, paid runtime or extra connection is required.

`vendor/stykanimate/motion.mjs` includes the upstream `defaultFigure` topology from `src/demo.mjs` and `sampleAnglePath` from `src/rig-angle-path.mjs`. The illustrated runtime uses depth-based frontal rigs with fixed limb lengths. Running and walking interpolate thigh/knee cycles; racket sports interpolate shoulder elevation/sweep, elbow flexion, forearm swivel, wrist cock and roll. Forward kinematics determines the hitting arms and the tennis/badminton supporting arms; two-bone inverse kinematics positions the pickleball supporting arm and planted legs. Continuous depth clipping reveals arm and racket portions through the chest plane. Badminton keeps its racket orientation relative to the elbow frame through overhead poses. Racket direction derives from the forearm, with depth projection and forearm roll controlling its appearance. These cyclic curves use the upstream periodic interpolator. The upstream figure topology is retained in the vendor source as a reference. The sport choreography, props and timer interface are new Sidequest code. This is a small runtime adaptation, not the full StykAnimate editor, and does not import/export `.styk` projects.

See [upstream attribution and pinned source references](vendor/stykanimate/NOTICE.md). This project is distributed under GPL-3.0-or-later; see [LICENSE](LICENSE). Sidequest is independently developed and is not an official StykAnimate product.

## Tennis pilot and motion comparison

`motion-lab.html` compares the original Sidequest character with a recovered Pocket Life World character. Tennis now uses named drawing slots, joint-space entry/exit blending, independent head/hair timing and a more proportionate head. The existing wardrobe adds saved top/bottom color choices and head-size adjustment. The lab offers synchronized scrubbing, slow playback, both reference outfits, a previous-renderer comparison and a joint overlay. The timer uses the improved tennis renderer; other activity choreography stays on its established path.

The owner-private hosted comparison contains `private-reference/` (recovered character art, rig, 194 original animation clips, pinned browser runtime, provenance and licenses) and the user's images in `assets/reference/`. Those assets are deliberately omitted from the public GitHub tree. This public tree runs the Sidequest timer independently; its game comparison requires those supplied private files. No original badminton/tennis clip was found in the recovered set. The badminton comparison is an explicitly labeled authored adaptation; original mode plays recovered clips. Template geometry is used for the recovered outfit, and exact Android outfit deformation may differ. The comparison runs Spine animation in the browser rather than Unity's Android runtime or physics engine.
