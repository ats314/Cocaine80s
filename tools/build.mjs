// Build the playable page.
//
//   npm i esbuild react@18 react-dom@18
//   node tools/build.mjs
//
// One source (cocaine80master) -> one output (index.html), self-contained:
// React compiled in, zero network requests, so it runs from GitHub Pages, a
// file:// URL, or any host with a strict content-security policy.
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const BASE = 'https://ats314.github.io/Cocaine80s/';
const DESC = 'Miami, 1986. Your brother went into the water eleven days ago. They ruled it accidental. One story, three acts, one sitting.';

// Scratch dir lives INSIDE the repo: esbuild resolves react from the entry
// file's location, so a temp dir in /tmp never finds ./node_modules.
const tmp = fs.mkdtempSync(path.join(root, '.build-'));
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
  bundle: true, minify: true, format: 'iife', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  outfile: path.join(tmp, 'app.js'),
  absWorkingDir: root,
});

const app = fs.readFileSync(path.join(tmp, 'app.js'), 'utf8');
fs.rmSync(tmp, { recursive: true, force: true });
if (app.includes('</script')) throw new Error('bundle needs script-tag escaping');

// Open Graph drives the link-preview card in iMessage / WhatsApp / Slack /
// Discord. og:image must be an ABSOLUTE url or no card is generated at all.
//
// #root is the scroll container — html/body stay overflow:hidden. The game has
// no inner scroller, so without this nothing below the first screenful is
// reachable on a phone.
const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
<title>COCAINE 80s — ELEVEN DAYS</title>
<meta name="description" content="${DESC}">
<link rel="canonical" href="${BASE}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="COCAINE 80s">
<meta property="og:title" content="COCAINE 80s — ELEVEN DAYS">
<meta property="og:description" content="${DESC}">
<meta property="og:url" content="${BASE}">
<meta property="og:image" content="${BASE}og-image.png">
<meta property="og:image:secure_url" content="${BASE}og-image.png">
<meta property="og:image:type" content="image/png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="COCAINE 80s neon logo over a Miami skyline at sunset">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="COCAINE 80s — ELEVEN DAYS">
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
  #root{width:100%;height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;background:#060E1A}
</style>
</head>
<body>
<div id="root"></div>
<script>${app}</script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`built index.html (${html.length} bytes)`);
