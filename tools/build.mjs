// Build the standalone playable page from the single-file source.
//
//   npm i esbuild react@18 react-dom@18
//   node tools/build.mjs
//
// Produces index.html: one self-contained file with React bundled in and no
// network requests, so it works from GitHub Pages, a file:// URL, or anywhere
// a strict content-security policy blocks external hosts.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const root = path.resolve(import.meta.dirname, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'c80-'));

// The source has no file extension; esbuild needs one to pick the JSX loader.
fs.copyFileSync(path.join(root, 'cocaine80master'), path.join(tmp, 'game.jsx'));
fs.writeFileSync(
  path.join(tmp, 'entry.jsx'),
  `import { createRoot } from 'react-dom/client';\n` +
  `import Cocaine80s from './game.jsx';\n` +
  `createRoot(document.getElementById('root')).render(<Cocaine80s />);\n`
);

await build({
  entryPoints: [path.join(tmp, 'entry.jsx')],
  bundle: true,
  minify: true,
  format: 'iife',
  jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: path.join(tmp, 'app.js'),
  absWorkingDir: root,
});

const app = fs.readFileSync(path.join(tmp, 'app.js'), 'utf8');
if (app.includes('</script')) throw new Error('bundle needs script-tag escaping');

const BASE = 'https://ats314.github.io/Cocaine80s/';
const DESC = 'Miami, 1986. Run product, build an empire, outrun the DEA — and get out before it all burns down. Free in your browser.';

// Open Graph drives the link preview card in iMessage, WhatsApp, Slack and
// Discord. og:image must be an ABSOLUTE url or no card is generated at all.
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>COCAINE 80s — A Miami Vice Empire Game</title>
<meta name="description" content="${DESC}">
<link rel="canonical" href="${BASE}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="COCAINE 80s">
<meta property="og:title" content="COCAINE 80s">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${BASE}">
<meta property="og:image" content="${BASE}og-image.png">
<meta property="og:image:secure_url" content="${BASE}og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="COCAINE 80s neon logo over a Miami skyline at sunset">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="COCAINE 80s">
<meta name="twitter:description" content="${DESC}">
<meta name="twitter:image" content="${BASE}og-image.png">
<link rel="apple-touch-icon" href="apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<meta name="theme-color" content="#060E1A">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="COCAINE 80s">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:100%;height:100%;overflow:hidden;background:#060E1A}
  #root{width:100%;height:100%;overflow:hidden;background:#060E1A}
</style>
</head>
<body>
<div id="root"></div>
<script>${app}</script>
</body>
</html>
`;


for (const name of ['index.html', 'play.html']) {
  fs.writeFileSync(path.join(root, name), html);
}
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`built index.html and play.html (${html.length} bytes)`);
