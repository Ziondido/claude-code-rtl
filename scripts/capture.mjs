import puppeteer from 'puppeteer';
import { execSync, spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlFile = path.resolve(__dirname, '../demo.html');
const outDir   = path.resolve(__dirname, '../images');
const frameDir = path.resolve(outDir, 'frames');

fs.mkdirSync(frameDir, { recursive: true });
// Clean old frames
fs.readdirSync(frameDir).forEach(f => fs.unlinkSync(path.join(frameDir, f)));

const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=2'],
    executablePath: '/usr/bin/google-chrome',
});
const page = await browser.newPage();
await page.setViewport({ width: 960, height: 620, deviceScaleFactor: 2 });
await page.goto('file://' + htmlFile, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 400));

let frameIdx = 0;
async function shot(count = 1) {
    for (let i = 0; i < count; i++) {
        await page.screenshot({
            path: path.join(frameDir, `f${String(frameIdx++).padStart(4,'0')}.png`),
        });
    }
}

// Get button position for cursor animation
const btnBox = await page.$eval('#rtl-btn', el => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width/2, y: r.top + r.height/2 };
});

// === Scene 1: Hold on clean state (RTL off) — 1.5s @ ~20fps ===
for (let i = 0; i < 30; i++) await shot();

// === Scene 2: Cursor moves in from right edge toward button ===
const startX = 900, startY = btnBox.y + 10;
const steps = 18;
for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t; // easeInOut
    const x = startX + (btnBox.x - startX) * ease;
    const y = startY + (btnBox.y - startY) * ease;
    await page.evaluate((x, y) => window.showCursor(x, y, false), x, y);
    await shot();
}

// === Scene 3: Hover on button (0.4s) ===
await page.evaluate(() => window.hoverBtn(true));
for (let i = 0; i < 8; i++) await shot();

// === Scene 4: Click down ===
await page.evaluate(() => { window.clickBtn(true); window.showCursor(window._btn.getBoundingClientRect().left + 13, window._btn.getBoundingClientRect().top + 13, true); });
await shot(3);

// === Scene 5: Activate RTL + release click ===
await page.evaluate(() => { window.enableRTL(); window.clickBtn(false); window.hoverBtn(false); });
await shot(2);

// === Scene 6: Cursor moves away ===
for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const ease = t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
    const x = btnBox.x + (900 - btnBox.x) * ease;
    const y = btnBox.y + (btnBox.y + 20 - btnBox.y) * ease;
    await page.evaluate((x, y) => window.showCursor(x, y, false), x, y);
    await shot();
}
await page.evaluate(() => window.hideCursor());

// === Scene 7: Hold RTL on — 2s ===
for (let i = 0; i < 40; i++) await shot();

// === Scene 8: Pause then fade — 0.5s hold ===
for (let i = 0; i < 10; i++) await shot();

await browser.close();

console.log(`Captured ${frameIdx} frames`);

// Also grab static screenshots
const browser2 = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/google-chrome',
});
const p2 = await browser2.newPage();
await p2.setViewport({ width: 960, height: 620, deviceScaleFactor: 2 });
await p2.goto('file://' + htmlFile, { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 300));
await p2.screenshot({ path: `${outDir}/01-rtl-off.png` });
await p2.evaluate(() => window.enableRTL());
await new Promise(r => setTimeout(r, 400));
await p2.screenshot({ path: `${outDir}/02-rtl-on.png` });
await browser2.close();
console.log('Static screenshots saved');

// === Build GIF with ffmpeg palettegen (sharp colors) ===
console.log('Building GIF with ffmpeg...');

// Step 1: generate palette
execSync(
    `ffmpeg -y -framerate 20 -i ${frameDir}/f%04d.png ` +
    `-vf "fps=20,scale=900:-1:flags=lanczos,palettegen=max_colors=256:reserve_transparent=0" ` +
    `${outDir}/palette.png`,
    { stdio: 'pipe' }
);

// Step 2: encode GIF using palette
execSync(
    `ffmpeg -y -framerate 20 -i ${frameDir}/f%04d.png -i ${outDir}/palette.png ` +
    `-lavfi "fps=20,scale=900:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3" ` +
    `-loop 0 ${outDir}/demo-animated.gif`,
    { stdio: 'pipe' }
);

// Cleanup palette
fs.unlinkSync(`${outDir}/palette.png`);

const size = (fs.statSync(`${outDir}/demo-animated.gif`).size / 1024 / 1024).toFixed(1);
console.log(`GIF created: ${outDir}/demo-animated.gif (${size} MB)`);
