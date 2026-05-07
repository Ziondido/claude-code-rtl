import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(__dirname, '..');

// Large Claude asterisk centered, bold "RTL" label bottom, glow effect
function spoke(angleDeg, cx, cy, len, w) {
    const r = w / 2;
    return `<rect x="${cx - w/2}" y="${cy - len/2}" width="${w}" height="${len}" rx="${r}"
        fill="url(#claude)" transform="rotate(${angleDeg} ${cx} ${cy})"/>`;
}

// Big asterisk: center=64,52, long spokes
const cx = 64, cy = 52, len = 66, w = 8;
const spokes = [0, 30, 60, 90, 120, 150].map(a => spoke(a, cx, cy, len, w)).join('\n  ');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <radialGradient id="bg" cx="50%" cy="45%">
      <stop offset="0%" stop-color="#222222"/>
      <stop offset="100%" stop-color="#0d0d0d"/>
    </radialGradient>
    <linearGradient id="claude" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0%" stop-color="#f5a623"/>
      <stop offset="100%" stop-color="#bf5c0f"/>
    </linearGradient>
    <!-- glow filter -->
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="128" height="128" rx="22" fill="url(#bg)"/>

  <!-- Soft orange glow behind asterisk -->
  <circle cx="${cx}" cy="${cy}" r="30" fill="#e07820" opacity="0.18" filter="url(#glow)"/>

  <!-- Claude asterisk — large, centered -->
  <g filter="url(#glow)">
    ${spokes}
  </g>

  <!-- Bottom label: blue "RTL" bold text -->
  <text x="64" y="118" font-family="'Arial Black', Arial, sans-serif" font-size="22"
        font-weight="900" fill="#4da6ff" text-anchor="middle" letter-spacing="3">RTL</text>
</svg>`;

fs.writeFileSync(`${out}/icon.svg`, svg);
console.log('Written icon.svg');

// Convert SVG → PNG 512x512 using ImageMagick
execSync(`magick -background none -size 512x512 ${out}/icon.svg ${out}/icon.png`);
console.log('Written icon.png (512x512)');
