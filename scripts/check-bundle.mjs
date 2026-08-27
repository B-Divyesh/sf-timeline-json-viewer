import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const indexPath = resolve('dist/index.html');
if (!existsSync(indexPath)) throw new Error('dist/index.html is missing. Run npm run build first.');

const html = readFileSync(indexPath, 'utf8');
const assetPaths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
const sizeFor = (extension) => assetPaths
  .filter((asset) => asset.endsWith(extension))
  .reduce((total, asset) => total + statSync(resolve('dist', asset.slice(1))).size, 0);
const javascript = sizeFor('.js');
const css = sizeFor('.css');
const inlineJavascript = [...html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)]
  .reduce((total, match) => total + Buffer.byteLength(match[1]), 0);
const inlineCss = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)]
  .reduce((total, match) => total + Buffer.byteLength(match[1]), 0);
const fonts = assetPaths
  .filter((asset) => /\.(?:woff2?|ttf|otf)$/.test(asset))
  .reduce((total, asset) => total + statSync(resolve('dist', asset.slice(1))).size, 0);

const budgets = [
  ['initial JavaScript', javascript + inlineJavascript, 200 * 1024],
  ['initial CSS', css + inlineCss, 50 * 1024],
  ['initial fonts', fonts, 120 * 1024]
];

for (const [label, bytes, limit] of budgets) {
  console.log(`${label}: ${bytes.toLocaleString()} / ${limit.toLocaleString()} bytes`);
  if (bytes > limit) process.exitCode = 1;
}

if (process.exitCode) throw new Error('One or more initial-load bundle budgets were exceeded.');
