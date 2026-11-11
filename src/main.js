import './style.css';
const film = document.querySelector('#story-film');
const story = document.querySelector('#story');
const sections = [...document.querySelectorAll('.chapter')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let desiredTime = .3, ready = false, scrollQueued = false;
function seek() { if (ready && !film.seeking && Math.abs(film.currentTime - desiredTime) > .08) film.currentTime = desiredTime; }
film.addEventListener('loadedmetadata', () => { ready = true; update(); });
film.addEventListener('seeked', seek);
function update() {
  scrollQueued = false;
  const y = window.scrollY;
  const total = story.offsetHeight - innerHeight;
  const progress = Math.min(1, Math.max(0, y / total));
  document.querySelector('#progress-fill').style.width = `${progress * 100}%`;
  document.querySelector('.journey-progress').style.opacity = y > total + innerHeight * .4 ? 0 : 1;
  document.body.classList.toggle('scrolled', y > 100);
  const active = sections.findLast(section => y + innerHeight * .4 >= section.offsetTop) || sections[0];
  const index = sections.indexOf(active);
  document.querySelector('#chapter-number').textContent = `0${index + 1}`;
  const start = Number(active.dataset.start), end = Number(active.dataset.end);
  const local = Math.min(1, Math.max(0, (y - active.offsetTop + (index ? innerHeight * .4 : 0)) / (active.offsetHeight - innerHeight * .25)));
  desiredTime = reducedMotion ? start : start + (end - start) * local;
  seek();
}
window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(update); } }, { passive: true });
window.addEventListener('resize', update);
update();
const dialog = document.querySelector('#film-dialog');
const fullFilm = document.querySelector('#full-film');
document.querySelector('#watch-film').addEventListener('click', () => { dialog.showModal(); document.body.classList.add('dialog-open'); fullFilm.play().catch(() => {}); });
document.querySelector('#close-film').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => { fullFilm.pause(); document.body.classList.remove('dialog-open'); document.querySelector('#watch-film').focus(); });
dialog.addEventListener('click', event => { if (event.target === dialog && event.clientY < dialog.getBoundingClientRect().top) dialog.close(); });
const observer = new IntersectionObserver(async entries => {
  if (!entries.some(entry => entry.isIntersecting)) return;
  observer.disconnect();
  try { const { createWorld } = await import('./world.js'); await createWorld(document.querySelector('#world'), reducedMotion); }
  catch (error) { console.error(error); document.querySelector('#world-loading').textContent = '3D görünüm açılamadı. Filmi izleyerek sahneyi keşfedebilirsin.'; }
}, { rootMargin: '500px' });
observer.observe(document.querySelector('#kesif'));
