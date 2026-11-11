// A short press advances visibly; holding keeps the journey moving.
// The renderer (film or 3D scene) owns time, while this controller owns intent.
export function createMotion({ duration, step = .75, rate = 1 } = {}) {
  let time = 0, destination = 0, direction = 0, started = 0;
  let held = false;
  const clamp = value => Math.max(0, Math.min(duration, value));
  return {
    get time() { return time; },
    get direction() { return direction; },
    get moving() { return direction !== 0; },
    get held() { return held; },
    press(value, now) {
      if (held && direction === value) return;
      held = true; direction = value; started = now;
      destination = clamp(time + direction * step);
      if (destination === time) { direction = 0; held = false; }
    },
    release(now) {
      if (!held) return;
      held = false;
      if (now - started > 180) { destination = time; direction = 0; }
    },
    sync(value) { time = clamp(value); },
    stop() { held = false; direction = 0; destination = time; },
    seek(value) { time = clamp(value); this.stop(); },
    update(delta, now) {
      if (!direction) return time;
      if (held && now - started > 180) destination = direction > 0 ? duration : 0;
      time = clamp(time + direction * Math.min(delta, .1) * rate);
      if ((direction > 0 && time >= destination) || (direction < 0 && time <= destination)) {
        time = destination;
        if (!held || now - started > 180 || time === 0 || time === duration) direction = 0;
      }
      return time;
    },
  };
}
