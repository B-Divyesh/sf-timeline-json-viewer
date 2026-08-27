import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { readFile, writeFile } from 'node:fs/promises';

const inlineOfflineShell = () => ({
  name: 'inline-offline-shell',
  async closeBundle() {
    const outputDirectory = new URL('./dist/', import.meta.url);
    const indexPath = new URL('index.html', outputDirectory);
    let html = await readFile(indexPath, 'utf8');
    const script = html.match(/<script type="module" crossorigin src="(\/assets\/index-[^"]+\.js)"><\/script>/);
    const style = html.match(/<link rel="stylesheet" crossorigin href="(\/assets\/index-[^"]+\.css)">/);
    if (script) {
      const assetDirectory = script[1].slice(0, script[1].lastIndexOf('/') + 1);
      const source = (await readFile(new URL(`.${script[1]}`, outputDirectory), 'utf8'))
        .replace(/\bimport\((["'])\.\/([^"']+)\1\)/g, (_match, quote, asset) => `import(${quote}${assetDirectory}${asset}${quote})`)
        .replace(/\n\/\/# sourceMappingURL=.*$/, '');
      html = html.replace(script[0], `<script type="module">${source}</script>`);
    }
    if (style) {
      const source = await readFile(new URL(`.${style[1]}`, outputDirectory), 'utf8');
      html = html.replace(style[0], `<style>${source}</style>`);
    }
    await writeFile(indexPath, html);
  }
});

export default defineConfig({
  plugins: [svelte(), inlineOfflineShell()],
  build: { target: 'es2022', sourcemap: true },
  worker: { format: 'es' },
  test: { exclude: ['e2e/**', 'node_modules/**', 'dist/**'] }
});
