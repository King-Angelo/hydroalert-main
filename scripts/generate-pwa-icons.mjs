/**
 * Generates PWA icons: blue droplet on #0f172a background.
 * Run: node scripts/generate-pwa-icons.mjs
 */
import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'icons');

const BG = '#0f172a';
const DROPLET = '#0ea5e9';
const HIGHLIGHT = '#38bdf8';

function dropletSvg(size) {
  const pad = size * 0.18;
  const cx = size / 2;
  const top = pad;
  const bottom = size - pad;
  const width = size - pad * 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BG}" rx="${size * 0.12}"/>
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${HIGHLIGHT}"/>
      <stop offset="100%" stop-color="${DROPLET}"/>
    </linearGradient>
  </defs>
  <path fill="url(#g)" d="M ${cx} ${top}
    C ${cx + width * 0.42} ${top + size * 0.22}, ${cx + width * 0.48} ${bottom - size * 0.08}, ${cx} ${bottom}
    C ${cx - width * 0.48} ${bottom - size * 0.08}, ${cx - width * 0.42} ${top + size * 0.22}, ${cx} ${top} Z"/>
  <ellipse cx="${cx - size * 0.08}" cy="${top + size * 0.28}" rx="${size * 0.06}" ry="${size * 0.1}" fill="white" opacity="0.35"/>
</svg>`;
}

async function writeIcon(size, filename) {
  const buffer = await sharp(Buffer.from(dropletSvg(size))).png().toBuffer();
  await writeFile(join(outDir, filename), buffer);
  console.log('Wrote', filename);
}

await mkdir(outDir, { recursive: true });
await writeIcon(192, 'icon-192x192.png');
await writeIcon(512, 'icon-512x512.png');
