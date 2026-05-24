import puppeteer from 'puppeteer';
import { mkdir, readdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(ROOT, 'temporary screenshots');

const url = process.argv[2];
const label = process.argv[3];

if (!url) {
  console.error('Usage: node screenshot.mjs <url> [label]');
  console.error('Example: node screenshot.mjs http://localhost:3000 hero');
  process.exit(1);
}

await mkdir(OUT_DIR, { recursive: true });

let max = 0;
for (const f of await readdir(OUT_DIR)) {
  const m = f.match(/^screenshot-(\d+)/);
  if (m) max = Math.max(max, Number(m[1]));
}
const n = max + 1;
const name = label ? `screenshot-${n}-${label}.png` : `screenshot-${n}.png`;
const outPath = join(OUT_DIR, name);

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`Saved ${outPath}`);
} finally {
  await browser.close();
}
