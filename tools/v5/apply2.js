// Span-aware integrator for the v5 rewrite.
//
//   node apply2.js <target> <result.json...>            # dry run
//   node apply2.js --write <target> <result.json...>    # apply
//
// Most agents anchor a replacement to a single unique line. Several instead
// anchor to the FIRST line of a multi-line span and describe the end in prose.
// For those we take the line count AND the literal end line out of the notes and
// require them to agree before cutting anything — guessing a span boundary in a
// 6000-line file silently produces code that still parses but is wrong.
const fs = require('fs');

const args = process.argv.slice(2);
const write = args[0] === '--write';
const rest = write ? args.slice(1) : args;
const target = rest[0];
const files = rest.slice(1);

let src = fs.readFileSync(target, 'utf8');
let applied = 0, failed = 0;
const report = [];

// "REPLACE the 12-line span" -> 12
const lineCount = n => { const m = /the\s+(\d+)-line span/i.exec(n || ''); return m ? +m[1] : null; };
// "ending at `  },[cfg,meta.upgrades]);`" -> that literal
const endLiteral = n => {
  const m = /ending at\s+`([^`]+)`/i.exec(n || '')
        || /THROUGH(?:\s+AND\s+INCLUDING)?(?:\s+the\s+line)?\s+`([^`]+)`/i.exec(n || '');
  return m ? m[1] : null;
};

for (const f of files) {
  const result = JSON.parse(fs.readFileSync(f, 'utf8'));
  const label = f.split('/').pop().slice(0, 16);

  for (const add of result.additions || []) {
    const { anchor, placement, code, name } = add;
    const notes = add.integrationNotes || '';

    let count = 0, idx = 0;
    while ((idx = src.indexOf(anchor, idx)) !== -1) { count++; idx += anchor.length; }
    if (count !== 1) {
      report.push([label, name, count === 0 ? 'ANCHOR NOT FOUND' : `AMBIGUOUS (${count}x)`]);
      failed++;
      continue;
    }

    const at = src.indexOf(anchor);

    if (placement !== 'replace') {
      if (write) {
        src = placement === 'before'
          ? src.slice(0, at) + code + '\n' + src.slice(at)
          : src.slice(0, at + anchor.length) + '\n' + code + src.slice(at + anchor.length);
      }
      report.push([label, name, 'OK ' + placement]);
      applied++;
      continue;
    }

    // ---- replace: single line, or a span described in the notes ----
    const nLines = lineCount(notes);
    const endLit = endLiteral(notes);

    if (!nLines && !endLit) {
      if (write) src = src.slice(0, at) + code + src.slice(at + anchor.length);
      report.push([label, name, 'OK replace(1)']);
      applied++;
      continue;
    }

    const lines = src.split('\n');
    let startLine = src.slice(0, at).split('\n').length - 1;

    let endLine = null;
    if (nLines) endLine = startLine + nLines - 1;

    // An end literal like "};" or "];" matches the first nested closer, not the
    // real one. Refuse it rather than cut the wrong span.
    const GENERIC = /^[\s})\];,]*$/;
    if (endLit && GENERIC.test(endLit)) {
      if (!nLines) {
        report.push([label, name, `END LITERAL TOO GENERIC (${JSON.stringify(endLit)}) — need a line count`]);
        failed++;
        continue;
      }
      endLine = startLine + nLines - 1;
    } else if (endLit) {
      // find the first line at/after the anchor whose text contains the literal
      let found = -1;
      for (let i = startLine; i < lines.length && i < startLine + 400; i++) {
        if (lines[i].includes(endLit.trim())) { found = i; break; }
      }
      if (found === -1) {
        report.push([label, name, 'SPAN END LITERAL NOT FOUND']);
        failed++;
        continue;
      }
      if (endLine !== null && endLine !== found) {
        report.push([label, name, `SPAN MISMATCH: count=>${endLine - startLine + 1} literal=>${found - startLine + 1}`]);
        failed++;
        continue;
      }
      endLine = found;
    }

    if (endLine === null || endLine < startLine || endLine >= lines.length) {
      report.push([label, name, 'BAD SPAN']);
      failed++;
      continue;
    }

    if (write) {
      lines.splice(startLine, endLine - startLine + 1, code);
      src = lines.join('\n');
    }
    report.push([label, name, `OK replace(${endLine - startLine + 1} lines)`]);
    applied++;
  }
}

for (const [l, n, s] of report) {
  console.log((s.startsWith('OK') ? '  ok  ' : '  !!  ') + l.padEnd(17) + String(n).slice(0, 46).padEnd(48) + s);
}
console.log('---');
console.log(`${applied} resolvable, ${failed} unresolvable`);

if (write) {
  if (failed) { console.log('REFUSING TO WRITE: unresolved spans'); process.exit(1); }
  fs.writeFileSync(target, src);
  console.log('WROTE ' + target);
}
process.exit(failed ? 1 : 0);
