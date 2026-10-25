// SPDX-License-Identifier: GPL-3.0-or-later
export const DEFAULTS = {focus: 25, short: 5, long: 15};
export class FocusTimer {
  constructor(settings = {}, now = Date.now) {
    this.now = now;
    this.settings = {...DEFAULTS};
    this.configure(settings);
    this.mode = 'focus';
    this.remaining = this.duration;
    this.deadline = null;
    this.completed = 0;
  }
  get duration() { return this.settings[this.mode] * 60_000; }
  get running() { return this.deadline !== null; }
  configure(settings) {
    for (const mode of Object.keys(DEFAULTS)) {
      const n = Number(settings[mode]);
      if (Number.isInteger(n) && n >= 1 && n <= 120) this.settings[mode] = n;
    }
  }
  start() { if (!this.running && this.remaining > 0) this.deadline = this.now() + this.remaining; }
  pause() { this.tick(); this.deadline = null; }
  reset() { this.deadline = null; this.remaining = this.duration; }
  setMode(mode) {
    if (!(mode in DEFAULTS)) return;
    this.mode = mode;
    this.reset();
  }
  tick() {
    if (!this.running) return null;
    this.remaining = Math.max(0, this.deadline - this.now());
    if (this.remaining > 0) return null;
    const finished = this.mode;
    if (finished === 'focus') this.completed++;
    this.setMode(finished === 'focus' ? (this.completed % 4 === 0 ? 'long' : 'short') : 'focus');
    return finished;
  }
}
export function formatTime(ms) {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
