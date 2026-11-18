// Generator for the personal GitHub profile banner (banner.svg)
// Inspired by the work-account banner, with the website's dash-sphere
// (components/SphereBackground.js) rendered top-right, rotating forever.
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
const CX = 1300, CY = -10, R = 350;         // sphere center top-right corner (like the website)
const SPACING = 26;                         // dash spacing per band (px)
const SPEED = 42;                           // equator dash speed px/s (website: 0.002 rad/frame @ 60fps * 350)
const DUR = (SPACING / SPEED).toFixed(3);   // one-spacing wrap loop


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
  // ---------- rotating dash sphere ----------
  const bandRand = mulberry32(20261117);
  let bands = '';
  for (let y = 0; y <= 330; y += 10) {
    const rely = y - CY; // relative to sphere center
    if (rely >= R) continue;
    const a = Math.sqrt(R * R - rely * rely); // chord half-width at this latitude
    if (a < 16) continue;
    const phase = SPACING * bandRand();
    const op = (0.26 + 0.32 * bandRand()).toFixed(2);
    const len = 9 + 4 * bandRand();
    const jr = Math.floor(bandRand() * 9) - 4;
    const stroke = `rgb(${80 + jr},${90 + jr},${82 + jr})`;
    let dashes = '';
    for (let pos = -a - SPACING + phase; pos <= a + SPACING; pos += SPACING) {
      const x = CX + pos;
      const ang = Math.atan2(rely, pos); // tangential to the disc, like the website
      const dx = (len / 2) * Math.cos(ang);
      const dy = (len / 2) * Math.sin(ang);
      dashes += `<line x1="${(x - dx).toFixed(1)}" y1="${(y - dy).toFixed(1)}" x2="${(x + dx).toFixed(1)}" y2="${(y + dy).toFixed(1)}"/>`;
    }
    bands += `<g stroke="${stroke}" stroke-width="2" stroke-opacity="${op}" stroke-linecap="round">` +
      `<animateTransform attributeName="transform" type="translate" from="0 0" to="${SPACING} 0" dur="${DUR}s" repeatCount="indefinite"/>` +
      `${dashes}</g>\n`;
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
    <clipPath id="disc"><circle cx="${CX}" cy="${CY}" r="${R}"/></clipPath>
    <radialGradient id="vig" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R}">
      <stop offset="0" stop-color="${BG}" stop-opacity="0"/>
      <stop offset="0.75" stop-color="${BG}" stop-opacity="0"/>
      <stop offset="0.9" stop-color="${BG}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${BG}" stop-opacity="0.95"/>
    </radialGradient>
  </defs>

  <rect width="${W}" height="${H}" rx="${RX}" fill="${BG}"/>

  <!-- sphere background, top-right corner, like the website -->
  <g clip-path="url(#banner)">
    <g clip-path="url(#disc)">
      <g>
        <animate attributeName="opacity" from="0" to="1" dur="1.4s" fill="freeze"/>
        ${bands}
        <!-- depth shading (fake lighting, static) -->
        <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#vig)"/>
      </g>
    </g>
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

makeBanner("Hi, I'm Francis", 'francischartrand.com', 'banner.svg');
