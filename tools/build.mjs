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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>COCAINE 80s</title>
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
