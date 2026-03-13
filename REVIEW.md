# Project Review: COCAINE 80s

## Overview

Single-file (~3,630 lines, 259KB) React game engine implementing a Miami Vice-themed drug dealing empire simulation. Ambitious and well-crafted with deep game systems, outstanding narrative writing, and sophisticated visual/audio design.

---

## Strengths

### 1. Exceptional Narrative Writing
The dialogue is genuinely cinematic. Characters like Maria Santos, Detective Ramirez, and El Colombiano are fully realized with distinct voices. The narrative engine assembles end-game stories from montage events, producing unique endings every run.

### 2. Sophisticated Game Systems
- **Price engine** uses Ornstein-Uhlenbeck processes (mean reversion + momentum + shocks)
- **Quality-based storylet system** (Hades-inspired) with priority queues and declarative conditions
- **Phase transitions** driven by player actions, not arbitrary timers
- **Defusable fuse timers** create delayed consequences the player can counteract
- **Poker-style multi-turn deals** add tension across moves

### 3. Pure State Architecture
All game logic is framework-agnostic with pure `{ state, effects }` returns. The "React Native with ZERO changes" claim for the engine portion is credible.

### 4. Audio & Visual Polish
Dynamic synth engine changes based on era/heat/time-of-day. Per-location skyline profiles, VHS scanline overlays, ambient motes, and neon glow effects create strong atmosphere.

### 5. Progressive Disclosure
HUD reveals stats only after the player encounters the mechanic. Coach marks teach through contextual hints. Feature unlocks (bank, empire, lifestyle) are gated by achievements.

---

## Critical Bugs

### 1. `dealsSinceLastEvent` is never incremented (line 1292)

Initialized to 0 in `createInitialState` but **never incremented** anywhere. Many storylets require `dealsSinceGte: 2` or `dealsSinceGte: 3`, so these conditions always fail (0 < 2). This breaks **most NPC storylets**:

- `maria_tip`, `maria_party`, `maria_launder`
- `ramirez_coffee`, `ramirez_photos`, `ramirez_offer`, `ramirez_bribe`
- `colombiano_gift`, `colombiano_zoo`
- `faction_dispute` and all faction downstream events
- All informant arc events

**Fix:** Increment in `processBuyDrug`/`processSellDrug`, reset to 0 when a storylet fires.

### 2. `fedHeatGte` condition not handled in `meetsConditions` (lines 1009-1046)

The evaluator handles `heatGte` (line 1015) but `ramirez_intro` uses `fedHeatGte` (line 648). Unrecognized keys are silently skipped, so Ramirez appears immediately after 2 deals instead of waiting for heat >= 15.

**Fix:** Add `if (k==='fedHeatGte' && s.fedHeat<v) return false;` or rename to `heatGte`.

### 3. Meta-progression is never persisted (lines 2537, 2754)

`saveMeta()` exists but is **never called**. All meta-progression (rep, upgrades, unlocked playbooks) is lost on page reload.

### 4. Game always starts with default settings (line 2740)

`startGame` hardcodes `PLAYBOOKS[0]` and heat level 0. Despite fully implemented PLAYBOOKS, HEAT_LADDER, daily challenge, and safehouse upgrade systems, there is **no UI to select them**.

### 5. `got_failure_bonus` flag never set (line 1455)

The failure bonus checks the flag but never sets it. The "one-time" lifeline triggers every eligible travel.

---

## Moderate Bugs

### 6. Supplier betrayal flag races with random roll (lines 1688, 1795)
Flag set unconditionally, but message/effect behind `Math.random() < 0.3`. 70% of the time the flag silently blocks future triggers.

### 7. Police result text never displayed (lines 1957, 3044)
`processPolice` generates `resultText` but the UI only shows HP.

### 8. Shallow copy mutation in `applyPlaybookMods` (line 1198)
`state.turf[loc] = mods.startTurf` mutates through shallow copy. Safe now but fragile.

### 9. `SynthEngine._loop()` recomputes constants twice (lines 2166, 2234)
`sc` and `beatMs` computed inside try block, then again outside it.

### 10. `getDailyModifiers` shuffle is non-deterministic (line 257)
Sort comparator with side effects produces browser-dependent results from same seed.

---

## Missing Features (Designed but Not Wired)

| Feature | Engine Code | UI | Status |
|---------|------------|-----|--------|
| Playbook selection | Complete | Missing | Always starts as Hustler |
| Heat level selection | Complete | Missing | Always Tourist difficulty |
| Daily challenges | Complete | Missing | Seed generation works, no entry point |
| Safehouse upgrades (meta) | Complete | Missing | Buy with rep between runs |
| Rep economy | Complete | Missing | Calculated but never saved |
| Stash system | Partial | Missing | `stashInv` exists, no deposit/withdraw UI |
| Completion grid | Defined | Missing | Track playbook x heat combos |

---

## Summary

Impressive work -- deeply systemic game with excellent writing, wrapped in polished audiovisual package. Core architecture (pure state transitions, declarative storylets, action-driven progression) is well-designed. Main issue: ~40% of designed features are implemented in the engine but never exposed due to missing UI and counter bugs. Fixing the 5 critical bugs and adding the pre-game selection screen would dramatically expand playable content that already exists.
