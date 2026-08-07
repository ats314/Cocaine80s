// Build the playable pages.
//
//   npm i esbuild react@18 react-dom@18
//   node tools/build.mjs
//
// index.html / play.html / v5.html  <- cocaine80s-v5.jsx  (ELEVEN DAYS — the live game)
// classic.html                      <- cocaine80master    (the original empire game)
//
// Every page is self-contained: React compiled in, zero network requests, so
// it runs from GitHub Pages, a file:// URL, or any host with a strict CSP.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(import.meta.dirname, '..');
const BASE = 'https://ats314.github.io/Cocaine80s/';

// #root is the scroll container — html/body stay overflow:hidden. The game has
// no inner scroller, so without this nothing below the first screenful is
// reachable on a phone.
const CSS = `<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;overflow:hidden;background:#060E1A}
  #root{width:100%;height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;background:#060E1A}
</style>`;

async function bundle(srcName) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'c80-'));
  fs.copyFileSync(path.join(root, srcName), path.join(tmp, 'game.jsx'));
  fs.writeFileSync(
    path.join(tmp, 'entry.jsx'),
    `import { createRoot } from 'react-dom/client';\n` +
    `import Cocaine80s from './game.jsx';\n` +
    `createRoot(document.getElementById('root')).render(<Cocaine80s />);\n`
  );
  await build({
    entryPoints: [path.join(tmp, 'entry.jsx')],
    bundle: true, minify: true, format: 'iife', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    outfile: path.join(tmp, 'app.js'),
    absWorkingDir: root,
  });
  const app = fs.readFileSync(path.join(tmp, 'app.js'), 'utf8');
  fs.rmSync(tmp, { recursive: true, force: true });
  if (app.includes('</script')) throw new Error(srcName + ': bundle needs script-tag escaping');
  return app;
}

// Open Graph drives the link-preview card in iMessage / WhatsApp / Slack /
// Discord. og:image must be an ABSOLUTE url or no card is generated at all.
const page = (app, title, desc, url) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="COCAINE 80s">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${BASE}og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${BASE}og-image.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<meta name="theme-color" content="#060E1A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
${CSS}
</head>
<body>
<div id="root"></div>
<script>${app}</script>
</body>
</html>
`;

const v5 = await bundle('cocaine80s-v5.jsx');
const classic = await bundle('cocaine80master');

const D5 = 'Miami, 1986. Your brother went into the water eleven days ago. They ruled it accidental. One story, three acts, one sitting.';
const main = page(v5, 'COCAINE 80s — ELEVEN DAYS', D5, BASE);
fs.writeFileSync(path.join(root, 'index.html'), main);
fs.writeFileSync(path.join(root, 'play.html'), main);
fs.writeFileSync(path.join(root, 'v5.html'), page(v5, 'COCAINE 80s — ELEVEN DAYS', D5, BASE + 'v5.html'));
fs.writeFileSync(path.join(root, 'classic.html'),
  page(classic, 'COCAINE 80s — Classic', 'Miami, 1986. The original empire game: run product, build turf, outrun the DEA. Free in your browser.', BASE + 'classic.html'));
console.log('built index.html, play.html, v5.html (ELEVEN DAYS) and classic.html');
