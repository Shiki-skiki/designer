'use strict';
const projects = [
  { title: 'MONO', category: 'BRAND & DIGITAL / 2026', role: 'Identity, web design', description: 'A sound-first identity for a new kind of listening. Sculptural product imagery, bold typography, and a digital experience that gives every detail room to resonate.' },
  { title: 'OPEN FORM', category: 'ART DIRECTION / 2025', role: 'Typography, art direction', description: 'An exploration of type as image. Open forms and deliberate tension create a visual language for a culture that refuses to stand still.' },
  { title: 'FORMA', category: 'WEB EXPERIENCE / 2026', role: 'Web design, development', description: 'An architectural practice seen through a different lens. A spatial web experience that brings material, light, and human perspective to the foreground.' },
  { title: 'ORBIT', category: 'DIGITAL ART & MOTION / 2025', role: 'Art direction, interaction', description: 'A study in attraction and reflection. Liquid-metal forms and cinematic red light become a tactile digital identity shaped by movement.' },
  { title: 'OFF SCRIPT', category: 'EDITORIAL & WEB / 2024', role: 'Editorial, digital design', description: 'An independent journal for people with a different point of view. Expressive typography meets a considered editorial structure, on paper and on screen.' }
];
const projectButtons = [...document.querySelectorAll('.project')];
const projectDialog = document.querySelector('#project-dialog');
let currentProject = 0;
let galleryOffset = 0;
const openedBy = new WeakMap();
function openDialog(dialog, trigger = document.activeElement) {
  openedBy.set(dialog, trigger);
  if (!dialog.open) dialog.showModal();
}
document.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => openDialog(document.getElementById(button.dataset.open), button)));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => openedBy.get(dialog)?.focus({ preventScroll: true }));
});
function showProject(index, trigger) {
  currentProject = (index + projects.length) % projects.length;
  const project = projects[currentProject];
  document.querySelector('#project-title').textContent = project.title;
  document.querySelector('#project-category').textContent = project.category;
  document.querySelector('#project-description').textContent = project.description;
  document.querySelector('#project-role').textContent = project.role;
  document.querySelector('#project-detail-visual').replaceChildren(projectButtons[currentProject].querySelector('.project-image').cloneNode(true));
  if (!projectDialog.open) openDialog(projectDialog, trigger);
}
projectButtons.forEach(button => button.addEventListener('click', () => showProject(Number(button.dataset.project), button)));
document.querySelector('#next-detail').addEventListener('click', () => showProject(currentProject + 1));
function moveGallery(direction) {
  galleryOffset = (galleryOffset + direction + projects.length) % projects.length;
  const track = document.querySelector('.gallery-track');
  for (let slot = 0; slot < projects.length; slot++) {
    const button = projectButtons[(slot + galleryOffset) % projects.length];
    button.style.setProperty('--slot', slot - 2);
    track.append(button);
  }
  document.querySelector('.gallery-count').textContent = `${String(galleryOffset + 1).padStart(2, '0')} / 05`;
}
document.querySelector('#previous-work').addEventListener('click', () => moveGallery(-1));
document.querySelector('#next-work').addEventListener('click', () => moveGallery(1));
document.querySelector('.gallery-stage').addEventListener('keydown', event => {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    moveGallery(event.key === 'ArrowRight' ? 1 : -1);
  }
});
let swipeStart = null;
const gallery = document.querySelector('.gallery-stage');
gallery.addEventListener('touchstart', event => { swipeStart = { x:event.touches[0].clientX, y:event.touches[0].clientY }; }, {passive:true});
gallery.addEventListener('touchend', event => {
  if (!swipeStart) return;
  const dx = event.changedTouches[0].clientX - swipeStart.x;
  const dy = event.changedTouches[0].clientY - swipeStart.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) moveGallery(dx < 0 ? 1 : -1);
  swipeStart = null;
}, {passive:true});
document.querySelector('#copy-email').addEventListener('click', async () => {
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText('hello@lishen.design'); status.textContent = 'Email address copied.'; }
  catch { status.textContent = 'Select and copy: hello@lishen.design'; }
});
document.querySelector('#year').textContent = new Date().getFullYear();

const reelDialog = document.querySelector('#reel-dialog');
const reelScreen = document.querySelector('#reel-screen');
const reelToggle = document.querySelector('#reel-toggle');
const reelSlides = [
  {image:'assets/orbit.webp', title:'ORBIT', kind:'FORM IN MOTION', alt:'Chrome orbit with red reflections'},
  {image:'assets/forma.webp', title:'FORMA', kind:'SPACE WITH INTENTION', alt:'Monumental red entrance in concrete architecture'},
  {image:'assets/mono.webp', title:'MONO', kind:'FEEL EVERY FREQUENCY', alt:'Black headphones on a scarlet backdrop'}
];
let reelPlaying = false, elapsed = 0, previousTime = 0, frame = 0, slideIndex = -1;
function renderReel() {
  const index = Math.min(2, Math.floor(elapsed / 4000));
  if (index !== slideIndex) {
    slideIndex = index;
    const slide = reelSlides[index];
    const img = document.querySelector('#reel-image');
    img.src = slide.image; img.alt = slide.alt;
    document.querySelector('#reel-project-name').textContent = slide.title;
    document.querySelector('#reel-project-kind').textContent = slide.kind;
  }
  document.querySelector('#reel-progress').value = elapsed;
  document.querySelector('#reel-time').textContent = `00:${String(Math.floor(elapsed/1000)).padStart(2,'0')} / 00:12`;
}
function tick(time) {
  if (!reelPlaying) return;
  if (previousTime) elapsed = Math.min(12000, elapsed + time - previousTime);
  previousTime = time; renderReel();
  if (elapsed >= 12000) { pauseReel(); reelToggle.textContent = 'REPLAY'; }
  else frame = requestAnimationFrame(tick);
}
function playReel() {
  if (elapsed >= 12000) { elapsed = 0; slideIndex = -1; }
  reelPlaying = true; previousTime = 0; reelToggle.textContent = 'PAUSE';
  reelScreen.classList.add('is-playing'); cancelAnimationFrame(frame); frame = requestAnimationFrame(tick);
}
function pauseReel() { reelPlaying = false; cancelAnimationFrame(frame); reelScreen.classList.remove('is-playing'); reelToggle.textContent = 'PLAY'; }
document.querySelector('#open-reel').addEventListener('click', event => {
  elapsed = 0; slideIndex = -1; renderReel(); openDialog(reelDialog, event.currentTarget); playReel();
});
reelToggle.addEventListener('click', () => reelPlaying ? pauseReel() : playReel());
reelDialog.addEventListener('close', pauseReel);
document.addEventListener('visibilitychange', () => { if (document.hidden && reelPlaying) pauseReel(); });
