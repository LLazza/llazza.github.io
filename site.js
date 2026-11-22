/* The shapes, their drop animation, and the side pages.
   You don't need to edit this file: all the text is in content.js. */

/* =====================================================================
   1. THE SHAPES — each drawn in a 100×100 box, visually about the same size
   ===================================================================== */
const SHAPES = {
  circle:   '<circle cx="50" cy="50" r="46"/>',
  square:   '<rect x="9" y="9" width="82" height="82"/>',
  triangle: '<polygon points="50,4 97,90 3,90"/>',
  diamond:  '<polygon points="50,0 100,50 50,100 0,50"/>',
  hexagon:  '<polygon points="50,2 92,26 92,74 50,98 8,74 8,26"/>',
  half:     '<path d="M2,72 A48,48 0 0 1 98,72 Z"/>',
  quarter:  '<path d="M8,92 L8,8 A84,84 0 0 1 92,92 Z"/>',
  pill:     '<rect x="2" y="27" width="96" height="46" rx="23"/>',
  pentagon: '<polygon points="50,3 97,38 79,95 21,95 3,38"/>',
  arch:     '<path d="M14,96 L14,46 A36,36 0 0 1 86,46 L86,96 Z"/>',
};

// Where the ✕ sits inside each shape on the close button (its visual centre)
const X_CENTRE = { triangle: [50, 62], quarter: [36, 62], half: [50, 54], arch: [50, 64], pentagon: [50, 56] };

const SIZE_RATIO = 0.11;  // shape size relative to the screen (0.11 ≈ 110 px on a laptop)
const SHADOWS = false;  // set to true to bring back the shadows under the shapes

// Where does a (tilted) shape touch the floor? Walk along its outline, rotate each
// point by the tilt, and find the lowest points. All values are % of the shape's box.
function footprint(svg, tiltDeg) {
  const el = svg.firstElementChild, L = el.getTotalLength(), t = tiltDeg * Math.PI / 180;
  const pts = [];
  for (let i = 0; i <= 160; i++) {
    const p = el.getPointAtLength(L * i / 160), dx = p.x - 50, dy = p.y - 50;
    pts.push({ x: 50 + dx * Math.cos(t) - dy * Math.sin(t), y: 50 + dx * Math.sin(t) + dy * Math.cos(t) });
  }
  const bottom = Math.max(...pts.map(p => p.y));
  const touch = pts.filter(p => p.y > bottom - 3).map(p => p.x);
  const xs = pts.map(p => p.x);
  return { bottom, touchL: Math.min(...touch), touchR: Math.max(...touch), left: Math.min(...xs), right: Math.max(...xs) };
}

const PAGES = [...document.querySelectorAll('nav a')].map(a => ({
  id: a.getAttribute('href').slice(1), label: a.textContent,
}));

// Random shapes, never the same one twice, each with a small random tilt
const pool = Object.keys(SHAPES).sort(() => Math.random() - 0.5);
const stage = document.getElementById('stage');
const items = PAGES.map((page, i) => {
  const a = document.createElement('a');
  a.className = 'item';
  a.href = '#' + page.id;
  const tilt = Math.random() * 30 - 15;
  a.style.setProperty('--tilt', tilt.toFixed(1) + 'deg');
  a.innerHTML = `
    ${SHADOWS ? '<span class="shadows"><span class="ambient"></span><span class="contact"></span></span>' : ''}
    <span class="drop"><svg class="shape" viewBox="0 0 100 100" aria-hidden="true">${SHAPES[pool[i]]}</svg></span>
    <span class="label">${page.label}</span>`;
  page.shape = pool[i];
  page.tilt = tilt;
  a.addEventListener('click', e => { e.preventDefault(); openPanel(page.id); });
  stage.appendChild(a);

  // Size and place the shadows from the shape's real footprint
  const f = footprint(a.querySelector('.shape'), tilt);
  a.style.setProperty('--fy', f.bottom.toFixed(1));
  if (SHADOWS) {
    const contactW = Math.max(f.touchR - f.touchL, 10) + 6;       // a point still casts a small dot
    const contact = a.querySelector('.contact'), ambient = a.querySelector('.ambient');
    Object.assign(contact.style, { left: ((f.touchL + f.touchR) / 2 - contactW / 2) + '%', width: contactW + '%', top: f.bottom + '%' });
    const ambW = (f.right - f.left) * 1.1;
    Object.assign(ambient.style, { left: ((f.left + f.right) / 2 - ambW / 2) + '%', width: ambW + '%', top: (f.bottom - 10) + '%' });
  }
  return a;
});

/* =====================================================================
   2. PLACEMENT — scatter them in the free space, not too close to each
   other, and never on top of the name or the menu
   ===================================================================== */
let layoutSeed = Math.floor(Math.random() * 1e9);
function seededRandom(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
}

function place() {
  setUnit();                                        // make sure name and menu match this screen
  const W = innerWidth, H = innerHeight, phone = W < 600;
  const nav = document.querySelector('nav').getBoundingClientRect();
  const hero = document.querySelector('.hero').getBoundingClientRect();
  // The landing zone: below the menu line, above the name line, and set in from
  // the left and right edges. Shapes never fall outside it.
  const sideInset = Math.max(20, W * (phone ? 0.05 : 0.08));
  const breathing = Math.max(24, H * 0.05);
  const area = {
    left: sideInset, right: W - sideInset,
    top: nav.bottom + breathing,
    bottom: hero.top - breathing,
  };
  const avoid = [];

  // Size is a fixed share of the screen: each shape covers the same fraction of
  // the screen's area on a phone, a laptop or a huge monitor.
  // If they can't all fit with clear space around each one (an unusually
  // shaped window), they get 10% smaller and we try again.
  let size = Math.round(SIZE_RATIO * Math.sqrt(W * H));
  const MIN_SIZE = 30;
  let spots = null;
  for (;;) {
    document.documentElement.style.setProperty('--size', size + 'px');
    const boxes = items.map(el => ({ w: el.offsetWidth, h: el.offsetHeight }));   // shape + label
    const gap = size * 0.6;                         // minimum empty space between any two items
    spots = scatter(boxes, area, avoid, gap, seededRandom(layoutSeed));
    if (spots || size <= MIN_SIZE) break;
    size = Math.max(MIN_SIZE, Math.round(size * 0.9));
  }
  if (!spots) spots = grid(items.map(el => ({ w: el.offsetWidth, h: el.offsetHeight })), area);

  items.forEach((el, i) => { el.style.left = spots[i].x + 'px'; el.style.top = spots[i].y + 'px'; });
}

// Random positions where no two boxes come closer than `gap`. Returns null if it can't.
function scatter(boxes, area, avoid, gap, rand) {
  const clear = (r, o, pad) => r.x + r.w + pad <= o.x || o.x + o.w + pad <= r.x ||
                               r.y + r.h + pad <= o.y || o.y + o.h + pad <= r.y;
  for (let restart = 0; restart < 40; restart++) {
    const placed = [];
    for (const b of boxes) {
      const spanX = area.right - area.left - b.w, spanY = area.bottom - area.top - b.h;
      if (spanX < 0 || spanY < 0) return null;
      let spot = null;
      for (let t = 0; t < 400 && !spot; t++) {
        const r = { x: area.left + rand() * spanX, y: area.top + rand() * spanY, w: b.w, h: b.h };
        if (avoid.every(o => clear(r, o, 0)) && placed.every(o => clear(r, o, gap))) spot = r;
      }
      if (!spot) break;                             // dead end: start over
      placed.push(spot);
    }
    if (placed.length === boxes.length) return placed;
  }
  return null;
}

// Last resort on tiny screens: a tidy grid
function grid(boxes, area) {
  const cols = 2, rows = Math.ceil(boxes.length / cols);
  const cw = (area.right - area.left) / cols, ch = (area.bottom - area.top) / rows;
  return boxes.map((b, i) => ({
    x: area.left + (i % cols) * cw + (cw - b.w) / 2,
    y: area.top + Math.floor(i / cols) * ch + (ch - b.h) / 2,
  }));
}

/* =====================================================================
   3. THE DROP — one by one, each falls in, squashes on landing,
   bounces once and settles
   ===================================================================== */
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function dropIn(el, delay) {
  const drop = el.querySelector('.drop');
  const fall = -(el.getBoundingClientRect().top + 200);         // start just above the screen
  const spin = (Math.random() < 0.5 ? -1 : 1) * (40 + Math.random() * 60);
  // 'backwards' = hold the first frame while waiting; afterwards CSS takes over (for hover)
  const opts = { duration: 1100, delay, fill: 'backwards' };
  drop.animate([
    { transform: `translateY(${fall}px) rotate(${spin}deg)`, easing: 'cubic-bezier(.55,0,1,.45)' },
    { transform: 'translateY(0) rotate(0) scale(1.18, .78)', offset: .52, easing: 'cubic-bezier(.2,.8,.4,1)' },
    { transform: 'translateY(-26px) rotate(0) scale(.94, 1.07)', offset: .70, easing: 'cubic-bezier(.6,0,.9,.5)' },
    { transform: 'translateY(0) rotate(0) scale(1.06, .94)', offset: .84, easing: 'ease-out' },
    { transform: 'translateY(0) rotate(0) scale(1)' },
  ], opts);
  if (SHADOWS) {
    // Far away: wide and faint. Close: tight and dark. The contact line only exists on touch.
    el.querySelector('.ambient').animate([
      { opacity: 0, transform: 'scale(2.4, 1.8)', easing: 'cubic-bezier(.55,0,1,.45)' },
      { opacity: 1, transform: 'scale(1.15, .95)', offset: .52 },
      { opacity: .7, transform: 'scale(1.25, 1.1)', offset: .70 },
      { opacity: 1, transform: 'scale(1.04, 1)', offset: .84 },
      { opacity: 1, transform: 'scale(1)' },
    ], opts);
    el.querySelector('.contact').animate([
      { opacity: 0, transform: 'scaleX(.6)' },
      { opacity: 0, transform: 'scaleX(.6)', offset: .46 },
      { opacity: 1, transform: 'scaleX(1.25)', offset: .52 },
      { opacity: 0, transform: 'scaleX(.8)', offset: .64 },
      { opacity: 0, transform: 'scaleX(.8)', offset: .74 },
      { opacity: 1, transform: 'scaleX(1.08)', offset: .84 },
      { opacity: 1, transform: 'scaleX(1)' },
    ], opts);
  }
  setTimeout(() => el.classList.add('landed'), delay + 650);
}

place();
if (reduceMotion) {
  items.forEach(el => el.classList.add('landed'));
  document.body.classList.add('ready');
} else {
  // A random drop order, about a quarter of a second apart
  const order = items.map((el, i) => i).sort(() => Math.random() - 0.5);
  order.forEach((i, k) => dropIn(items[i], 500 + k * 260));
  const after = 500 + items.length * 260 + 500;
  document.getElementById('name').style.animationDelay = after + 'ms';
  document.getElementById('email').style.animationDelay = (after + 350) + 'ms';
  document.body.classList.add('ready');
}


let resizeTimer;
addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(place, 120); });

/* =====================================================================
   4. PAGES — the side panel
   ===================================================================== */
const panel = document.getElementById('panel');
const navLinks = document.querySelectorAll('nav a');
/* ---------- Build each page from content.js ---------- */
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const boldMe = t => esc(t).replace(esc(SITE.me), '<b>' + esc(SITE.me) + '</b>');
const linkList = links => links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join('');

function paperHTML(p) {
  return `<div class="entry">
    <p class="title">${esc(p.title)}</p>
    <p class="meta">${boldMe(p.authors)}${p.venue ? '<br>' + esc(p.venue) : ''}</p>
    ${p.links && p.links.length ? `<p class="links">${linkList(p.links)}</p>` : ''}
  </div>`;
}

const PAGES_HTML = {
  about() {
    const a = SITE.about;
    return `<h2>About</h2>
      ${a.paragraphs.map(t => `<p>${esc(t)}</p>`).join('')}
      <h3>Contact</h3>
      <p>${esc(a.email)}</p>
      <p class="links">${a.links.map(l => `<a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}</a>`).join(' &nbsp;·&nbsp; ')}</p>`;
  },
  research() {
    return '<h2>Research</h2>' + SITE.research.groups.map(g =>
      `<h3>${esc(g.title)}</h3>${g.papers.map(paperHTML).join('')}`).join('');
  },
  teaching() {
    return '<h2>Teaching</h2>' + SITE.teaching.groups.map(g =>
      `<h3>${esc(g.title)}</h3>` + g.courses.map(c =>
        `<div class="row"><span>${esc(c.name)}<small>${esc(c.place)}</small></span></div>`).join('')).join('');
  },
  cv() {
    return `<h2>CV</h2>
      <a class="button" href="${esc(SITE.cv.pdf)}" target="_blank" rel="noopener">Download full CV (PDF)</a>`;
  },
};

// All four pages are written into the page right away (only one is shown at a
// time). This way search engines can read every page, not just the home screen.
document.getElementById('panel-content').innerHTML = Object.keys(PAGES_HTML)
  .map(id => `<section class="page" id="page-${id}" hidden>${PAGES_HTML[id]()}</section>`).join('');

// The close button borrows the shape (and tilt) of the section being read
function setCloseShape(id) {
  const page = PAGES.find(p => p.id === id);
  if (!page) return;
  const [cx, cy] = X_CENTRE[page.shape] || [50, 50], r = 13;
  document.getElementById('close-shape').innerHTML = `
    <svg viewBox="0 0 100 100">
      <g class="outline" transform="rotate(${page.tilt.toFixed(1)} 50 50)">${SHAPES[page.shape]}</g>
      <path class="x" d="M${cx - r},${cy - r} L${cx + r},${cy + r} M${cx + r},${cy - r} L${cx - r},${cy + r}"/>
    </svg>`;
}

function openPanel(id) {
  setCloseShape(id);
  document.querySelectorAll('#panel-content .page').forEach(sec => { sec.hidden = sec.id !== 'page-' + id; });
  panel.classList.add('open');
  document.body.classList.add('inside');
  panel.scrollTop = 0;
  navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  history.replaceState(null, '', '#' + id);
}
function closePanel() {
  panel.classList.remove('open');
  document.body.classList.remove('inside');
  navLinks.forEach(a => a.classList.remove('active'));
  history.replaceState(null, '', location.pathname + location.search);
}
navLinks.forEach(a => a.addEventListener('click', e => { e.preventDefault(); openPanel(a.getAttribute('href').slice(1)); }));
document.getElementById('close').addEventListener('click', closePanel);
document.getElementById('scrim').addEventListener('click', closePanel);
addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
if (PAGES_HTML[location.hash.slice(1)]) setTimeout(() => openPanel(location.hash.slice(1)), 2600);
