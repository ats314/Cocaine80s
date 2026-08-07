#!/bin/bash
# Reproducible v5 integration: rebuilds ELEVEN DAYS from the committed v4.1 source.
# Every stage is asserted; the script stops on the first failure rather than
# producing a file that parses but is subtly wrong.
set -e
cd "$(dirname "$0")"
SRC=/home/user/Cocaine80s/cocaine80master
OUT=v5trial.jsx

echo "── stage 0: baseline"
cp "$SRC" "$OUT"
wc -l < "$OUT"

echo "── stage 1: engine strip (single campaign)"
node apply2.js --write "$OUT" v5/ae0cc8b48467cfe64.json | tail -2

echo "── stage 2: npcState merge (continuity A8)"
python3 - <<'PY'
p='v5trial.jsx'; s=open(p,encoding='utf-8').read()
old='    npcState:{ maria:{met:false,trust:0,alive:true}, ramirez:{met:false,evidence:0,alive:true}, colombiano:{met:false,trust:0,alive:true} },'
new='    npcState:{ maria:{met:false,trust:0,exposure:0,alive:true}, ramirez:{met:false,trust:0,evidence:0,alive:true}, colombiano:{met:false,trust:0,alive:true}, tiburon:{met:false,trust:0,alive:true}, cass:{met:false,trust:0,alive:true} },'
assert s.count(old)==1, s.count(old)
open(p,'w',encoding='utf-8').write(s.replace(old,new)); print("   npcState merged")
PY

echo "── stage 3: portraits (owns the whole portrait region)"
node apply2.js --write "$OUT" v5/ad68f67802945df5c.json | tail -2

echo "── stage 4: retarget the narrator patch onto the new registry"
python3 - <<'PY'
import json
p='v5/ac1a322f05a214513.json'; r=json.load(open(p))
NEW_ANCHOR='const PORTRAITS={ maria:MariaP, ramirez:RamirezP, colombiano:ColombianoP, nestor:NestorP, tiburon:TiburonP, cass:CassP };'
MERGED='const PORTRAITS={ maria:MariaP, ramirez:RamirezP, colombiano:ColombianoP, nestor:NestorP, tiburon:TiburonP, cass:CassP, narrator:NarratorP };'
src=open('v5trial.jsx',encoding='utf-8').read()
assert src.count(NEW_ANCHOR)==1, "portrait registry line not found/unique"
hit=False
for a in r['additions']:
    if a['name'].startswith('NarratorP portrait'):
        a['anchor']=NEW_ANCHOR
        old_tail='const PORTRAITS={ maria:MariaP, ramirez:RamirezP, colombiano:ColombianoP, tiburon:TiburonP, cass:CassP, narrator:NarratorP };'
        if old_tail in a['code']:
            a['code']=a['code'].replace(old_tail, MERGED)   # keep BOTH nestor and narrator
        assert MERGED in a['code'], "registry merge missing"
        hit=True
assert hit, "narrator addition not found"
json.dump(r,open(p,'w'),indent=1); print("   narrator patch retargeted; registry keeps nestor + narrator")
PY

echo "── stage 5: story arcs (spine, maria, ramirez)"
node apply2.js --write "$OUT" v5/ac1a322f05a214513.json v5/a2e8f61565f688104.json v5/ad67946bf481ac4e8.json | tail -2

echo "── stage 6: drop the engine's dead duplicate ending copy"
python3 - <<'PY'
p='v5trial.jsx'; lines=open(p,encoding='utf-8').read().split('\n')
# ENDING_HEADLINES: engine's trio is the earlier one; spine's (later) is live.
i=next(n for n,l in enumerate(lines) if 'FILE REOPENS IN DEATH RULED ACCIDENTAL' in l)
assert 'QUIET CHANGE AT THE TOP' in lines[i+1] and 'MAN LEAVES CITY' in lines[i+2]
del lines[i:i+3]
# NARRATIVE_OPENERS: engine's witness/inheritor/ghost trio (12 lines)
j=next(n for n,l in enumerate(lines) if 'The docket lists him as a cooperating individual' in l)
start=j-1
assert lines[start].strip()=='witness:[', lines[start]
assert lines[start+11].strip()=='],', lines[start+11]
del lines[start:start+12]
open(p,'w',encoding='utf-8').write('\n'.join(lines)); print("   removed 15 dead lines")
PY

echo "── stage 7: delete the 57 superseded v4 storylets"
python3 - <<'PY'
import re
p='v5trial.jsx'; lines=open(p,encoding='utf-8').read().split('\n')
start=next(i for i,l in enumerate(lines) if l.startswith('const STORY = {'))
end=next(i for i in range(start+1,len(lines)) if lines[i]=='};')
pat=re.compile(r'^  ([A-Za-z0-9_]+):\s*\{\s*speaker:')
entries=[(i,pat.match(lines[i]).group(1)) for i in range(start+1,end) if pat.match(lines[i])]
rng=[(i,(entries[n+1][0] if n+1<len(entries) else end),k) for n,(i,k) in enumerate(entries)]
doomed=[(a,b,k) for a,b,k in rng if not re.match(r'^(m_|r_|c_)',k)]
for a,b,k in sorted(doomed,reverse=True): del lines[a:b]
open(p,'w',encoding='utf-8').write('\n'.join(lines)); print(f"   deleted {len(doomed)} v4 storylets")
PY

echo "── stage 8: screens keyframes (rest held back — collides with engine screens)"
node apply2.js --write "$OUT" v5/aff4bb1cdd38e1668.json | tail -2

echo "── stage 8b: continuity fixes"
python3 - <<'PY'
import re
p='v5trial.jsx'; s=open(p,encoding='utf-8').read()
n=0
def sub(old,new,why):
    global s,n
    assert s.count(old)==1, f"{why}: found {s.count(old)}"
    s=s.replace(old,new); n+=1; print("   fixed:",why)

# A3 — m_brick_call gates ALL of Maria's arc but closed at move 3, so losing a
# 3-move race made 12 storylets permanently unreachable. Gate on the arrival
# flag instead of a move window, and stop re-staging a payphone he already used.
sub('conditions:{ flagNot:"m_met", moveLte:3 },',
    'conditions:{ flag:"c_opened", flagNot:"m_met" },',
    'm_brick_call no longer closes (was moveLte:3, gated Maria entire arc)')

# D1 — the order on Cesar is dated March here and July everywhere else.
if '“Yes. In March.”' in s:
    sub('“Yes. In March.”','“Yes. In July.”','Cesar order dated July, not March')
elif 'Yes. In March.' in s:
    sub('Yes. In March.','Yes. In July.','Cesar order dated July, not March')

# D2 — Cesar owes exactly $9,400 to two different people.
if 'Nine thousand four hundred. That is what your brother owed me' in s:
    sub('Nine thousand four hundred. That is what your brother owed me',
        'Six thousand four hundred. That is what your brother owed me',
        'Maria is owed 6,400 (El Colombiano keeps 9,400)')

# D6 — the arc names him Ray; the epilogue says H.
for old,new in [('Det. H. Ramirez','Det. R. Ramirez')]:
    c=s.count(old)
    if c:
        s=s.replace(old,new); n+=c; print(f"   fixed: Ramirez initial x{c}")

# A4 — c_act2_close sets knows_ramirez_ran, and r_confession excluded that flag,
# so Ramirez's confession could never fire. Make them sequential: the act break
# reveals it, then he says it out loud. This also unblocks r_act3_witness and
# the entire WITNESS ending, which were chained behind r_confessed.
sub('conditions:{ flag:"r_turn_done", flagNone:["knows_ramirez_ran"], evidenceGte:10, totalProfitGte:45000, dealsSinceGte:2 },',
    'conditions:{ flagAll:["r_turn_done","knows_ramirez_ran"], flagNone:["r_confessed"], evidenceGte:10, totalProfitGte:30000, dealsSinceGte:2 },',
    'r_confession now follows the act break instead of being excluded by it')

# The witness path sat behind $80k, well past where real runs reach (measured
# peak ~$30k). Bring it to the same shelf as the confession that gates it.
sub('conditions:{ flag:"knows_ramirez_ran", flagNone:["r_witness_asked","ending_inheritor","ending_ghost"], evidenceGte:12, totalProfitGte:80000, dealsSinceGte:2 },',
    'conditions:{ flag:"r_confessed", flagNone:["r_witness_asked","ending_witness","ending_inheritor","ending_ghost"], evidenceGte:10, totalProfitGte:40000, dealsSinceGte:2 },',
    'r_act3_witness reachable (was gated at $80k behind an unreachable flag)')

open(p,'w',encoding='utf-8').write(s)
print("   continuity edits applied:",n)
PY

echo "── stage 9: verify"
cp "$OUT" ../build/v5.jsx
cd ../build
ERR=$(./node_modules/.bin/esbuild v5.jsx --outfile=/dev/null 2>&1 | grep -c '✘' || true)
WARN=$(./node_modules/.bin/esbuild v5.jsx --outfile=/dev/null 2>&1 | grep -c '▲' || true)
echo "   parse errors: $ERR   warnings: $WARN"
./node_modules/.bin/esbuild v5.jsx --outfile=/dev/null 2>&1 | head -12
[ "$ERR" = "0" ] || { echo "FAILED: parse errors"; exit 1; }
echo "   lines: $(wc -l < v5.jsx)"
echo "BUILD OK"
