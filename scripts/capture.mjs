import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlFile = path.resolve(__dirname, '../demo.html');
const outDir = path.resolve(__dirname, '../images');

fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/google-chrome',
});
const page = await browser.newPage();
await page.setViewport({ width: 900, height: 700, deviceScaleFactor: 2 });
await page.goto('file://' + htmlFile, { waitUntil: 'networkidle0' });
await page.evaluate(() => { document.getElementById('demo-label').style.display = 'none'; });

// Screenshot 1: RTL off
await page.screenshot({ path: `${outDir}/01-rtl-off.png`, fullPage: false });
console.log('Captured: 01-rtl-off.png');

// Click RTL toggle
await page.click('#rtl-btn');
await new Promise(r => setTimeout(r, 300));

// Screenshot 2: RTL on
await page.screenshot({ path: `${outDir}/02-rtl-on.png`, fullPage: false });
console.log('Captured: 02-rtl-on.png');

await browser.close();

// Create GIF from both screenshots using ImageMagick
console.log('Creating GIF...');
execSync(
    `convert -delay 120 ${outDir}/01-rtl-off.png -delay 120 ${outDir}/02-rtl-on.png ` +
    `-loop 0 -resize 900x ${outDir}/demo.gif`
);
console.log('Created: demo.gif');

// Create animated GIF with more frames (toggle back and forth)
const browser2 = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: '/usr/bin/google-chrome',
});
const page2 = await browser2.newPage();
await page2.setViewport({ width: 900, height: 700, deviceScaleFactor: 2 });
await page2.goto('file://' + htmlFile, { waitUntil: 'networkidle0' });
await page2.evaluate(() => { document.getElementById('demo-label').style.display = 'none'; });

const frames = [];
const frameDir = `${outDir}/frames`;
fs.mkdirSync(frameDir, { recursive: true });

// Wait for page to settle
await new Promise(r => setTimeout(r, 500));

// Frame 0-4: hold RTL off
for (let i = 0; i < 5; i++) {
    const f = `${frameDir}/f${String(i).padStart(3,'0')}.png`;
    await page2.screenshot({ path: f });
    frames.push({ path: f, delay: 60 });
}

// Click toggle ON
await page2.click('#rtl-btn');
await new Promise(r => setTimeout(r, 50));

// Frame 5-12: hold RTL on
for (let i = 5; i < 13; i++) {
    const f = `${frameDir}/f${String(i).padStart(3,'0')}.png`;
    await page2.screenshot({ path: f });
    frames.push({ path: f, delay: 60 });
}

// Click toggle OFF
await page2.click('#rtl-btn');
await new Promise(r => setTimeout(r, 50));

// Frame 13-17: hold RTL off again
for (let i = 13; i < 18; i++) {
    const f = `${frameDir}/f${String(i).padStart(3,'0')}.png`;
    await page2.screenshot({ path: f });
    frames.push({ path: f, delay: 60 });
}

await browser2.close();

// Build animated GIF
const frameArgs = frames.map(f => `-delay ${f.delay} ${f.path}`).join(' ');
execSync(`convert ${frameArgs} -loop 0 -resize 900x ${outDir}/demo-animated.gif`);
console.log('Created: demo-animated.gif');

console.log('\nAll images in:', outDir);
