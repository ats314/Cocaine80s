// Repair smart-punctuation damage in cocaine80master.
//
// The source was run through a typographic "smart quotes" pass, which turned
// string delimiters into “ ” ‘ ’ and spread operators into …  That is not
// valid JavaScript, so no parser can be used as a starting point.
//
// This is a recursive-descent scanner that tracks JS code, strings, template
// literals, comments, regex literals, and JSX. Only characters acting as
// STRING DELIMITERS are rewritten to straight quotes. Curly quotes inside a
// string, or inside JSX text, are legitimate dialogue typography and are left
// exactly as they are.
const fs = require('fs');

const src = fs.readFileSync(process.argv[2], 'utf8');
const n = src.length;
const isCurlyD = c => c === '“' || c === '”';
const isCurlyS = c => c === '‘' || c === '’';

let out = '';
let i = 0;
const anomalies = [];

function lineAt(pos) {
  let l = 1;
  for (let k = 0; k < pos && k < n; k++) if (src[k] === '\n') l++;
  return l;
}

function lastSig() {
  for (let k = out.length - 1; k >= 0; k--) {
    const c = out[k];
    if (c !== ' ' && c !== '\t' && c !== '\n' && c !== '\r') return c;
  }
  return '';
}

// ── strings ────────────────────────────────────────────────────────────────
// A quote only ends the string if what follows is code rather than prose.
// Dialogue strings contain nested quoted speech whose quotes were smartened
// identically to the delimiters, so lookahead is the only available signal.
const CLOSERS = new Set([',', '}', ')', ']', ';', ':', '+', '.', '?', '&', '|', '=', '>', '\n', '\r', undefined]);
const KEYWORDS = /^(in|instanceof|of)\b/;

function closesHere(pos) {
  let k = pos + 1;
  while (k < n && (src[k] === ' ' || src[k] === '\t')) k++;
  if (CLOSERS.has(src[k])) return true;
  const ahead = src.slice(k, k + 48);
  if (/^\/>/.test(ahead)) return true;                      // JSX self-close
  if (/^[A-Za-z_$][\w$.:-]*\s*=[^=]/.test(ahead)) return true; // next JSX attr
  return KEYWORDS.test(ahead);
}

// `lenient` closes at the first delimiter seen — correct for short single
// quoted identifiers ('gte') and for JSX attribute values.
function readString(closer, q, lenient) {
  const startPos = i;
  i++;
  let body = '';
  let closed = false;
  while (i < n) {
    const c = src[i];
    if (c === '\\') { body += c + (src[i + 1] || ''); i += 2; continue; }
    if (c === '\n') break;
    if (closer(c) && (lenient || closesHere(i))) { i++; closed = true; break; }
    body += c;
    i++;
  }
  if (!closed) anomalies.push(`line ${lineAt(startPos)}: unterminated string`);
  const esc = body.split('\\').join('\\\\').split(q).join('\\' + q);
  return q + esc + q;
}

// ── JSX ────────────────────────────────────────────────────────────────────
// Decide whether `<` opens a JSX element or is a less-than operator.
function looksLikeJsx() {
  if (!/^<\/?[A-Za-z>]/.test(src.slice(i, i + 3))) return false;
  const prev = lastSig();
  if (prev === '' || '(,=:[!&|?{};+'.includes(prev)) return true;
  if (prev === '>') return true;
  const tail = out.replace(/\s+$/, '');
  return /\breturn$/.test(tail) || /=>$/.test(tail);
}

function scanJsxElement() {
  out += '<';
  i++;
  if (src[i] === '/') {                       // closing tag — consume and pop
    while (i < n && src[i] !== '>') { out += src[i]; i++; }
    out += '>';
    i++;
    return;
  }
  while (i < n && /[\w.:$-]/.test(src[i])) { out += src[i]; i++; }  // tag name
  let selfClose = false;
  while (i < n) {                                              // attributes
    const c = src[i];
    if (c === '/' && src[i + 1] === '>') { out += '/>'; i += 2; selfClose = true; break; }
    if (c === '>') { out += '>'; i++; break; }
    if (c === '"' || isCurlyD(c)) { out += readString(ch => ch === '"' || isCurlyD(ch), '"', true); continue; }
    if (c === "'" || isCurlyS(c)) { out += readString(ch => ch === "'" || isCurlyS(ch), "'", true); continue; }
    if (c === '{') { out += '{'; i++; scanCode('}'); out += '}'; i++; continue; }
    out += c;
    i++;
  }
  if (!selfClose) scanJsxChildren();
}

// Children are literal text. Quotes and apostrophes here are prose, not
// delimiters, so nothing is rewritten except inside {expressions}.
function scanJsxChildren() {
  while (i < n) {
    const c = src[i];
    if (c === '<' && src[i + 1] === '/') {
      out += '<';
      i++;
      while (i < n && src[i] !== '>') { out += src[i]; i++; }
      out += '>';
      i++;
      return;
    }
    if (c === '<' && /^<[A-Za-z>]/.test(src.slice(i, i + 2))) { scanJsxElement(); continue; }
    if (c === '{') { out += '{'; i++; scanCode('}'); out += '}'; i++; continue; }
    out += c;
    i++;
  }
}

// ── code ───────────────────────────────────────────────────────────────────
// Scans JS. With stopAtBrace, returns (without consuming) at the `}` that
// closes the enclosing JSX expression container.
function scanCode(stopAtBrace) {
  let depth = 0;
  while (i < n) {
    const c = src[i];
    const c2 = src[i + 1];

    if (stopAtBrace && c === '}' && depth === 0) return;
    if (c === '{') { depth++; out += c; i++; continue; }
    if (c === '}') { depth--; out += c; i++; continue; }

    if (c === '/' && c2 === '/') {                                // line comment
      const nl = src.indexOf('\n', i);
      const end = nl === -1 ? n : nl;
      out += src.slice(i, end);
      i = end;
      continue;
    }
    if (c === '/' && c2 === '*') {                               // block comment
      const e = src.indexOf('*/', i + 2);
      const stop = e === -1 ? n : e + 2;
      out += src.slice(i, stop);
      i = stop;
      continue;
    }
    if (c === '`') { scanTemplate(); continue; }

    if (c === '/') {                                             // regex literal
      const prev = lastSig();
      // `<` is excluded: `</div>` is a JSX closing tag, not a regex.
      if (prev === '' || '(,=:[!&|?{};+-*%~^'.includes(prev)) {
        let j = i + 1;
        let inClass = false;
        let ok = false;
        while (j < n) {
          const t = src[j];
          if (t === '\\') { j += 2; continue; }
          if (t === '\n') break;
          if (t === '[') inClass = true;
          else if (t === ']') inClass = false;
          else if (t === '/' && !inClass) { ok = true; j++; break; }
          j++;
        }
        if (ok) {
          while (j < n && /[a-z]/.test(src[j])) j++;
          out += src.slice(i, j);
          i = j;
          continue;
        }
      }
      out += c;
      i++;
      continue;
    }

    if (c === '<' && looksLikeJsx()) { scanJsxElement(); continue; }
    if (c === '"' || isCurlyD(c)) { out += readString(ch => ch === '"' || isCurlyD(ch), '"'); continue; }
    if (c === "'" || isCurlyS(c)) { out += readString(ch => ch === "'" || isCurlyS(ch), "'", true); continue; }
    if (c === '…') { out += '...'; i++; continue; }              // spread operator

    out += c;
    i++;
  }
}

function scanTemplate() {
  const startPos = i;
  out += '`';
  i++;
  while (i < n) {
    const t = src[i];
    if (t === '\\') { out += t + (src[i + 1] || ''); i += 2; continue; }
    if (t === '`') { out += '`'; i++; return; }
    if (t === '$' && src[i + 1] === '{') {
      out += '${';
      i += 2;
      scanCode('}');
      out += '}';
      i++;
      continue;
    }
    out += t;   // template text — curly quotes here are literal
    i++;
  }
  anomalies.push(`line ${lineAt(startPos)}: unterminated template literal`);
}

scanCode(null);

fs.writeFileSync(process.argv[3], out);
console.log(`wrote ${process.argv[3]} (${out.length} bytes)`);
if (anomalies.length) {
  console.log(`${anomalies.length} anomalies:`);
  for (const a of anomalies.slice(0, 25)) console.log('  ' + a);
}
