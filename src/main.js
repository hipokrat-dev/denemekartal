import './style.css';
import { createMotion } from './motion.js';

const film = document.querySelector('#journey-film');
const stage = document.querySelector('#experience');
const forward = document.querySelector('#forward');
const backward = document.querySelector('#backward');
const loading = document.querySelector('#loading');
const progress = document.querySelector('.timeline');
const status = document.querySelector('#accessibility-status');
const credits = document.querySelector('#credits-dialog');
let motion, ready = false, failed = false, playRequest = null;
let activeInput = null, previousFrame = performance.now(), lastProgress = -1;
const keyDirections = new Map([
  ['ArrowUp', 1], ['ArrowRight', 1], ['w', 1], ['W', 1],
  ['ArrowDown', -1], ['ArrowLeft', -1], ['s', -1], ['S', -1],
]);

function pause() { film.pause(); }
function stop() {
  motion?.stop(); activeInput = null; pause();
  forward.classList.remove('is-active'); backward.classList.remove('is-active');
}
function seek(time) {
  if (!film.seeking && Math.abs(film.currentTime - time) > 1 / 48) film.currentTime = time;
}
function press(direction, source) {
  if (!ready || credits.open) return;
  if (activeInput && activeInput !== source) stop();
  if (!motion.moving || motion.direction !== direction) motion.sync(film.currentTime);
  activeInput = source;
  motion.press(direction, performance.now());
  forward.classList.toggle('is-active', direction > 0);
  backward.classList.toggle('is-active', direction < 0);
  if (direction < 0) pause();
  else play(); // Call in the user gesture as well, for Safari's media policy.
}
function release(source, cancelled = false) {
  if (activeInput !== source) return;
  if (cancelled) stop();
  else {
    motion?.release(performance.now());
    activeInput = null;
    if (!motion?.moving) pause();
    forward.classList.remove('is-active'); backward.classList.remove('is-active');
  }
}
function play() {
  if (playRequest || !film.paused || film.seeking || !ready || motion?.direction !== 1) return;
  playRequest = film.play();
  playRequest.catch(error => {
    if (error.name !== 'AbortError') { stop(); status.textContent = 'Devam etmek için ileri oka tekrar bas.'; }
  }).finally(() => { playRequest = null; if (motion?.direction !== 1 || document.hidden || credits.open) pause(); });
}
function reset() {
  stop(); if (!motion) return;
  motion.seek(0); film.currentTime = 0;
  status.textContent = 'Yolculuk başa alındı.';
  stage.dataset.ended = 'false';
}

film.addEventListener('loadedmetadata', () => {
  motion = createMotion({ duration: film.duration });
  // Preserve the first frame, including on browsers restoring media state.
  film.currentTime = 0;
});
film.addEventListener('loadeddata', () => {
  ready = true; failed = false; loading.hidden = true;
  forward.disabled = false; backward.disabled = false;
  stage.dataset.ready = 'true';
});
film.addEventListener('waiting', () => { if (motion?.moving) loading.hidden = false; });
film.addEventListener('playing', () => { loading.hidden = true; });
film.addEventListener('canplay', () => { if (ready) loading.hidden = true; });
film.addEventListener('seeked', () => {
  if (!motion) return;
  if (motion.direction === 1) play();
  else if (Math.abs(film.currentTime - motion.time) > 1 / 24) seek(motion.time);
});
film.addEventListener('ended', () => {
  motion?.sync(film.duration); stop();
  stage.dataset.ended = 'true';
  status.textContent = 'Yolculuk tamamlandı. Başa dön düğmesiyle yeniden başlayabilirsin.';
});
film.addEventListener('error', () => {
  ready = false; failed = true; stop(); loading.hidden = true;
  forward.disabled = false;
  forward.setAttribute('aria-label', 'Filmi yeniden yükle');
  status.textContent = 'Film yüklenemedi. İleri oka basarak tekrar deneyebilirsin.';
});

for (const [button, direction] of [[forward, 1], [backward, -1]]) {
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    if (failed) { failed = false; film.load(); loading.hidden = false; return; }
    button.setPointerCapture(event.pointerId);
    press(direction, `pointer:${event.pointerId}`);
  });
  button.addEventListener('pointerup', event => release(`pointer:${event.pointerId}`));
  button.addEventListener('pointercancel', event => release(`pointer:${event.pointerId}`, true));
  button.addEventListener('lostpointercapture', event => release(`pointer:${event.pointerId}`, true));
  // Keyboard/assistive activation emits click without a pointer event.
  button.addEventListener('click', event => {
    if (event.detail !== 0) return;
    press(direction, 'activation'); release('activation');
  });
}
window.addEventListener('keydown', event => {
  if (credits.open || event.altKey || event.ctrlKey || event.metaKey) return;
  if (keyDirections.has(event.key)) {
    event.preventDefault();
    if (!event.repeat) press(keyDirections.get(event.key), `key:${event.code}`);
  } else if (event.key === ' ' && event.target === document.body) { event.preventDefault(); stop(); }
  else if (event.key === 'Home') { event.preventDefault(); reset(); }
});
window.addEventListener('keyup', event => { if (keyDirections.has(event.key)) { event.preventDefault(); release(`key:${event.code}`); } });
window.addEventListener('blur', stop);
window.addEventListener('pagehide', stop);
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
document.querySelector('#reset').addEventListener('click', reset);
document.querySelector('#sound').addEventListener('click', event => {
  film.muted = !film.muted;
  event.currentTarget.setAttribute('aria-pressed', String(!film.muted));
  event.currentTarget.setAttribute('aria-label', film.muted ? 'Sesi aç' : 'Sesi kapat');
});
const fullscreen = document.querySelector('#fullscreen');
if (!document.documentElement.requestFullscreen) fullscreen.hidden = true;
fullscreen.addEventListener('click', async () => {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch { status.textContent = 'Bu tarayıcı tam ekranı desteklemiyor.'; }
});
document.addEventListener('fullscreenchange', () => fullscreen.setAttribute('aria-label', document.fullscreenElement ? 'Tam ekrandan çık' : 'Tam ekran'));
document.querySelector('#credits').addEventListener('click', () => { stop(); credits.showModal(); });
document.querySelector('#close-credits').addEventListener('click', () => credits.close());
credits.addEventListener('click', event => { if (event.target === credits) { const rect = credits.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) credits.close(); } });
credits.addEventListener('close', () => document.querySelector('#credits').focus());

function frame(now) {
  const delta = Math.min((now - previousFrame) / 1000, .05);
  previousFrame = now;
  if (ready && motion && !document.hidden) {
    if (motion.direction === 1) {
      motion.sync(film.currentTime); motion.update(0, now);
      if (motion.moving) play(); else pause();
    } else if (motion.direction === -1) {
      pause(); motion.update(delta, now); seek(motion.time);
    }
    const percent = Math.min(100, Math.round(film.currentTime / film.duration * 100));
    if (percent !== lastProgress) {
      progress.setAttribute('aria-valuenow', String(percent));
      progress.firstElementChild.style.transform = `scaleX(${film.currentTime / film.duration})`;
      lastProgress = percent;
    }
    if (!motion.moving) { forward.classList.remove('is-active'); backward.classList.remove('is-active'); }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
