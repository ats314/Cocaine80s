# Agent Onboarding Guide

This file helps LLM agents understand, review, and contribute to the COCAINE 80s codebase.

## Quick Orientation

This is a **single-file React game** (`cocaine80master`, ~3,630 lines). The entire game — engine, narrative, audio, and UI — lives in one JavaScript file. This is intentional for portability (the engine portion can be dropped into React Native with zero changes).

**Do not split this into multiple files** unless explicitly asked. The single-file architecture is a design choice.

## Documentation Map

| File | Purpose |
|------|---------|
| `CLAUDE.md` | This file. Agent onboarding, conventions, contribution rules |
| `ARCHITECTURE.md` | Code map with line numbers, state shape, data flow, all functions |
| `NARRATIVE.md` | All storylets, NPC arcs, dialogue catalog, endings, content map |
| `GAMEPLAY.md` | Mechanics reference, formulas, balance parameters, tuning guide |
| `REVIEW.md` | Technical review with known bugs and recommendations |
| `README.md` | Public-facing project description |

## Code Conventions

### Style
- **Compressed helpers**: `R`, `RF`, `FM`, `CL` are intentionally terse (they're called hundreds of times)
- **Inline styles**: All CSS is CSS-in-JS. No external stylesheets
- **Spread-return pattern**: State transitions return `{ state: {...s, ...changes}, effects: [...] }`
- **Straight quotes only**: `"` `'` for string delimiters, `...` for spread. Curly quotes (`“ ” ‘ ’`) and `…` are only ever *content* inside a string — never syntax. Do not let an editor or paste path apply "smart punctuation" to this file; it silently produces source that no parser will accept (see `tools/repair-smart-quotes.js`)

### Architecture Layers
```
┌─────────────────────────────────────────────┐
│  React Component (line ~2170+)              │  Platform-specific
│  Screens, UI, event handlers                │
├─────────────────────────────────────────────┤
│  Audio Engine (line ~1790-1880)             │  Web Audio API
├─────────────────────────────────────────────┤
│  State Transitions (line ~985-1770)         │  PURE — no side effects
│  processTravel, processBuy, processSell...  │  Returns {state, effects}
├─────────────────────────────────────────────┤
│  Narrative Engine (line ~412-938)           │  PURE — storylet selection
│  STORY object, meetsConditions, selectStorylet│
├─────────────────────────────────────────────┤
│  Constants & Data (line ~16-410)            │  Static game data
│  Drugs, locations, eras, etc.               │
└─────────────────────────────────────────────┘
```

### Key Principle: Pure State Transitions
All game logic functions (`processTravel`, `processBuyDrug`, `processSellDrug`, etc.) are **pure functions**:
- Input: current state + action parameters
- Output: `{ state: newState, effects: [...] }`
- No DOM, no React, no side effects

Effects are processed separately by the React component. This is what makes the engine portable.

### Helper Functions
| Helper | Meaning | Example |
|--------|---------|---------|
| `R(a,b)` | Random integer in [a,b] | `R(0,5)` → 0-5 |
| `RF(a,b)` | Random float in [a,b) | `RF(0.5, 1.5)` → 0.5-1.5 |
| `FM(n)` | Format money | `FM(1500)` → "$1,500" |
| `CL(v,lo,hi)` | Clamp value | `CL(150,0,100)` → 100 |
| `randNorm()` | Standard normal random | For price engine |

## How to Add Features

### Adding a New Drug
1. Add entry to `DRUGS` array (~line 51) with: name, tier (0-2), mean, min, max, sigma, theta, emoji
2. Update `DRUG_COUNT` if it's not derived (it is: `DRUGS.length`)
3. No other changes needed — the engine iterates over `DRUGS` dynamically

### Adding a New Location
1. Add entry to `LOCS` array (~line 24) with: name, icon, color, creed, heat, desc, priceMod (3 values for tiers 0-2)
2. Add atmosphere entry to `LOCATION_VIBE` (~line 35) with day/night arrays
3. Add skyline profile to `SKYLINE_PROFILES` (~line 2447)
4. Update arrays that are sized to location count: `safeHouses`, `turf`, `enforcers`, `demand` in `createInitialState`

**Note:** The following systems were previously defined but have been removed: PLAYBOOKS, HEAT_LADDER, SAFEHOUSE_UPGRADES, daily challenge system, meta-progression (rep/upgrades), and stash inventory. `createInitialState` now takes no parameters.

### Adding a New Storylet
1. Add entry to `STORY` object (~line 558-994) with:
   - Key: unique storylet ID
   - `speaker`: 'maria' | 'ramirez' | 'colombiano' | 'narrator'
   - `portrait`: character mood
   - `priority`: higher = selected first (1-15)
   - `conditions`: object with condition keys (see ARCHITECTURE.md for full list)
   - `lines`: array of `{ text, portrait }` dialogue lines
   - `choices`: array of `{ text, reaction, effects }` options
2. Effects can include: `flags` (array), `cashDelta`, `cleanCashDelta`, `cred`, `invDelta`, `npc.*` trust/evidence changes

### Adding a New Ending
1. Add opener templates to `NARRATIVE_OPENERS` (~line 310)
2. Add config to `endingConfig` in the gameover screen (~line 3162)
3. Add NPC closers to `generateNarrative` if needed (~line 432)
4. Add trigger condition in `processTravel` ending checks (~line 1717+)

### Adding a New Lifestyle Item
1. Add entry to `LIFESTYLE` array (~line 110) with: name, icon, cost, credBoost, desc, effect
2. Handle the effect in `processTravel` if it has gameplay impact (like "club" laundering)
3. Add montage text to `montageItems` in `processBuyLifestyle` if notable

### Adding a New Achievement
1. Add detection logic in the relevant process function (usually `processTravel` or `processSellDrug`)
2. Push achievement ID to `achs` array and emit `{ type: 'ACHIEVEMENT', id }` effect
3. Optionally add to `UNLOCK_MAP` (~line 2252) if it unlocks a feature

## How to Review Code

### Reviewing Game Balance
Read `GAMEPLAY.md` for all formulas. Key tuning levers:
- Drug price volatility: `sigma` and `theta` per drug in `DRUGS`
- Police frequency: `heat` per location in `LOCS`, `copsMod` per era in `ERAS`
- Economy speed: `mean` prices in `DRUGS`, `income` in `TURF_LEVELS`
- Difficulty curve: `PHASE_TRANSITIONS` thresholds
- Loan pressure: debt tiers in `processTravel` (~line 1406-1438)

### Reviewing Narrative
Read `NARRATIVE.md` for the full catalog. Key things to check:
- **Condition coverage**: Do storylets trigger at the right time? Check `dealsSinceGte`, profit thresholds, NPC trust requirements
- **Flag consistency**: Storylets that set flags should be checked against storylets that read those flags
- **Arc completeness**: Each NPC has a progression — verify all branches lead somewhere
- **Tone consistency**: Characters have distinct voices (Maria = strategic wit, Ramirez = tired humor, Colombiano = quiet menace)

### Reviewing UI/UX
The React component starts at ~line 2536. Key screens:
- `title` → `comic` → `game` (main loop)
- `police` → `policeResult` (encounter)
- `escape` (endgame choice)
- `broke_choice` (mercy mechanic)
- `gameover` (narrative epilogue)

Tabs within `game`: market, bag, travel, bank, empire, life

## Common Pitfalls

1. **Smart punctuation breaks the build**: If `…` or curly quotes appear where syntax belongs (`const C = {pink:”#FF2D7B”}`), the file will not parse at all. Run `node tools/repair-smart-quotes.js <in> <out>` to repair, then verify with a parser before committing.

2. **Shallow copies**: State updates use `{ …s, ... }` which is shallow. Nested objects (like `npcState`, `turf`, `enforcers`) need their own spread when modified.

3. **Condition key typos**: If you add a new condition key to a storylet but forget to handle it in `meetsConditions`, it will be **silently ignored** (treated as passing). Always add the handler.

4. **Effect processing**: Effects returned from state transitions are processed by `processEffects` in the React component. If you add a new effect type, you must handle it there too (~line 2656+).

5. **Storylet deduplication**: `storySeen` tracks which storylets have fired. Always include the storylet ID in `storySeen` when it fires, or it will repeat.

6. **dealsSinceLastEvent**: This counter gates NPC storylets. It increments on buy/sell and resets when a storylet fires. If you add a new storylet, it uses this automatically via the condition system.

## Recently Completed Features

1. **Witness defuse encounter** — When a witness fuse is active, a $2K defuse opportunity appears as a random encounter (40% chance per travel)
2. **DEA surveillance fuse** — Plants when fedHeat ≥45 and profit ≥$80K; detonates after 6 moves (+12 heat, +2 evidence); defusable for $5K
3. **Supplier betrayal → fuse timer** — Converted from random-per-travel to deterministic fuse (4-move timer), planted when 5+ buys at same location + heat ≥20
4. **Coach marks** — Added contextual hints for first encounter, first poker deal, and first defuse opportunity

## Testing

There are no automated tests. To verify changes:
1. Play through a full run checking the modified system
2. Verify storylet conditions fire at the right thresholds
3. Check the browser console for errors
4. Test edge cases: zero cash, max heat, max inventory, all endings

## File Structure
```
Cocaine80s/
├── cocaine80master    # The entire game (single file)
├── CLAUDE.md          # This file — agent guide
├── ARCHITECTURE.md    # Code map and technical reference
├── NARRATIVE.md       # Story content catalog
├── GAMEPLAY.md        # Mechanics and balance reference
├── REVIEW.md          # Technical review and known issues
├── README.md          # Public project description
└── .gitignore
```
