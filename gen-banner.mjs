// Generator for the personal GitHub profile banner (banner.svg)
// Flowing dashed wave lines over the whole banner: invisible (transparent)
// wave paths carrying the same round white-grey dashes as before, marching
// along the lines forever (stroke-dashoffset loop).
import { createRequire } from 'module';
import { writeFileSync, readFileSync } from 'fs';

// Load opentype.js from this folder's node_modules (portable — works when the folder is moved)
const require2 = createRequire(import.meta.url);
const opentype = require2('opentype.js');

// ---------- config ----------
const W = 1280, H = 320, RX = 48;          // "rounder" corners than the work banner (24)
const BG = '#0c1f12';                       // website body background
const ACCENT = '#22eb61';                   // website link / hover green
const SITE_URL = 'https://francischartrand.com';
const SPACING = 26;                         // dash period along each wave line (px)
const SPEED = 42;                           // dash speed along the lines px/s
const DUR = (SPACING / SPEED).toFixed(3);   // one-dash-period wrap loop
const DUR_N = Number(DUR);                  // numeric DUR for phase math
const LINE_GAP = 13;                        // vertical gap between wave lines (px)
const FADE = 130;                           // edge fade width (px) hiding the waves


// ---------- seeded rng ----------
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}


const LOGO_PATH_1 = 'm42 336.8c-23.1 0-41.8-18.7-41.8-41.8 0-23.1 18.7-41.8 41.8-41.8 23.1 0 41.8 18.7 41.8 41.8 0 23.1-18.7 41.8-41.8 41.8z';
const LOGO_PATH_2 = 'm47.7 85c0 0 37.3-3 37.3-42.9 19.8-17.8 41 41.9 41 41.9 0 0-42-3.1-42 35 0 33.3-32.7-4-37.8-24.1-0.7-2.7-4.5-9.9-4.5-9.9 0 0 2.6 0.1 6 0zm0.1 83.4c0 0 37.1-2.7 37.1 37.2 0 39.9 20.1-7.1 20.1-7.1l18.4-29.3c0 0-39.4 6.1-39.4-34.7 0-40.9-46.9 28.5-36.2 33.9zm-5.8 0.2c-23.2 0-42-18.7-42-41.8 0-23.1 18.8-41.8 42-41.8 23.2 0 42 18.7 42 41.8 0 23.1-18.8 41.8-42 41.8zm0 0c-23.2 0-42-18.7-42-41.8 0-23.1 18.8-41.8 42-41.8 23.2 0 42 18.7 42 41.8 0 23.1-18.8 41.8-42 41.8zm85-84.6c-23.2 0-42-18.8-42-42 0-23.2 18.8-42 42-42 23.2 0 42 18.8 42 42 0 23.2-18.8 42-42 42zm0 0c-23.2 0-42-18.8-42-42 0-23.2 18.8-42 42-42 23.2 0 42 18.8 42 42 0 23.2-18.8 42-42 42zm89-84v84h-90v-84zm1 84c-23.2 0-42-18.8-42-42 0-23.2 18.8-42 42-42 23.2 0 42 18.8 42 42 0 23.2-18.8 42-42 42zm0 0c-23.2 0-42-18.8-42-42 0-23.2 18.8-42 42-42 23.2 0 42 18.8 42 42 0 23.2-18.8 42-42 42zm-90 169c-23.2 0-42-18.8-42-42 0-23.2 18.8-42 42-42 23.2 0 42 18.8 42 42 0 23.2-18.8 42-42 42zm0 0c-23.2 0-42-18.8-42-42 0-23.2 18.8-42 42-42 23.2 0 42 18.8 42 42 0 23.2-18.8 42-42 42zm89-84v84h-90v-84zm1 84c-23.2 0-42-18.8-42-42 0-23.2 18.8-42 42-42 23.2 0 42 18.8 42 42 0 23.2-18.8 42-42 42zm0 0c-23.2 0-42-18.8-42-42 0-23.2 18.8-42 42-42 23.2 0 42 18.8 42 42 0 23.2-18.8 42-42 42z';

// website "funky" font (Leckerli One, OFL) — title is outlined to SVG paths,
// so no font embedding/loading is needed (works everywhere, incl. GitHub camo)
const FONT_TITLE_SIZE = 55;
const font = opentype.parse(readFileSync(new URL('./fonts/leckerli-one.ttf', import.meta.url)).buffer.slice(0));

// opentype.js v2's toPathData can emit literal "NaN" for degenerate control points,
// which silently truncates the path in renderers. Build the d string ourselves,
// replacing non-finite coordinates with sane neighbors.
function commandsToD(commands, dp = 1) {
  const r = (n) => Number(Number(n).toFixed(dp));
  let lastX = 0, lastY = 0;
  const fin = (v, fallback) => (Number.isFinite(v) ? v : fallback);
  return commands.map((c) => {
    const x = fin(c.x, lastX), y = fin(c.y, lastY);
    let out;
    switch (c.type) {
      case 'M': out = `M${r(x)} ${r(y)}`; break;
      case 'L': out = `L${r(x)} ${r(y)}`; break;
      case 'Q': out = `Q${r(fin(c.x1, x))} ${r(fin(c.y1, y))} ${r(x)} ${r(y)}`; break;
      case 'C': out = `C${r(fin(c.x1, x))} ${r(fin(c.y1, y))} ${r(fin(c.x2, x))} ${r(fin(c.y2, y))} ${r(x)} ${r(y)}`; break;
      case 'Z': out = 'Z'; break;
      default: return '';
    }
    if (c.type !== 'Z') { lastX = x; lastY = y; }
    return out;
  }).join('');
}

function makeBanner(title, subtitle, outfile) {
  // ---------- flowing dashed wave lines (background) ----------
  // The wave lines themselves are transparent — only their dashes are painted.
  // Vertical spacing is warped along x (b * s(x)) so the field squeezes and
  // spreads like the reference topo-wave pattern; shared + per-line sines add
  // the bends. Dashes march along each line via a seamless dashoffset loop.
  const waveRand = mulberry32(20261117);
  const STEP = 20;                            // sample step along x (px)
  const X0 = -60, X1 = W + 60;                // extend past the clip edges
  let bands = '';
  for (let b = -LINE_GAP; b <= H + LINE_GAP; b += LINE_GAP) {
    const op = (0.26 + 0.32 * waveRand()).toFixed(2);
    const len = 9 + 4 * waveRand();           // dash length, same range as before
    const jr = Math.floor(waveRand() * 9) - 4;
    const stroke = `rgb(${80 + jr},${90 + jr},${82 + jr})`;

    // per-line bend phases (correlated with b so bends travel across the field)
    const ph2 = 0.008 * b + (waveRand() - 0.5) * 0.6;
    const ph3 = 0.015 * b + (waveRand() - 0.5) * 0.8;

    const pts = [];
    for (let x = X0; x <= X1; x += STEP) {
      const s = 1 + 0.32 * Math.sin(x / 460 + 1.1);          // shared spacing warp
      const y = b * s
        + 34 * Math.sin(x / 560 + 2.0)                        // shared undulation
        + 20 * Math.sin(x / 300 + ph2)                        // per-line bend
        + 6 * Math.sin(x / 150 + ph3);                        // small ripple
      pts.push([x, y]);
    }

    // Catmull-Rom -> cubic bezier for a smooth path through the samples
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] ?? pts[i];
      const p1 = pts[i], p2 = pts[i + 1];
      const p3 = pts[i + 2] ?? p2;
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }

    bands += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="2" stroke-opacity="${op}" stroke-linecap="round" stroke-dasharray="${len.toFixed(1)} ${(SPACING - len).toFixed(1)}">` +
      `<animate attributeName="stroke-dashoffset" from="0" to="${-SPACING}" dur="${DUR}s" begin="-${(((0.006 * b + waveRand() * 0.18) % DUR_N + DUR_N) % DUR_N).toFixed(3)}s" repeatCount="indefinite"/>` +
      `</path>\n`;
  }

  // ---------- logo + title (title outlined to paths with the website's Leckerli One) ----------
  const glyphPath = font.getPath(title, 0, 0, FONT_TITLE_SIZE);
  const bbox = glyphPath.getBoundingBox();
  const titleW = bbox.x2 - bbox.x1;
  const titleD = commandsToD(glyphPath.commands);
  const titleX = 690 - titleW / 2 - bbox.x1; // left edge, minus glyph offset
  const titleY = 150;                        // baseline
  const logoScale = 64 / 337;
  const logoW = 259 * logoScale;
  const logoX = Math.round(titleX - 40 - logoW);
  const logoY = 99;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${title}. ${subtitle}">
  <title>${title}</title>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; text-anchor: middle; }
    .subtitle {
      /* system monospace stack: supported by default on macOS, Windows, Linux */
      font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 14px;
      letter-spacing: 1px;
      text-decoration: underline;
      fill: ${ACCENT};
      opacity: 0.85;
    }
  </style>
  <defs>
    <clipPath id="banner"><rect width="${W}" height="${H}" rx="${RX}"/></clipPath>
    <linearGradient id="fadeL" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${FADE}" y2="0">
      <stop offset="0" stop-color="${BG}"/>
      <stop offset="1" stop-color="${BG}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="fadeR" gradientUnits="userSpaceOnUse" x1="${W - FADE}" y1="0" x2="${W}" y2="0">
      <stop offset="0" stop-color="${BG}" stop-opacity="0"/>
      <stop offset="1" stop-color="${BG}"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="${RX}" fill="${BG}"/>

  <!-- flowing dashed wave lines background -->
  <g clip-path="url(#banner)">
    <g>
      <animate attributeName="opacity" from="0" to="1" dur="1.4s" fill="freeze"/>
      ${bands}
    </g>
    <!-- smooth edge fades so the waves melt into the background -->
    <rect width="${FADE}" height="${H}" fill="url(#fadeL)"/>
    <rect x="${W - FADE}" width="${FADE}" height="${H}" fill="url(#fadeR)"/>
  </g>

  <!-- logo + title -->
  <g transform="translate(${logoX} ${logoY}) scale(${logoScale.toFixed(4)})" fill="#FFFFFF">
    <path fill-rule="evenodd" d="${LOGO_PATH_1}"/>
    <path d="${LOGO_PATH_2}"/>
  </g>
  <!-- title outlined with Leckerli One glyphs -->
  <g transform="translate(${titleX.toFixed(1)} ${titleY})"><path d="${titleD}" fill="#FFFFFF"/></g>
  <!-- website link (clickable when the SVG is opened directly / inlined in HTML) -->
  <a href="${SITE_URL}" target="_blank" xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="${SITE_URL}">
    <text class="subtitle" x="690" y="186.5">${subtitle}</text>
  </a>
</svg>
`;
  writeFileSync(new URL(`./${outfile}`, import.meta.url), svg);
  console.log(`${outfile} written (${(svg.length / 1024).toFixed(1)} KB)`);
}

makeBanner("Welcome To My Coding Space", 'francischartrand.com', 'banner.svg');
